const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'../..');
function load(file,mocks={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:id=>mocks[id]??require(id),__DEV__:false,console});return exports;}
function setup({post:refreshPost,save}={}){
 let access='old-access',refresh='old-refresh',cleared=0,posts=0,saves=0,rejected;const routes=[];
 const instance=async config=>({data:{id:1},config});instance.interceptors={request:{use(){}},response:{use(ok,error){rejected=error}}};
 const axios={create:()=>instance,isAxiosError:e=>!!e?.isAxiosError,post:async(url,...args)=>{
  if(url.endsWith('/logout/'))return {data:{}};posts++;return refreshPost?refreshPost(url,...args):{data:{access:'new-access',refresh:'new-refresh'}};
 }};
 const storage={getItem:async key=>key==='access'?access:key==='refresh'?refresh:null,setSession:async(a,r)=>{saves++;if(save)await save(saves);access=a;refresh=r},clearSession:async()=>{cleared++;access=null;refresh=null},deleteItem:async()=>{}};
 const api=load('src/store/baseApi.ts',{
  '@/features/language/i18n':{translate:x=>x},'@/features/auth/utils/refreshFailure':load('src/features/auth/utils/refreshFailure.ts'),
  '@/config/constants':{STORAGE_KEYS:{ACCESS_TOKEN:'access',REFRESH_TOKEN:'refresh',PUSH_TOKEN:'push'}},'@/config/env':{ENV:{API_URL:'https://example.test'}},
  '@/store/authSlice':{clearAuth:()=>({type:'clear'})},'@/utils/storage':{storage},'@/utils/toast':{showErrorToast(){}},
  '@reduxjs/toolkit/query/react':{createApi:()=>({util:{resetApiState:()=>({type:'reset'})}})},
  'axios':{__esModule:true,default:axios},'expo-router':{router:{replace:r=>routes.push(r)}},
 });
 const request=()=>rejected({config:{url:'/api/auth/customer/profile/',headers:{Authorization:`Bearer ${access}`}},response:{status:401}});
 return {api,request,cleared:()=>cleared,posts:()=>posts,saves:()=>saves,access:()=>access,refresh:()=>refresh,routes};
}
test('successful server rotation + local write error retains session; retry persists same rotated tokens without second refresh',async()=>{
 let fail=true;const s=setup({save:async()=>{if(fail)throw Error('secure-store unavailable')}});
 await assert.rejects(s.request());assert.equal(s.cleared(),0);assert.equal(s.routes.length,0);assert.equal(s.posts(),1);
 fail=false;await s.request();assert.equal(s.posts(),1);assert.equal(s.access(),'new-access');assert.equal(s.refresh(),'new-refresh');assert.equal(s.cleared(),0);
});
for(const scenario of [
 {name:'offline',post:async()=>{throw {isAxiosError:true}}},
 {name:'server error',post:async()=>{throw {isAxiosError:true,response:{status:503}}}},
 {name:'malformed response',post:async()=>({data:{unexpected:true}})},
 {name:'non-token 400 error',post:async()=>{throw {isAxiosError:true,response:{status:400,data:{detail:'upstream error'}}}}},
])test(`${scenario.name} does not erase the saved session or route to login`,async()=>{
 const s=setup({post:scenario.post});await assert.rejects(s.request());assert.equal(s.cleared(),0);assert.equal(s.routes.length,0);assert.equal(s.refresh(),'old-refresh');
});
test('explicit rejected refresh does clear the invalid session',async()=>{
 const s=setup({post:async()=>{throw {isAxiosError:true,response:{status:401,data:{code:'token_not_valid'}}}}});await assert.rejects(s.request());assert.equal(s.cleared(),1);assert.equal(s.routes.length,1);
});
test('concurrent callers share one refresh request',async()=>{
 let resolve;const response=new Promise(r=>{resolve=r});const s=setup({post:()=>response});const first=s.api.refreshAccessToken(),second=s.api.refreshAccessToken();assert.equal(first,second);resolve({data:{access:'new',refresh:'rotated'}});await Promise.all([first,second]);assert.equal(s.posts(),1);
});
test('old in-flight refresh cannot overwrite a session after logout/new login reset',async()=>{
 let resolve;const response=new Promise(r=>{resolve=r});const s=setup({post:()=>response});const pending=s.api.refreshAccessToken();await new Promise(r=>setImmediate(r));s.api.resetRefreshState();resolve({data:{access:'stale',refresh:'stale-refresh'}});await assert.rejects(pending,/SESSION_CHANGED/);assert.equal(s.saves(),0);assert.equal(s.cleared(),0);
});
