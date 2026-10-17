/* 3.6h bounded memory-only report, export snapshot and summary correctness.
 * node tests/performance-report-3-6h.test.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync('SeaPerformance.js','utf8');
const prefs=new Map(),writes=[];
const localStorage={
  getItem:k=>prefs.get(k)??null,
  setItem(k,v){writes.push(k);prefs.set(k,String(v));}
};
const context={localStorage,SEA_VIEW:{width:480,height:800},SEA_DESKTOP:false,Date};
vm.createContext(context);
vm.runInContext(code+';this.performanceObserver=SEA_PERFORMANCE;',context);
const p=context.performanceObserver;
assert.equal(p.report(),null,'No fabricated report before a voyage');
const created=[];
function newScene(){
 return {add:{text(x,y,value){
   const label={x,y,text:value,visible:true,
     setOrigin(){return this;},setScrollFactor(){return this;},
     setDepth(){return this;},setVisible(v){this.visible=v;return this;},
     setText(t){this.text=t;return this;},destroy(){this.destroyed=true;}};
   created.push(label);return label;
 }}};
}
p.attach(newScene());
for(let i=0;i<70;i++)p.sample(16.7);
assert.equal(p.report(),null,'Disabled mode cannot collect');
p.setEnabled(true);
for(let i=0;i<200;i++){
 const delta=i===20?50:16.7;
 for(let j=0;j<60;j++)p.sample(delta);
}
const active=p.report();
assert(active);
assert.equal(active.format,'mar-de-sangue-performance-report');
assert.equal(active.schema,1);
assert.equal(active.view,'compact');
assert.equal(active.rollingLimit,180);
assert.equal(active.retainedWindows,180);
assert.equal(active.samples.length,180,'Rolling data cap');
assert.equal(active.truncated,true,'Rolling report must disclose truncated data');
assert(active.seconds>180,'Total duration retained even after cap');
assert(active.summary.minFps>0);
assert(active.summary.medianFps>=active.summary.minFps);
assert(active.summary.meanFps>=active.summary.minFps);
assert(active.summary.worstFrameMs>=50);
assert(active.summary.slowFrames>=1);
assert.equal(typeof active.startedAt,'string');
const observerCount=p.history.length;
active.samples[0].fps=-999;
active.summary.meanFps=-999;
assert.notEqual(p.history[0].fps,-999,'Export cannot mutate active history');
assert.notEqual(p.report().summary.meanFps,-999,'Reports must be isolated copies');
const lastCollected=p.report();
p.detach();
assert.equal(p.scene,null);
assert.equal(p.label,null);
assert.equal(created.at(-1).destroyed,true);
const after=p.report();
assert.equal(after.source,'viagem-concluida');
assert.equal(after.retainedWindows,observerCount);
assert.deepEqual(JSON.stringify(after.samples),JSON.stringify(lastCollected.samples));
assert.deepEqual(JSON.stringify(after.summary),JSON.stringify(lastCollected.summary));
p.attach(newScene());
p.setEnabled(false);
assert.equal(p.report().source,'viagem-concluida',
  'New voyage without active samples must keep the last completed report');
p.setEnabled(true);
for(let i=0;i<60;i++)p.sample(16.7);
const next=p.report();
assert.equal(next.source,'viagem-em-andamento');
assert.equal(next.retainedWindows,1);
assert.equal(next.truncated,false);
p.setEnabled(false);
assert.equal(p.report().retainedWindows,1,'Turning off never discards captured windows');
p.detach();
assert.equal(p.report().source,'viagem-concluida');
assert.equal(writes.every(k=>k==='carcaca.mar.performance.visible.v1'),true,
 'Frame samples cannot be persisted or mixed into save');
const game=fs.readFileSync('Game.js','utf8');
assert(!/SeaProfile\s*\.|playerVelocity|\.fire\(/.test(code));
assert(game.includes('SEA_PERFORMANCE.detach(this);'));
console.log('PASS 3.6h: bounded FPS report, summary, isolation, retention and scene teardown');
