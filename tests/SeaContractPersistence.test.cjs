/* O Mar de Sangue — ciclo 4: quadro, efeitos e save v4.
 * Teste offline: node tests/SeaContractPersistence.test.cjs
 */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const memory=new Map();
const localStorage={
  getItem:key=>memory.has(key)?memory.get(key):null,
  setItem:(key,value)=>memory.set(key,String(value)),
  removeItem:key=>memory.delete(key)
};
const faction=()=>({allegiance:null,proofs:{sobreviventes:false,corte:false,culto:false},lockUntil:0,history:[]});
const fakeFactions={initial:faction,normalize:f=>f||faction()};
const world={Math,localStorage,SEA_FACTIONS:fakeFactions};
const gameProfileOnly=read('Game.js').split('// Corrige o posicionamento')[0];
vm.runInNewContext([
  read('SeaContractState.js'),read('SeaContractEffects.js'),
  read('SeaSaveTransfer.js'),gameProfileOnly,
  'this.testExports={state:SEA_CONTRACT_STATE,effects:SEA_CONTRACT_EFFECTS,'+
    'transfer:SEA_SAVE_TRANSFER,profile:SeaProfile,upgrades:SEA_UPGRADES};'
].join('\n'),world);
const {state:S,effects:E,transfer:T,profile:P}=world.testExports;
const ids=['CT-001','CT-002','CT-003','CT-004','CT-005','CT-006','CT-007'];
const enabled=Object.create(S,{approvedTemplates:{value:ids}});
const same=(a,b)=>assert.equal(JSON.stringify(a),JSON.stringify(b));

assert.equal(S.templateId('CT-001'),true);
assert.equal(S.templateId('ct001'),false);
assert.equal(S.generate(2,ids.slice(0,2),17),null,'sem catálogo suficiente, não há quadro');
for(let seed=0;seed<128;seed++){
  const board=S.generate(10,ids,seed);
  assert.ok(board.offers.length>=3&&board.offers.length<=6);
  assert.equal(new Set(board.offers.map(x=>x.templateId)).size,board.offers.length);
  assert.equal(new Set(board.offers.map(x=>x.id)).size,board.offers.length);
  same(board,S.generate(10,ids,seed));
  same(S.validate({version:1,board,pendingEffects:[],settledInstances:[]}).board,board);
}
assert.equal(enabled.generate(2,ids.slice(0,3),1234).offers.length,3);
const progress=S.defaults();
progress.board=enabled.generate(2,ids.slice(0,3),1234);
const profile={mission:2,sorties:0,contractProgress:progress};
const offered=progress.board.offers[0];
assert.equal(enabled.accept(profile,offered.id),true);
assert.equal(enabled.accept(profile,offered.id),false,'aceite único');
assert.equal(enabled.canSettle(profile,{instanceId:offered.id,templateId:offered.templateId}),true);
assert.equal(enabled.canSettle(profile,{instanceId:offered.id,templateId:'CT-999'}),false);
profile.sorties=1;
const contract={instanceId:offered.id,templateId:'CT-001',route:'free'};
const eligible=profile.contractProgress.board.offers.find(x=>x.templateId==='CT-001');
if(eligible.id!==offered.id){
  // Recreate a board with a CT-001 accepted instance for the effect test.
  profile.contractProgress=enabled.defaults();
  const b=enabled.generate(2,['CT-001','CT-002','CT-003'],8);
  const choice=b.offers.find(x=>x.templateId==='CT-001');
  profile.contractProgress.board=b;
  assert.equal(enabled.accept(profile,choice.id),true);
  contract.instanceId=choice.id;
}
enabled.afterSortie(profile,{mode:'sandbox',won:true,contractInstance:contract},2);
assert.equal(profile.contractProgress.pendingEffects.length,1);
assert.equal(profile.contractProgress.pendingEffects[0].id,'fx-ct001-demeter-abrigo');
assert.equal(profile.contractProgress.pendingEffects[0].expiresOnSortie,2);
assert.equal(enabled.canSettle(profile,contract),false,'não pagar duas vezes');
assert.equal(enabled.hasSettled(profile,contract.instanceId),true);
const pendingProfile={sorties:1,contractProgress:profile.contractProgress};
let healed=0;
const s={profile:pendingProfile,contractId:null,shipHP:100,maxShipHP:200,
  elapsed:10,lastDamageTime:1000,time:{now:7200},enemies:[],
  player:{x:0,y:0},updateHUD(){healed++},announce(){}};
