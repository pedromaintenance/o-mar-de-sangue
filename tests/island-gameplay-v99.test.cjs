/* Lab v2 is the single source for the 19 gameplay encounters / 95 choices. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8'),catalog=JSON.parse(read('laboratorio-ilhas/catalog.json'));
const ctx={
 SEA_DESKTOP:true,SEA_VIEW:{width:1280,height:720},
 SEA_MATH:{safe:n=>Math.max(0,Math.floor(n)),clamp:(x,a,b)=>Math.max(a,Math.min(b,x))},
 SEA_WEATHER:{announceTier(){}},SEA_AUDIO:{play(){}},
 SEA_COMBAT:{scars(){}},
 SEA_CONTRACTS:{options(){return null}}
};
vm.createContext(ctx);
vm.runInContext(read('SeaIslandRules.js')+';this.rules=SEA_ISLAND_RULES;',ctx);
vm.runInContext(read('SeaPoliticalEvents.js')+';this.politics=SEA_POLITICAL_EVENTS;',ctx);
vm.runInContext(read('SeaIslands.js')+';this.ui=SEA_ISLANDS;',ctx);
const R=ctx.rules,P=ctx.politics,UI=ctx.ui;
const event=id=>catalog.events.find(e=>e.id===id);
function mock(kind='demeter'){
 const island={id:7,kind,x:150,y:200,radius:80,image:{setTint(){return this},setAlpha(){return this}}};
 return {cache:{json:{get:k=>k===R.cacheKey?catalog:null}},gold:200,shipHP:390,maxShipHP:500,curse:25,
  shipStats:{cannonDamage:80,maxSpeed:250,radar:700,turnSpeed:4},
  alignment:{sobreviventes:0,corte:0,culto:0},profile:{sorties:1,alignment:{sobreviventes:0,corte:0,culto:0}},
  islands:[island],islandSelected:island,islandVisits:new Set(),islandDocked:true,islandOutcome:'',islandError:'',
  islandOptions:[],islandChoiceIndex:0,landmarkGlows:[],time:{now:1234},goldFx:0,politicalEvents:[],
  politicalLedger:{sobreviventes:0,corte:0,culto:0},announce(){},updateHUD(){},
  textures:{exists(){return false}},drawHullScars(){},effectsActive:0,effectsLimit:48};
}
UI.render=()=>{};UI.showDestructionSmoke=(s,island)=>{island.smokeTriggered=true;return true;};
assert.equal(catalog.events.length,19);
assert.equal(catalog.events.reduce((n,e)=>n+e.options.length,0),95);
for(const e of catalog.events){
 const s=mock();
 const opts=R.options(s,e.id);
 assert.equal(opts.length,5,e.id+' has five choices');
 for(const o of opts){
  const q=R.preview(s,o);
  assert(q.ok,e.id+'/'+o.id+': '+q.error);
  assert(o.hint.startsWith('PREÇO:'),'price, never reward, is shown');
  assert(!o.hint.includes('+'),'no reward percentage exposed to player');
 }
}
{
 const s=mock('demeter');s.shipHP=100;
 assert(UI.apply(s,R.options(s,'demeter')[0]));
 assert.equal(s.gold,100);assert.equal(s.shipHP,350); // 50% of maxHP, 50% of voyage gold
 assert(!UI.apply(s,R.options(s,'demeter')[0]),'one action per site');
}
{
 const s=mock('demeter');s.curse=88;
 assert(UI.apply(s,R.options(s,'demeter')[2]));
 assert.equal(s.curse,0);assert.equal(s.gold,180);
}
{
 const s=mock('demeter');
 assert(UI.apply(s,R.options(s,'demeter')[3]));
 assert.equal(s.shipHP,490);assert.equal(s.curse,65);
 assert.equal(s.alignment.culto,10);
 assert.equal(s.islandSelected.destroyed,true);
 assert.equal(s.islandSelected.smokeTriggered,true);
}
{
 const s=mock('daegon');
 assert(UI.apply(s,R.options(s,'daegon')[0]));
 assert.equal(s.shipHP,340);assert.equal(s.shipStats.cannonDamage,84);
}
{
 const s=mock('daegon');
 assert(UI.apply(s,R.options(s,'daegon')[2]));
 assert.equal(s.shipHP,140);assert.equal(s.shipStats.cannonDamage,96);assert.equal(s.curse,65);
}
{
 const s=mock('daegon');
 assert(UI.apply(s,R.options(s,'daegon')[3]));
 assert.equal(s.shipHP,290);assert.equal(s.curse,0);
 assert.equal(s.alignment.sobreviventes,10);assert(s.islandSelected.destroyed);
}
{
 const s=mock('daegon');s.shipHP=150;
 assert(!UI.apply(s,R.options(s,'daegon')[2]),'cannot sacrifice half hull below survival');
 assert.equal(s.shipHP,150);assert.equal(s.islandVisits.size,0);
}
{
 const s=mock('demeter');s.gold=0;
 assert(!UI.apply(s,R.options(s,'demeter')[0]),'no free offerings at zero gold');
 const theft=R.preview(s,R.options(s,'demeter')[4]);
 assert(theft.ok);assert.equal(theft.next.gold,0,'percentage theft does not generate money from nothing');
}
{
 // Every political first-act decision chooses a valid original-story echo branch.
 for(const eventId of ['refugees','convoy','ritual']){
  const opts=R.options(mock(),eventId,{politicalEvent:eventId});
  for(const option of opts)assert(P.echoes[eventId][option.storyChoice],
   eventId+'/'+option.id+' must link to a real echo');
 }
 // All nine second acts have five alternatives and are bound to the original parent.
 for(const [mapping,id] of Object.entries(R.echoIds)){
  const source=mapping.split(':')[0];
  const choices=R.options(mock(),id,{politicalEcho:source});
  assert.equal(choices.length,5,id);
  assert(choices.every(c=>c.politicalEcho===source));
 }
}
const game=read('Game.js'),html=read('index.html'),sw=read('sw.js');
assert(html.indexOf('SeaIslandRules.js')<html.indexOf('SeaIslands.js'));
assert(game.includes("this.load.json(SEA_ISLAND_RULES.cacheKey,'laboratorio-ilhas/catalog.json')"));
assert(game.includes('alignment:this.alignment'),'voyage alignment enters settlement');
assert(game.includes('p.alignment[k]=SEA_MATH.clamp'),'alignment persists through existing save');
assert(sw.includes('"./SeaIslandRules.js"'));
assert(sw.includes('"./laboratorio-ilhas/catalog.json"'));
assert(Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1])>=99);
console.log('PASS LAB->GAME: 19 scenes / 95 actions, Demeter and Dagon arithmetic, no free offerings, permanent alignment, political echoes, destruction smoke, PWA');
