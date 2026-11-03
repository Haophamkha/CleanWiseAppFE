const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript'),React=require('react'),{create,act}=require('react-test-renderer');
const {language:core,react:i18nReact}=require('./language-support.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;
const root=path.resolve(__dirname,'../..');
function load(file,mocks={}){const filename=path.join(root,file),m=new Module(filename,module);m.paths=module.paths;m.require=name=>Object.hasOwn(mocks,name)?mocks[name]:name==='react-i18next'?i18nReact:name==='@/features/language/i18n'?core:name.startsWith('.')?require(path.resolve(path.dirname(filename),name)):require(name);m._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,filename);return m.exports;}
const {localizeTransactionNote}=load('src/features/payment/utils/localizeTransactionNote.ts');
const {localizeServiceField}=load('src/features/service/utils/localizeService.ts');
const fixtures=require('./fixtures/service-copy.json');
const ui={View:'View',Text:'Text',TouchableOpacity:'TouchableOpacity',Modal:'Modal',Pressable:'Pressable',ScrollView:'ScrollView',ActivityIndicator:'Spinner',RefreshControl:'RefreshControl',StyleSheet:{hairlineWidth:1}};
const theme=load('src/constants/theme.ts');
const common={'@/features/payment/utils/localizeTransactionNote':{localizeTransactionNote},'react-native':ui,'@expo/vector-icons':{Feather:'Icon'},'@/features/theme/ThemeProvider':{useAppTheme:()=>theme.APP_THEMES.light},'@/constants/theme':theme,'react-native-safe-area-context':{useSafeAreaInsets:()=>({top:0,bottom:0})},'expo-router':{router:{push:()=>{}}},'@/utils/currency':load('src/utils/currency.ts'),'@/utils/formatTime':load('src/utils/formatTime.ts')};
const textOf=r=>r.root.findAllByType('Text').flatMap(n=>n.children.filter(c=>typeof c==='string')).join(' ');

test('all seeded service presentation strings have bundled English translations',()=>{
 const en=require('../../src/features/language/locales/en.json');
 for (const text of fixtures) assert.ok(Object.hasOwn(en, text), text);
});

test('conditional and nested service choices keep API values, conditions, pricing and customer drafts in both languages',async()=>{
 const raw={key:'items',type:'REPEATABLE_GROUP',label:'Hạng mục cần vệ sinh',item_fields:[{key:'category',type:'SINGLE_SELECT',label:'Loại hạng mục',options:[{value:'MATTRESS',label:'Nệm'}]},{key:'size',type:'SINGLE_SELECT',options_by:'category',label:'Loại / Kích thước',options:[{when:{category:'MATTRESS'},items:[{value:'SMALL',label:'Nhỏ hơn 1.5m',description:'Nệm kích thước nhỏ hơn 1.5m'}]}]}]};
 const before=JSON.stringify(raw),values={items:[{category:'MATTRESS',size:'SMALL',quantity:2}],note:'Ưu tiên phòng ngủ'},draft=JSON.stringify(values);
 try{for(const lang of ['en','vi','en']){await core.i18n.changeLanguage(lang);const translated=localizeServiceField(raw,core.translate);assert.equal(translated.item_fields[0].options[0].value,'MATTRESS');assert.equal(translated.item_fields[1].options[0].when.category,'MATTRESS');assert.equal(translated.item_fields[1].options[0].items[0].value,'SMALL');assert.equal(translated.item_fields[0].options[0].label,lang==='en'?'Mattress':'Nệm');assert.equal(JSON.stringify(raw),before);assert.equal(JSON.stringify(values),draft);}}finally{await core.i18n.changeLanguage('vi');}
});

