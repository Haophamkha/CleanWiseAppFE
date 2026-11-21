const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),{create,act}=require('react-test-renderer');global.IS_REACT_ACT_ENVIRONMENT=true;
const code=ts.transpileModule(fs.readFileSync(path.resolve(__dirname,'../../src/features/auth/hooks/useLogin.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
function deferred(){let resolve;const promise=new Promise(r=>{resolve=r});return {promise,resolve}}
function setup({save=async()=>{},profile=async()=>({id:1,role:'CUSTOMER'}),role='CUSTOMER'}={}){
 let api,google;const events=[],routes=[];const res={access:'a',refresh:'r',user:{id:1,role}};
 const login=()=>({unwrap:async()=>{events.push('login');return res}});
 const getProfile=()=>({unwrap:async()=>{events.push('profile');return profile()}});
 const dispatch=a=>events.push(a.type);
 const mocks={
  'react-i18next':{useTranslation:()=>({t:x=>x})},
  '@/config/constants':{ROUTES:{HOME:'/home'},STORAGE_KEYS:{REFRESH_TOKEN:'refresh'}},
  '@/features/auth/api/authApi':{saveTokens:async()=>{events.push('save');await save();events.push('saved')},useLoginMutation:()=>[login,{isLoading:false}],useLoginWithGoogleMutation:()=>[login,{isLoading:false}],useLazyGetProfileQuery:()=>[getProfile]},
  '@/features/auth/hooks/useGoogleAuth':{useGoogleAuth:fn=>{google=fn;return {request:true,promptAsync:()=>{}}}},
  '@/store/authSlice':{setUser:()=>({type:'user'})},'@/store/baseApi':{baseApi:{util:{resetApiState:()=>({type:'reset'})}}},
  '@/store/hooks':{useAppDispatch:()=>dispatch},'@/utils/storage':{storage:{getItem:async()=>'r'}},
  '@/utils/apiError':{getApiErrorMessage:()=> 'error'},'@/utils/toast':{showErrorToast:()=>{}},
  '@/utils/validators':{getLocalizedLoginSchema:()=>({safeParse:()=>({success:true})})},
  'expo-router':{router:{replace:route=>routes.push(route)}},
 };
 const exports={};vm.runInNewContext(code,{exports,require:id=>id in mocks?mocks[id]:require(id)});
 function Harness(){api=exports.useLogin();return null}
 return {Harness,api:()=>api,google:token=>google(token),events,routes};
}
async function mount(s){let tree;await act(async()=>{tree=create(React.createElement(s.Harness))});return tree}
async function close(t){await act(async()=>t.unmount())}
test('customer login waits for durable tokens and profile, then success before navigation',async()=>{
 const saved=deferred(),profile=deferred(),s=setup({save:()=>saved.promise,profile:()=>profile.promise}),tree=await mount(s);let submitting;
 await act(async()=>{submitting=s.api().submit()});assert.equal(s.api().sessionPhase,'loading');assert.deepEqual(s.events,['login','save']);assert.equal(s.routes.length,0);
 await act(async()=>saved.resolve());assert.deepEqual(s.events,['login','save','saved','reset','profile']);assert.equal(s.api().sessionPhase,'loading');
 await act(async()=>{profile.resolve({id:1,role:'CUSTOMER'});await submitting});assert.equal(s.api().sessionPhase,'success');assert.equal(s.routes.length,0);
 await act(async()=>s.api().finishSession());assert.deepEqual(s.routes,['/home']);await close(tree);
});
test('profile network error stays in loading error; retry does not re-login or overwrite tokens',async()=>{
 let online=false;const s=setup({profile:async()=>{if(!online)throw Error('offline');return {id:1}}}),tree=await mount(s);
 await act(async()=>s.api().submit());assert.equal(s.api().sessionPhase,'error');online=true;
 await act(async()=>s.api().retrySession());assert.equal(s.api().sessionPhase,'success');assert.equal(s.events.filter(e=>e==='login').length,1);assert.equal(s.events.filter(e=>e==='save').length,1);await close(tree);
});
test('Google login uses the same loading and persistence flow',async()=>{
 const s=setup(),tree=await mount(s);await act(async()=>s.google('google-id-token'));assert.equal(s.api().sessionPhase,'success');assert.deepEqual(s.events,['login','save','saved','reset','profile','user']);await close(tree);
});
test('wrong role never saves a session or opens a success screen',async()=>{
 const s=setup({role:'WORKER'}),tree=await mount(s);await act(async()=>s.api().submit());assert.equal(s.api().sessionPhase,'idle');assert.deepEqual(s.events,['login']);await close(tree);
});
