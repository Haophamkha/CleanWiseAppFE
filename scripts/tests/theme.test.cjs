const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { create, act } = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
const root = path.resolve(__dirname, '../..');
function load(file, mocks = {}) {
  const full = path.join(root, file), loaded = new Module(full, module);
  loaded.paths = module.paths;
  loaded.require = name => Object.hasOwn(mocks, name) ? mocks[name] : name === '@/features/language/i18n' ? require('./language-support.cjs').language : name === 'react-i18next' ? require('./language-support.cjs').react : name.startsWith('.') ? require(path.resolve(path.dirname(full), name)) : require(name);
  const compiled = ts.transpileModule(fs.readFileSync(full, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } });
  loaded._compile(compiled.outputText, full);
  return loaded.exports;
}
const themes = load('src/constants/theme.ts');
const tokens = require('../../tokens');
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return {promise, resolve, reject}; };
async function mount(options = {}) {
  let system = options.system ?? 'light', override, current, renderer;
  const listeners = new Set(), saved = new Map(options.saved ? [['cleanwise_customer_appearance', options.saved]] : []), writes = [], backgrounds = [], alerts = [];
  const emit = () => listeners.forEach(fn => fn());
  const nativeSetter = value => { override = value === 'system' ? undefined : value; emit(); };
  const storage = {
    getItem: options.read ?? (async key => saved.get(key) ?? null),
    setItem: async (key, value) => { writes.push(value); if (options.write) await options.write(key, value); saved.set(key, value); },
  };
  const ui = { View: 'View', Text: 'Text', TouchableOpacity: 'TouchableOpacity', StyleSheet: { hairlineWidth: 1 }, Alert: { alert: (...args) => alerts.push(args) } };
  const themeModule = load('src/features/theme/ThemeProvider.tsx', {
    '@/constants/theme': themes,
    '@react-native-async-storage/async-storage': storage,
    'expo-router/react-navigation': { DarkTheme: { dark: true, colors: {} }, DefaultTheme: { dark: false, colors: {} }, ThemeProvider: ({children}) => children },
    'expo-status-bar': { StatusBar: 'StatusBar' },
    'expo-system-ui': { setBackgroundColorAsync: async color => backgrounds.push(color) },
    'expo-splash-screen': { hideAsync: async () => {} },
    nativewind: { vars: value => value, useColorScheme: () => ({ colorScheme: React.useSyncExternalStore(fn => { listeners.add(fn); return () => listeners.delete(fn); }, () => override ?? system, () => system), setColorScheme: nativeSetter }) },
    'react-native': ui,
  });
  const { AppearanceSettings } = load('src/features/theme/AppearanceSettings.tsx', {
    '@/constants/theme': themes,
    './ThemeProvider': themeModule, '@/components/common/MenuGroup': { MenuGroup: ({children}) => React.createElement('Group', null, children) },
    '@expo/vector-icons': { Feather: 'Icon' }, 'react-native': ui,
  });
  const { ChatRoomHeader } = load('src/features/chat/components/ChatRoomHeader.tsx', {
    '@/features/theme/ThemeProvider': themeModule, '@/components/ui': { Avatar: 'Avatar' }, '@expo/vector-icons': { Feather: 'Icon' },
    'expo-router': { router: { back() {} } }, 'react-native': ui, 'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 0 }) },
  });
  function Consumer() {
    current = themeModule.useAppTheme();
    const [draft] = React.useState('Nội dung đang nhập');
    return React.createElement(React.Fragment, null, React.createElement(AppearanceSettings), React.createElement(ChatRoomHeader, {name:'Nhân viên'}), React.createElement('Draft', {value:draft}));
  }
  await act(async () => { renderer = create(React.createElement(themeModule.AppThemeProvider, null, React.createElement(Consumer))); });
  return { get theme() {return current;}, renderer, writes, saved, backgrounds, alerts,
    choose: value => act(async () => { await renderer.root.findAllByType('TouchableOpacity').find(node => node.props.accessibilityLabel === value).props.onPress(); }),
    system: value => act(async () => { system=value; emit(); }),
    unmount: () => act(async () => renderer.unmount()),
  };
}

test('guest settings switch theme without remounting content; chat and status bar update', async () => {
  const app=await mount();
  try {
    assert.equal(app.theme.preference,'light');
    await app.choose('Tối');
    assert.equal(app.theme.mode,'dark');
    assert.equal(app.renderer.root.findByType('StatusBar').props.style,'light');
    assert.equal(app.renderer.root.findAllByType('Text').find(n=>n.children.includes('Nhân viên')).props.style.color,themes.APP_THEMES.dark.COLORS.ink);
    assert.equal(app.renderer.root.findByType('Draft').props.value,'Nội dung đang nhập');
    assert.equal(app.saved.get('cleanwise_customer_appearance'),'dark');
    assert.equal(app.renderer.root.findAllByType('TouchableOpacity').find(n=>n.props.accessibilityLabel==='Tối').props.accessibilityState.checked,true);
    assert.equal(app.renderer.root.findAllByType('TouchableOpacity').find(n=>n.props.accessibilityLabel==='Tối').props['aria-checked'],true);
    await app.choose('Sáng');
    assert.equal(app.theme.mode,'light');
    assert.equal(app.renderer.root.findByType('StatusBar').props.style,'dark');
  } finally { await app.unmount(); }
});

