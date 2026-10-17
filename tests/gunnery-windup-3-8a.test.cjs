/* 3.8a — Cannon windup and recoil; monster close-combat regression. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const gun=fs.readFileSync('SeaGunnery.js','utf8'),src=fs.readFileSync('Game.js','utf8');
const ctx={};vm.createContext(ctx);
vm.runInContext(gun+';this.g=SEA_GUNNERY;',ctx);
const g=ctx.g;
assert.equal(g.chargeMs(0),2000);
assert(g.chargeMs(1)<2000&&g.chargeMs(12)<700&&g.chargeMs(50)<20);
for(let n=0;n<50;n++)assert(g.chargeMs(n+1)<g.chargeMs(n));
assert(g.chargeMs(500)<g.chargeMs(50),'charge approaches zero');
assert(g.recoil(100,1,0)>g.recoil(23,1,0));
assert(g.recoil(100,5,0)>g.recoil(100,1,0));
assert(g.recoil(100,5,20)<g.recoil(100,5,0));
assert(!g.ready(1999,2000,10000,-1000,360));
assert(g.ready(2000,2000,10000,-1000,360));
assert(!g.ready(2000,2000,10000,9900,360));
function method(name,next){
 const start=src.indexOf('    '+name+'('),end=src.indexOf('    '+next+'(',start);
 assert(start>=0&&end>start,'missing '+name+' -> '+next);
 return src.slice(start,end);
}
const c={SEA_GUNNERY:g};vm.createContext(c);
vm.runInContext('this.methods={'+method('resetCannonCharge','fire').replace('    updateCannonCharge(dt,pad)', '    ,updateCannonCharge(dt,pad)')+'};',c);
const m=c.methods;let attempts=[];
const ship={cannonCharge:{port:0,starboard:0},cannonPointers:new Map(),
 time:{now:0},shipStats:{reload:360},profile:{levels:{cadencia:0,reforco:0}},
 keys:{Q:{isDown:false},E:{isDown:false},SPACE:{isDown:false}},
 lastPortShot:-1000,lastStarboardShot:-1000,
 fire(side){attempts.push(side);this[side==='port'?'lastPortShot':'lastStarboardShot']=this.time.now;return true;}};
Object.assign(ship,{resetCannonCharge:m.resetCannonCharge,updateCannonCharge:m.updateCannonCharge});
function advance(ms,pad={}){
 for(let t=0;t<ms;t+=50){
  const step=Math.min(50,ms-t);ship.time.now+=step;
  ship.updateCannonCharge(step/1000,pad);
 }}
ship.keys.Q.isDown=true;
advance(1950);assert.equal(attempts.length,0);
assert(ship.cannonCharge.port>0&&ship.cannonCharge.starboard===0);
advance(50);assert.deepEqual(attempts,['port']);
assert.equal(ship.cannonCharge.port,0);
ship.keys.Q.isDown=false;advance(300);assert.equal(ship.cannonCharge.port,0);
ship.cannonPointers.set('finger1','starboard');advance(2050);
assert.equal(attempts[1],'starboard');
ship.cannonPointers.clear();ship.profile.levels.cadencia=22;
ship.keys.SPACE.isDown=true;advance(300);
assert.deepEqual(attempts.slice(-2),['port','starboard']);
ship.resetCannonCharge();
assert.equal(ship.cannonCharge.port,0);
assert.equal(ship.cannonCharge.starboard,0);
const monsterTypes=['enguia','afogados','coral','caranguejo','tartaruga','kraken','dagon'];
const definitions=src.slice(src.indexOf('const SEA_FOES ='),src.indexOf('const SeaProfile ='));
vm.runInContext(definitions+';this.foes=SEA_FOES;',c);
vm.runInContext('this.ai={'+method('updateEnemies','enemyFire')+'};',c);
c.Phaser={Math:{Distance:{Between:(x1,y1,x2,y2)=>Math.hypot(x1-x2,y1-y2)},
 Angle:{Wrap:v=>Math.atan2(Math.sin(v),Math.cos(v))}}};
c.SEA_MATH={clamp:(v,a,b)=>Math.max(a,Math.min(b,v))};
c.SEA_WEATHER={enemyCurrent(){}};
function foe(type){
 const f=c.foes[type];return {type,id:10,x:150,y:0,vx:0,vy:0,heading:0,
 speed:f.speed,maxRange:f.range,radius:f.radius,cooldown:0,
 cooldownBase:f.cooldown,pattern:f.pattern,atk:f.atk,mass:f.mass,
 dead:false,hp:f.hp,maxhp:f.hp,chargeMs:0,chargeStage:0,specialPhase:0,
 isMonster:monsterTypes.includes(type),label:{setText(){}}};
}
for(const type of monsterTypes){
 let shots=0,lunge=0,tentacle=0;const e=foe(type);
 const world={player:{x:0,y:0},hullRadius:68,elapsed:10,enemies:[e],
 islands:[],currentDifficulty:1,enemyFire(){shots++},
 monsterLunge(){lunge++},tentacleAttack(){tentacle++},
 collideWorldBounds(){},collideRock(){}};
 c.ai.updateEnemies.call(world,.05);
 assert.equal(shots,0,type+' must not create projectiles');
 assert.equal(type==='kraken'?tentacle:lunge,1,type+' should attack physically');
 assert(Math.hypot(e.vx,e.vy)>0,type+' should charge toward player');
}
const court=foe('patrulha');let shots=0;
const world={player:{x:0,y:0},hullRadius:68,elapsed:10,enemies:[court],
 islands:[],currentDifficulty:1,enemyFire(){shots++},
 collideWorldBounds(){},collideRock(){}};
for(let i=0;i<39;i++)c.ai.updateEnemies.call(world,.05);
assert.equal(shots,0,'court should wind up 1.95 seconds');
c.ai.updateEnemies.call(world,.05);
assert.equal(shots,1,'court fires on 2-second windup');
assert(src.includes('this.playerVelocity.x -= sign * rightX * recoil'));
assert(src.includes('e.vx-=fireDX*impulse'));
assert(!src.includes('dagonAttack(e,distance)'));
assert(!src.includes("if (e.type === 'enguia' || e.type === 'afogados' || e.type === 'coral')"));
assert(fs.readFileSync('index.html','utf8').includes('SeaGunnery.js'));
assert(fs.readFileSync('sw.js','utf8').includes('./SeaGunnery.js'));
console.log('PASS 3.8a: hold-to-fire, exponentially faster charge, recoil and melee-only monsters');