assert.equal(E.enter(s).length,1);
E.update(s,.016);
assert.equal(s.shipHP,130);
assert.equal(healed,1);
E.update(s,.016);
assert.equal(s.shipHP,130,'bênção não duplica');
assert.equal(s.contractEffects[0].used,true);
const lab={...s,contractId:'ct001'};
assert.equal(E.enter(lab).length,0,'laboratório não usa efeitos permanentes');
const hunterState=S.defaults();
hunterState.pendingEffects=[{id:'fx-ct001-cacadores-tributo',instanceId:contract.instanceId,expiresOnSortie:2}];
let hunterCount=0,forced=false;
const hunter={profile:{sorties:1,contractProgress:hunterState},contractId:null,elapsed:15,
  enemies:[],announce(){},spawnEnemy(type,dist,options){hunterCount++;forced=options.forcedHostile;
    return {id:1,type,label:{setText(){}}};}};
E.enter(hunter);E.update(hunter,.016);E.update(hunter,.016);
assert.equal(hunterCount,1);
assert.equal(forced,true);
const passState=S.defaults();
passState.pendingEffects=[{id:'fx-ct001-salvo-conduto',instanceId:contract.instanceId,expiresOnSortie:2}];
const passage={profile:{sorties:1,contractProgress:passState},contractId:null,announce(){}};
E.enter(passage);
const hostile={type:'patrulha',dead:false,neutral:false,label:{setText(){},setColor(){}}};
assert.equal(E.onSpawn(passage,hostile,{forcedHostile:true}),false);
assert.equal(hostile.neutral,false);
assert.equal(E.onSpawn(passage,hostile,{}),true);
assert.equal(hostile.neutral,true);
assert.equal(E.onSpawn(passage,{...hostile,neutral:false},{}),false,'salvo-conduto não acumula');
profile.sorties=2;
enabled.afterSortie(profile,{mode:'sandbox',won:false},2);
assert.equal(profile.contractProgress.pendingEffects.length,0,'expira após uma viagem');
let invalid=S.defaults();invalid.board={activeMission:2,clearedMission:1,seed:11,offers:[
  {id:'CT-001:M2:11:0',templateId:'CT-001',mission:2,seed:1,status:'offered'},
  {id:'CT-001:M2:11:1',templateId:'CT-001',mission:2,seed:2,status:'offered'},
  {id:'CT-003:M2:11:2',templateId:'CT-003',mission:2,seed:3,status:'offered'}
]};
assert.throws(()=>S.validate(invalid),'não aceitar template repetido');
assert.equal(S.normalize(invalid).board,null,'save malformado é isolado');
const fresh=P.defaults();
assert.equal(fresh.version,4);
assert.equal(fresh.contractProgress.version,1);
const valid=T.profile(fresh);
same(valid.contractProgress,S.defaults());
const ancient={...fresh};delete ancient.contractProgress;
assert.equal(T.profile(ancient).contractProgress,undefined,'backup legado aceito sem novo campo');
assert.throws(()=>T.profile({...fresh,secret:1}),'campos inesperados rejeitados');
assert.throws(()=>T.profile({...fresh,contractProgress:invalid}),'efeitos/quadro malformados rejeitados');
const backup={format:T.format,schema:4,exportedAt:new Date().toISOString(),profile:fresh};
const parsed=T.parse(JSON.stringify(backup));
assert.equal(parsed.profile.contractProgress.version,1);
const oldBackup={...backup,profile:ancient};
assert.equal(T.parse(JSON.stringify(oldBackup)).profile.contractProgress,undefined);
const rootBefore=P.load();
assert.equal(rootBefore.mission,1);
const report=P.settle({won:true,withdrawn:false,mode:'mission',stage:1,wave:1,
  collected:180,kills:2,rammings:0,islands:0});
assert.equal(report.mission,2);
assert.equal(P.load().contractProgress.board,null,'CT-001 ainda não autorizado');
assert.equal(P.load().sorties,1);
assert.equal(P.load().contractProgress.pendingEffects.length,0);
const actualBefore=localStorage.getItem('carcaca.mar-de-sangue.v4');
T.apply(T.profile(P.load()));
assert.equal(P.load().mission,2,'restauração preserva progressão');
assert.equal(P.load().contractProgress.version,1);
const rollback=T.lastRollback();
assert.equal(rollback.profile.contractProgress.version,1,'rollback preserva contrato');
assert.ok(actualBefore,'save anterior existia');
console.log('Persistência de contratos: sorteio, expiração, efeitos, save/backup v4 e legado OK.');
