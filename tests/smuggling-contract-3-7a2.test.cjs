/* 3.7a.2 — inspection pressure, alternatives, anti-replay and save v4. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const contractSource=fs.readFileSync('SeaContracts.js','utf8');
const islandSource=fs.readFileSync('SeaIslands.js','utf8');
const context={SEA_DESKTOP:true,SEA_VIEW:{width:1280,height:720},
  SEA_WEATHER:{tiers:0,announceTier(){this.tiers++}},
  SEA_AUDIO:{play(){}},
  SEA_COMBAT:{scars(){}},
  SEA_MATH:{safe:n=>Math.max(0,Math.floor(n)),clamp:(x,a,b)=>Math.max(a,Math.min(x,b))}
};
vm.createContext(context);
vm.runInContext(contractSource+';this.contracts=SEA_CONTRACTS;',context);
vm.runInContext(islandSource+';this.islandUI=SEA_ISLANDS;',context);
const c=context.contracts,ui=context.islandUI;
const shape=()=>({add(){return this},setDepth(){return this},
 setOrigin(){return this},setScrollFactor(){return this},
 setVisible(){return this},setStrokeStyle(){return this},
 setScale(){return this},setText(){return this},setFillStyle(){return this},
 destroy(){return this},clear(){return this},lineStyle(){return this},
 lineBetween(){return this},strokeCircle(){return this}});
function scene(){
 const s={W:4400,H:3400,shipHP:90,maxShipHP:100,gold:0,curse:7,
    shipStats:{radar:420,cannonDamage:10,maxSpeed:180,turnSpeed:2},
    player:{x:2200,y:1700},playerVelocity:{x:0,y:0},
    elapsed:0,hullRadius:68,islands:[
      {id:1,kind:'wreck',x:2500,y:1420,radius:90},
      {id:2,kind:'ruin',x:3550,y:1600,radius:90},
      {id:3,kind:'ruin',x:300,y:200,radius:80},
      {id:4,kind:'demeter',x:1300,y:2000,radius:80}],
    islandVisits:new Set(),chartDiscovered:new Set(),
    chartWaypointId:null,atlasFocusedId:null,islandOptions:[],
    islandOutcome:'',islandError:'',islandChoiceIndex:0,
    enemies:[],islandDocked:false,sinking:false,ended:false,time:{now:5000},
    add:{rectangle:shape,text:shape,graphics:shape,
      container:shape,image:shape},
    textures:{exists:()=>true,get:()=>({getSourceImage:()=>({height:256})})},
    touchReset(){},updateHUD(){this.hudCount=(this.hudCount||0)+1},
    announce(msg){this.messages.push(msg)},messages:[],
    finish(...args){this.finishCalls.push(args);this.ended=true},
    finishCalls:[],spawnEnemy(type,spacing){
      this.spawnCalls.push([type,spacing]);
      const e={id:15,type,x:this.player.x+100,y:this.player.y,
        dead:false,smugglingInspector:false};
      this.enemies.push(e);return e;
    },spawnCalls:[]
 };
 ui.init(s);
 return s;
}
let s=scene(),countersBefore=JSON.stringify({gold:s.gold,curse:s.curse});
assert.equal(c.init(s,'smuggle'),true);
assert.equal(s.contract.id,'smuggle');
assert.equal(s.contract.destinationId,2);
assert.equal(s.contract.bounty,190);
assert.equal(c.target(s).id,2);
assert.deepEqual([...s.chartDiscovered],[2],'only target can be revealed');
assert.equal(s.chartWaypointId,2);
assert(c.status(s).includes('SUSPEITA 0%'));
assert.equal(c.options(s,{id:1}),null);
assert.equal(c.options(s,c.target(s)).length,2);
// Status and heat are stable during intro and when the player pauses.
s.elapsed=5.5;c.update(s,.1);
assert.equal(s.spawnCalls.length,0);
s.elapsed=6;
c.update(s,.05);
assert.equal(s.spawnCalls.length,1);
assert.equal(s.enemies[0].smugglingInspector,true);
assert(s.contract.suspicion>0);
for(let i=0;i<50;i++)c.update(s,.05);
const rising=s.contract.suspicion;
assert(rising>35&&rising<75,rising+' = proximity raises suspicion over time');
s.enemies[0].dead=true;
for(let i=0;i<100;i++)c.update(s,.05);
assert(s.contract.suspicion<rising,'evading or defeating inspector lowers suspicion');
assert.equal(s.spawnCalls.length,1,'inspector only appears once');
// A destination visited before the delivery remains a valid docking target.
s.player.x=3550+90+68+35;s.player.y=1600;
s.islandVisits.add(2);
const near=ui.nearest(s);
assert.equal(near?.island?.id,2);
assert.equal(near.allowed,true);
s.islandDocked=true;s.islandSelected=s.islands[1];
s.contract.suspicion=73;
assert.equal(ui.apply(s,c.options(s,s.islandSelected)[0]),false,
  'high suspicion blocks secret unloading');
assert(s.islandError.includes('SUSPEITA'));
assert.equal(s.contract.completed,false);
assert.equal(s.contract.bounty,190);
assert.equal(ui.apply(s,c.options(s,s.islandSelected)[1]),true,
  'corrupt transaction is an alternative even without pocket gold');
assert.equal(s.contract.completed,true);
assert.equal(s.contract.route,'bribe');
assert.equal(s.contract.bounty,115);
assert.equal(s.curse,7);
assert.equal(s.chartWaypointId,null);
assert.equal(ui.apply(s,{contractAction:'smuggle-bribe'}),false,'no double completion');
assert.equal(s.finishCalls.length,0,'must read dock outcome before settlement');
ui.close(s);
assert.deepEqual(s.finishCalls,[[true]]);
assert.equal(JSON.stringify({gold:s.gold,curse:s.curse}),countersBefore);
c.update(s,.1);
assert.equal(s.finishCalls.length,1,'no repeated settlement after completion');
// Secret delivery has higher reward but affects existing temporary curse.
const quiet=scene();
assert.equal(c.init(quiet,'smuggle'),true);
quiet.contract.suspicion=14;
quiet.islandDocked=true;quiet.islandSelected=quiet.islands[1];
assert.equal(ui.apply(quiet,c.options(quiet,quiet.islandSelected)[0]),true);
assert.equal(quiet.contract.route,'hidden');
assert.equal(quiet.contract.bounty,190);
assert.equal(quiet.curse,19);
assert.equal(context.SEA_WEATHER.tiers,1);
ui.close(quiet);
assert.equal(quiet.finishCalls[0][0],true);
// Continuous inspection seizes goods at 100; cannot pay by withdrawing.
const captured=scene();
assert.equal(c.init(captured,'smuggle'),true);
captured.elapsed=10;
captured.contract.suspicion=99.8;
c.update(captured,.05);
assert.equal(captured.contract.intercepted,true);
assert.equal(captured.contract.bounty,0);
assert.deepEqual(captured.finishCalls,[[false,true]]);
c.update(captured,.05);
assert.equal(captured.finishCalls.length,1);
assert.equal(c.apply(captured,{contractAction:'smuggle-bribe'}),false);
const idle=scene();
assert.equal(c.init(idle,'unknown-id'),false);
assert.equal(idle.contract,null);
assert.equal(c.update(idle,.1),undefined);
assert(!/SeaProfile\s*\.|\blocalStorage\b|\bsessionStorage\b|\bfetch\s*\(/.test(contractSource));
const game=fs.readFileSync('Game.js','utf8'),port=fs.readFileSync('PortUI.js','utf8');
assert(game.includes('SEA_CONTRACTS.update(this,dt)'));
assert(game.includes("['rescue','smuggle','hunt'].includes(data?.contract)"));
assert(game.includes('contractBounty=won&&this.contract?.completed'));
assert(port.includes("this.start('sandbox',id)"));
assert(port.includes('ACEITAR CONTRABANDO'));
console.log('PASS 3.7a.2: court inspection, confiscation, clandestine/bribe alternatives, no duplicate rewards');
