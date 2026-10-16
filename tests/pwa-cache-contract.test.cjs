/* 3.6a: the service worker must never precache paths that do not exist.
 * Failing a single cache.addAll() request prevents SW activation.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('sw.js','utf8');
const context={self:{addEventListener(){}}};
vm.createContext(context);
vm.runInContext(source+';this.assets=ASSETS;this.cacheName=CACHE_NAME;',context);
const assets=[...context.assets];
assert(assets.length>100,'The offline manifest should include game assets');
assert.equal(new Set(assets).size,assets.length,'No duplicated cache paths');
assert(assets.includes('./PwaStatus.js'));
assert(assets.includes('./index.html'));
assert(assets.includes('./Game.js'));
for(const url of assets){
  assert(url.startsWith('./'),'Unexpected external precache URL '+url);
  if(url==='./')continue;
  const local=url.slice(2);
  assert(fs.existsSync(local),'Precache resource missing: '+url);
  assert(fs.statSync(local).isFile(),'Precache resource is not a file: '+url);
}
assert(!assets.some(x=>x.includes('manifest.json')&&x!=='./manifest.webmanifest'));
assert(context.cacheName.includes('v42-offline'));
console.log('PASS precache: '+assets.length+' verified local resources, zero missing');
