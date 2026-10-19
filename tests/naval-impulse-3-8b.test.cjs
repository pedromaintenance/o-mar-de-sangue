/* 3.8b — naval impulse, input gating, capped collision-speed risk and v4 saves. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const math=fs.readFileSync('SeaImpulse.js','utf8'),game=fs.readFileSync('Game.js','utf8');
const ctx={};vm.createContext(ctx);
vm.runInContext(math+';this.impulse=SEA_IMPULSE;',ctx);
const impulse=ctx.impulse;
assert.equal(impulse.cooldown(0),10);
assert(Math.abs(impulse.cooldown(10)-(2+8*Math.exp(-1.3)))<1e-9);
assert(impulse.cooldown(20)<2.6&&impulse.cooldown(20)>2);
assert(impulse.cooldown(100)>2&&impulse.cooldown(100)<2.001);
assert(impulse.cooldown(999999)>=2);
assert(!impulse.ready(9.99,0,0));
assert(impulse.ready(10,0,0));
assert(impulse.ready(2+8*Math.exp(-1.3),0,10));
assert(impulse.speedFactor(0)===1&&impulse.speedFactor(.7)>1.8);
assert(impulse.speedFactor(5)<=1.85);
assert.equal(impulse.thrust(200),270);
const start=game.indexOf('    updateImpulse(dt,pad) {');
const end=game.indexOf('    createHUD() {',start);
assert(start>=0&&end>start,'live impulse code must be present in Game.js');
const func=vm.runInContext('(function(dt,pad){'+game.slice(start,end).replace(
 '    updateImpulse(dt,pad) {','').trim().replace(/\}\s*$/,'')+'})',
 Object.assign(ctx,{SEA_IMPULSE:impulse}));
const scene={
 keys:{R:{isDown:false}},profile:{levels:{impulso:0}},
 player:{rotation:0},playerVelocity:{x:0,y:0},
 shipStats:{maxSpeed:200},elapsed:0,lastImpulseAt:-1000,
 impulseRemaining:0,impulseKeyHeld:false,impulseTapQueued:false,
 cannonNeedsRelease:{port:false,starboard:false},
 cannonCharge:{port:350,starboard:200},
 cancelled:0,shake:0,
 resetCannonCharge(){this.cancelled++;this.cannonCharge.port=0;this.cannonCharge.starboard=0;},
 cameras:{main:{shake(){scene.shake++}}}
};
scene.keys.R.isDown=true;
assert.equal(func.call(scene,.016,{just:{}}),true,'first press starts impulse');
assert(scene.impulseRemaining>.6);
assert(scene.playerVelocity.y< -200,'immediate forward kick for running/escape');
assert.equal(scene.cancelled,1,'cannot exploit simultaneous cannon charge');
assert.deepEqual(JSON.parse(JSON.stringify(scene.cannonNeedsRelease)),{port:true,starboard:true});
assert.equal(scene.shake,1,'brief impact feedback');
for(let i=0;i<250;i++){scene.elapsed+=.016;func.call(scene,.016,{just:{}});}
assert.equal(scene.cancelled,1,'holding R never auto-repeats');
assert.equal(scene.impulseRemaining,0);
assert.equal(scene.lastImpulseAt,0,'no cooldown reset after active window');
scene.keys.R.isDown=false;func.call(scene,.016,{just:{}});
scene.keys.R.isDown=true;
assert(!func.call(scene,.016,{just:{}}),'cannot reactivate before 10s');
scene.keys.R.isDown=false;func.call(scene,.016,{just:{}});
scene.elapsed=10;scene.keys.R.isDown=true;
assert(func.call(scene,.016,{just:{}}),'fresh press at 10s activates');
scene.keys.R.isDown=false;func.call(scene,.016,{just:{}});
scene.profile.levels.impulso=20;scene.elapsed=12;
assert(!func.call(scene,.016,{just:{2:true}}),'higher level still respects cooldown');
scene.elapsed=10+impulse.cooldown(20);
assert(func.call(scene,.016,{just:{2:true}}),'Xbox X activates after upgraded cooldown');
scene.keys.R.isDown=false;func.call(scene,.016,{just:{}});
scene.impulseTapQueued=true;scene.elapsed=10+2*impulse.cooldown(20);
assert(func.call(scene,.016,{just:{}}),'touch button activates independently');
assert.equal(scene.impulseTapQueued,false,'queued click is consumed');
scene.impulseTapQueued=true;scene.elapsed+=.01;
assert.equal(func.call(scene,.016,{just:{}}),false,'cooldown rejects second tap');
assert.equal(scene.impulseTapQueued,false,'cooldown cannot queue phantom impulse');
scene.ended=true;scene.elapsed+=100;scene.keys.R.isDown=false;
func.call(scene,.016,{just:{}});
scene.keys.R.isDown=true;
assert.equal(func.call(scene,.016,{just:{}}),false,'game over cannot activate');
for(const control of ['pad?.just?.[2]','this.impulseTapQueued','this.keys?.R?.isDown'])
 assert(game.includes(control),'controls missing: '+control);
assert(game.includes('SEA_IMPULSE.speedFactor(this.impulseRemaining||0)'));
assert(game.includes('if(this.impulseRemaining>0){'),'gun charge disabled while boosting');
assert(game.includes('this.impulseButtonHitbox'),'visible impulse touch target');
assert(game.includes("id: 'impulso'"),'dedicated yard upgrade');
const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
assert(html.indexOf('SeaImpulse.js')<html.indexOf('Game.js'));
assert(sw.includes('"./SeaImpulse.js"') &&
 Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1])>=62,
 'naval impulse must remain offline-cached in v62 and newer');
console.log('PASS 3.8b: 10→2s exponential cooldown, R/X/touch debouncing, one impulse per press, cannon lock and PWA v62');
