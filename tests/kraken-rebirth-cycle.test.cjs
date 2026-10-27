/* Sandbox Kraken revival cycle: defeat -> distant sentinel -> new summon.
 * Regression: avoids duplicate tentacles, preserves missions/contracts, and only
 * resets the active-encounter lock after actual Kraken defeat.
 */
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const game=fs.readFileSync('Game.js','utf8');
new vm.Script(game,{filename:'Game.js'});
function method(name,context={}) {
  const at=game.indexOf('\n    '+name+'(');
  assert(at!==-1,'missing '+name);
  const brace=game.indexOf('{',at);
  let depth=0,end=brace;
  for (;end<game.length;end++) {
    if(game[end]==='{') depth++;
    else if(game[end]==='}' && --depth===0) break;
  }
  assert(end<game.length,'unbalanced '+name);
  return vm.runInNewContext('({'+game.slice(at+1,end+1)+'}).'+name,context);
}
function visual(){return {destroy(){this.destroyed=true}};}
const services={
  SEA_WEATHER:{onSink(){}},SEA_COMBAT:{sinkEnemy(){}},SEA_CONTRACTS:{onSink(){}}
};
const sink=method('sinkEnemy',services);
const sentinel={type:'tentaculo',sandboxSentinel:true,dead:false,ship:visual(),wake:visual(),bar:visual(),label:visual()};
const boss={type:'kraken',boss:true,reward:380,dead:false,x:1100,y:1500,wake:visual(),bar:visual(),label:visual()};
let announcement='';
const s={
 mode:'sandbox',contractId:null,sandboxKrakenTriggered:true,
 sandboxTentacleRebirthFrom:null,nextTentacleSpawnAt:0,
 enemies:[boss,sentinel],elapsed:90,objective:'endless',
 burst(){},dropTreasure(){},splash(){},announce(message){announcement=message;}
};
sink.call(s,boss);
assert.equal(boss.dead,true);
assert.equal(s.sandboxKrakenTriggered,false,'boss death should unlock next encounter');
assert.equal(s.nextTentacleSpawnAt,95,'rebirth has a five-second delay');
assert.equal(s.sandboxTentacleRebirthFrom.x,1100);
assert.equal(s.sandboxTentacleRebirthFrom.y,1500);
assert.equal(sentinel.dead,true,'old solitary tentacle must retire');
for(const key of ['ship','wake','bar','label']) assert.equal(sentinel[key].destroyed,true);
assert.match(announcement,/KRAKEN RECUOU/);
assert.equal(s.bossKills,1,'boss kill count remains correct');
const untriggered={...s,sandboxKrakenTriggered:false,nextTentacleSpawnAt:0};
const otherBoss={...boss,dead:false,wake:visual(),bar:visual(),label:visual()};
sink.call(untriggered,otherBoss);
assert.equal(untriggered.nextTentacleSpawnAt,0,'untriggered death must not start a cycle');
const mission={...s,mode:'mission',sandboxKrakenTriggered:true,nextTentacleSpawnAt:0};
sink.call(mission,{...boss,dead:false,wake:visual(),bar:visual(),label:visual()});
assert.equal(mission.sandboxKrakenTriggered,true,'mission boss never resets sandbox state');
assert.equal(mission.nextTentacleSpawnAt,0,'mission must not create sentinel');

const find=method('findSandboxTentacleRebirthPosition');
const scene={
 W:4400,H:3400,player:{x:3500,y:2600},islands:[],enemies:[{dead:true,x:2000,y:1600}]
};
const origin={x:1100,y:1500};
for(let i=0;i<12;i++){
 const p=find.call(scene,origin,73);
 assert(p,'a distant water position should exist');
 assert(Math.hypot(p.x-origin.x,p.y-origin.y)>=1100,'far from previous battle');
 assert(Math.hypot(p.x-scene.player.x,p.y-scene.player.y)>=850,'far from player');
 assert(p.x>=115&&p.x<=scene.W-115&&p.y>=115&&p.y<=scene.H-115);
}
assert.equal(find.call({...scene,islands:[{x:2200,y:1700,radius:5000}]},origin,73),null,
 'must retry later rather than place the tentacle inside an island');

const progress=method('progressBattle');
let spawns=0, optionsSeen=null;
const battlefield={
 mode:'sandbox',contract:null,ended:false,waveClock:0,elapsed:94,
 nextTentacleSpawnAt:95,sandboxKrakenTriggered:false,
 sandboxTentacleRebirthFrom:{x:1100,y:1500},
 enemies:[{dead:true,type:'kraken'},{dead:true,sandboxSentinel:true}],
 wave:1,nextSpawnTime:10000,
 spawnEnemy(type,spacing,options){
  assert.equal(type,'tentaculo'); assert.equal(spacing,980);
  spawns++; optionsSeen=options; return {type};
 },
 announce(){}
};
progress.call(battlefield,.1);
assert.equal(spawns,0,'not before cooldown');
battlefield.elapsed=95;
progress.call(battlefield,.1);
assert.equal(spawns,1);
assert.equal(optionsSeen.rebirthFrom.x,1100);
assert.equal(battlefield.sandboxTentacleRebirthFrom,null,'position constraint clears only after spawn');
assert.equal(battlefield.nextTentacleSpawnAt,109,'no immediate duplicates');
battlefield.elapsed=95.5;
battlefield.enemies.push({dead:false,sandboxSentinel:true,type:'tentaculo'});
progress.call(battlefield,.1);
assert.equal(spawns,1,'no second active sentinel');
battlefield.sandboxKrakenTriggered=true;
battlefield.enemies.at(-1).dead=true;
battlefield.elapsed=112;
progress.call(battlefield,.1);
assert.equal(spawns,1,'no sentinel while Kraken active');
battlefield.sandboxKrakenTriggered=false;
battlefield.sandboxTentacleRebirthFrom={x:1700,y:1750};
battlefield.spawnEnemy=()=>{spawns++;return null;};
battlefield.elapsed=126;
progress.call(battlefield,.1);
assert.equal(battlefield.nextTentacleSpawnAt,128,'failed safe position retries');
assert.deepEqual(Object.keys(battlefield.sandboxTentacleRebirthFrom).sort(),['x','y']);
assert.equal(spawns,2,'one attempted spawn, not a loop');

const sw=fs.readFileSync('sw.js','utf8');
assert(Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1])>=76);
assert(game.includes("this.spawnEnemy('kraken', 640, {fromTentacle:true})"));
assert(game.includes("this.mode === 'sandbox' && type === 'kraken' && !options.fromTentacle"));
assert(game.includes("const reinforcements = Math.min(7, krakenEncounter * 2)"));
console.log('PASS Kraken sandbox recurrence, distant placement, singleton, retries, missions and PWA');
