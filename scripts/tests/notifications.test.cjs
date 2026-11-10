const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { create, act } = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;

async function mount(initial) {
  let response = initial, current, renderer, refetches = [], options;
  const filename = path.resolve(__dirname, '../../src/features/notification/hooks/useNotifications.ts');
  const loaded = new Module(filename, module);
  loaded.paths = module.paths;
  const prefetch = () => {};
  const mocks = {
    'react-i18next': { useTranslation: () => ({ t: key => key }) },
    'expo-router': { router: { push() {} } },
    'react-native': { Alert: { alert() {} } },
    '@/features/notification/utils/notificationMeta': { getLocalizedNotificationFilterOptions: () => [], getNotificationRoute: () => null },
    '@/features/notification/api/notificationApi': {
      notificationApi: { usePrefetch: () => prefetch },
      useGetNotificationsQuery: (params, config) => { options = config; return { ...response, refetch: () => refetches.push(params.page) }; },
      useMarkNotificationReadMutation: () => [() => {}],
      useMarkAllNotificationsReadMutation: () => [() => {}, { isLoading: false }],
    },
  };
  loaded.require = name => name in mocks ? mocks[name] : require(name);
  loaded._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText, filename);
  function Consumer() { current = loaded.exports.useNotifications(); return null; }
  await act(async () => { renderer = create(React.createElement(Consumer)); });
  return {
    get state() { return current; }, get options() { return options; }, refetches,
    update: next => act(async () => { response = next; renderer.update(React.createElement(Consumer)); }),
    unmount: () => act(async () => renderer.unmount()),
  };
}

test('notification load failures are exposed separately from a successful empty response', async () => {
  const app = await mount({ isError: true, isFetching: false });
  try {
    assert.equal(app.state.isError, true);
    assert.equal(app.state.isLoading, false);
    await act(async () => app.state.refresh());
    assert.deepEqual(app.refetches, [1]);
    await app.update({ currentData: { results: [], unread_count: 0 }, isError: false, isFetching: false });
    assert.equal(app.state.isError, false);
    assert.deepEqual(app.state.items, []);
    assert.deepEqual(app.options, { refetchOnMountOrArgChange: true, refetchOnFocus: true });
  } finally { await app.unmount(); }
});

test('refresh from a later page returns to page one without refetching the old page', async () => {
  const app = await mount({ currentData: { results: [{ id: 1 }], unread_count: 63, has_next: true }, isError: false, isFetching: false });
  try {
    await act(async () => app.state.loadMore());
    assert.equal(app.state.page, 2);
    await act(async () => app.state.refresh());
    assert.equal(app.state.page, 1);
    assert.deepEqual(app.refetches, []);
    assert.equal(app.state.unreadCount, 63);
  } finally { await app.unmount(); }
});
