/* CT-001 — testes de estados e rotas (sem Phaser ou DOM).
 * Executar da raiz: node tests/SeaContractCT001.test.cjs
 */
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const assert=require('node:assert/strict');
const code=fs.readFileSync(path.join(__dirname,'../SeaContractCT001.js'),'utf8');
const world={
  Math,SEA_ECONOMY:{missionPayoutMultiplier:.25,
    missionCommission:stage=>Math.round(24+4.5*stage+6*Math.sqrt(stage))},
  SEA_FOES:{fragata:{name:'FRAGATA'},galeao:{name:'GALEÃO'},
    patrulha:{name:'PATRULHA'},corsario:{name:'CORSÁRIO'},bombardeiro:{name:'BOMBARDEIRO'}},
  SEA_ISLANDS:{render(s){s.rendered=(s.rendered||0)+1}}
};
vm.runInNewContext(code+'\nthis.CT=SEA_CT001;',world);
const CT=world.CT;
let id=1;
function scene(stage=2){
  return {
    W:8800,H:6800,profile:{mission:stage},player:{x:900,y:600},
    playerVelocity:{x:0,y:0},shipHP:100,maxShipHP:100,
    islands:[{id:11,kind:'wreck',x:1450,y:800,radius:65},
      {id:12,kind:'ruin',x:2500,y:1300,radius:72},
      {id:13,kind:'demeter',x:2900,y:1800,radius:65}],
    chartDiscovered:new Set(),islandVisits:new Set(),chartWaypointId:null,
    elapsed:5, enemies:[],alignment:{sobreviventes:20,corte:20,culto:20},
    politicalEvents:[],islandDocked:false,ended:false,sinking:false,
    announce(){},updateHUD(){},touchReset(){},
    finish(won,withdrawn){this.finished={won,withdrawn}},
    spawnEnemy(type,spacing,opts={}){
      const e={id:id++,type,x:920+spacing,y:650,radius:65,
        capturable:opts.capturable===true,boardingDisabled:false,dead:false,
        hp:200,maxhp:200,vx:0,vy:0,speed:100,heading:0,
        label:{setText(){}},reward:24};
      this.enemies.push(e);
      return e;
    }
  };
}
function untilCapture(stage=2){
  const s=scene(stage);
  assert.equal(CT.init(s),true);
  const clue=CT.target(s);
  assert.equal(clue.kind,'wreck');
  s.islandSelected=clue;
  assert.equal(CT.apply(s,{contractAction:'ct001-clue'}),true);
  assert.equal(s.contract.phase,'chase');
  const e=s.enemies.find(e=>e.id===s.contract.targetEnemyId);
  assert.ok(e?.capturable);
  e.boardingDisabled=true;e.dead=true;
  assert.equal(CT.onCapture(s,e),true);
  assert.equal(s.contract.phase,'choose');
  assert.equal(s.islandDocked,true);
  assert.equal(s.islandSelected.id,'ct001-deck');
  assert.equal(CT.options(s,s.islandSelected).length,3);
  return s;
}
{
  const s=untilCapture();
  assert.equal(CT.apply(s,{contractAction:'ct001-free'}),true);
  assert.equal(s.contract.phase,'deliver');
  assert.equal(CT.target(s).kind,'demeter');
  s.islandSelected=CT.target(s);
  assert.equal(CT.apply(s,{contractAction:'ct001-deliver'}),true);
  assert.equal(s.contract.completed,true);
  assert.equal(s.contract.bounty,Math.round(s.contract.baseBounty*.8));
  assert.equal(s.alignment.sobreviventes,30);
  assert.equal(s.alignment.corte,13);
  assert.equal(s.alignment.culto,18);
  assert.equal(CT.apply(s,{contractAction:'ct001-deliver'}),false);
}
{
  const s=untilCapture();
  assert.equal(CT.apply(s,{contractAction:'ct001-loot'}),true);
  assert.equal(s.contract.phase,'ambush');
  assert.equal(s.contract.ambushIds.length,2);
  CT.update(s);
  assert.equal(s.contract.completed,false);
  for(const enemy of s.enemies)if(s.contract.ambushIds.includes(enemy.id))enemy.dead=true;
  CT.update(s);
  assert.equal(s.contract.completed,true);
  assert.equal(s.contract.bounty,Math.round(s.contract.baseBounty*1.25));
  assert.equal(s.finished.won,true);
  assert.equal(s.alignment.sobreviventes,14);
}
{
  const s=untilCapture();
  assert.equal(CT.apply(s,{contractAction:'ct001-sell'}),true);
  assert.equal(s.contract.phase,'manifest');
  assert.equal(CT.target(s).kind,'ruin');
  s.islandSelected=CT.target(s);
  assert.equal(CT.apply(s,{contractAction:'ct001-manifest'}),true);
  assert.equal(s.contract.completed,true);
  assert.equal(s.contract.bounty,s.contract.baseBounty);
  assert.equal(s.alignment.corte,25);
  assert.equal(s.alignment.sobreviventes,12);
}
{
  const s=scene();
  assert.equal(CT.init(s),true);
  s.islandSelected=CT.target(s);
  CT.apply(s,{contractAction:'ct001-clue'});
  s.elapsed=s.contract.escapeAt+1;
  CT.update(s);
  assert.equal(s.contract.failed,true);
  assert.equal(s.contract.bounty,0);
  assert.equal(s.finished.won,false);
}
{
  const a=scene(2),b=scene(10),c=scene(25);
  CT.init(a);CT.init(b);CT.init(c);
  assert.ok(a.contract.baseBounty<b.contract.baseBounty);
  assert.ok(b.contract.baseBounty<c.contract.baseBounty);
  assert.equal(CT.band(25).escorts.length,4);
  assert.equal(CT.band(200).escorts.length,4);
}
console.log('CT-001: 3 rotas, fuga, escala e escolha modal passaram.');
