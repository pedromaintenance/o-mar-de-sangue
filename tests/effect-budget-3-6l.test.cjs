/* 3.6l — passive FX-budget telemetry, v1 compatibility and safe comparisons. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const prefs=new Map(),writes=[];
const context={
 localStorage:{
  getItem:k=>prefs.get(k)??null,
  setItem(k,v){writes.push(k);prefs.set(k,String(v));}
 },
 SEA_VIEW:{width:480,height:800},SEA_DESKTOP:false,Date
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('SeaPerformance.js','utf8')+
 ';this.perf=SEA_PERFORMANCE;',context);
vm.runInContext(fs.readFileSync('SeaPerformanceCompare.js','utf8')+
 ';this.comparator=SEA_PERFORMANCE_COMPARE;',context);
const p=context.perf,c=context.comparator;
const label={text:'',visible:false,
 setOrigin(){return this},setScrollFactor(){return this},
 setDepth(){return this},setVisible(v){this.visible=v;return this},
 setText(v){this.text=v;return this},destroy(){this.destroyed=true;}};
const s={effectsActive:0,effectsLimit:48,add:{text(){return label}}};
p.attach(s);
assert.equal(p.enabled,false);
for(let i=0;i<60;i++)p.sample(16.7);
assert.equal(p.report(),null,'Opt-out never collects FX or FPS data');
assert.equal(p.fxReadings,0);
p.setEnabled(true);
for(let i=0;i<60;i++){
 s.effectsActive=i<20?0:i<40?24:48;
 p.sample(16.7);
}
let a=p.report();
assert.equal(a.schema,1,'Additive fields do not require a schema migration');
assert.equal(a.retainedWindows,1);
assert.equal(a.samples[0].effectBudget.meanActive,24);
assert.equal(a.samples[0].effectBudget.peakActive,48);
assert.equal(a.samples[0].effectBudget.limit,48);
assert.equal(a.samples[0].effectBudget.atLimitFrames,20);
assert.equal(a.summary.effectBudget.meanActive,24);
assert.equal(a.summary.effectBudget.atLimitFrames,20);
assert(label.text.includes('FX 48/48')&&label.text.includes('NO LIMITE 20'));
assert.equal(p.fxReadings,0,'Counters reset after the measurement window');
s.effectsActive=3;
for(let i=0;i<60;i++)p.sample(16.7);
a=p.report();
assert.equal(a.retainedWindows,2);
assert.equal(a.summary.effectBudget.peakActive,48);
assert.equal(a.summary.effectBudget.meanActive,13.5);
assert.equal(a.summary.effectBudget.atLimitFrames,20);
assert.equal(a.samples[1].effectBudget.peakActive,3);
// All report objects must be detached snapshots, including nested telemetry.
a.summary.effectBudget.peakActive=999;
a.samples[0].effectBudget.meanActive=999;
assert.equal(p.report().summary.effectBudget.peakActive,48);
assert.equal(p.report().samples[0].effectBudget.meanActive,24);
const snapshot=p.report();
p.detach(s);
assert.equal(p.report().source,'viagem-concluida');
assert.equal(p.report().summary.effectBudget.meanActive,13.5);
const stable=p.report();
stable.summary.effectBudget.limit=2;
assert.equal(p.report().summary.effectBudget.limit,48);
const valid=c.parse(JSON.stringify(p.report()));
assert.equal(valid.summary.effectBudget.limit,48);
assert.equal(valid.summary.effectBudget.peakActive,48);
assert.equal(valid.sampleCount,2);
const legacy=JSON.parse(JSON.stringify(p.report()));
delete legacy.summary.effectBudget;
legacy.samples.forEach(s=>delete s.effectBudget);
assert.equal(c.parse(JSON.stringify(legacy)).summary.effectBudget,undefined);
assert.equal(c.compare(valid,c.parse(JSON.stringify(legacy))).metrics.length,6);
assert(c.compare(valid,c.parse(JSON.stringify(legacy))).warnings.some(
 w=>w.includes('Apenas um relatório')));
const compared=c.compare(valid,c.parse(JSON.stringify(p.report())));
assert.equal(compared.metrics.length,9);
assert.equal(compared.metrics[6].label,'FX · MÉDIA');
assert(compared.warnings.some(w=>w.includes('causalidade')));
assert(!JSON.stringify(valid).includes('samples'),'Comparator discards raw frames');
function invalid(modify){
 const doc=JSON.parse(JSON.stringify(p.report()));modify(doc);
 assert.throws(()=>c.parse(JSON.stringify(doc)),/efeitos|Número inválido|quadros no limite/);
}
invalid(d=>{d.samples[0].effectBudget.peakActive=49;});
invalid(d=>{d.samples[1].effectBudget.meanActive=-2;});
invalid(d=>{d.samples[1].effectBudget.atLimitFrames=100;});
invalid(d=>{d.summary.effectBudget.atLimitFrames=900;});
invalid(d=>{delete d.samples[1].effectBudget;});
invalid(d=>{d.summary.effectBudget.peakActive=47;});
// A malformed scene cannot poison the report or trigger game behavior.
p.attach({effectsActive:-20,effectsLimit:0,add:s.add});
for(let i=0;i<60;i++)p.sample(16.7);
const malformed=p.report();
assert.equal(malformed.samples[0].effectBudget,undefined);
assert.equal(malformed.summary.effectBudget,undefined);
p.setEnabled(false);
assert.equal(p.fxReadings,0);
assert(writes.every(k=>k==='carcaca.mar.performance.visible.v1'));
assert(!/SeaProfile\s*\.|playerVelocity|\.fire\(/.test(
 fs.readFileSync('SeaPerformance.js','utf8')));
console.log('PASS 3.6l: effect budget observed passively, isolated, backward compatible');
