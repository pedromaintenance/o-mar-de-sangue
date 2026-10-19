/* 3.7a — rescue gameplay contract. No profile migration or network. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const sources=['SeaContracts.js','SeaIslands.js','Game.js','PortUI.js','index.html'];
const code=Object.fromEntries(sources.map(name=>[name,fs.readFileSync(name,'utf8')]));
const ctx={SEA_DESKTOP:true,SEA_VIEW:{width:1280,height:720},
 SEA_MATH:{safe:n=>Math.max(0,Math.floor(n)),clamp:(n,a,b)=>Math.min(b,Math.max(a,n))},
 SEA_WEATHER:{announceTier(){}},SEA_AUDIO:{play(){}},SEA_COMBAT:{scars(){}}
};
vm.createContext(ctx);
vm.runInContext(code['SeaContracts.js']+';this.contracts=SEA_CONTRACTS;',ctx);
vm.runInContext(code['SeaIslands.js']+';this.islandsAPI=SEA_ISLANDS;',ctx);
const c=ctx.contracts,islands=ctx.islandsAPI;
const shape=()=>({add(){return this},setDepth(){return this},setOrigin(){return this},
 setScrollFactor(){return this},setVisible(){return this},setStrokeStyle(){return this},
 setScale(){return this},setText(){return this},setFillStyle(){return this},
 destroy(){this.destroyed=true;return this},clear(){return this},
 lineStyle(){return this},lineBetween(){return this},strokeCircle(){return this}});
const saves=[],finishes=[];
function scene(){
 const s={W:4400,H:3400,shipHP:90,maxShipHP:100,gold:0,curse:0,
  shipStats:{radar:460,maxSpeed:198,cannonDamage:23,turnSpeed:2},
  player:{x:2200,y:1700},hullRadius:68,playerVelocity:{x:0,y:0},
  islands:[{id:1,kind:'wreck',x:2500,y:1400,radius:80},
    {id:2,kind:'wreck',x:400,y:400,radius:80},
    {id:3,kind:'parley',x:1900,y:500,radius:80},
    {id:4,kind:'demeter',x:3100,y:1900,radius:80},
    {id:5,kind:'demeter',x:200,y:2900,radius:80}],
  enemies:[],time:{now:500},elapsed:12,ended:false,sinking:false,
  chartDiscovered:new Set(),chartWaypointId:null,atlasFocusedId:null,
  islandVisits:new Set(),islandDocked:false,islandSelected:null,
  islandOutcome:'',islandError:'',islandOptions:[],islandChoiceIndex:0,
  add:{rectangle:shape,text:shape,container:shape,graphics:shape,image:shape},
  textures:{exists:()=>true,get:()=>({getSourceImage:()=>({height:256})})},
  touchReset(){},updateHUD(){this.updated=(this.updated||0)+1},
  announce(){},drawHullScars(){},finish(won){finishes.push(won);this.ended=true}
 };
 islands.init(s);
 return s;
}
let s=scene(),saveSnapshot=JSON.stringify({gold:s.gold,levels:null});
assert.equal(c.init(s,'rescue'),true);
assert.equal(s.contract.pickupId,1);
assert.equal(s.contract.shelterId,4);
assert.equal(s.chartWaypointId,1);
assert.deepEqual([...s.chartDiscovered],[1]);
assert.equal(c.status(s),'RESGATE · LOCALIZE OS NÁUFRAGOS NA CARTA');
assert.equal(c.options(s,{id:9}),null);
assert.equal(c.options(s,{id:1}).length,1);
assert.equal(c.apply(s,{contractAction:'deliver'}),false);
s.islandDocked=true;s.islandSelected=s.islands[0];
const pickup=c.options(s,s.islandSelected)[0];
assert(islands.apply(s,pickup),'pickup accepted');
assert.equal(s.contract.phase,'deliver');
assert.equal(s.contract.completed,false);
assert.equal(s.chartWaypointId,4);
assert.deepEqual([...s.chartDiscovered],[1,4]);
assert.equal(s.islandVisits.has(1),true);
assert.equal(islands.apply(s,pickup),false);
assert.equal(finishes.length,0,'pickup cannot finish');
islands.close(s);
assert.equal(finishes.length,0,'no payout for pickup');
// Visit the delivery location beforehand on a different voyage, then
// confirm that the rescue transition can still be completed once.
s.islandVisits.add(4);
s.player.x=3250;s.player.y=1900;
assert.equal(islands.nearest(s).island.id,4,'visited sanctuary remains available for delivery');
s.islandDocked=true;s.islandSelected=s.islands[3];
const delivery=c.options(s,s.islandSelected)[0];
assert.equal(islands.apply(s,delivery),true);
assert.equal(s.contract.completed,true);
assert.equal(s.chartWaypointId,null);
assert.equal(islands.apply(s,delivery),false,'payout only once');
assert.equal(finishes.length,0,'player reads the delivery outcome before finishing');
islands.close(s);
assert.deepEqual(finishes,[true]);
assert.equal(JSON.stringify({gold:s.gold,levels:null}),saveSnapshot);
// Invalid ids never create an active contract.
const regular=scene();assert.equal(c.init(regular,'made-up'),false);
assert.equal(regular.contract,null);
assert.equal(c.init(regular,'rescue'),true);
assert(!/SeaProfile\.|localStorage|sessionStorage|\bfetch\s*\(/.test(code['SeaContracts.js']),
 'Contracts cannot mutate permanent progression or call remote endpoints');
assert(code['Game.js'].includes('contractBounty=won&&this.contract?.completed'));
assert(code['Game.js'].includes("['rescue','smuggle','hunt'].includes(data?.contract)"));
assert(code['Game.js'].includes("if (this.contract)return SEA_CONTRACTS.status(this)"));
assert(code['PortUI.js'].includes("['rescue','smuggle'].includes(id)"));
assert(code['PortUI.js'].includes("this.start('sandbox',id)"));
assert(code['index.html'].indexOf('SeaContracts.js')>code['index.html'].indexOf('SeaAtlas.js'));
assert(code['index.html'].indexOf('SeaContracts.js')<code['index.html'].indexOf('Game.js'));
console.log('PASS 3.7a rescue: two stops, waypoint, anti-replay, payout condition and v4 isolation');
