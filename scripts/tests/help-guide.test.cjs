const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module'), ts = require('typescript');
const React = require('react'), { create, act } = require('react-test-renderer');
const { language, react } = require('./language-support.cjs');
global.IS_REACT_ACT_ENVIRONMENT = true;
global.requestAnimationFrame = callback => setImmediate(callback);
global.cancelAnimationFrame = clearImmediate;
const root = path.resolve(__dirname, '../..');
function load(file, mocks = {}) {
  const full = path.join(root, file), loaded = new Module(full, module); loaded.paths = module.paths;
  loaded.require = name => name in mocks ? mocks[name] : name === 'react-i18next' ? react : require(name);
  loaded._compile(ts.transpileModule(fs.readFileSync(full, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, full);
  return loaded.exports;
}
const { guidePosition } = load('src/features/chatbot/utils/helpGuide.ts');
const [article] = require('../../../CleanWiseApp/apps/chatbot/data/customer_app_guide.json');

test('topic links use stable IDs and invalid step values cannot open the wrong step', () => {
  assert.equal(guidePosition(article.sections, 'dia-chi', '2').section.heading, 'Thêm và chọn địa chỉ');
  assert.equal(guidePosition([...article.sections].reverse(), 'dia-chi', '2').step, 1);
  for (const value of ['-1', '0', '1.5', 'nope', '10000']) assert.equal(guidePosition(article.sections, 'dia-chi', value).step, 0);
  assert.equal(guidePosition(article.sections, 'missing').invalid, true);
  assert.equal(guidePosition(article.sections).invalid, false);
});

test('chapter title, 11 topics, step navigation, Android back and English content', async () => {
  await language.i18n.changeLanguage('vi');
  let params = {}, back, renderer;
  const changes = [];
  const { HelpArticleReader } = load('src/features/chatbot/components/HelpArticleReader.tsx', {
    '@/features/theme/ThemeProvider': { useAppTheme: () => ({ COLORS: { primary: 'teal' } }) },
    '@expo/vector-icons': { Feather: 'Icon' },
    'expo-router': { router: { setParams: patch => { changes.push(patch); params = { ...params, ...patch }; }, replace() {} }, useLocalSearchParams: () => params },
    'react-native': { View: 'View', Text: 'Text', TouchableOpacity: 'Button', ScrollView: 'Scroll', BackHandler: { addEventListener: (_, callback) => { back = callback; return { remove() {} }; } } },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) },
    '../utils/helpGuide': { guidePosition }, './HelpScreenshot': { HelpScreenshot: 'Screenshot' },
  });
  const update = () => act(async () => renderer.update(React.createElement(HelpArticleReader, { article })));
  const text = () => renderer.root.findAllByType('Text').flatMap(node => node.children.filter(c => typeof c === 'string'));
  const buttonText = value => renderer.root.findAllByType('Button').find(node => node.findAllByType('Text').some(t => t.children.includes(value)));
  await act(async () => { renderer = create(React.createElement(HelpArticleReader, { article })); });
  try {
    assert.ok(text().includes(article.title));
    assert.equal(renderer.root.findAllByType('Button').filter(n => n.props.accessibilityLabel?.match(/^\d+\./)).length, 11);
    const topic = renderer.root.findAllByType('Button').find(n => n.props.accessibilityLabel === '4. Thêm và chọn địa chỉ');
    await act(async () => topic.props.onPress()); await update();
    assert.equal(params.section, 'dia-chi'); assert.ok(text().includes('Bước 1 / 3'));
    assert.equal(renderer.root.findAllByType('Screenshot').length, 1);
    await act(async () => buttonText('Bước tiếp').props.onPress()); await update();
    assert.ok(text().includes('Bước 2 / 3'));
    await act(async () => language.i18n.changeLanguage('en'));
    assert.ok(text().includes('Add and choose an address')); assert.ok(text().includes('Step 2 / 3'));
    assert.equal(renderer.root.findByType('Screenshot').props.english, true);
    assert.equal(back(), true); await update(); assert.equal(params.section, '');
    params = { section: 'not-a-topic' }; await update();
    assert.equal(renderer.root.findAllByType('Screenshot').length, 0);
    assert.ok(text().some(value => value.includes('unavailable')));
  } finally { await act(async () => renderer.unmount()); await language.i18n.changeLanguage('vi'); }
});

test('screenshots support error retry, enlargement and bounded zoom', async () => {
  let renderer;
  const image = article.sections[0].steps[0].image;
  const { HelpScreenshot } = load('src/features/chatbot/components/HelpScreenshot.tsx', {
    '@/config/env': { ENV: { API_URL: 'http://localhost:8000/' } },
    '@/features/theme/ThemeProvider': { useAppTheme: () => ({ COLORS: { ink: 'black' } }) }, '@expo/vector-icons': { Feather: 'Icon' },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) },
    'react-native': { View: 'View', Text: 'Text', Image: 'Image', Modal: 'Modal', ScrollView: 'Scroll', TouchableOpacity: 'Button', useWindowDimensions: () => ({ width: 360, height: 800 }) },
  });
  await act(async () => { renderer = create(React.createElement(HelpScreenshot, { image, english: false })); });
  try {
    const button = label => renderer.root.findAllByType('Button').find(n => n.props.accessibilityLabel === label);
    assert.ok(renderer.root.findAllByType('Image')[0].props.source.uri.endsWith(`/help-images/${encodeURIComponent(image.file)}/`));
    await act(async () => button('Mở ảnh minh họa').props.onPress());
    assert.equal(renderer.root.findByType('Modal').props.visible, true);
    await act(async () => renderer.root.findAllByType('View').find(n => n.props.onLayout).props.onLayout({ nativeEvent: { layout: { width: 360, height: 640 } } }));
    const largePhoto = renderer.root.findAllByType('Image').at(-1).parent;
    assert.ok(largePhoto.props.style.width <= 344);
    assert.ok(largePhoto.props.style.width / largePhoto.props.style.aspectRatio <= 624);
    for (let i = 0; i < 8; i++) await act(async () => button('Phóng to ảnh').props.onPress());
    assert.equal(button('Phóng to ảnh').props.disabled, true);
    await act(async () => button('Đóng').props.onPress());
    assert.equal(renderer.root.findByType('Modal').props.visible, false);
    await act(async () => button('Mở ảnh minh họa').props.onPress());
    assert.equal(button('Thu nhỏ ảnh').props.disabled, true);
    await act(async () => renderer.root.findAllByType('Image')[0].props.onError());
    assert.equal(renderer.root.findAllByType('Button').some(n => n.props.accessibilityLabel === 'Mở ảnh minh họa'), false);
    await act(async () => renderer.root.findAllByType('Button').find(n => !n.props.accessibilityLabel).props.onPress());
    assert.ok(button('Mở ảnh minh họa'));
  } finally { await act(async () => renderer.unmount()); }
});
