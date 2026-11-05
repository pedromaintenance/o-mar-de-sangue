/* V115 — ramifications with monetary, combat and political consequences. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const names=['SeaFactions.js','SeaFactionPolitics.js','SeaContracts.js','Game.js','PortUI.js','PortContractsV115.css','sw.js'];
const files=Object.fromEntries(names.map(p=>[p,fs.readFileSync(p,'utf8')]));
for(const p of names.filter(x=>x.endsWith('.js')&&x!=='sw.js'))new vm.Script(files[p],{filename:p});
const ctx={SEA_WEATHER:{announceTier(){}},SEA_AUDIO:{play(){}},SEA_MATH:{clamp:(v,a,b)=>Math.max(a,Math.min(v,b)),safe:v=>Math.max(0,Math.floor(v))}};
vm.createContext(ctx);
vm.runInContext(files['SeaFactions.js']+';this.F=SEA_FACTIONS;',ctx);
vm.runInContext(files['SeaFactionPolitics.js']+';this.P=SEA_FACTION_POLITICS;',ctx);
vm.runInContext(files['SeaContracts.js']+';this.C=SEA_CONTRACTS;',ctx);
const C=ctx.C,P=ctx.P,F=ctx.F;
function make(faction=null){
 const s={W:4400,H:3400,elapsed:21,ended:false,sinking:false,
  player:{x:2200,y:1700},playerVelocity:{x:0,y:0},islands:[
   {id:1,kind:'wreck',x:2300,y:1700},
   {id:2,kind:'demeter',x:2700,y:2000},
   {id:3,kind:'ruin',x:3650,y:1900}],
  profile:{faction:{...F.initial(),allegiance:faction},sorties:16},
  alignment:{sobreviventes:5,corte:20,culto:12},curse:0,
  enemies:[],spawned:[],islandVisits:new Set(),chartDiscovered:new Set(),
  chartWaypointId:null,atlasFocusedId:null,islandSelected:null,islandOutcome:'',
  islandError:'',islandChoiceIndex:0,
  finishCalls:[],updateHUD(){this.hud=(this.hud||0)+1},
  announce(m){this.lastMessage=m},
  spawnEnemy(type,distance,opts){
    const e={id:this.spawned.length+1,type,distance,opts,dead:false,
      x:2500,y:1450,hp:100,maxhp:100,reward:40,speed:110,
      label:{setText(t){this.text=t;return this;}}};
    this.enemies.push(e);this.spawned.push(e);return e;
  },
  finish(...args){this.finishCalls.push(args);this.ended=true}
 };
 return s;
}
function dock(s){s.islandSelected=C.target(s);}
const s=make();assert(C.init(s,'rescue'));
assert.equal(C.options(s,C.target(s)).length,2,'evacuation dilemma');
dock(s);
assert(C.apply(s,C.options(s,C.target(s))[1]),'all passengers board');
assert.equal(s.contract.evacuation,'all');
assert.equal(s.contract.phase,'deliver');
assert.equal(s.contract.bounty,205);
assert.equal(s.spawned.length,1);
assert.equal(s.spawned[0].type,'corsario');
assert(s.spawned[0].opts.forcedHostile);
assert(s.spawned[0].contractPursuer);
assert.equal(s.chartWaypointId,2);
assert(!C.apply(s,{contractAction:'rescue-all'}),'no second pursuer and prize');
dock(s);
assert(C.apply(s,C.options(s,C.target(s))[0]));
assert.equal(s.contract.completed,true);
assert.equal(s.contract.bounty,205);
assert(!C.apply(s,{contractAction:'deliver'}),'no duplicate delivery');
const impossible=make();assert(C.init(impossible,'rescue'));
impossible.spawnEnemy=()=>null;dock(impossible);
assert(!C.apply(impossible,C.options(impossible,C.target(impossible))[1]),
 'high-risk choice must not pay without a pursuer');
assert.equal(impossible.contract.phase,'pickup');
assert.equal(impossible.contract.bounty,125);
assert.equal(impossible.chartWaypointId,1);
const legacy=make();assert(C.init(legacy,'rescue'));dock(legacy);
assert(C.apply(legacy,C.options(legacy,C.target(legacy))[0]));
assert.equal(legacy.contract.bounty,125);
assert.equal(legacy.spawned.length,0);
const chase=make();assert(C.init(chase,'hunt'));dock(chase);
assert.equal(C.options(chase,C.target(chase)).length,2);
assert(C.apply(chase,C.options(chase,C.target(chase))[1]));
assert.equal(chase.contract.method,'evidence');
assert.equal(chase.contract.escapeAt,181,'160 seconds from investigation');
assert.equal(chase.contract.bounty,173,'28% paid to witnesses');
assert.equal(chase.spawned.length,1);
assert.equal(chase.spawned[0].hp,105,'documented vulnerability');
assert(!C.apply(chase,{contractAction:'hunt-evidence'}));
const pursuit=make();assert(C.init(pursuit,'hunt'));dock(pursuit);
assert(C.apply(pursuit,C.options(pursuit,C.target(pursuit))[0]));
assert.equal(pursuit.contract.method,'pursuit');
assert.equal(pursuit.contract.escapeAt,126);
assert.equal(pursuit.contract.bounty,240);
assert.equal(pursuit.spawned[0].hp,125);
const inform=make();assert(C.init(inform,'smuggle'));dock(inform);
inform.contract.suspicion=99;
assert.equal(C.options(inform,C.target(inform)).length,3);
assert(C.apply(inform,C.options(inform,C.target(inform))[2]),
 'informing the Court remains an option with high suspicion');
assert.equal(inform.contract.route,'inform');
assert.equal(inform.contract.bounty,85);
assert.equal(inform.alignment.corte,28);
assert.equal(inform.alignment.culto,7);
assert.equal(inform.curse,0);
assert(!C.apply(inform,{contractAction:'smuggle-inform'}),'no double reputation');
const oath=make('culto');assert(C.init(oath,'faction-smuggle'));dock(oath);
const initial=oath.contract.commissionBounty;
assert(C.apply(oath,C.options(oath,C.target(oath))[2]));
assert.equal(oath.contract.bounty,Math.round(initial*.45));
assert.equal(oath.alignment.corte,28);
assert.equal(oath.alignment.culto,7);
assert(!P.bonusAtSettlement(oath),'Cult oath cannot reward betrayal');
assert.equal(oath.alignment.culto,7);
const loyal=make('culto');assert(C.init(loyal,'faction-smuggle'));dock(loyal);
assert(C.apply(loyal,C.options(loyal,C.target(loyal))[1]));
assert(P.bonusAtSettlement(loyal));
assert.equal(loyal.alignment.culto,20);
assert(!/SeaProfile\s*\.|localStorage|sessionStorage|\bfetch\s*\(/.test(files['SeaContracts.js']),
 'Contract scene must not read or mutate the persistent profile');
assert(files['Game.js'].includes('contractDecision=this.contract.id'));
assert(files['PortUI.js'].includes('DECISÃO DO CAPITÃO'));
assert(files['PortUI.js'].includes('port-contracts__grid'));
assert(files['PortUI.js'].includes("this.button('contract:hunt'"));
assert(files['PortUI.js'].includes("this.button('contract:rescue'"));
assert(files['PortUI.js'].includes("this.button('contract:smuggle'"));
assert(files['sw.js'].includes('PortContractsV115.css'));
assert(files['sw.js'].includes('omar-mar-de-sangue-v115-'));
console.log('PASS V115: evacuation pursuer, witness risk, betrayal reputation, loyal commission and v4 isolation');
