/* node tests/save-restore-3-6c.test.cjs — strict import + durable rollback */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('SeaSaveTransfer.js','utf8');
const game=fs.readFileSync('Game.js','utf8');
const ids=[...game.matchAll(/\{ id: '([^']+)', icon:/g)].map(m=>m[1]);
assert.equal(ids.length,14,'Expected canonical 14 upgrades');
const levels=Object.fromEntries(ids.map(id=>[id,0]));
const original={version:4,gold:715,levels:{...levels,casco:2},
  sorties:14,wins:8,losses:5,kills:36,rammings:2,earned:1862,
  best:400,mission:7,bestMission:6,bestWave:11,mode:'mission'};
const imported={...original,gold:555,mission:3,levels:{...levels,canhoes:4}};
let writes=[],failKey=null;const store=new Map([['carcaca.mar-de-sangue.v4',JSON.stringify(original)]]);
const localStorage={
 getItem:key=>store.has(key)?store.get(key):null,
 setItem(key,v){if(key===failKey)throw Error('QuotaExceededError');writes.push(key);store.set(key,String(v));},
 removeItem(key){writes.push('DEL '+key);store.delete(key)}
};
const ctx={localStorage,SeaProfile:{load:()=>JSON.parse(store.get('carcaca.mar-de-sangue.v4'))},
 SEA_UPGRADES:ids.map(id=>({id})),console,Date};
vm.createContext(ctx);
vm.runInContext(source+';this.transfer=SEA_SAVE_TRANSFER;',ctx);
const t=ctx.transfer,save=t.saveKey,rollback=t.rollbackKey;
const wrap=(profile=imported)=>JSON.stringify({format:'mar-de-sangue-captain-backup',
 schema:4,exportedAt:'2026-10-16T18:44:18.000Z',profile});
const parsed=t.parse(wrap());
assert.deepEqual(JSON.parse(JSON.stringify(parsed.profile)),imported);
assert.equal(parsed.exportedAt,'2026-10-16T18:44:18.000Z');
const old=store.get(save);
function bad(payload,pattern){
 const before=writes.length;assert.throws(()=>t.parse(payload),pattern);
 assert.equal(writes.length,before,'Rejected import must never write');
}
bad('{ nope',/JSON inválido/);
bad(' ',/Arquivo vazio/);
bad('a'.repeat(t.maxSize+1),/maior que/);
bad(JSON.stringify({...JSON.parse(wrap()),schema:5}),/Formato de backup/);
bad(JSON.stringify({...JSON.parse(wrap()),profile:{...imported,version:5}}),/Apenas saves v4/);
bad(JSON.stringify({...JSON.parse(wrap()),profile:{...imported,gold:-1}}),/Valor inválido/);
bad(JSON.stringify({...JSON.parse(wrap()),profile:{...imported,gold:1.5}}),/Valor inválido/);
bad(JSON.stringify({...JSON.parse(wrap()),profile:{...imported,mission:0}}),/Valor inválido/);
bad(JSON.stringify({...JSON.parse(wrap()),profile:{...imported,levels:{...imported.levels,casco:1000000}}}),/Nível inválido/);
bad(JSON.stringify({...JSON.parse(wrap()),profile:{...imported,evil:'code'}}),/campos exatos/);
bad(JSON.stringify({...JSON.parse(wrap()),profile:{...imported,levels:{...imported.levels,evil:1}}}),/lista de melhorias/);
bad(JSON.stringify({...JSON.parse(wrap()),profile:{...imported,mode:'evil'}}),/Modo/);
bad(JSON.stringify({...JSON.parse(wrap()),nasty:true}),/Formato de backup/);
assert.equal(store.get(save),old);
assert.equal(t.lastRollback(),null);
t.apply(parsed.profile);
assert.equal(JSON.parse(store.get(save)).gold,555);
assert.equal(JSON.parse(store.get(rollback)).previousRawV4,old);
assert.equal(JSON.parse(store.get(rollback)).previousProfile.gold,715);
assert.equal(writes.at(-2),rollback,'Rollback MUST be written before replacing save');
assert.equal(writes.at(-1),save,'Save replace follows durable snapshot');
assert.equal(t.lastRollback().profile.gold,715);
const undo=t.lastRollback();
t.apply(undo.profile);
assert.equal(JSON.parse(store.get(save)).gold,715,'Undo returns to former save');
assert.equal(t.lastRollback().profile.gold,555,'Undo should be reversible');
failKey=save;
const beforeFailure=store.get(save);
assert.throws(()=>t.apply(imported),/preservado/);
assert.equal(store.get(save),beforeFailure,'Write error cannot corrupt the original');
failKey=rollback;
const beforeRollbackFailure=store.get(save);
assert.throws(()=>t.apply(imported),/QuotaExceededError/);
assert.equal(store.get(save),beforeRollbackFailure,'Backup failure must abort before save write');
failKey=null;
assert(t.lastRollback()?.profile,'An undo snapshot must exist before an explicit wipe');
t.clearRollback();
assert.equal(t.lastRollback(),null,'Erase progress must remove the undo snapshot');
console.log('PASS 3.6c: strict v4 schema, reject corrupted/malicious files, rollback, undo and write failure');
