/* Integração CT-001: roteador legados + motor de abordagem + estado novo.
 * Teste sem navegador: node tests/SeaContractCT001.integration.test.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const ctx={
  Math,
  SEA_ECONOMY:{missionPayoutMultiplier:.25,missionCommission:s=>24+5*s},
  SEA_FOES:{
    patrulha:{name:'Patrulha'},corsario:{name:'Corsário'},
    fragata:{name:'Fragata'},galeao:{name:'Galeão'},bombardeiro:{name:'Bombardeiro'}
  },
  SEA_FACTION_POLITICS:{commissions:{},commission(){return null}},
  SEA_ISLANDS:{render(s){s.dialogRendered=true}}
};
const loaded=[
  'SeaConvoyNavigation.js','SeaContractCT001.js','SeaContracts.js','SeaBoarding.js'
].map(read).join('\n');
vm.runInNewContext(loaded+'\nthis.testExports={CT:SEA_CT001,C:SEA_CONTRACTS,B:SEA_BOARDING};',ctx);
const {C,B}=ctx.testExports;
let serial=0,visualDestroyed=0;
const scene={
  W:8800,H:6800,profile:{mission:2},player:{x:100,y:100},
  playerVelocity:{x:0,y:0},hullRadius:55,elapsed:0,ended:false,
  sinking:false,islandDocked:false,atlasOpen:false,islandVisits:new Set(),
  islands:[{id:1,kind:'wreck',x:150,y:350,radius:70},
    {id:2,kind:'ruin',x:670,y:390,radius:75},
    {id:3,kind:'demeter',x:850,y:560,radius:60}],
  chartDiscovered:new Set(),enemies:[],politicalEvents:[],
  alignment:{sobreviventes:20,corte:20,culto:20},
  announce(){},touchReset(){},updateHUD(){},
  anchorPulse:{clear(){}},anchorButton:{setVisible(){}},
  anchorText:{setVisible(){}},anchorHint:{setVisible(){}},
  spawnEnemy(type,spacing,opts={}){
    const visual=()=>({destroy(){visualDestroyed++}});
    const e={id:++serial,type,x:223,y:100,radius:65,hp:200,maxhp:200,
      vx:0,vy:0,heading:0,speed:110,reward:24,
      capturable:!!opts.capturable,dead:false,boardingDisabled:false,
      ship:visual(),bar:visual(),wake:visual(),
      label:{destroy(){visualDestroyed++},setText(){},setColor(){}}
    };
    this.enemies.push(e);return e;
  }
};
assert.equal(C.init(scene,'ct001'),true);
assert.equal(scene.contract.id,'ct001');
assert.equal(C.target(scene).kind,'wreck');
scene.islandSelected=C.target(scene);
assert.equal(C.apply(scene,{contractAction:'ct001-clue'}),true);
assert.equal(scene.contract.phase,'chase');
const target=scene.enemies.find(e=>e.ct001Transport);
assert.ok(target);
target.hp=48;
assert.equal(B.onDamage(scene,target),true);
assert.equal(B.nearest(scene).allowed,true);
assert.equal(B.board(scene,target),true);
assert.equal(visualDestroyed,4);
assert.equal(scene.dialogRendered,true);
assert.equal(scene.islandDocked,true);
assert.equal(scene.contract.phase,'choose');
const choices=C.options(scene,scene.islandSelected);
assert.deepEqual(Array.from(choices,v=>v.contractAction),
  ['ct001-free','ct001-loot','ct001-sell']);
assert.equal(C.apply(scene,choices[0]),true);
assert.equal(scene.contract.phase,'deliver');
assert.equal(C.target(scene).kind,'demeter');
scene.islandSelected=C.target(scene);
assert.equal(C.apply(scene,{contractAction:'ct001-deliver'}),true);
assert.equal(scene.contract.completed,true);
assert.equal(scene.contract.bounty,Math.round(scene.contract.baseBounty*.8));
assert.equal(scene.alignment.sobreviventes,30);
assert.equal(scene.politicalEvents.length,1);
console.log('Integração CT-001: manifesto → comboio → captura → decisão → Deméter OK');
