const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),{create,act}=require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT=true;

test('RootLayout has no raw JSX text inside providers or Stack',async()=>{
 const source=fs.readFileSync(path.resolve(__dirname,'../../src/app/_layout.tsx'),'utf8');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const host=name=>({children})=>React.createElement(name,null,children);
 const Stack=host('Stack');Stack.Screen=host('Screen');
 const mocks={
  '@/features/auth/components/SessionBootstrap':{SessionBootstrap:host('SessionBootstrap')},
  '@/components/common/ConfirmProvider':{ConfirmProvider:host('ConfirmProvider')},
  '@/components/common/SuccessSheet':{SuccessSheetProvider:host('SuccessSheetProvider')},
  '@/config/toastConfig':{AppToast:host('AppToast')},
  '@/store/baseApi':{registerAuthDispatch:()=>{}},
  '@/store/store':{store:{dispatch:()=>{}}},
  'expo-router':{Stack},
  'react-native-safe-area-context':{SafeAreaProvider:host('SafeAreaProvider')},
  'react-redux':{Provider:host('ReduxProvider')},
  '@/features/theme/ThemeProvider':{AppThemeProvider:host('ThemeProvider')},
  '@/features/language/LanguageProvider':{AppLanguageProvider:host('LanguageProvider')},
  'expo-splash-screen':{preventAutoHideAsync:async()=>{}},
  '../global.css':{},
 };
 const exports={};vm.runInNewContext(code,{exports,require:id=>id in mocks?mocks[id]:require(id)});
 let tree;
 await act(async()=>{tree=create(React.createElement(exports.default))});
 try {
  function inspect(node) {
   if(!node)return;
   assert.equal(typeof node,'object',`Raw text outside Text: ${JSON.stringify(node)}`);
   for(const child of node.children||[])inspect(child);
  }
  inspect(tree.toJSON());
 } finally {await act(async()=>tree.unmount())}
});
