/* node tests/SeaContractAnalytics.test.cjs
 * O painel não inventa resultados nem mistura renda de campanha com laboratório.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ctx={Math};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../SeaContractAnalytics.js'),'utf8')+
  '\nthis.A=SEA_CT001_ANALYTICS;',ctx);
const A=ctx.A;
function report({stage=10,route='free',won=true,seconds=120,seed=123,version=2,
  generatedAt='2026-11-10T03:00:00.000Z',reward=600}={}){
  const obj={
    format:'mar-de-sangue-ct001-playtest',schema:version,
    generatedAt,contractId:'CT-001',stage,
    route,captureSeconds:44,routeLength:5200,interceptionWindowSeconds:144,
    result:{won,withdrawn:false,completed:won,kills:3,rammings:0,
      collectedGold:reward,contractBounty:reward,simulatedReward:reward}
  };
  if(version===2){
    obj.seed=seed;obj.benchmark=true;obj.actualSaveMission=2;
    obj.result.elapsedSeconds=seconds;obj.result.hullMax=200;
    obj.result.hullRemaining=80;
  }
  return obj;
}
const r1=A.validate(report());
const r2=A.validate(report({won:false,seconds:180,reward:120,
  generatedAt:'2026-11-10T03:05:00.000Z'}));
const r3=A.validate(report({stage:2,route:'sell',seconds:150,seed:78,
  generatedAt:'2026-11-10T03:10:00.000Z',reward:300}));
assert.equal(r1.schema,2);
assert.equal(r1.seed,123);
assert.equal(r1.benchmark,true);
assert.equal(r1.actualSaveMission,2);
assert.equal(A.group([r1,r2]).length,1);
const group=A.group([r1,r2])[0];
assert.equal(group.n,2);
assert.equal(group.victories,1);
assert.equal(group.successRate,.5);
assert.equal(group.medianTime,150);
assert.equal(group.medianCapture,44);
assert.equal(group.goldPerMinute,144);
const aggregate=A.summarize([r1,r2,r3]);
assert.equal(aggregate.tests,3);
assert.equal(aggregate.wins,2);
assert.equal(aggregate.medianDuration,150);
assert.equal(aggregate.groups.length,2);
assert.equal(A.modelProxy(10).proposedBase,657);
assert.equal(A.modelProxy(2).proposedBase,251);
const legacy=A.validate(report({version:1}));
assert.equal(legacy.elapsedSeconds,null);
assert.equal(legacy.benchmark,false);
assert.equal(A.group([legacy])[0].goldPerMinute,null);
assert.throws(()=>A.validate({...report(),schema:4}));
assert.throws(()=>A.validate({...report(),route:'<script>alert(1)</script>'}));
assert.throws(()=>A.validate({...report(),result:{...report().result,simulatedReward:-100}}));
assert.throws(()=>A.validate({...report(),result:{...report().result,elapsedSeconds:Infinity}}));
assert.throws(()=>A.validate({...report(),seed:4294967296}));
assert.equal(A.validate({...report(),failureReason:'x'.repeat(999)}).failureReason.length,160);
const html=fs.readFileSync(path.join(__dirname,'../ct001-playtests.html'),'utf8');
assert.ok(html.includes('SeaContractAnalytics.js'));
assert.ok(html.includes('type="file"'));
const inline=html.match(/<script>\s*([\s\S]*?)<\/script>/);
assert.ok(inline,'script de interface não encontrado');
new Function(inline[1]);
console.log('Analytics CT-001: agregação, schema legado, validação e HTML local OK.');
