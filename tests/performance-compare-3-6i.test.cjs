/* 3.6i: validate local comparison inputs without touching saves or network. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('SeaPerformanceCompare.js','utf8');
const context={};vm.createContext(context);
vm.runInContext(source+';this.tool=SEA_PERFORMANCE_COMPARE;',context);
const tool=context.tool;
function report({count=30,fps=59,view='compact',source='viagem-concluida',truncated=false}={}){
 const samples=Array.from({length:count},(_,i)=>({
  second:i+1,fps,meanMs:Math.round(10000/fps)/10,maxMs:40,
  slowFrames:1,frames:fps
 }));
 return {format:'mar-de-sangue-performance-report',schema:1,
  capturedAt:'2026-10-17T10:00:00.000Z',startedAt:'2026-10-17T09:55:00.000Z',
  source,view,metric:'Phaser update',seconds:count,
  retainedWindows:count,rollingLimit:180,truncated,
  summary:{minFps:fps,medianFps:fps,meanFps:fps,
   worstFrameMs:40,slowFrames:count,updateFrames:fps*count},samples
 };
}
const a=tool.parse(JSON.stringify(report()));
const b=tool.parse(JSON.stringify(report({count:10,fps:45,view:'desktop'})));
const result=tool.compare(a,b);
const rows=JSON.parse(JSON.stringify(result.metrics));
assert.equal(rows.length,6);
assert.deepEqual(rows[0],{label:'FPS MÉDIO',unit:'fps',a:59,b:45,
 delta:-14,higherBetter:true});
assert(result.warnings.some(s=>s.includes('diferentes')));
assert(result.warnings.some(s=>s.includes('menos de 20')));
assert(result.warnings.some(s=>s.includes('durações')));
assert(!result.a.samples,'Imported raw arrays must be discarded');
const safe=tool.compare(tool.parse(JSON.stringify(report())),
 tool.parse(JSON.stringify(report({fps:58}))));
assert.equal(safe.warnings.length,0);
const defaults=report();
const rejected=[
 ['{broken',/inválido/],[' ',/vazio/],
 ['x'.repeat(262145),/256 KB/],
 [JSON.stringify({...defaults,schema:2}),/FPS v1/],
 [JSON.stringify({...defaults,view:'arbitrary'}),/visualização/],
 [JSON.stringify({...defaults,samples:[]}),/180 amostras/],
 [JSON.stringify({...defaults,samples:[...defaults.samples,...defaults.samples,
   ...defaults.samples,...defaults.samples,...defaults.samples,...defaults.samples,
   ...defaults.samples]}),/180 amostras/],
 [JSON.stringify({...defaults,retainedWindows:999}),/Quantidade/],
 [JSON.stringify({...defaults,summary:{...defaults.summary,meanFps:'bad'}}),/Número/],
 [JSON.stringify({...defaults,samples:defaults.samples.map((s,i)=>i===1?{...s,second:.2}:s)}),/temporal/],
 [JSON.stringify({...defaults,samples:defaults.samples.map((s,i)=>i===2?{...s,fps:Infinity}:s)}),/Número/],
 [JSON.stringify({...defaults,summary:{...defaults.summary,slowFrames:999999}}),/incompatível/],
 [JSON.stringify({...defaults,source:'hack'}),/Origem/]
];
for(const [payload,pattern] of rejected)assert.throws(()=>tool.parse(payload),pattern);
const malicious=tool.parse(JSON.stringify({...defaults,
 device:'<img src=x onerror=alert(1)>',player:{gold:999},notes:'<script>alert(1)</script>'}));
assert.equal(JSON.stringify(malicious).includes('script'),false);
assert.equal(JSON.stringify(malicious).includes('gold'),false);
assert.equal(JSON.stringify(malicious).includes('<'),false);
const executable=source.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');
assert(!/SeaProfile\s*\.|\blocalStorage\b|\bfetch\s*\(|XMLHttpRequest/.test(executable),
 'Comparator cannot access profile, storage or network');
console.log('PASS 3.6i: FPS reports validated locally; warnings, comparisons and malformed inputs');
