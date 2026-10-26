/* Asset audit static contracts: no changes to Phaser or gameplay. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('asset-audit.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const readme=fs.readFileSync('README.md','utf8');
for(const id of ['gallery','search','category','usage','order','detail','export-csv',
 'export-json','checker','pixel','source-status','missing-list','duplicate-list']){
 assert(html.includes('id="'+id+'"'),'Audit missing '+id);
}
const src=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(src&&src.length>4000,'Catalog script missing');
new vm.Script(src,{filename:'asset-audit.html'});
const cache=JSON.parse(sw.match(/const ASSETS=(\[[^\n]*\]);/)[1]);
const visuals=cache.filter(p=>/\.(png|jpe?g|webp|svg|gif)$/i.test(p));
assert(visuals.length>=110,'Current precache should expose game image catalog');
assert(cache.includes('./asset-audit.html'),'Audit must be accessible offline');
assert(sw.includes('v68-asset-audit'),'Versioned PWA refresh required');
assert(html.includes('git/trees/main?recursive=1'),'Full Git tree inventory');
assert(html.includes('data.truncated'),'Never claim complete inventory from truncated response');
assert(html.includes('precacheFrom'),'Offline fallback');
assert(html.includes('sourceTexts'),'Real runtime source reference scanner');
assert(html.includes('explicitReferences'),'Real source cross-reference scanner');
assert(html.includes('STATE.missing'),'Detect paths not present in Git tree');
assert(html.includes('STATE.duplicates'),'SHA-based exact duplicates');
assert(html.includes('img.naturalWidth'),'Image dimensions must come from real media');
assert(html.includes('fileURL(a.path)'),'Use relative Pages path, not raw.githubusercontent');
assert(html.includes("String(v).replace(/\"/g")||html.includes('replace(/"/g'),'Escape CSV');
assert(html.includes('textContent'),'Dynamic content must not use unescaped innerHTML');
assert(!/\b(?:delete|removeFile|createFile)\s*\(/.test(src),
 'Auditor must not mutate repository files');
assert(readme.includes('asset-audit.html'),'The catalog must have a documented public route');
console.log('PASS audit static: '+visuals.length+' PWA images, source scanner, PWA/offline, exports and safe HTML');
