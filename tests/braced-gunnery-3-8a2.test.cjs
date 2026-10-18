/* 3.8a.2 — holding brakes navigation, fired broadsides impart visible momentum. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const game=fs.readFileSync('Game.js','utf8');
const source=fs.readFileSync('SeaGunnery.js','utf8');
const ctx={SEA_MATH:{clamp:(n,a,b)=>Math.max(a,Math.min(b,n))},
 SEA_AUDIO:{play(){}}
};vm.createContext(ctx);
vm.runInContext(source+';this.g=SEA_GUNNERY;',ctx);
const g=ctx.g;
assert.deepEqual(JSON.parse(JSON.stringify(g.brace(0))),{speed:1,thrust:1,drag:0});
assert.deepEqual(JSON.parse(JSON.stringify(g.brace(1))),{speed:.60,thrust:.55,drag:.9});
assert.deepEqual(JSON.parse(JSON.stringify(g.brace(2))),{speed:.45,thrust:.38,drag:1.25});
assert(g.recoil(23,1,0,1.5)>55,'initial ship should recoil visibly');
assert(g.recoil(23,1,0,1.5)<90,'do not fling ship unrealistically');
assert(g.recoil(100,4,0,1.5)>g.recoil(23,1,0,1.5));
assert(g.recoil(100,4,15,1.5)<g.recoil(100,4,0,1.5));
assert(g.recoil(100,4,15,1.5)>0,'bracing cannot create negative velocity');
assert(g.recoil(23,1,0,1.5)>g.recoil(23,1,0,4),'heavier ships absorb more');
// Evaluate exactly the functions extracted from the live engine, not a
// second implementation. This catches physics changes in future releases.
function between(start,end){
 const a=game.indexOf(start),b=game.indexOf(end,a+start.length);
 assert(a>=0&&b>a,'missing engine code '+start);return game.slice(a,b);
}
const methods=between('    resetCannonCharge() {','    v15Burst(x,y,')
 .replace('    updateCannonCharge(dt,pad) {',',updateCannonCharge(dt,pad) {')
 .replace('    fire(side =',',fire(side =');
vm.runInContext('this.m={'+methods+'};',ctx);
const simSrc=between('        const keyboardTurn = Number(this.keys.RIGHT.isDown',
 '        this.player.x += this.playerVelocity.x * dt;');
const step=vm.runInContext('(function(dt,pad){'+simSrc+'})',ctx);
function sim(){
 const s={
 player:{x:2200,y:1700,rotation:0},playerVelocity:{x:0,y:0},
 shipStats:{accel:180,maxSpeed:198,reload:360,balls:1,cannonDamage:23,
  shotSpeed:440,shotTTL:1.25,turnSpeed:2.25},
 profile:{levels:{cadencia:0,reforco:0}},time:{now:0},keys:{
  RIGHT:{isDown:false},D:{isDown:false},LEFT:{isDown:false},A:{isDown:false},
  UP:{isDown:true},W:{isDown:false},DOWN:{isDown:false},S:{isDown:false},
  Q:{isDown:false},E:{isDown:false},SPACE:{isDown:false}},
 joystick:{x:0,y:0},cannonPointers:new Map(),cannonCharge:{port:0,starboard:0},
 cannonNeedsRelease:{port:false,starboard:false},cannonBracing:0,
 recoilVisual:0,recoilDamping:0,lastPortShot:-1000,lastStarboardShot:-1000,
 sounds:[],cameraShake:0,shots:0,
 cameras:{main:{shake(ms,amount){s.cameraShake++;assert(amount>0)}}},
 triggerCannonUiFx(){},makeShot(){this.shots++;},splash(){},v15Burst(){}
 };
 s.resetCannonCharge=ctx.m.resetCannonCharge;
 s.updateCannonCharge=ctx.m.updateCannonCharge;
 s.fire=ctx.m.fire;
 return s;
}
function advance(s,ms,pad={}){
 for(let i=0;i<ms;i+=50){
  let d=Math.min(50,ms-i);s.time.now+=d;
  step.call(s,d/1000,{x:0,y:0,...pad});
 }
}
const free=sim();free.playerVelocity.y=-180;
advance(free,900);
const cruise=Math.hypot(free.playerVelocity.x,free.playerVelocity.y);
const one=sim();one.playerVelocity.y=-180;one.keys.Q.isDown=true;
advance(one,900);
const braced=Math.hypot(one.playerVelocity.x,one.playerVelocity.y);
assert(braced<cruise*.85,
 'preparing one battery must cut speed materially: '+braced+' vs '+cruise);
assert(braced<=198*.60+.1,'one battery has a 60% speed cap');
assert.equal(one.cannonBracing,1);
assert.equal(one.shots,0,'hold under two seconds cannot fire');
const both=sim();both.playerVelocity.y=-180;both.keys.SPACE.isDown=true;
advance(both,900);
assert.equal(both.shots,0);
assert.equal(both.cannonBracing,2);
assert(Math.hypot(both.playerVelocity.x,both.playerVelocity.y)<=198*.45+.1,
 'two batteries should restrict ship to 45% speed');
assert(Math.hypot(both.playerVelocity.x,both.playerVelocity.y)<braced);
// Releasing cancels windup and the speed penalty immediately; no shot.
one.keys.Q.isDown=false;
advance(one,50);
assert.equal(one.cannonCharge.port,0);
assert.equal(one.cannonBracing,0);
assert.equal(one.shots,0);
const recovered=Math.hypot(one.playerVelocity.x,one.playerVelocity.y);
advance(one,900);
assert(Math.hypot(one.playerVelocity.x,one.playerVelocity.y)>recovered+12,
 'acceleration should recover after cancelling');
// A real broadside at level zero is a single shot even after 10s held.
const salvo=sim();salvo.keys.Q.isDown=true;
advance(salvo,1950);
assert.equal(salvo.shots,0);
advance(salvo,50);
assert.equal(salvo.shots,1,'hold to the end of 2s to fire');
assert.equal(salvo.cannonBracing,0);
assert(salvo.playerVelocity.x>40,
 'port broadside should push ship laterally by a substantial impulse');
assert(salvo.recoilDamping>.4);
assert(salvo.recoilVisual>8,'hull lean should be visually noticeable');
assert(salvo.cameraShake>0,'camera should show impact');
const lateral=salvo.playerVelocity.x;
advance(salvo,250);
assert(salvo.playerVelocity.x>lateral*.5,
 'lateral motion should not instantly disappear');
advance(salvo,10000);
assert.equal(salvo.shots,1,'holding after a shot must never machine gun');
salvo.keys.Q.isDown=false;advance(salvo,50);
salvo.keys.Q.isDown=true;advance(salvo,2000);
assert.equal(salvo.shots,2);
// Braces mitigate recoil when firing exactly the same gun.
const normal=sim(),armored=sim();
armored.profile.levels.reforco=20;
normal.fire('port');armored.fire('port');
assert(armored.playerVelocity.x<normal.playerVelocity.x*.4);
// Physically opposite broadsides cancel translation but still give a
// visible brief shake; no arbitrary sideways drift.
const opposite=sim();opposite.fire('both');
assert(Math.abs(opposite.playerVelocity.x)<.001);
assert.equal(opposite.cameraShake,2);
console.log('PASS 3.8a.2: deliberate hold, speed loss, cancelled charge, stronger visible recoil and no autofire');
