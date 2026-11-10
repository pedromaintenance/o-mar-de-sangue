/* Testes do laboratório CT-001 v0.6 (node tests/SeaContractLab.test.cjs).
 * A missão, o navio e a bandeira de benchmark não são escritos no save.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ctx={Math,URLSearchParams,SEA_FACTIONS:{
  initial:()=>({allegiance:null,proofs:{sobreviventes:false,corte:false,culto:false},
    lockUntil:0,history:[]})
}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../SeaContractLab.js'),'utf8')+
  '\nthis.L=SEA_CT001_LAB;',ctx);
const L=ctx.L;
assert.deepEqual(Array.from(L.scenarios),[2,10,25]);
for(const stage of [2,10,25]){
  const cfg=L.config('?ct001Stage='+stage+'&ct001Seed=56789',3);
  assert.equal(cfg.stage,stage);
  assert.equal(cfg.benchmark,true);
  assert.equal(cfg.actualStage,3);
  assert.equal(cfg.seed,56789);
  const real={version:4,mission:3,gold:100,
    levels:{casco:66,canhoes:15,cofre:18},
    alignment:{sobreviventes:75,corte:4,culto:0},
    faction:{allegiance:'sobreviventes'}};
  const old=JSON.stringify(real);
  const copy=L.sceneProfile(real,cfg);
  assert.notEqual(copy,real);
  assert.notEqual(copy.levels,real.levels);
  assert.equal(copy.mission,stage);
  assert.equal(copy.levels.cofre,0);
  assert.equal(copy.faction.allegiance,null);
  assert.equal(copy.alignment.sobreviventes,0);
  assert.equal(JSON.stringify(real),old,'benchmark nunca altera o perfil real');
}
for(const raw of ['', '1','3','0','-1','25abc','010','999999']){
  const cfg=L.config('?ct001Stage='+raw,7);
  assert.equal(cfg.benchmark,false,'faixa não autorizada: '+raw);
  assert.equal(cfg.stage,7);
}
for(const seed of ['-1','abc','4294967296','1e7',' 7 ','+1','001']){
  assert.equal(L.config('?ct001Stage=10&ct001Seed='+encodeURIComponent(seed),1).seed,
    L.seedDefault,'semente malformada: '+seed);
}
assert.equal(L.config('?ct001Stage=10&ct001Seed=0',1).seed,0);
assert.equal(L.config('?ct001Stage=10&ct001Seed=4294967295',1).seed,4294967295);
const a=L.rng(42),b=L.rng(42),c=L.rng(43);
const aa=Array.from({length:30},()=>a());
assert.deepEqual(aa,Array.from({length:30},()=>b()));
assert.notEqual(aa[0],c());
assert.ok(aa.every(x=>x>=0&&x<1));
assert.equal(L.sceneProfile({mission:5},L.config('',5)).mission,5);
console.log('Laboratório CT-001: faixas 2/10/25, seeds, perfis temporários e modo legado OK.');
