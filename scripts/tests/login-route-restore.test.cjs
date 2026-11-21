const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),{create,act}=require('react-test-renderer');global.IS_REACT_ACT_ENVIRONMENT=true;
const host=name=>({children,...props})=>React.createElement(name,props,children);
async function render(user,phase='idle'){
 const code=ts.transpileModule(fs.readFileSync(path.resolve(__dirname,'../../src/app/(auth)/login.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const mocks={
  '@/features/language/i18n':{localizeKnownMessage:x=>x},'react-i18next':{useTranslation:()=>({t:x=>x})},
  '@/features/theme/ThemeProvider':{useAppTheme:()=>({COLORS:{}})},
  '@/features/auth/components/AuthKit':{AuthScreen:host('AuthScreen'),OrDivider:host('Divider'),PillButton:host('Button'),PillInput:host('Input')},
  '@/features/auth/components/SessionLoadingScreen':{SessionLoadingScreen:host('Loading')},
  '@/features/auth/hooks/useLogin':{useLogin:()=>({sessionPhase:phase})},
  '@/store/hooks':{useAppSelector:fn=>fn({auth:{user}})},'@/config/constants':{ROUTES:{HOME:'/(tabs)/home'}},
  '@assets/icon/google.png':{__esModule:true,default:0},'expo-router':{Link:host('Link'),Redirect:host('Redirect'),router:{replace(){}}},
  'react-native':{Image:host('Image'),Modal:host('Modal'),Text:host('Text'),View:host('View')},
 };
 const exports={};vm.runInNewContext(code,{exports,require:id=>id in mocks?mocks[id]:require(id)});
 let tree;await act(async()=>{tree=create(React.createElement(exports.default))});return tree;
}
const close=async tree=>{await act(async()=>tree.unmount())};
test('reopening the saved login route with a restored session must go home',async()=>{
 const tree=await render({id:1,role:'CUSTOMER'});try{assert.equal(tree.root.findAllByType('Redirect').length,1);assert.equal(tree.root.findByType('Redirect').props.href,'/(tabs)/home');assert.equal(tree.root.findAllByType('AuthScreen').length,0)}finally{await close(tree)}
});
test('signed-out visitor can still use login',async()=>{const tree=await render(null);assert.equal(tree.root.findAllByType('AuthScreen').length,1);assert.equal(tree.root.findAllByType('Redirect').length,0);await close(tree)});
for(const phase of ['loading','success','error'])test(`new login ${phase} keeps its transition instead of redirecting early`,async()=>{
 const tree=await render({id:1},phase);assert.equal(tree.root.findAllByType('Redirect').length,0);assert.equal(tree.root.findByType('Modal').props.visible,true);await close(tree);
});
