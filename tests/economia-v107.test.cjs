/* Economy V107 regression: campaigns advance story, the open sea pays. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const game=fs.readFileSync('Game.js','utf8');
const port=fs.readFileSync('PortUI.js','utf8'),sw=fs.readFileSync('sw.js','utf8');
const mathStart=game.indexOf('const SEA_MATH =');
const mathEnd=game.indexOf('const SEA_MISSION_TITLES =');
const shipStart=game.indexOf('const SEA_PLAYER_SHIP =');
const profileStart=game.indexOf('const SeaProfile =');
const profileEnd=game.indexOf('\n};',profileStart)+3;
assert(mathStart>=0&&mathEnd>mathStart&&shipStart>mathEnd&&
       profileStart>shipStart&&profileEnd>profileStart,'Model blocks present');
const saved=new Map();
const env={
 localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,String(v))},
 SEA_FACTIONS:{initial:()=>({allegiance:null}),normalize:f=>f}
};
vm.createContext(env);
vm.runInContext("const SEA_SAVE_V4='carcaca.mar-de-sangue.v4';"+
 "const SEA_SAVE_V3='carcaca.mar-de-sangue.shipyard.v3';let SEA_SESSION=null;\n"+
 game.slice(mathStart,mathEnd)+'\n'+game.slice(shipStart,profileStart)+
 '\n'+game.slice(profileStart,profileEnd)+
 '\nthis.model={SEA_MATH,SEA_UPGRADES,SEA_ECONOMY,SeaProfile};',env);
const {SEA_MATH,SEA_UPGRADES,SEA_ECONOMY,SeaProfile}=env.model;
assert.equal(SEA_ECONOMY.missionPayoutMultiplier,.25);
assert.equal(SEA_ECONOMY.upgradePriceMultiplier,3);
assert.equal(SEA_UPGRADES.length,15);
for(const u of SEA_UPGRADES)for(const level of [0,1,3,8])
 assert.equal(SeaProfile.price(u,level),SEA_MATH.cost(u.base,u.factor,level)*3,
   'Upgrade triple cost '+u.id+' level '+level);
assert.equal(SeaProfile.defaults().gold,55);
function reset(){const p=SeaProfile.defaults();p.gold=1000;SeaProfile.store(p);}
function trip(options={}){
 reset();
 return SeaProfile.settle({won:true,withdrawn:false,mode:'mission',stage:2,wave:0,
   collected:400,kills:0,rammings:0,...options});
}
const mission=trip({});
assert.equal(mission.grossReward,400);
assert.equal(mission.campaignCost,300);
assert.equal(mission.reward,100);
assert.equal(mission.bank,1100);
assert.equal(mission.mission,3,'Campaign progress unchanged');
const sandbox=trip({mode:'sandbox'});
assert.equal(sandbox.reward,400);
assert.equal(sandbox.campaignCost,0);
assert.equal(sandbox.bank,1400);
assert.equal(trip({won:false,withdrawn:true}).reward,75);
assert.equal(trip({won:false,withdrawn:false}).reward,40);
reset();
const p=SeaProfile.load();p.levels.cofre=2;SeaProfile.store(p);
const boosted=SeaProfile.settle({won:true,withdrawn:false,mode:'mission',stage:2,
 wave:0,collected:400,kills:0,rammings:0});
assert.equal(boosted.grossReward,520);
assert.equal(boosted.reward,130,'Cofre multiplier retained');
assert(SEA_ECONOMY.missionCommission(10)>SEA_ECONOMY.missionCommission(1));
assert(SEA_ECONOMY.missionCommission(20)<200);
assert(SEA_ECONOMY.missionCommission(90)<600);
assert.equal(SEA_ECONOMY.missionCommission(1000),SEA_ECONOMY.missionCommission(100));
assert(game.includes("this.gold >= this.targetGold"),'Cargo objective unchanged');
assert(game.includes("commission = SEA_ECONOMY.missionCommission(this.stage)"));
assert(port.includes('CUSTO DA CAMPANHA')&&port.includes('Saque integral'));
assert(Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1])>=107);
assert(sw.includes('"./assets/items/treasure_chest.png"'));
console.log('PASS Economy V107: all upgrade prices, mission 25%, sandbox 100%, save, cofre, objective, cache');
