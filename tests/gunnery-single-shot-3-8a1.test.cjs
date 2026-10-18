/* 3.8a.1: one shot per deliberate press/hold/release, all inputs. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('Game.js','utf8'),gsrc=fs.readFileSync('SeaGunnery.js','utf8');
const ctx={};vm.createContext(ctx);
vm.runInContext(gsrc+';this.g=SEA_GUNNERY;',ctx);
const a=src.indexOf('    resetCannonCharge() {');
const b=src.indexOf('    fire(side =',a);
assert(a>=0&&b>a,'cannon charge methods exist');
const methods=src.slice(a,b).replace('    updateCannonCharge(dt,pad) {',
  '    ,updateCannonCharge(dt,pad) {');
vm.runInContext('this.m={'+methods+'};',ctx);
const ship={
 cannonCharge:{port:0,starboard:0},
 cannonNeedsRelease:{port:false,starboard:false},
 cannonPointers:new Map(),profile:{levels:{cadencia:0}},
 time:{now:0},shipStats:{reload:360},
 keys:{Q:{isDown:false},E:{isDown:false},SPACE:{isDown:false}},
 lastPortShot:-1000,lastStarboardShot:-1000,shots:[],
 fire(side){
   this.shots.push({side,at:this.time.now});
   this[side==='port'?'lastPortShot':'lastStarboardShot']=this.time.now;
   return true;
 }
};
ship.resetCannonCharge=ctx.m.resetCannonCharge;
ship.updateCannonCharge=ctx.m.updateCannonCharge;
function tick(ms,gamepad={}){
 for(let i=0;i<ms;i+=50){
   const d=Math.min(50,ms-i);
   ship.time.now+=d;
   ship.updateCannonCharge(d/1000,gamepad);
 }
}
const shots=()=>ship.shots.length;
// Keyboard: 2 second windup, then NEVER automatic re-fire.
ship.keys.Q.isDown=true;
tick(1950);assert.equal(shots(),0);
tick(50);assert.equal(shots(),1);
assert.equal(ship.cannonNeedsRelease.port,true);
tick(15000);
assert.equal(shots(),1,'holding Q for 15s may only fire once');
assert.equal(ship.cannonCharge.port,0);
ship.keys.Q.isDown=false;tick(50);
assert.equal(ship.cannonNeedsRelease.port,false);
ship.keys.Q.isDown=true;tick(2000);
assert.equal(shots(),2,'release + new hold fires again');
ship.keys.Q.isDown=false;tick(50);
// Two independent broadside latches, including Space.
ship.keys.SPACE.isDown=true;tick(2000);
assert.equal(shots(),4);
assert.deepEqual(ship.shots.slice(-2).map(x=>x.side),['port','starboard']);
tick(10000);assert.equal(shots(),4,'space hold is two shots total');
ship.keys.SPACE.isDown=false;tick(50);
ship.keys.SPACE.isDown=true;tick(2000);
assert.equal(shots(),6,'new Space press fires both again');
ship.keys.SPACE.isDown=false;tick(400); // existing reload has time to clear
// Touch: holding two fingers on one battery does not rearm on first lift.
ship.profile.levels.cadencia=25;
ship.cannonPointers.set('finger-1','port');
ship.cannonPointers.set('finger-2','port');
tick(200);assert.equal(shots(),7);
ship.cannonPointers.delete('finger-1');tick(5000);
assert.equal(shots(),7,'releasing one of two fingers is not a full release');
ship.cannonPointers.delete('finger-2');tick(400);
ship.cannonPointers.set('finger-3','port');
tick(200);assert.equal(shots(),8);
ship.cannonPointers.clear();tick(50);
// Mixed sources: keyboard released, gamepad remains pressed.
ship.keys.E.isDown=true;tick(200);
assert.equal(shots(),9);
ship.keys.E.isDown=false;tick(500,{starboard:true});
assert.equal(shots(),9,'other held input keeps latch active');
tick(50,{starboard:false});
tick(200,{starboard:true});
assert.equal(shots(),10);
tick(10000,{starboard:true});
assert.equal(shots(),10,'continuous trigger never repeats');
tick(50,{starboard:false});
// On very high Serventes levels, near-zero charge STILL needs rearm.
ship.profile.levels.cadencia=999999;
ship.keys.Q.isDown=true;tick(50);
assert.equal(shots(),11);
tick(15000);
assert.equal(shots(),11,'even near-zero charge never machine guns');
ship.keys.Q.isDown=false;tick(50);
ship.keys.Q.isDown=true;tick(50);
assert.equal(shots(),12);
ship.keys.Q.isDown=false;tick(50);
// Pause interrupts a partial charge; still-held controls do not resume it.
ship.profile.levels.cadencia=0;
ship.keys.Q.isDown=true;tick(500);
assert(ship.cannonCharge.port>0&&ship.cannonCharge.port<2000);
ship.resetCannonCharge();tick(5000);
assert.equal(shots(),12,'pause cannot turn a pending charge into a new shot');
ship.keys.Q.isDown=false;tick(50);
ship.keys.Q.isDown=true;tick(2000);
assert.equal(shots(),13);
ship.keys.Q.isDown=false;tick(50);
// Quick tap/cancel cannot accumulate charge across input cycles.
ship.profile.levels.cadencia=0;
for(let i=0;i<8;i++){
 ship.keys.E.isDown=true;tick(100);
 ship.keys.E.isDown=false;tick(50);
}
assert.equal(shots(),13);
console.log('PASS 3.8a.1: one shot per press, release rearm, mixed touch/keyboard/gamepad, ultra-fast levels and pause');
