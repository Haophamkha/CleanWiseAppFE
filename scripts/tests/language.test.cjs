const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const {create, act} = require('react-test-renderer');
const {language: core} = require('./language-support.cjs');
global.IS_REACT_ACT_ENVIRONMENT = true;
const root = path.resolve(__dirname, '../..');
function load(file, mocks = {}) {
  const filename = path.join(root, file), loaded = new Module(filename, module);
  loaded.paths = module.paths;
  loaded.require = name => Object.hasOwn(mocks, name) ? mocks[name] : name === '@/features/language/i18n' || name === './i18n' ? core : name.startsWith('.') ? require(path.resolve(path.dirname(filename), name)) : require(name);
  loaded._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText, filename);
  return loaded.exports;
}
const deferred = () => { let resolve; const promise = new Promise(yes => {resolve=yes;});return {promise,resolve}; };
async function mount(options = {}) {
  await core.i18n.changeLanguage('vi');
  let current, renderer, mounts=0;
  const saved = new Map(options.saved === undefined ? [] : [[core.LANGUAGE_STORAGE_KEY,options.saved]]), writes=[], alerts=[], queries=[];
  const storage = {getItem:options.read ?? (async key=>saved.get(key)??null),setItem:async(key,value)=>{writes.push(value);if(options.write)await options.write(key,value);saved.set(key,value);}};
  const ui = {View:'View',Text:'Text',TouchableOpacity:'TouchableOpacity',ScrollView:'ScrollView',Alert:{alert:(...args)=>alerts.push(args)},Linking:{openSettings:()=>{}}};
  const theme={useAppTheme:()=>({COLORS:{primary:'green',inkMuted:'gray'},preference:'light',setPreference:async()=>{}})};
  const provider=load('src/features/language/LanguageProvider.tsx',{'@react-native-async-storage/async-storage':storage});
  const common={'react-native':ui,'@expo/vector-icons':{Feather:'Icon'},'@/components/common/MenuGroup':{MenuGroup:'MenuGroup'},'@/features/theme/ThemeProvider':theme,'@/constants/theme':load('src/constants/theme.ts')};
  const {LanguageSettings}=load('src/features/language/LanguageSettings.tsx',{...common,'./LanguageProvider':provider});
  const {AppearanceSettings}=load('src/features/theme/AppearanceSettings.tsx',{...common,'./ThemeProvider':theme});
  const {default:SettingsScreen}=load('src/app/profile/settings.tsx',{
    ...common,'@/features/language/LanguageSettings':{LanguageSettings},'@/features/theme/AppearanceSettings':{AppearanceSettings},
    '@/components/common/MenuListItem':{MenuListItem:'MenuItem'},'@/components/common/ScreenHeader':{ScreenHeader:'Header'},'@/components/common/SwitchRow':{SwitchRow:'SwitchRow'},
    '@/config/constants':{ROUTES:{}},'@/features/notification/hooks/useNotificationPreferences':{useNotificationPreferences:authenticated=>{queries.push(authenticated);return {pushEnabled:true,setPushEnabled:()=>{}};}},
    '@/features/profile/hooks/useProfile':{useProfile:()=>({isAuthenticated:options.authenticated??false})},'@/store/hooks':{useAppSelector:fn=>fn({auth:{user:null}})},
    'expo-constants':{expoConfig:{version:'1.0.0'}},'expo-router':{router:{push:()=>{}}},'react-native-safe-area-context':{useSafeAreaInsets:()=>({top:0,bottom:0})},
  });
  function Content(){current=provider.useAppLanguage();const [draft]=React.useState(()=>{mounts++;return 'Nội dung người dùng';});return React.createElement(React.Fragment,null,React.createElement(SettingsScreen),React.createElement('Draft',{value:draft}));}
  await act(async()=>{renderer=create(React.createElement(provider.AppLanguageProvider,null,React.createElement(Content)));});
  return {renderer,saved,writes,alerts,queries,get current(){return current;},get mounts(){return mounts;},choose:async label=>{
    if(!renderer.root.findAllByType('TouchableOpacity').some(n=>n.props.accessibilityLabel===label))
      await act(async()=>renderer.root.findAllByType('TouchableOpacity').find(n=>n.props.accessibilityLabel===core.translate('Chọn ngôn ngữ ứng dụng')).props.onPress());
    await act(async()=>{await renderer.root.findAllByType('TouchableOpacity').find(n=>n.props.accessibilityLabel===label).props.onPress();});
  },unmount:()=>act(async()=>renderer.unmount())};
}

