/* 3.6g — deterministic opt-in telemetry, no physics or profile mutation.
 * node tests/performance-3-6g.test.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync('SeaPerformance.js','utf8');
const values=new Map(),writes=[];
const localStorage={
  getItem:key=>values.get(key)??null,
  setItem(key,value){writes.push([key,String(value)]);values.set(key,String(value));}
};
const created=[];
function scene() {
 return {add:{text(x,y,value,options){
   const t={x,y,text:value,options,visible:true,destroyed:false,
     setOrigin(){return this},setScrollFactor(){return this},
     setDepth(v){this.depth=v;return this},
     setVisible(v){this.visible=v;return this},
     setText(v){this.text=v;return this},
     destroy(){this.destroyed=true;return this}
   };
   created.push(t);return t;
 }}};
}
function load(desktop){
 const context={localStorage,SEA_VIEW:{width:desktop?1280:480,height:desktop?720:800},
   SEA_DESKTOP:desktop};
 vm.createContext(context);
 vm.runInContext(code+';this.perf=SEA_PERFORMANCE;',context);
 return context.perf;
}
const beforeGame=fs.readFileSync('Game.js','utf8');
assert(beforeGame.includes('SEA_PERFORMANCE.attach(this);'));
assert(beforeGame.includes('SEA_PERFORMANCE.sample(delta);'));
assert(beforeGame.includes('SEA_PERFORMANCE.detach(this);'));
assert(beforeGame.includes("this.input.keyboard.on('keydown-F3', this.onPerformance);"));
assert(beforeGame.includes("this.input.keyboard.off('keydown-F3', this.onPerformance);"));
assert(!/SeaProfile|\.fire\(|playerVelocity|\.spawnEnemy\(/.test(code),
  'Performance module cannot reference game state or enemy behavior');
for(const desktop of [true,false]){
 const perf=load(desktop),gameScene=scene();
 assert.equal(perf.enabled,false,'Disabled by default');
 perf.attach(gameScene);
 assert.equal(perf.label,null,'Disabled sampling creates no Phaser objects');
 perf.sample(16.7);assert.equal(perf.frames,0);
 assert.equal(perf.toggle(),true);
 assert.equal(perf.enabled,true);
 assert.equal(perf.label.visible,true);
 assert.equal(perf.label.x,desktop?640:240);
 assert.equal(perf.label.y,desktop?683:602);
 assert.equal(perf.label.depth,145);
 assert.equal(created.at(-1).options.fontFamily,'monospace');
 for(let i=0;i<60;i++)perf.sample(16.7);
 assert(perf.latest&&perf.latest.fps>=59&&perf.latest.fps<=60);
 assert.equal(perf.latest.slowFrames,0);
 assert(perf.label.text.includes('MÉDIA')&&perf.label.text.includes('PICO'));
 const display=perf.label.text;
 assert.equal(perf.toggle(),false);
 assert.equal(perf.label.visible,false);
 perf.sample(40);assert.equal(perf.label.text,display,'Disabled diagnostics must not redraw');
 assert.equal(perf.frames,0);
 assert.equal(perf.setEnabled(true),true);
 perf.sample(NaN);perf.sample(-1);perf.sample(1200);
 assert.equal(perf.frames,0,'Invalid delta must be ignored');
 for(let i=0;i<57;i++)perf.sample(16.7);
 perf.sample(50);
 assert.equal(perf.latest.slowFrames,1,'Slow frame detection');
 assert(perf.latest.maxMs>=50);
 perf.detach(gameScene);
 assert(perf.label===null&&perf.scene===null);
 assert(created.at(-1).destroyed,'Overlay destroyed on voyage shutdown');
 assert.equal(perf.enabled,true,'Preference preserved across scene shutdown');
}
assert.equal(values.get('carcaca.mar.performance.visible.v1'),'1');
assert(writes.every(([key])=>key==='carcaca.mar.performance.visible.v1'),
 'Only isolated performance preference can be written');
const restored=load(false);assert(restored.enabled,'Enabled mode must survive reload');
console.log('PASS 3.6g: disabled fast path, frame metrics, sample caps, persistence and teardown');
