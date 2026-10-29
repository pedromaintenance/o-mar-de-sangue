/* V103 — directional naval combat: real projectile collision + pure rules. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('Game.js','utf8');
const positioning=fs.readFileSync('SeaPositioning.js','utf8');
const c={};vm.createContext(c);
vm.runInContext(positioning+';this.position=SEA_POSITIONING;',c);
const p=c.position;
assert.equal(p.zone(0,0,-440),'stern','travel in bow direction hits target stern');
assert.equal(p.zone(0,0,440),'bow','travel opposite bow direction hits prow');
assert.equal(p.zone(0,440,0),'broadside');
assert.equal(p.zone(Math.PI/2,440,0),'stern','classification rotates with ship');
assert.equal(p.zone(Math.PI/2,-440,0),'bow');
assert.equal(p.zone(0,0,0),'broadside','stationary projectile cannot claim stern');
assert.equal(p.zone(NaN,0,-400),'broadside','invalid heading is neutral');
assert.equal(p.zone(0,NaN,-400),'broadside','invalid vector is neutral');
assert.equal(p.zone(0,0,-400),p.zone(0,0,-200),'speed-independent angle');
assert.equal(p.impact(23,0,0,-440).damage,28,'20% stern damage');
assert.equal(p.impact(23,0,0,440).damage,21,'10% bow mitigation');
assert.equal(p.impact(23,0,440,0).damage,23,'broadside damage unchanged');
assert.equal(p.impact(23.75,0,440,0).damage,23.75,'broadside keeps decimals');
assert.equal(p.impact(23,0,0,-440,true).damage,25,'boss stern bonus 10%');
assert.equal(p.impact(23,0,0,440,true).damage,22,'boss bow protection 5%');

const start=src.indexOf('    updateShots(dt) {');
const end=src.indexOf('    collectTreasures(dt) {',start);
assert(start>=0&&end>start,'live projectile method found');
vm.runInContext('this.methods={'+src.slice(start,end)+'};',c);
c.SEA_GUNNERY={chargeMs:()=>2000,counterbatteryReady:()=>false};
c.SEA_FACTION_POLITICS={provoke(){}};
let hitVisualDamage=0;
c.SEA_COMBAT={hitEnemy(s,e,x,y,damage){hitVisualDamage=damage;}};
c.SEA_VISUALS={distance2:()=>Infinity};

function shot({friendly,vx,vy,boss=false,monster=false,eye=false,heading=0,damage=23}){
 const e={type:'patrulha',heading,hp:200,maxhp:200,x:100,y:100,radius:58,
  chargeMs:0,chargeStage:0,boss,isMonster:monster,pattern:'broadside',
  ship:{active:false},dead:false};
 const projectile={x:100,y:100,vx,vy,ttl:1,damage,friendly,
  object:{setPosition(){},destroy(){this.destroyed=true;}}};
 if(eye)projectile.dagonEyeCurse=25;
 let received=null,announcements=[];
 const s={time:{now:10000},currentDifficulty:1,mode:'mission',
  player:{x:100,y:100,rotation:heading},hullRadius:58,
  shots:[projectile],islands:[],enemies:friendly?[e]:[],
  curse:0,sinking:false,ended:false,
  segmentNear(){return true;},splash(){},burst(){},
  damageShip(value){received=value;return true;},
  announce(label){announcements.push(label);},sinkEnemy(enemy){enemy.dead=true;}};
 c.methods.updateShots.call(s,.016);
 assert.equal(s.shots.length,0,'projectile consumed once after hull contact');
 return {dealt:200-e.hp,received,announcements,visual:hitVisualDamage,s};
}
// Attack the stern of regular ships; show accurate damage feedback.
let r=shot({friendly:true,vx:0,vy:-440});
assert.equal(r.dealt,28);assert.equal(r.visual,28);
assert(r.announcements.some(x=>x.includes('TIRO DE POPA')));
r=shot({friendly:true,vx:0,vy:440});
assert.equal(r.dealt,21);assert.equal(r.visual,21);
assert.equal(r.announcements.length,0);
r=shot({friendly:true,vx:440,vy:0});
assert.equal(r.dealt,23,'classic broadside preserved');
r=shot({friendly:true,vx:0,vy:-440,boss:true});
assert.equal(r.dealt,25,'naval boss is vulnerable, but less');
r=shot({friendly:true,vx:0,vy:-440,monster:true});
assert.equal(r.dealt,23,'no invented prow for sea monsters');
// Incoming cannon volleys use the same geometry — no asymmetric cheat.
r=shot({friendly:false,vx:0,vy:-440});
assert.equal(r.received,28);
assert(r.announcements.some(x=>x.includes('POPA EXPOSTA')));
r=shot({friendly:false,vx:0,vy:440});
assert.equal(r.received,21);
r=shot({friendly:false,vx:440,vy:0});
assert.equal(r.received,23);
// Eye-of-Dagon curse projectile is not naval artillery and keeps its original value.
r=shot({friendly:false,vx:0,vy:-440,eye:true});
assert.equal(r.received,23);
assert.equal(r.s.curse,25);
assert(r.announcements.every(x=>!x.includes('POPA EXPOSTA')));

const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
assert(html.indexOf('SeaPositioning.js')>0&&
 html.indexOf('SeaPositioning.js')<html.indexOf('Game.js'));
assert(sw.includes('"./SeaPositioning.js"'));
assert(Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1])>=103);
assert(fs.readFileSync('PortUI.js','utf8').includes('ÂNGULO DE IMPACTO'));
console.log('PASS V103: bow/beam/stern angles, symmetric hull damage, boss scaling, monster and Dagon exceptions, PWA');