test('guest settings switch to English immediately and retain drafts, theme and saved language',async()=>{
 const app=await mount();try{
  assert.equal(app.current.language,'vi');assert.equal(app.renderer.root.findByType('Header').props.title,'Cài đặt');
  await app.choose('English');
  assert.equal(app.current.language,'en');assert.equal(app.renderer.root.findByType('Header').props.title,'Settings');
  assert.deepEqual(app.renderer.root.findAllByType('MenuGroup').map(n=>n.props.title),['Personalization','App preferences']);
  assert.equal(app.renderer.root.findAllByType('TouchableOpacity').find(n=>n.props.accessibilityLabel==='Choose app language').props.accessibilityState.expanded,false);
  await app.choose('Choose app language');
  const radios=app.renderer.root.findAllByType('TouchableOpacity').filter(n=>n.props.accessibilityRole==='radio');
  assert.deepEqual(radios.map(n=>n.props.accessibilityLabel),['Light','Dark','Tiếng Việt','English']);
  assert.equal(radios.find(n=>n.props.accessibilityLabel==='English').props['aria-checked'],true);
  assert.equal(radios.find(n=>n.props.accessibilityLabel==='Light').props.accessibilityState.checked,true);
  assert.equal(app.saved.get(core.LANGUAGE_STORAGE_KEY),'en');assert.equal(app.mounts,1);assert.equal(app.renderer.root.findByType('Draft').props.value,'Nội dung người dùng');
  assert.ok(app.queries.every(value=>value===false));
  await app.choose('Tiếng Việt');assert.equal(app.renderer.root.findByType('Header').props.title,'Cài đặt');
 }finally{await app.unmount();}
});
test('restores saved English before screens mount',async()=>{
 const read=deferred(),app=await mount({read:()=>read.promise});try{
  assert.equal(app.renderer.root.findAllByType('Header').length,0);
  await act(async()=>{read.resolve('en');});assert.equal(app.current.language,'en');assert.equal(app.renderer.root.findByType('Header').props.title,'Settings');
 }finally{await app.unmount();}
});

test('compact settings keep notification controls and reveal secondary actions',async()=>{
 const app=await mount({authenticated:true});try{
  assert.equal(app.renderer.root.findByType('SwitchRow').props.label,'Thông báo đẩy');
  assert.equal(app.renderer.root.findAllByType('TouchableOpacity').filter(n=>n.props.accessibilityRole==='radio').length,2);
  assert.equal(app.renderer.root.findAllByType('MenuItem').length,0);
  const more=app.renderer.root.findAllByType('TouchableOpacity').find(n=>n.findAllByType('Text').some(text=>text.children.includes('Cài đặt khác')));
  await act(async()=>more.props.onPress());
  assert.deepEqual(app.renderer.root.findAllByType('MenuItem').map(n=>n.props.label),['Đổi mật khẩu','Cài đặt thông báo hệ thống','Xoá bộ nhớ đệm']);
  await app.choose('English');assert.equal(app.renderer.root.findByType('SwitchRow').props.label,'Push notifications');
  assert.ok(app.renderer.root.findAllByType('Text').some(n=>n.children.includes('English')));
 }finally{await app.unmount();}
});
test('missing, invalid or unreadable storage defaults to Vietnamese',async()=>{
 for(const options of [{},{saved:'fr'},{saved:'system'},{read:async()=>{throw Error('unavailable');}}]){const app=await mount(options);try{assert.equal(app.current.language,'vi');assert.equal(core.getLocale(),'vi-VN');}finally{await app.unmount();}}
});
test('rapid changes serialize storage writes and preserve the final choice',async()=>{
 const first=deferred();let calls=0;const app=await mount({write:async()=>{if(++calls===1)await first.promise;}});try{
  let a,b,c;await act(async()=>{a=app.current.setLanguage('en');b=app.current.setLanguage('vi');c=app.current.setLanguage('en');});
  assert.equal(app.current.language,'en');assert.equal(core.getLocale(),'en-US');assert.deepEqual(app.writes,['en']);
  await act(async()=>{first.resolve();await Promise.all([a,b,c]);});assert.deepEqual(app.writes,['en','vi','en']);assert.equal(app.saved.get(core.LANGUAGE_STORAGE_KEY),'en');
 }finally{await app.unmount();}
});
test('failed persistence reports an English error and allows the next save',async()=>{
 let calls=0;const app=await mount({write:async()=>{if(++calls===1)throw Error('full');}});try{
  await app.choose('English');assert.equal(app.current.language,'en');assert.equal(app.alerts[0][0],"Couldn't save language");
  await app.choose('Tiếng Việt');assert.equal(app.saved.get(core.LANGUAGE_STORAGE_KEY),'vi');
  await assert.rejects(app.current.setLanguage('fr'),/Unsupported language/);
 }finally{await app.unmount();}
});
test('bundled dictionaries have matching keys and interpolation placeholders',()=>{
 const vi=require('../../src/features/language/locales/vi.json'),en=require('../../src/features/language/locales/en.json');
 assert.deepEqual(Object.keys(vi).sort(),Object.keys(en).sort());assert.ok(Object.keys(en).length>1000);
 for(const key of Object.keys(vi)){assert.ok(en[key].trim(),key);assert.deepEqual((vi[key].match(/\{\{[^}]+\}\}/g)??[]).sort(),(en[key].match(/\{\{[^}]+\}\}/g)??[]).sort(),key);}
});
test('date and currency formatting follows language and keeps VND',async()=>{
 const {formatVnd}=load('src/utils/currency.ts'),{formatMessageTime,formatRelativeTime}=load('src/utils/formatTime.ts');
 try{await core.i18n.changeLanguage('en');assert.equal(formatVnd(120000),'120,000 VND');assert.equal(formatRelativeTime(new Date().toISOString()),'Just now');assert.equal(formatMessageTime('2026-10-23T13:05:00Z'),new Date('2026-10-23T13:05:00Z').toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}));
 assert.equal(core.translate('{{value0}} phút trước',{value0:1,count:1}),'1 minute ago');
 assert.equal(core.translate('{{value0}} phút trước',{value0:2,count:2}),'2 minutes ago');
 await core.i18n.changeLanguage('vi');assert.equal(formatVnd(120000),'120.000đ');}finally{await core.i18n.changeLanguage('vi');}
});
test('status maps and validation errors use the selected language without changing codes',async()=>{
 const {getLocalizedLoginSchema}=load('src/utils/validators.ts');
 const booking=load('src/features/booking/utils/bookingStatus.ts');
 const themes=load('src/constants/theme.ts');
 try{await core.i18n.changeLanguage('en');assert.equal(getLocalizedLoginSchema().safeParse({phone:'',password:''}).error.issues[0].message,'Please enter your phone number');
 assert.equal(booking.getLocalizedBookingStatusTabs()[0].key,'ALL');assert.equal(booking.getLocalizedBookingStatusTabs()[0].label,'All');
 assert.equal(booking.getBookingStatusMap(themes.COLORS).COMPLETED.label,'Completed');
 assert.equal(core.translate('Mã xác nhận đã được gửi tới {{value0}}',{value0:'test@example.com'}),'A verification code was sent to test@example.com');
 assert.equal(core.translate('Unknown backend content'),'Unknown backend content');
 }finally{await core.i18n.changeLanguage('vi');}
});

