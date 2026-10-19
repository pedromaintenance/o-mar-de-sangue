/* 3.7a.3 — end-to-end contract states in the real contract/islands code. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const scripts=['SeaContracts.js','SeaIslands.js','Game.js','PortUI.js','SeaAtlas.js','sw.js'];
const txt=Object.fromEntries(scripts.map(k=>[k,fs.readFileSync(k,'utf8')]));
const ctx={SEA_DESKTOP:true,SEA_VIEW:{width:1280,height:720},
 SEA_AUDIO:{play(){}},SEA_WEATHER:{enemyCurrent(){},announceTier(){}},
 SEA_MATH:{clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),safe:n=>Math.max(0,Math.floor(n))},
 SEA_COMBAT:{scars(){}},
 Phaser:{Math:{Angle:{Wrap:x=>Math.atan2(Math.sin(x),Math.cos(x))}}}
};vm.createContext(ctx);
vm.runInContext(txt['SeaContracts.js']+';this.c=SEA_CONTRACTS',ctx);
vm.runInContext(txt['SeaIslands.js']+';this.ui=SEA_ISLANDS',ctx);
const c=ctx.c,ui=ctx.ui;
const fakeObj=()=>({add(){return this},destroy(){return this},setDepth(){return this},
 setOrigin(){return this},setScrollFactor(){return this},setVisible(){return this},
 setStrokeStyle(){return this},setScale(){return this},setText(v){this.text=v;return this},
 setFillStyle(){return this},clear(){return this},lineStyle(){return this},
 lineBetween(){return this},strokeCircle(){return this}});
const newScene=()=>{
 const s={W:4400,H:3400,elapsed:12,ended:false,sinking:false,
 player:{x:2200,y:1700},playerVelocity:{x:0,y:0},
 shipHP:200,maxShipHP:200,gold:0,curse:0,hullRadius:68,
 shipStats:{radar:460,maxSpeed:200,cannonDamage:25,turnSpeed:2},
 islands:[{id:1,kind:'wreck',x:2430,y:1400,radius:80},
          {id:2,kind:'wreck',x:240,y:350,radius:80},
          {id:3,kind:'demeter',x:3300,y:2500,radius:80}],
 islandVisits:new Set(),chartDiscovered:new Set(),atlasFocusedId:null,
 chartWaypointId:null,islandDocked:false,islandSelected:null,
 islandOutcome:'',islandError:'',islandOptions:[],islandChoiceIndex:0,
 enemies:[],enemySerial:0,spawnCalls:[],finishCalls:[],messages:[],
 add:{rectangle:fakeObj,text:fakeObj,container:fakeObj,graphics:fakeObj,image:fakeObj},
 textures:{exists:()=>true,get:()=>({getSourceImage:()=>({height:256})})},
 time:{now:1400},
 touchReset(){},updateHUD(){this.hudUpdates=(this.hudUpdates||0)+1},
 announce(m){this.messages.push(m)},
 spawnEnemy(type,range){this.spawnCalls.push({type,range});
  const enemy={id:++this.enemySerial,type,x:2800,y:1450,vx:0,vy:0,
    hp:100,maxhp:100,speed:125,heading:0,reward:80,dead:false,
    label:fakeObj(),radius:60};this.enemies.push(enemy);return enemy;},
 collideWorldBounds(){},collideRock(){},
 finish(...args){this.finishCalls.push(args);this.ended=true;}
 };
 ui.init(s);return s;
};
const s=newScene();const state=JSON.stringify({gold:s.gold,curse:s.curse});
assert.equal(c.init(s,'hunt'),true);
assert.equal(s.contract.phase,'clue');assert.equal(s.contract.clueId,1);
assert.equal(s.chartWaypointId,1);
assert.deepEqual([...s.chartDiscovered],[1],'clue only, not hidden islands');
assert(c.status(s).includes('NAUFRÁGIO'));
assert.equal(c.hunted(s),null,'cannot reveal fugitive before intel');
assert.equal(c.options(s,s.islands[2]),null);
assert.equal(c.apply(s,{contractAction:'hunt-clue'}),false,'cannot remotely investigate');
s.islandVisits.add(1); // clue remains dockable even if visited earlier.
s.player={x:2595,y:1400};
assert.equal(ui.nearest(s)?.island?.id,1,'previsited clue remains dockable');
s.islandVisits.delete(1);s.islandSelected=s.islands[0];s.islandDocked=true;
const option=c.options(s,s.islandSelected)[0];
assert.equal(ui.apply(s,option),true);
assert.equal(s.contract.phase,'chase');
assert.equal(s.contract.escapeAt,117,'deadline starts at clue, not voyage start');
assert.equal(s.contract.bounty,240);
assert.equal(s.chartWaypointId,null);
assert.deepEqual([...s.chartDiscovered],[1],'hunted ship is not an island spoiler');
assert.equal(s.spawnCalls.length,1);
assert.equal(s.spawnCalls[0].type,'fragata');
const prey=c.hunted(s);assert(prey&&prey.huntTarget);
assert(prey.label.text.includes('CAPITÃO CONDENADO'));
assert.equal(prey.hp,125);assert.equal(prey.maxhp,125);
assert.equal(c.options(s,s.islands[0]),null,'cannot repeat clue');
assert.equal(ui.apply(s,option),false,'no second reveal or extra fragata');
assert.equal(s.spawnCalls.length,1);
const old={x:prey.x,y:prey.y};
prey.heading=1.2;assert.equal(c.evade(s,prey,.5),true);
assert(Math.hypot(prey.x-old.x,prey.y-old.y)>1,'moving vessel advances');
assert(Number.isFinite(prey.x)&&Number.isFinite(prey.y));
ui.close(s);assert.equal(s.finishCalls.length,0,'reading clue does not finish contract');
assert.equal(JSON.stringify({gold:s.gold,curse:s.curse}),state);
// Killing an arbitrary fragata must not pay a bounty.
const generic={id:999,type:'fragata',huntTarget:false};
assert.equal(c.onSink(s,generic),false);
assert.equal(s.finishCalls.length,0);
assert.equal(c.onSink(s,prey),true);
assert.equal(s.contract.completed,true);assert.equal(s.contract.phase,'complete');
assert.deepEqual(s.finishCalls,[[true]]);
assert.equal(c.onSink(s,prey),false,'exactly once');
assert.equal(s.contract.bounty,240);
assert.equal(JSON.stringify({gold:s.gold,curse:s.curse}),state);
// Escape by natural passage at world rim.
const fled=newScene();c.init(fled,'hunt');
fled.islandDocked=true;fled.islandSelected=fled.islands[0];
assert(c.apply(fled,c.options(fled,fled.islandSelected)[0]));
const runner=c.hunted(fled);
runner.x=fled.contract.exitX;runner.y=fled.contract.exitY;
fled.islandDocked=false;
c.update(fled,.016);
assert.equal(fled.contract.escaped,true);assert.equal(fled.contract.bounty,0);
assert.deepEqual(fled.finishCalls,[[false,true]]);
assert.equal(c.onSink(fled,runner),false,'late kill cannot earn contract bounty');
c.update(fled,.016);assert.equal(fled.finishCalls.length,1);
// Timer expiry even if the prey gets stuck in an island.
const timed=newScene();c.init(timed,'hunt');
timed.islandSelected=timed.islands[0];timed.islandDocked=true;
assert(c.apply(timed,c.options(timed,timed.islandSelected)[0]));
timed.islandDocked=false;timed.elapsed=timed.contract.escapeAt;
c.update(timed,.016);
assert(timed.contract.escaped&&!timed.contract.completed);
assert.deepEqual(timed.finishCalls,[[false,true]]);
// If no spawn slot is available, retry safely: no bogus clue consumption.
const stalled=newScene();c.init(stalled,'hunt');
stalled.spawnEnemy=()=>null;
stalled.islandDocked=true;stalled.islandSelected=stalled.islands[0];
assert.equal(c.apply(stalled,c.options(stalled,stalled.islandSelected)[0]),false);
assert.equal(stalled.contract.phase,'clue');
assert.equal(stalled.islandVisits.has(1),false);
assert(stalled.islandError.includes('TENTE NOVAMENTE'));
assert(!/SeaProfile\s*\.|localStorage|sessionStorage|\bfetch\s*\(/.test(txt['SeaContracts.js']));
assert(txt['Game.js'].includes('SEA_CONTRACTS.onSink(this,enemy)'));
assert(txt['Game.js'].includes('SEA_CONTRACTS.evade(this,e,dt)'));
assert(txt['Game.js'].includes("['rescue','smuggle','hunt'].includes(data?.contract)"));
assert(txt['PortUI.js'].includes("this.button('contract:hunt'"));
assert(txt['SeaAtlas.js'].includes('SEA_CONTRACTS.hunted(s)'));
assert(txt['sw.js'].includes('v63-condemned-hunt'));
console.log('PASS 3.7a.3: clue, moving wanted target, anti-replay, payout/escape and v4 isolation');
