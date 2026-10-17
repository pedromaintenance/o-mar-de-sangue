/* 3.6l.1 — normalized counts per 1,000 frames, with v1 compatibility. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('SeaPerformanceCompare.js','utf8');
const ctx={};vm.createContext(ctx);vm.runInContext(source+';this.c=SEA_PERFORMANCE_COMPARE;',ctx);
const c=ctx.c;
function report(count,frames,slow,fxAtLimit){
 const fx=fxAtLimit===null?null:{meanActive:12,peakActive:48,limit:48,
   atLimitFrames:count*fxAtLimit};
 const samples=Array.from({length:count},(_,i)=>({
   second:i+1,fps:frames,meanMs:Math.round(10000/frames)/10,maxMs:40,
   frames,slowFrames:slow,...(fx?{effectBudget:{meanActive:12,peakActive:48,
     limit:48,atLimitFrames:fxAtLimit}}:{})
 }));
 return {format:'mar-de-sangue-performance-report',schema:1,
   capturedAt:'2026-10-17T13:00:00.000Z',startedAt:'2026-10-17T12:00:00.000Z',
   view:'compact',source:'viagem-concluida',seconds:count,
   retainedWindows:count,rollingLimit:180,truncated:false,
   summary:{minFps:frames,medianFps:frames,meanFps:frames,
    worstFrameMs:40,slowFrames:count*slow,updateFrames:count*frames,
    ...(fx?{effectBudget:fx}:{})},
   samples};
}
// Longer captures can have more absolute stutters but lower stutters/1,000.
const rawA=report(20,60,3,6),rawB=report(30,40,1,2);
const a=c.parse(JSON.stringify(rawA)),b=c.parse(JSON.stringify(rawB));
const compared=c.compare(a,b);
const row=label=>compared.metrics.find(x=>x.label===label);
assert.equal(compared.metrics.length,11);
assert.deepEqual(JSON.parse(JSON.stringify(row('LENTOS / 1.000'))),{
 label:'LENTOS / 1.000',unit:'por mil quadros',
 a:50,b:25,delta:-25,higherBetter:false});
assert.deepEqual(JSON.parse(JSON.stringify(row('FX NO LIMITE / 1.000'))),{
 label:'FX NO LIMITE / 1.000',unit:'por mil quadros',
 a:100,b:50,delta:-50,higherBetter:null});
assert.equal(row('QUADROS >33 MS').a,60);
assert.equal(row('QUADROS >33 MS').b,30);
assert.equal(row('FX · NO LIMITE').a,120);
assert.equal(row('FX · NO LIMITE').b,60);
const old=report(20,60,3,null);
const legacy=c.compare(c.parse(JSON.stringify(old)),b);
assert.equal(legacy.metrics.length,7);
assert(legacy.warnings.some(w=>w.includes('Apenas um relatório')));
assert.equal(legacy.metrics.some(x=>x.label==='FX NO LIMITE / 1.000'),false);
const corrupted=report(20,60,3,null);
corrupted.summary.slowFrames++;
assert.throws(()=>c.parse(JSON.stringify(corrupted)),/Contagens de quadros incompatíveis/);
const corrupted2=report(20,60,3,null);
corrupted2.summary.updateFrames+=1;
assert.throws(()=>c.parse(JSON.stringify(corrupted2)),/Contagens de quadros incompatíveis/);
const changed=report(20,60,3,6);
changed.samples[0].frames=0;
assert.throws(()=>c.parse(JSON.stringify(changed)),/Contagem de quadros incompatíveis/);
const executable=source.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');
assert(!/SeaProfile\s*\.|\blocalStorage\b|\bfetch\s*\(|XMLHttpRequest/.test(executable));
console.log('PASS 3.6l.1: normalized slow/FX rates, v1 legacy and verified totals');