test('saved preference is restored before app screens mount', async () => {
  const read=deferred(); const app=await mount({read:()=>read.promise});
  try {
    assert.equal(app.renderer.root.findAllByType('Draft').length,0);
    await act(async()=>read.resolve('dark'));
    assert.equal(app.theme.preference,'dark');
    assert.equal(app.theme.mode,'dark');
    assert.equal(app.renderer.root.findAllByType('Draft').length,1);
  } finally {await app.unmount();}
});

test('only light and dark are offered; default and manual choices ignore system appearance', async()=>{
 const app=await mount({system:'dark'});
 try {
  assert.equal(app.theme.preference,'light');
  assert.equal(app.theme.mode,'light');
  assert.deepEqual(app.renderer.root.findAllByType('TouchableOpacity').filter(n=>n.props.accessibilityRole==='radio').map(n=>n.props.accessibilityLabel),['Sáng','Tối']);
  await app.system('light'); assert.equal(app.theme.mode,'light');
  await app.system('dark'); assert.equal(app.theme.mode,'light');
  await app.choose('Tối'); await app.system('light'); assert.equal(app.theme.mode,'dark');
  await app.choose('Sáng'); await app.system('dark'); assert.equal(app.theme.mode,'light');
  await assert.rejects(app.theme.setPreference('system'), /Giao diện không hợp lệ/);
 } finally {await app.unmount();}
});

test('legacy system, invalid or unreadable storage falls back to light appearance', async()=>{
 for(const options of [{saved:'system',system:'dark'},{saved:'invalid',system:'dark'},{read:async()=>{throw Error('storage unavailable');},system:'dark'}]){
  const app=await mount(options);try{assert.equal(app.theme.preference,'light');assert.equal(app.theme.mode,'light');}finally{await app.unmount();}
 }
});

test('rapid theme changes persist in order and the last selection survives restart', async()=>{
 const first=deferred();let count=0;
 const app=await mount({write:async()=>{if(++count===1)await first.promise;}});
 try{
  let a,b,c;
  await act(async()=>{a=app.theme.setPreference('dark');b=app.theme.setPreference('light');c=app.theme.setPreference('dark');});
  assert.equal(app.theme.preference,'dark');
  assert.deepEqual(app.writes,['dark']);
  await act(async()=>{first.resolve();await Promise.all([a,b,c]);});
  assert.deepEqual(app.writes,['dark','light','dark']);
  assert.equal(app.saved.get('cleanwise_customer_appearance'),'dark');
 } finally {await app.unmount();}
});

test('a failed save is reported and does not prevent the next preference from saving',async()=>{
 let calls=0;const app=await mount({write:async()=>{if(++calls===1)throw Error('disk full');}});
 try{
  await app.choose('Tối');assert.equal(app.theme.mode,'dark');assert.equal(app.alerts.length,1);
  await app.choose('Sáng');assert.equal(app.saved.get('cleanwise_customer_appearance'),'light');
 }finally{await app.unmount();}
});

function luminance(hex){const c=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
test('dark palette keeps readable text, status badges and filled button labels',()=>{
 const c=themes.APP_THEMES.dark.COLORS;
 for(const [fg,bg]of [[c.ink,c.canvas],[c.ink,c.surface],[c.inkSoft,c.surface],[c.inkMuted,c.surface],[c.inkMuted,c.surfaceMuted],[c.primary,c.primaryLight],[c.success,c.successLight],[c.danger,c.dangerLight],[c.accentDark,c.accentLight],[c.infoDark,c.infoLight],[c.white,c.primaryFill],[c.white,c.dangerFill]])assert.ok(contrast(fg,bg)>=4.5,`${fg} on ${bg} has low contrast`);
});
test('NativeWind keeps default semantic color names and opacity-aware theme variables',()=>{
 assert.ok(tokens.tailwindColors.ink.DEFAULT.includes('--cw-ink'));
 assert.ok(tokens.tailwindColors.primary.DEFAULT.includes('--cw-primary'));
 assert.ok(tokens.tailwindColors.primary['fill-dark'].includes('--cw-primary-fill-dark'));
 assert.ok(tokens.tailwindColors['surface-muted'].includes('--cw-surface-muted'));
 assert.deepEqual(Object.keys(tokens.variables.light).sort(),Object.keys(tokens.variables.dark).sort());
});
