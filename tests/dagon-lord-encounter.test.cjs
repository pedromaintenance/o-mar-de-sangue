/* Dagon, Senhor das Profundezas: separate mission, deferred sandbox boss, unique mechanics. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const game=fs.readFileSync('Game.js','utf8');
new vm.Script(game,{filename:'Game.js'});
const helper=game.match(/function seaDagonLordEncounter\(stage\)\s*\{[^}]+\}/);
assert(helper,'dedicated mission schedule helper');
const schedules=vm.runInNewContext(helper[0]+';seaDagonLordEncounter');
for(const stage of [40,140,240])assert.equal(schedules(stage),true,'Lord stage '+stage);
for(const stage of [5,10,15,20,25,30,35,45,50,60,75,100])assert.equal(schedules(stage),false,'no replacement at '+stage);
assert(game.includes("this.missionBoss = seaDagonLordEncounter(this.stage) ? 'dagon_senhor'"));
assert(game.includes("if(this.wave % 60 === 20) this.pendingDagonLord=true"));
assert(game.includes("this.pendingDagonLord && !this.sandboxKrakenTriggered && !this.sandboxDagonTriggered"));
assert(game.includes("this.spawnEnemy('dagon_senhor',860,{fromWaveBoss:true})"));
assert(game.includes("type === 'dagon_senhor' && !options.fromWaveBoss"),'no random Lord spawn');
assert(game.includes("this.missionBoss==='dagon_senhor' ? this.missionBossDefeated"));
assert(game.includes("enemy.type===this.missionBoss) this.missionBossDefeated = true"));
assert(game.includes("this.dagonLordRift(e)"));
assert(game.includes("this.spawnDagonLordEyes(2)"));
assert(game.includes("e.cooldownBase*=.78"));
assert(game.includes("this.curse=Math.min(100,(this.curse||0)+12)"));
function method(name,ctx={}){
  const at=game.indexOf('\n    '+name+'(');
  assert(at>=0,'method missing '+name);
  const first=game.indexOf('{',at);
  let level=0,end=first;
  for(;end<game.length;end++){
    if(game[end]==='{')level++;
    else if(game[end]==='}'&&--level===0)break;
  }
  assert(end<game.length,'unbalanced method '+name);
  return vm.runInNewContext('({'+game.slice(at+1,end+1)+'}).'+name,ctx);
}
const eyes=method('spawnDagonLordEyes');
let summons=[];
eyes.call({spawnEnemy(type,range,opts){summons.push([type,range,opts.fromDagon]);}},2);
assert.deepEqual(summons,[['olho_dagon',510,true],['olho_dagon',640,true]],'eyes are reinforcements, not herald triggers');
const rift=method('dagonLordRift',{SEA_MATH:{clamp:(v,min,max)=>Math.max(min,Math.min(max,v))}});
let delayed=null,damage=0,announcements=[];
const scene={
  ended:false,W:4400,H:3400,
  player:{x:1000,y:1000},playerVelocity:{x:0,y:0},
  hullRadius:68,curse:0,
  add:{circle(){return {setStrokeStyle(){return this;},setDepth(){return this;},destroy(){}};}},
  tweens:{add(){}},
  time:{delayedCall(ms,cb){delayed={ms,cb};}},
  announce(x){announcements.push(x);},burst(){},splash(){},
  damageShip(n){damage=n;return true;}
};
const boss={dead:false,ship:{active:true},atk:100};
rift.call(scene,boss);
assert.equal(delayed.ms,1050,'telegraph window for evasion');
assert.equal(damage,0,'no instant unavoidable hit');
delayed.cb();
assert.equal(damage,72);
assert.equal(scene.curse,12);
assert(announcements.some(x=>x.includes('AFASTE-SE')),'visible warning');
const noHit={...scene,player:{x:2000,y:2000},curse:0,damageShip(){throw Error('escaped warning zone');}};
noHit.player={x:1000,y:1000};
rift.call(noHit,boss);
noHit.player.x=2000;noHit.player.y=2000;
delayed.cb();assert.equal(noHit.curse,0,'leaving the mark prevents the curse');
const sw=fs.readFileSync('sw.js','utf8');
assert(Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1])>=95);
console.log('PASS Lord mission 40+, sandbox wave20+, distinct encounter, telegraphed avoidable rift and two eye phases');
