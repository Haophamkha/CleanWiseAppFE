const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'../..');
function load(file,mocks={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:id=>mocks[id]??require(id)});return exports;}
const secureHelpers=load('src/utils/customerSecureStorage.ts');
const sessionHelpers=load('src/utils/sessionStorage.ts');
function native(){const values=new Map(),calls=[];let failWrites=false;return {values,calls,fail:value=>{failWrites=value},
 getItemAsync:async(key,options)=>{calls.push({method:'get',key,options});return values.get(`${options?.keychainService||'default'}:${key}`)??null},
 setItemAsync:async(key,value,options)=>{calls.push({method:'set',key,options});if(!failWrites)values.set(`${options?.keychainService||'default'}:${key}`,value)},
 deleteItemAsync:async(key,options)=>{values.delete(`${options?.keychainService||'default'}:${key}`)},
};}
function restart(secure){return load('src/utils/storage.ts',{
 './sessionStorage':sessionHelpers,'./customerSecureStorage':secureHelpers,
 '@/features/auth/utils/jwt':{decodeJwtPayload:()=>({role:'CUSTOMER'})},
 '@react-native-async-storage/async-storage':{__esModule:true,default:{getItem:()=>{throw Error('Native credentials must stay encrypted')}}},
 'expo-secure-store':secure,'react-native':{Platform:{OS:'android'}},
}).storage;}
test('actual customer storage adapter restores access and refresh after JS/process restart',async()=>{
 const secure=native(),first=restart(secure);await first.setSession('access','refresh');
 const second=restart(secure);const tokens=await second.getSession();assert.equal(tokens.access,'access');assert.equal(tokens.refresh,'refresh');
 assert.ok(secure.calls.filter(c=>c.key===secureHelpers.CUSTOMER_SESSION_KEY).every(c=>c.options?.keychainService===secureHelpers.CUSTOMER_KEYCHAIN_SERVICE || c.method==='get'));
});
test('existing default-service session is migrated without requiring a new login',async()=>{
 const secure=native(),saved=JSON.stringify({access:'old-access',refresh:'old-refresh'});
 secure.values.set(`default:${secureHelpers.CUSTOMER_SESSION_KEY}`,saved);
 const storage=restart(secure);assert.equal((await storage.getSession()).refresh,'old-refresh');
 assert.equal(secure.values.get(`${secureHelpers.CUSTOMER_KEYCHAIN_SERVICE}:${secureHelpers.CUSTOMER_SESSION_KEY}`),saved);
 assert.equal((await restart(secure).getSession()).access,'old-access');
});
test('silent native write failure cannot be shown as successful login',async()=>{
 const secure=native();secure.fail(true);const storage=restart(secure);await assert.rejects(storage.setSession('access','refresh'),/SESSION_NOT_PERSISTED/);
});
test('cleared new session cannot resurrect an old default-service session after relaunch',async()=>{
 const secure=native();secure.values.set(`default:${secureHelpers.CUSTOMER_SESSION_KEY}`,JSON.stringify({access:'old',refresh:'old'}));
 const storage=restart(secure);await storage.clearSession();const reopened=await restart(secure).getSession();assert.equal(reopened.access,null);assert.equal(reopened.refresh,null);
});
test('session migration does not silently succeed if native storage fails to retain data',async()=>{
 const secure=native();secure.values.set(`default:${secureHelpers.CUSTOMER_SESSION_KEY}`,JSON.stringify({access:'old',refresh:'old'}));secure.fail(true);
 await assert.rejects(restart(secure).getSession(),/SESSION_MIGRATION_NOT_PERSISTED/);
});
