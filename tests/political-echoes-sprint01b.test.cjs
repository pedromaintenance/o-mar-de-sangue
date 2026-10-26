/* Sprint 01b — decisions must produce distinct, accessible second acts. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=name=>fs.readFileSync(name,'utf8');
const ctx={
 SEA_DESKTOP:true,SEA_VIEW:{width:1280,height:720},
 SEA_MATH:{safe:n=>Math.max(0,Math.floor(n)),clamp:(n,a,b)=>Math.max(a,Math.min(b,n))},
 SEA_WEATHER:{announceTier(){}},SEA_AUDIO:{play(){}},SEA_COMBAT:{scars(){}},
 SEA_CONTRACTS:{options:()=>null}
};
vm.createContext(ctx);
vm.runInContext(read('SeaPoliticalEvents.js')+';this.politics=SEA_POLITICAL_EVENTS;',ctx);
vm.runInContext(read('SeaIslands.js')+';this.coast=SEA_ISLANDS;',ctx);
const p=ctx.politics,i=ctx.coast;
const shape=()=>({add(){return this},destroy(){return this},setInteractive(){return this},
 setOrigin(){return this},setScrollFactor(){return this},setDepth(){return this},
 setVisible(){return this},setStrokeStyle(){return this},setScale(){return this},
 setText(){return this},setFillStyle(){return this},setRotation(){return this},
 clear(){return this},lineStyle(){return this},lineBetween(){return this},
 strokeCircle(){return this}});
const pos=[
 ['wreck',200,200],['wreck',1100,200],['wreck',2150,200],['wreck',3600,300],
 ['ruin',200,1300],['ruin',1700,1300],['ruin',3600,1300],
 ['daegon',400,2700],['daegon',2800,2600],
 ['demeter',500,650],['demeter',2200,850],['demeter',3750,2300],
 ['monastery',900,2500],['monastery',2100,3050],['monastery',3800,3100],
 ['parley',3700,600]
];
function scene(contract=null){
 const s={W:4400,H:3400,stage:1,profile:{sorties:2},elapsed:10,
  shipHP:70,maxShipHP:100,curse:32,gold:125,
  shipStats:{radar:430,maxSpeed:200,cannonDamage:25,turnSpeed:2},
  islands:pos.map(([kind,x,y],id)=>({id,kind,x,y,radius:65})),
  contract,player:{x:2200,y:1700},playerVelocity:{x:0,y:0},hullRadius:68,
  enemies:[],islandVisits:new Set(),chartDiscovered:new Set(),
  chartWaypointId:null,atlasFocusedId:null,ended:false,sinking:false,
  islandDocked:false,islandSelected:null,islandOutcome:'',islandError:'',
  islandOptions:[],islandChoiceIndex:0,time:{now:500},
  add:{rectangle:shape,text:shape,container:shape,graphics:shape,image:shape},
  textures:{exists:()=>true,get:()=>({getSourceImage:()=>({height:256})})},
  touchReset(){},updateHUD(){},drawHullScars(){},announce(message){
    (this.notices??=[]).push(message)
  }
 };
 i.init(s);p.init(s);return s;
}
let completed=0;
for(const source of ['refugees','convoy','ritual']){
 for(const first of p.events[source].choices){
  const s=scene(),origin=s.islands.find(x=>x.politicalEventId===source);
  assert(origin,source+' missing');
  s.islandSelected=origin;s.islandDocked=true;
  assert.equal(i.apply(s,first),true,source+'/'+first.id+' first act');
  assert.equal(s.politicalEvents.length,1);
  assert.equal(s.islandVisits.has(origin.id),true);
  assert.equal(i.apply(s,first),false,'no duplicate original decision');
  const echoSite=s.islands.find(x=>x.politicalEcho?.source===source);
  assert(echoSite,source+'/'+first.id+' should cause an echo');
  assert.equal(echoSite.politicalEcho.originalChoice,first.id);
  assert.equal(echoSite.kind,p.echoes[source].kind);
  assert.notEqual(echoSite.id,origin.id);
  assert.equal(echoSite.politicalEventId,undefined,'no replacement of other events');
  assert(s.chartDiscovered.has(echoSite.id),'the clue reveals only its destination');
  assert.equal(s.chartDiscovered.size,1,'no unrelated atlas spoilers');
  assert.equal(s.chartWaypointId,echoSite.id,'unassigned navigation gets rumor');
  assert(s.notices.some(x=>x.includes('CARTA')));
  i.close(s);
  s.islandDocked=true;s.islandSelected=echoSite;s.islandOutcome='';
  const event=p.encounter(s,echoSite);
  assert(event&&event.choices.length===2,'second act offers two choices');
  assert(event.title.length&&event.lore.length);
  s.islandChoiceIndex=2;i.render(s);
  assert.equal(s.islandOptions.length,3,'two choices plus exit');
  const picked=event.choices[0];
  s.islandChoiceIndex=0;
  assert.equal(i.apply(s,picked),true,'second act applies');
  assert.equal(s.politicalEvents.length,2,'one new entry, no reputation save');
  assert.equal(s.politicalEvents[1].eventId,'echo:'+source);
  assert(echoSite.politicalEcho.resolved,'the rumor is resolved');
  assert.equal(s.chartWaypointId,null,'clear rumor waypoint only on completion');
  assert.equal(i.apply(s,picked),false,'echo cannot be replayed');
  assert.equal(s.politicalEvents.length,2);
  completed++;
 }
}
assert.equal(completed,9,'all nine first-act decisions have different second acts');
{
 const s=scene({id:'rescue',pickupId:0,shelterId:9,phase:'pickup'});
 const origin=s.islands.find(x=>x.politicalEventId==='refugees');
 assert.notEqual(origin.id,0,'the contract wreck remains reserved');
 s.chartWaypointId=0;
 s.islandSelected=origin;s.islandDocked=true;
 assert(i.apply(s,p.events.refugees.choices[0]));
 const target=s.islands.find(x=>x.politicalEcho?.source==='refugees');
 assert(target&&target.id!==9,'reserved Demeter destination never becomes an echo');
 assert.equal(s.chartWaypointId,0,'contract waypoint must not be changed');
}
{
 const s=scene(),site=s.islands.find(x=>x.politicalEventId==='convoy');
 s.islandSelected=site;s.islandDocked=true;
 const wrong={...p.events.refugees.choices[0],politicalEvent:'convoy'};
 assert.equal(i.apply(s,wrong),false,'cannot spoof a different event choice');
 assert.equal(s.gold,125);
 assert.equal(s.politicalEvents.length,0);
}
{
 const s=scene(),site=s.islands.find(x=>x.politicalEventId==='refugees');
 s.islandSelected=site;s.islandDocked=true;
 assert(i.apply(s,p.events.refugees.choices[1]));
 const echoSite=s.islands.find(x=>x.politicalEcho?.source==='refugees');
 i.close(s);s.islandDocked=true;s.islandSelected=echoSite;s.islandOutcome='';
 const event=p.echoEncounter(s,echoSite);
 const falseChoice={...event.choices[1],politicalEcho:'convoy'};
 const prior=s.gold;
 assert.equal(i.apply(s,falseChoice),false,'cannot use another echo action');
 assert.equal(s.gold,prior);
 assert.equal(echoSite.politicalEcho.resolved,undefined);
}
{
 const s=scene(),site=s.islands.find(x=>x.politicalEventId==='ritual');
 s.islandSelected=site;s.islandDocked=true;
 assert(i.apply(s,p.events.ritual.choices[2]));
 const target=s.islands.find(x=>x.politicalEcho?.source==='ritual');
 s.chartWaypointId=8; // player explicitly changed waypoint before returning
 i.close(s);s.islandDocked=true;s.islandSelected=target;s.islandOutcome='';
 assert(i.apply(s,p.echoEncounter(s,target).choices[1]));
 assert.equal(s.chartWaypointId,8,'player-selected different waypoint must survive resolution');
}
assert(!/SeaProfile\s*\.|localStorage|sessionStorage|fetch\s*\(/.test(read('SeaPoliticalEvents.js')),
  'No persistent save or network dependency in voyage political system');
const atlas=read('SeaAtlas.js'),game=read('Game.js'),sw=read('sw.js');
assert(atlas.includes('ECO POLÍTICO')&&atlas.includes('politicalEcho'));
assert(game.includes('SEA_POLITICAL_EVENTS.init(this)')&&game.includes('SEA_POLITICAL_EVENTS.update(this)'));
const cacheVersion=Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1]);
assert(Number.isFinite(cacheVersion)&&cacheVersion>=67,'PWA cache must be at least v67');
const uiCtx={SEA_MATH:{nice:v=>String(v)}};
vm.createContext(uiCtx);
vm.runInContext(read('PortUI.js')+';this.port=SEA_PORT_UI;',uiCtx);
const html=uiCtx.port.result({
 won:true,withdrawn:false,mode:'sandbox',collected:42,reward:35,kills:0,
 rammings:0,bank:35,wave:1,islands:4,
 politicalChronicle:[{text:'DECISÃO <script>',terms:'<img src=x>'},
                     {text:'CONSEQUÊNCIA',terms:'+12 casco'}]
});
assert(html.includes('AS MARCAS DA VIAGEM'));
assert(html.includes('DECISÃO &lt;script&gt;')&&!html.includes('<script>'),
  'Chronicle must escape injected markup');
assert(html.includes('&lt;img src=x&gt;')&&!html.includes('<img src=x>'));
assert(html.includes('CONSEQUÊNCIA'));
assert(read('Game.js').includes('report.politicalChronicle=(this.politicalEvents||[])'),
  'Voyage decisions must reach Port results without writing profile');
console.log('PASS Sprint 01b: nine branching echoes, two-choice UI, delayed pursuit, no spoilers, contract isolation, no duplicates');