test('mounted service form and booking summary update cached schema in place when language changes',async()=>{
 const field={key:'duration',type:'SINGLE_SELECT',label:'Thời gian mỗi buổi',required:true,options:[{value:'2_HOURS',label:'2 giờ',description:'Tối đa 55m² hoặc 2 phòng'}]};
 const formShared={FieldControl:({field})=>React.createElement('Text',null,field.options[0].label+' '+field.options[0].description),getSelectedOption:(f,v)=>f.options.find(o=>o.value===v[f.key]),buildCaption:()=>undefined,resolveOptions:f=>f.options};
 const localized={'@/features/service/utils/localizeService':{localizeServiceField}};
 const {FormSchemaRenderer}=load('src/features/service/components/FormSchemaRenderer.tsx',{...common,...localized,'./formFieldShared':formShared,'./RepeatableCategoryGroupField':{RepeatableCategoryGroupField:'Group'},'./TaskChecklist':{TaskChecklist:'Tasks'}});
 const {ServiceOptionsSummary}=load('src/features/booking/components/ServiceOptionsSummary.tsx',{...common,...localized,'../../service/components/formFieldShared':formShared,'@/features/service/utils/servicePricing':{getItemTotalPrice:()=>150000}});
 let renderer;try{await act(async()=>{renderer=create(React.createElement(React.Fragment,null,React.createElement(FormSchemaRenderer,{fields:[field],values:{duration:'2_HOURS'},onChange:()=>{}}),React.createElement(ServiceOptionsSummary,{fields:[field,{key:'note',type:'TEXT',label:'Ghi chú'}],values:{duration:'2_HOURS',note:'Nhà có vật nuôi'}})));});
 for(const lang of ['en','vi','en']){await act(async()=>{await core.i18n.changeLanguage(lang);});const text=textOf(renderer);assert.ok(text.includes(lang==='en'?'Duration per session':'Thời gian mỗi buổi'));assert.ok(text.includes(lang==='en'?'2 hours':'2 giờ'));assert.ok(text.includes(lang==='en'?'Up to 55m² or 2 rooms':'Tối đa 55m² hoặc 2 phòng'));assert.ok(text.includes('Nhà có vật nuôi'));}assert.equal(field.options[0].label,'2 giờ');
 }finally{if(renderer)await act(async()=>renderer.unmount());await core.i18n.changeLanguage('vi');}
});

test('payment history translates backend titles, methods and statuses with stable booking codes',async()=>{
 function SectionList(props){return React.createElement(React.Fragment,null,props.ListHeaderComponent,...props.sections.flatMap(s=>s.data.map(item=>props.renderItem({item}))));}
 const item={id:'payment-1',kind:'PAYMENT',channel:'ONLINE',title:'Thanh toán đơn CW-001',booking_code:'CW-001',booking_id:1,method_display:'Chuyển khoản',status:'PENDING',status_display:'Chờ thanh toán',amount:'150000',note:'Nội dung khách nhập',created_at:new Date().toISOString()};
 const {PaymentHistory}=load('src/features/payment/components/PaymentHistory.tsx',{...common,'react-native':{...ui,SectionList},'@/components/common/ScreenHeader':{ScreenHeader:'Header'},'@/components/ui/EmptyState':{EmptyState:'Empty'},'@/features/payment/hooks/usePaymentHistory':{usePaymentHistory:()=>({items:[item],totals:{paid:0,refunded:0,count:1},isInitialLoading:false,isError:false})}});
 let renderer;try{await act(async()=>{renderer=create(React.createElement(PaymentHistory));});await act(async()=>{await core.i18n.changeLanguage('en');});let text=textOf(renderer);assert.ok(text.includes('Payment for booking CW-001'),text);assert.ok(text.includes(core.translate('Chuyển khoản')),text);assert.ok(text.includes(core.translate('Chờ thanh toán')),text);assert.ok(text.includes(item.note));await act(async()=>{await core.i18n.changeLanguage('vi');});assert.ok(textOf(renderer).includes('Thanh toán đơn CW-001'));}finally{if(renderer)await act(async()=>renderer.unmount());await core.i18n.changeLanguage('vi');}
});

 test('system transaction notes translate identifiers while free-form notes remain untouched',async()=>{try{await core.i18n.changeLanguage('en');assert.equal(localizeTransactionNote('Thanh toán đơn CW-001',core.translate),'Payment for booking CW-001');assert.equal(localizeTransactionNote('Nạp tiền vào ví (mã 123456)',core.translate),'Wallet top-up (code 123456)');assert.equal(localizeTransactionNote('Rút tiền về Test Bank ****1234',core.translate),'Withdrawal to Test Bank ****1234');assert.equal(localizeTransactionNote('Ưu tiên phòng ngủ',core.translate),'Ưu tiên phòng ngủ');await core.i18n.changeLanguage('vi');assert.equal(localizeTransactionNote('Thanh toán đơn CW-001',core.translate),'Thanh toán đơn CW-001');}finally{await core.i18n.changeLanguage('vi');}});
