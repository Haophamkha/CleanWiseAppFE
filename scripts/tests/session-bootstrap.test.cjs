const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),{create,act}=require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT=true;
function load(file,mocks={}) {
 const code=ts.transpileModule(fs.readFileSync(path.resolve(__dirname,'../..',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const exports={};vm.runInNewContext(code,{exports,require:id=>id in mocks?mocks[id]:require(id),console});return exports;
}
function deferred(){let resolve;const promise=new Promise(r=>{resolve=r});return {promise,resolve};}
function setup(read,fetch,initialSegments=['(tabs)','home']) {
 let segments=initialSegments;const redirects=[];const router={replace:href=>redirects.push(href)};
 let user=null;const dispatch=a=>{user=a.payload},trigger=()=>({unwrap:fetch});
 const hooks=load('src/features/auth/hooks/useSessionBootstrap.ts',{
  'expo-router':{useRouter:()=>router,useSegments:()=>segments},
  '@/config/constants':{ROUTES:{HOME:'/(tabs)/home'},STORAGE_KEYS:{ACCESS_TOKEN:'access',REFRESH_TOKEN:'refresh'}},
  '@/features/auth/api/authApi':{useLazyGetProfileQuery:()=>[trigger]},
  '@/features/auth/utils/restoreCustomerSession':load('src/features/auth/utils/restoreCustomerSession.ts'),
  '@/store/authSlice':{setUser:payload=>({payload})},'@/store/hooks':{useAppDispatch:()=>dispatch},
  '@/utils/storage':{storage:{getSession:async()=>({access:await read('access'),refresh:await read('refresh')}),persistSession:async()=>{}}},
 });
 const {SessionBootstrap}=load('src/features/auth/components/SessionBootstrap.tsx',{
  '@/features/auth/components/SessionLoadingScreen':{SessionLoadingScreen:p=>React.createElement('loading',p)},
  '@/features/auth/hooks/useSessionBootstrap':hooks,
  '@/features/notification/hooks/usePushNotifications':{usePushNotifications:()=>{}},
  '@/features/notification/hooks/useUnreadCountRealtime':{useUnreadCountRealtime:()=>{}},
  '@/store/hooks':{useAppSelector:fn=>fn({auth:{user}})},
  'react-native':{View:'view',StyleSheet:{absoluteFill:{position:'absolute'}}},
 });return {SessionBootstrap,user:()=>user,redirects,navigate:next=>{segments=next}};
}
async function mount(s){let tree;await act(async()=>{tree=create(React.createElement(s.SessionBootstrap,null,React.createElement('guest')))});return tree;}
const content=t=>t.root.findAllByType('view')[1];
const close=async t=>{await act(async()=>t.unmount());};
test('hide guest while reading tokens and fetching profile; reveal only after restored',async()=>{
 const tokens=deferred(),profile=deferred();let calls=0;
 const s=setup(()=>tokens.promise,()=>{calls++;return profile.promise}),tree=await mount(s);
 assert.equal(content(tree).props.style.opacity,0);assert.equal(content(tree).props.pointerEvents,'none');assert.equal(content(tree).props.accessibilityElementsHidden,true);
 await act(async()=>tokens.resolve('saved'));assert.equal(calls,1);assert.equal(tree.root.findAllByType('loading').length,1);
 await act(async()=>profile.resolve({id:4}));assert.equal(s.user().id,4);assert.equal(tree.root.findByType('loading').props.success,true);await act(async()=>tree.root.findByType('loading').props.onComplete());assert.equal(tree.root.findAllByType('loading').length,0);assert.equal(content(tree).props.style.opacity,1);await close(tree);
});
test('no tokens: guest opens without profile request',async()=>{
 const s=setup(async()=>null,()=>{throw Error('unexpected request')}),tree=await mount(s);
 assert.equal(content(tree).props.style.opacity,1);assert.equal(s.user(),null);await close(tree);
});
test('offline: keep session covered and allow successful retry',async()=>{
 let ok=false;const s=setup(async()=>'saved',async()=>{if(!ok)throw Error('offline');return {id:5}}),tree=await mount(s);
 assert.equal(tree.root.findByType('loading').props.error,true);assert.equal(content(tree).props.style.opacity,0);ok=true;
 await act(async()=>tree.root.findByType('loading').props.onRetry());assert.equal(s.user().id,5);await act(async()=>tree.root.findByType('loading').props.onComplete());assert.equal(tree.root.findAllByType('loading').length,0);await close(tree);
});
test('refresh rejected and tokens removed: finish for signed-out route',async()=>{
 let revoked=false;const s=setup(async()=>revoked?null:'saved',async()=>{revoked=true;throw Error('401')}),tree=await mount(s);
 assert.equal(content(tree).props.style.opacity,1);assert.equal(s.user(),null);await close(tree);
});
test('refresh token alone restores session',async()=>{
 const s=setup(async k=>k==='refresh'?'refresh':null,async()=>({id:6})),tree=await mount(s);assert.equal(s.user().id,6);await close(tree);
});
test('storage error: show retry instead of guest content',async()=>{
 const s=setup(async()=>{throw Error('storage')},async()=>({id:7})),tree=await mount(s);assert.equal(tree.root.findByType('loading').props.error,true);assert.equal(content(tree).props.style.opacity,0);await close(tree);
});

for(const route of ['login','register']) test(`restored session on auth/${route} stays covered until Home replaces the auth route`,async()=>{
 const s=setup(async()=> 'saved',async()=>({id:8}),['(auth)',route]),tree=await mount(s);
 assert.equal(tree.root.findByType('loading').props.success,true);
 await act(async()=>tree.root.findByType('loading').props.onComplete());
 assert.deepEqual(s.redirects,['/(tabs)/home']);
 assert.equal(tree.root.findAllByType('loading').length,1);
 assert.equal(content(tree).props.style.opacity,0);
 s.navigate(['(tabs)','home']);
 await act(async()=>tree.update(React.createElement(s.SessionBootstrap,null,React.createElement('guest'))));
 assert.equal(tree.root.findAllByType('loading').length,0);
 assert.equal(content(tree).props.style.opacity,1);
 await close(tree);
});
