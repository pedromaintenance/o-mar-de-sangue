/* Sprint 01 — political choices are playable, one-time and voyage-local. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const js=path=>fs.readFileSync(path,'utf8');
const ctx={
  SEA_DESKTOP:true,SEA_VIEW:{width:1280,height:720},
  SEA_MATH:{safe:n=>Math.max(0,Math.floor(n)),clamp:(n,a,b)=>Math.max(a,Math.min(b,n))},
  SEA_AUDIO:{play(){}},SEA_WEATHER:{announceTier(){}},SEA_COMBAT:{scars(){}}
};
vm.createContext(ctx);
vm.runInContext(js('SeaPoliticalEvents.js')+';this.politics=SEA_POLITICAL_EVENTS;',ctx);
vm.runInContext(js('SeaIslands.js')+';this.islandsApi=SEA_ISLANDS;',ctx);
const politics=ctx.politics,ui=ctx.islandsApi;
const shape=()=>({add(){return this},destroy(){return this},setInteractive(){return this},
  setOrigin(){return this},setScrollFactor(){return this},setDepth(){return this},
  setVisible(){return this},setStrokeStyle(){return this},setScale(){return this},
  setText(){return this},setFillStyle(){return this},setRotation(){return this},
  clear(){return this},lineStyle(){return this},lineBetween(){return this},
  strokeCircle(){return this}});
function scene(contract=null){
  const s={W:4400,H:3400,stage:1,profile:{sorties:2},elapsed:10,
    shipHP:65,maxShipHP:100,curse:26,gold:40,
    shipStats:{radar:400,maxSpeed:200,cannonDamage:26,turnSpeed:2},
    islands:[
      {id:1,kind:'wreck',x:500,y:500,radius:70},
      {id:2,kind:'wreck',x:1800,y:500,radius:70},
      {id:3,kind:'ruin',x:3600,y:500,radius:70},
      {id:4,kind:'ruin',x:3100,y:1800,radius:70},
      {id:5,kind:'daegon',x:800,y:2600,radius:70},
      {id:6,kind:'daegon',x:2200,y:2800,radius:70},
      {id:7,kind:'parley',x:3900,y:2600,radius:70},
      {id:8,kind:'demeter',x:1300,y:1100,radius:70}
    ],
    contract,player:{x:2200,y:1700},playerVelocity:{x:0,y:0},
    hullRadius:68,enemies:[],islandVisits:new Set(),islandDocked:false,
    islandSelected:null,islandOutcome:'',islandError:'',islandOptions:[],
    islandChoiceIndex:0,time:{now:1500},spawnCalls:[],announcements:[],
    add:{rectangle:shape,text:shape,container:shape,graphics:shape,image:shape},
    textures:{exists:()=>true,get:()=>({getSourceImage:()=>({height:256})})},
    touchReset(){},updateHUD(){},drawHullScars(){},
    announce(message){this.announcements.push(message)},
    spawnEnemy(type,range){this.spawnCalls.push({type,range});return {type};}
  };
  ui.init(s);politics.init(s);return s;
}
{
  const s=scene({id:'rescue',pickupId:1,shelterId:8});
  assert.equal(s.islands.find(i=>i.id===1).politicalEventId,undefined,
    'contract pickup is not stolen by encounter');
  assert.equal(s.islands.find(i=>i.id===8).politicalEventId,undefined);
  assert.equal(s.islands.filter(i=>i.politicalEventId).length,3);
  for(const [id,kind] of [['refugees','wreck'],['convoy','ruin'],['ritual','daegon']]){
    const site=s.islands.find(i=>i.politicalEventId===id);
    assert(site&&site.kind===kind,'original physical kind kept for '+id);
    const encounter=politics.encounter(s,site);
    assert(encounter&&encounter.choices.length===3);
    assert(encounter.choices.every(c=>typeof c.outcome==='string'&&c.outcome.length));
  }
  assert.equal(politics.init(s),3,'reinitialization still has three sites');
  assert.equal(s.islands.filter(i=>i.politicalEventId).length,3);
}
{
  const s=scene();
  const site=s.islands.find(i=>i.politicalEventId==='refugees');
  s.islandSelected=site;s.islandDocked=true;
  const choice=politics.encounter(s,site).choices[0];
  assert(ui.apply(s,choice),'refugee rescue should apply');
  assert.equal(s.shipHP,83);
  assert.equal(s.curse,18);
  assert.equal(s.politicalEvents.length,1);
  assert.equal(s.politicalThreats.length,1);
  assert.equal(s.politicalThreats[0].type,'patrulha');
  assert.equal(ui.apply(s,choice),false,'cannot double rewards');
  assert.equal(s.politicalEvents.length,1);
  assert(ui.politicalRecord(s).detail.includes('ABRIGAR OS REFUGIADOS'));
  s.elapsed=23;
  politics.update(s);assert.equal(s.spawnCalls.length,0,'no surprise spawn inside dock');
  ui.close(s);s.pausedByCaptain=true;
  politics.update(s);assert.equal(s.spawnCalls.length,0,'no spawn while paused');
  s.pausedByCaptain=false;politics.update(s);
  assert.equal(s.spawnCalls.length,1);
  assert.equal(s.spawnCalls[0].type,'patrulha');
  politics.update(s);assert.equal(s.spawnCalls.length,1,'one patrol only');
  assert.equal(s.politicalThreats.length,0);
}
{
  const s=scene(),site=s.islands.find(i=>i.politicalEventId==='convoy');
  s.islandDocked=true;s.islandSelected=site;
  const choice=politics.encounter(s,site).choices[2];
  assert(ui.apply(s,choice),'naval charts');
  assert.equal(s.gold,25);
  assert.equal(s.shipStats.radar,610);
  assert.equal(s.politicalThreats.length,0);
  assert.equal(s.politicalEvents.length,1);
}
{
  const s=scene(),site=s.islands.find(i=>i.politicalEventId==='ritual');
  s.islandDocked=true;s.islandSelected=site;
  const choice=politics.encounter(s,site).choices[0];
  assert(ui.apply(s,choice),'free prisoners');
  assert.equal(s.shipHP,81);
  assert.equal(s.curse,14);
  assert.equal(s.politicalThreats[0].type,'cultista');
  assert.equal(s.politicalEvents[0].faction,'sobreviventes');
}
{
  const s=scene();
  const correct=s.islands.find(i=>i.politicalEventId==='convoy');
  const wrong=s.islands.find(i=>i.politicalEventId==='refugees');
  s.islandDocked=true;s.islandSelected=wrong;
  const option=politics.encounter(s,correct).choices[0];
  assert.equal(ui.apply(s,option),false,'cannot use event option on a different site');
  assert.equal(s.gold,40);
  assert.equal(s.politicalEvents.length,0);
}
assert(!/SeaProfile\.|localStorage|sessionStorage|fetch\s*\(/.test(js('SeaPoliticalEvents.js')),
  'encounters never write or read persistent saves or network');
const html=js('index.html'),game=js('Game.js'),sw=js('sw.js');
assert(html.indexOf('SeaPoliticalEvents.js')<html.indexOf('SeaIslands.js'));
assert(game.includes('SEA_POLITICAL_EVENTS.init(this)'));
assert(game.includes('SEA_POLITICAL_EVENTS.update(this)'));
assert(sw.includes('"./SeaPoliticalEvents.js"'));
console.log('PASS Sprint 01: three political events, contract isolation, effects, ledger, anti-replay and pursuit');
