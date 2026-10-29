'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const source={politics:read('SeaFactionPolitics.js'),factions:read('SeaFactions.js'),
 contracts:read('SeaContracts.js'),rules:read('SeaIslandRules.js'),game:read('Game.js'),
 port:read('PortUI.js'),events:read('SeaPoliticalEvents.js'),html:read('index.html'),sw:read('sw.js')};
for(const [name,code] of Object.entries(source))if(name!=='html'&&name!=='sw')new vm.Script(code,{filename:name+'.js'});
const ctx={SEA_WEATHER:{enemyCurrent(){},announceTier(){}},SEA_AUDIO:{play(){}},
 SEA_MATH:{safe:n=>Math.floor(Math.max(0,n)),clamp:(n,a,b)=>Math.max(a,Math.min(b,n))}};
vm.createContext(ctx);
vm.runInContext(source.factions+';this.F=SEA_FACTIONS',ctx);
vm.runInContext(source.politics+';this.P=SEA_FACTION_POLITICS',ctx);
vm.runInContext(source.contracts+';this.C=SEA_CONTRACTS',ctx);
vm.runInContext(source.rules+';this.R=SEA_ISLAND_RULES',ctx);
const {F,P,C,R}=ctx;
const profile=id=>({faction:{...F.initial(),allegiance:id},alignment:{sobreviventes:0,corte:0,culto:0},sorties:16});
assert.equal(P.allegiance(profile('corte')),'corte');
assert.equal(P.allegiance({profile:profile('culto')}),'culto');
assert.equal(P.allegiance(profile(null)),null);
{
 const s={profile:profile('culto'),shipStats:{cannonDamage:100}};
 P.shipStats(s);assert.equal(s.shipStats.cannonDamage,107);
 assert.equal(P.curseAdded(s,20),22);
 assert.equal(P.curseAdded({profile:profile('corte')},20),20);
}
{
 const s={profile:profile('sobreviventes')};
 assert.equal(Math.round(P.healing(s,100)),110);
 assert.equal(P.healing({profile:profile('culto')},100),100);
}
assert.equal(P.treasure({profile:profile('corte')},100),110);
assert.equal(P.treasure({profile:profile('sobreviventes')},100),100);
assert.equal(P.treasure({profile:profile(null)},100),100);
{
 const scene={profile:profile('corte')};
 assert(P.isNeutral(scene,'patrulha',{}));
 assert(!P.isNeutral(scene,'patrulha',{forcedHostile:true}));
 assert(!P.isNeutral(scene,'fragata',{}));
 assert(!P.isNeutral({profile:profile('sobreviventes')},'patrulha',{}));
 const label={text:'',color:'',setText(v){this.text=v;return this},setColor(v){this.color=v;return this}};
 const enemy={type:'patrulha',label};
 assert(P.markEnemy(scene,enemy));
 assert.equal(enemy.neutral,true);
 assert(label.text.includes('ALIADA'));
 assert(P.provoke(enemy));assert(!enemy.neutral);
 assert(label.text.includes('TRAÍDA'));
 assert(!P.provoke(enemy));
 const quiet={type:'patrulha',neutral:true,dead:false,heading:0,vx:0,vy:0,speed:100,x:200,y:200,
   visualPhase:0,chargeMs:99,chargeStage:3};
 const sea={elapsed:20,collideWorldBounds(){},collideRock(){},islands:[]};
 assert(P.neutralSail(sea,quiet,.05));
 assert.equal(quiet.chargeStage,0);assert(quiet.y<200);
}
{
 const valid=[['faction-rescue','sobreviventes','rescue'],['faction-hunt','corte','hunt'],['faction-smuggle','culto','smuggle']];
 const islands=[{id:1,kind:'wreck',x:1650,y:1000},
   {id:2,kind:'demeter',x:2150,y:1020},{id:3,kind:'ruin',x:3600,y:2800}];
 for(const [id,faction,base] of valid){
   const p=profile(faction),s={profile:p,islands,W:4400,H:3400,
     chartDiscovered:new Set(),player:{x:2200,y:1700}};
   assert(P.commission(id,p));assert(P.bounty(p,id)>C.offers[base].bounty);
   assert(C.init(s,id),id);
   assert.equal(s.contract.id,base);
   assert.equal(s.contract.commission,faction);
   assert.equal(s.contract.bounty,P.bounty(p,id));
   assert(s.chartDiscovered.size>0,'contract waypoint discovered');
   const rogue={...s,profile:profile('culto')};
   if(faction!=='culto')assert.equal(C.init(rogue,id),false,'unauthorized commission rejected');
 }
 assert.equal(P.commission('faction-rescue',profile('corte')),null);
}
{
 const catalog=JSON.parse(read('laboratorio-ilhas/catalog.json'));
 const mk=faction=>({
   faction:{...F.initial(),allegiance:faction},
   alignment:{sobreviventes:0,corte:0,culto:0},
   cache:{json:{get(){return catalog}}}, gold:200,shipHP:100,maxShipHP:500,curse:20,
   shipStats:{cannonDamage:100,maxSpeed:200,radar:500,turnSpeed:3}
 });
 const neutral=mk(null),survivor=mk('sobreviventes'),dagon=mk('culto');
 const choice={formula:'H:10',id:'fake-heal'};
 const base=R.preview(neutral,choice).next.hp,
       boosted=R.preview(survivor,choice).next.hp;
 assert.equal(base,150);assert.equal(boosted,155);
 const curse={formula:'C:40',id:'fake-curse'};
 assert.equal(R.preview(neutral,curse).next.curse,60);
 assert.equal(R.preview(dagon,curse).next.curse,64);
}
{
 const s={profile:profile(null),faction:F.initial(),
   alignment:{sobreviventes:7,corte:0,culto:0},
   contract:{id:'rescue',commission:'sobreviventes',completed:true}};
 assert(P.bonusAtSettlement(s));
 assert.equal(s.alignment.sobreviventes,15);
}
{
 const s={faction:{...F.initial(),history:[{action:'leave',faction:'corte',sortie:4}],
   lockUntil:5},profile:{sorties:4},elapsed:16,deserterPursuitSent:false,
   spawnEnemy(type,d,opt){this.spawn={type,d,opts:opt};return {label:{setText(){}}}},
   announce(msg){this.message=msg}};
 assert(P.desertion(s));assert.equal(s.spawn.type,'patrulha');
 assert(s.spawn.opts.forcedHostile);assert(!P.desertion(s));
 s.deserterPursuitSent=false;s.profile.sorties=5;
 assert(!P.desertion(s),'no deserter squad after neutral voyage');
}
assert(source.game.includes('SEA_FACTION_POLITICS.shipStats(this)'));
assert(source.game.includes('SEA_FACTION_POLITICS.neutralSail(this,e,dt)'));
assert(source.game.includes('SEA_FACTION_POLITICS.provoke(e)'));
assert(source.game.includes('SEA_FACTION_POLITICS.treasure(this,t.value)'));
assert(source.game.includes('SEA_FACTION_POLITICS.bonusAtSettlement(this)'));
assert(source.events.includes('forcedHostile:true'));
assert(source.contracts.includes("s.spawnEnemy?.('patrulha',330,{forcedHostile:true})"));
assert(source.port.includes("data-action=\"faction:"));
assert(source.port.includes("this.button('contract:'+assignment[0]"));
assert(source.html.includes('<script src="SeaFactionPolitics.js"></script>'));
assert(source.sw.includes('"./SeaFactionPolitics.js"'));
assert(source.sw.includes('v101-faction-political-consequences'));
console.log('PASS V101: three bounded perks, allied patrol, provocation, deserter pursuer, faction commissions, contract exclusivity, PWA');
