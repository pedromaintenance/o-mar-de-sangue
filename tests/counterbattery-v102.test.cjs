/* V102 — counterbattery changes active combat, not just UI/source strings. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('Game.js','utf8');
const gun=fs.readFileSync('SeaGunnery.js','utf8');
const c={};vm.createContext(c);
vm.runInContext(gun+';this.gunnery=SEA_GUNNERY;',c);
const g=c.gunnery;
const enemy=(overrides={})=>({
 type:'patrulha',pattern:'broadside',isMonster:false,boss:false,
 dead:false,hp:100,x:120,y:120,radius:58,chargeMs:1400,chargeStage:2,
 lastCounterbatteryAt:-Infinity,
 label:{text:'Patrulha da Corte',setText(v){this.text=v;}},
 ship:{active:false},...overrides
});
assert.equal(g.counterbatteryReady(enemy(),10000,2000),true,'window opens after 60%');
assert.equal(g.counterbatteryReady(enemy({chargeMs:1199}),10000,2000),false,'before window');
assert.equal(g.counterbatteryReady(enemy({chargeMs:1200}),10000,2000),true,'boundary inclusive');
assert.equal(g.counterbatteryReady(enemy({lastCounterbatteryAt:5001}),10000,2000),false,'4999ms immunity');
assert.equal(g.counterbatteryReady(enemy({lastCounterbatteryAt:5000}),10000,2000),true,'5000ms rearm');
assert.equal(g.counterbatteryReady(enemy({boss:true}),10000,2000),false);
assert.equal(g.counterbatteryReady(enemy({isMonster:true}),10000,2000),false);
assert.equal(g.counterbatteryReady(enemy({pattern:'ram'}),10000,2000),false);
assert.equal(g.counterbatteryReady(enemy({dead:true}),10000,2000),false);
assert.equal(g.counterbatteryReady(enemy({hp:0}),10000,2000),false);
assert.equal(g.counterbatteryReady(enemy(),NaN,2000),false);
assert.equal(g.counterbatteryReady(enemy(),10000,0),false);

function method(name,next) {
 const p=src.indexOf('    '+name+'('),q=src.indexOf('    '+next+'(',p);
 assert(p>=0&&q>p,'missing method '+name);
 return src.slice(p,q);
}
vm.runInContext('this.shots={'+method('updateShots','collectTreasures')+'};',c);
vm.runInContext('this.ai={'+method('updateEnemies','cultBargeRitual')+'};',c);
let provocations=0,impacts=0;
c.SEA_GUNNERY=g;
c.SEA_FOES={patrulha:{name:'Patrulha da Corte'}};
c.SEA_FACTION_POLITICS={provoke(){provocations++;},neutralSail(){return false;}};
c.SEA_COMBAT={hitEnemy(){impacts++;}};
c.SEA_MATH={clamp:(v,a,b)=>Math.max(a,Math.min(b,v))};
c.SEA_WEATHER={enemyCurrent(){}};
c.Phaser={Math:{Distance:{Between:(x1,y1,x2,y2)=>Math.hypot(x1-x2,y1-y2)},
 Angle:{Wrap:a=>Math.atan2(Math.sin(a),Math.cos(a))}}};

function impact(foe,now=10000,damage=20) {
 const shot={x:120,y:120,vx:0,vy:0,ttl:1,damage,friendly:true,
  object:{setPosition(){},destroy(){this.destroyed=true;}}};
 const world={time:{now},currentDifficulty:1,
  shots:[shot],islands:[],enemies:[foe],
  segmentNear(){return true;},splash(){},sinkEnemy(e){e.dead=true;}};
 c.shots.updateShots.call(world,.05);
 assert.equal(world.shots.length,0,'shot removed after hitting enemy');
 return foe;
}
let e=impact(enemy());
assert.equal(e.chargeMs,0,'actual hit resets enemy windup');
assert.equal(e.chargeStage,0);
assert.equal(e.lastCounterbatteryAt,10000);
assert.equal(e.counterbatteryNoticeUntil,10650);
assert.match(e.label.text,/SALVA INTERROMPIDA/);
assert.equal(e.hp,80,'damage remains intact');
assert.equal(provocations,1,'court hostility is still triggered');
assert.equal(impacts,1,'hit feedback still occurs');
e.chargeMs=1550;e.chargeStage=3;
impact(e,10400);assert.equal(e.chargeMs,1550,'rapid second hit cannot stunlock');
assert.equal(e.lastCounterbatteryAt,10000);
e.chargeMs=1550;
impact(e,15000);assert.equal(e.chargeMs,0,'interrupt re-arms after 5s');
e=impact(enemy({boss:true}));assert.equal(e.chargeMs,1400,'boss cannot be interrupted');
e=impact(enemy({isMonster:true}));assert.equal(e.chargeMs,1400,'monster cannot be interrupted');
e=impact(enemy({chargeMs:600}));assert.equal(e.chargeMs,600,'early hit does not interrupt');
e=impact(enemy({hp:10}));assert.equal(e.hp,0,'lethal cannon hit still sinks');
assert.equal(e.lastCounterbatteryAt,-Infinity,'no fake interrupt on sunken foe');

e=enemy({chargeMs:0,chargeStage:0,counterbatteryNoticeUntil:10650,
 label:{text:'Patrulha da Corte · SALVA INTERROMPIDA',setText(v){this.text=v;}},
 cooldown:1000,cooldownBase:1900,id:2,heading:0,vx:0,vy:0,
 x:150,y:0,speed:100,maxRange:430,maxhp:100,mass:1,atk:10});
const world={time:{now:10600},player:{x:0,y:0},hullRadius:60,
 elapsed:10,enemies:[e],islands:[],currentDifficulty:1,
 collideWorldBounds(){},collideRock(){},enemyFire(){throw Error('unexpected fire');}};
c.ai.updateEnemies.call(world,.05);
assert.match(e.label.text,/SALVA INTERROMPIDA/,'brief feedback survives stage updates');
world.time.now=10651;
c.ai.updateEnemies.call(world,.05);
assert.doesNotMatch(e.label.text,/SALVA INTERROMPIDA/,'notice automatically clears');
assert.equal(e.counterbatteryNoticeUntil,0);

assert(Number(fs.readFileSync('sw.js','utf8').match(/omar-mar-de-sangue-v(\d+)-/)?.[1])>=102,
 'V102 counterbattery remains compatible with later PWA cache revisions');
console.log('PASS V102: bounded interruption, immunity, bosses, lethal hits, live shot collision and label expiry');