test('booking header and receipt statuses switch in both directions',async()=>{
 const {getBookingStatusMeta,getPaymentStatusMeta}=load('src/features/booking/types/bookingStatus.ts');
 const colors=load('src/constants/theme.ts').COLORS;
 try{
  for(const language of ['en','vi']){
   await core.i18n.changeLanguage(language);
   for(const [code,key] of Object.entries({PENDING:'Chờ nhận việc',ASSIGNED:'Đã nhận việc',IN_PROGRESS:'Đang thực hiện',COMPLETED:'Hoàn thành',CANCELLED:'Đã hủy',EXPIRED:'Đã hết hạn'}))
    assert.equal(getBookingStatusMeta(code,colors).label,core.translate(key));
   for(const [code,key] of Object.entries({SUCCESS:'Đã thanh toán',PAID:'Đã thanh toán',REFUNDED:'Đã hoàn tiền',FAILED:'Thanh toán thất bại',CANCELLED:'Đã hủy thanh toán',PARTIALLY_REFUNDED:'Đã hoàn một phần',UNPAID:'Chưa thanh toán'}))
    assert.equal(getPaymentStatusMeta(code,colors).label,core.translate(key));
  }
  await core.i18n.changeLanguage('en');assert.equal(getPaymentStatusMeta('SUCCESS',colors).label,'Paid');
 }finally{await core.i18n.changeLanguage('vi');}
});

test('assistant cards translate existing API action labels without changing article titles',async()=>{
 const ui={View:'View',Text:'Text',TouchableOpacity:'TouchableOpacity',ActivityIndicator:'Spinner'};
 const {ChatbotActionCard}=load('src/features/chatbot/components/ChatbotActionCard.tsx',{'react-i18next':require('./language-support.cjs').react,'react-native':ui,'@expo/vector-icons':{Feather:'Icon'},'@/features/theme/ThemeProvider':{useAppTheme:()=>({COLORS:{}})}});
 let renderer;const card={type:'help',title:'Hướng dẫn do quản trị viên viết',label:'Xem nguồn hướng dẫn',version:3};
 const texts=()=>renderer.root.findAllByType('Text').flatMap(n=>n.children.filter(c=>typeof c==='string'));
 try{
  await act(async()=>{renderer=create(React.createElement(ChatbotActionCard,{card,onPress:()=>{},loading:false}));});
  await act(async()=>{await core.i18n.changeLanguage('en');});
  assert.ok(texts().includes('Guide source · Version 3'));assert.ok(texts().includes('View guide source'));assert.ok(texts().includes(card.title));
  await act(async()=>{renderer.update(React.createElement(ChatbotActionCard,{card:{type:'address_map',title:'Thêm địa chỉ trên bản đồ',label:'Chọn trên bản đồ'},onPress:()=>{},loading:false}));});
  assert.ok(texts().includes("Choose and save a location, then I'll help you continue"));
  await act(async()=>{await core.i18n.changeLanguage('vi');});assert.ok(texts().includes('Chọn vị trí rồi lưu, tôi sẽ tiếp tục giúp bạn'));
 }finally{if(renderer)await act(async()=>renderer.unmount());await core.i18n.changeLanguage('vi');}
});
