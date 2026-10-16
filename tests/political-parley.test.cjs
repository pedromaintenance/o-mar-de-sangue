/* 3.3 — political encounter narrative contracts, per-sortie state and saves.
 * node tests/political-parley.test.cjs
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const world=fs.readFileSync('Game.js','utf8');
assert(world.includes("baseKind === 'wreck' && !parleyPlaced ? 'parley' : baseKind"),
  'parley must replace exactly one deterministic wreck, not add new RNG/spawns');
assert(world.includes("parley: 'island-wreck'"),'use a preexisting image asset');
const vmctx={
 SEA_DESKTOP:true,SEA_VIEW:{width:1280,height:720},
 SEA_MATH:{safe:n=>Math.max(0,Math.floor(n)),clamp:(n,a,b)=>Math.max(a,Math.min(b,n))},
 SEA_WEATHER:{announceTier:()=>{}},
 SEA_AUDIO:{play:()=>{}},SEA_COMBAT:{scars:()=>{}}
};
vm.createContext(vmctx);vm.runInContext(fs.readFileSync('SeaIslands.js','utf8')+'\nthis.events=SEA_ISLANDS;',vmctx);
const events=vmctx.events;
assert.equal(events.titles.parley,'TRÊS BANDEIRAS NA MARÉ');
assert.equal(events.choices.parley.length,3);
assert.deepEqual(Array.from(events.choices.parley,x=>x.faction),['sobreviventes','corte','culto']);
assert.equal(new Set(Array.from(events.choices.parley,x=>x.id)).size,3);
const display=[];
const mockShape=(type,...args)=>({
 type,args,add(){return this;},setDepth(){return this;},setOrigin(){return this;},
 setScrollFactor(){return this;},setVisible(){return this;},setStrokeStyle(){return this;},
 setAlpha(){return this;},setScale(){return this;},setText(){return this;},
 setFillStyle(){return this;},clear(){return this;},lineStyle(){return this;},
 lineBetween(){return this;},strokeCircle(){return this;},destroy(){return this;}
});
function scene(id=77){
 const s={
  gold:50,shipHP:80,maxShipHP:100,curse:10,
  shipStats:{turnSpeed:1,maxSpeed:20,radar:400,cannonDamage:9},
  islands:[],islandDocked:true,islandOutcome:'',islandError:'',
  islandSelected:{id,kind:'parley'},
  islandVisits:new Set(),islandChoiceIndex:0,
  time:{now:1200},lastDamageTime:0,
  playerVelocity:{x:0,y:0},speed:0,
  add:{
   rectangle:(...args)=>mockShape('rectangle',...args),
   text:(...args)=>{const o=mockShape('text',...args);display.push(args[2]);return o;},
   graphics:()=>mockShape('graphics'),
   image:(...args)=>{display.push(args[2]);return mockShape('image',...args);},
   container:()=>mockShape('container')
  },
  textures:{exists:()=>true,get:()=>({getSourceImage:()=>({height:256})})},
  updateHUD(){this.hudUpdated=(this.hudUpdated||0)+1;},
  touchReset(){},drawHullScars(){}
 };
 events.init(s); // reset diary, add safe-to-call dock widgets
 s.islandDocked=true;s.islandSelected={id,kind:'parley'};
 return s;
}
for(const [faction,choiceId,expected] of [
 ['sobreviventes','refuge',{gold:50,hp:100,curse:2,cannon:9}],
 ['corte','tribute',{gold:110,hp:80,curse:25,cannon:9}],
 ['culto','bloodpowder',{gold:50,hp:68,curse:28,cannon:15}]
]){
 const s=scene(),choice=events.choices.parley.find(c=>c.id===choiceId);
 assert(events.apply(s,choice),'first decision must be applied');
 assert.equal(s.gold,expected.gold);
 assert.equal(s.shipHP,expected.hp);
 assert.equal(s.curse,expected.curse);
 assert.equal(s.shipStats.cannonDamage,expected.cannon);
 assert.equal(s.politicalLedger[faction],1);
 assert.equal(s.politicalChoice,choiceId);
 assert.equal(Object.values(s.politicalLedger).reduce((a,b)=>a+b,0),1);
 assert(s.islandOutcome.includes(choice.outcome),'display narrative consequence');
 assert(s.islandOutcome.includes('·')||s.islandOutcome.includes('casco'));
 assert(s.islandVisits.has(77));
 assert.equal(s.hudUpdated,1);
 const snapshot=JSON.stringify({gold:s.gold,hp:s.shipHP,curse:s.curse,ledger:s.politicalLedger});
 assert.equal(events.apply(s,choice),false,'repeated selection should be rejected');
 assert.equal(JSON.stringify({gold:s.gold,hp:s.shipHP,curse:s.curse,ledger:s.politicalLedger}),snapshot);
 assert.equal(s.islandOptions.length,1,'result must only have a return button');
 events.close(s);
 assert.equal(s.islandDocked,false);
 assert.deepEqual(JSON.stringify(s.politicalLedger),
   JSON.stringify(Object.assign({sobreviventes:0,corte:0,culto:0},{[faction]:1})),
   'voyage-only decision must remain available after closing the modal');
}
// Sacrificial option with insufficient hull never kills the ship and never
// grants stats or counts as visit. All three choices remain reachable by B.
const poor=scene(99);poor.shipHP=12;const pact=events.choices.parley[2];
assert.equal(events.apply(poor,pact),false);
assert.match(poor.islandError,/CASCO/);
assert.equal(poor.shipStats.cannonDamage,9);
assert.equal(poor.politicalChoice,null);
assert.equal(poor.islandVisits.size,0);
assert.equal(poor.islandOptions.length,4);
// A parley is per voyage only: init resets flags, not SeaProfile.
const a=scene();a.politicalChoice='tribute';events.init(a);
assert.equal(a.politicalChoice,null);
assert.equal(Object.values(a.politicalLedger).reduce((x,y)=>x+y,0),0);
const source=fs.readFileSync('SeaIslands.js','utf8');
assert(!/SeaProfile\.(?:store|save)|localStorage|sessionStorage/.test(source),
  'no profile/save schema writes in island encounters');
console.log('PASS 3.3 narrative choices, three factions, costs, one-time, no save mutation');
