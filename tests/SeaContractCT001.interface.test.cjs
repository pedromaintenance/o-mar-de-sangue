/* Interface de laboratório CT-001: marcador, revisit e telemetria.
 * node tests/SeaContractCT001.interface.test.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const ctx={Math,
  SEA_CONTRACTS:{target:s=>s.islands?.find(i=>i.id===s.contract?.shelterId)||null},
  SEA_DESKTOP:true,SEA_VIEW:{width:1280,height:720}};
vm.runInNewContext(
  ['SeaBoarding.js','SeaIslands.js','SeaAtlas.js','PortUI.js'].map(read).join('\n')+
  '\nthis.components={B:SEA_BOARDING,I:SEA_ISLANDS,A:SEA_ATLAS,P:SEA_PORT_UI}',ctx);
const {I,A,P}=ctx.components;
const island={id:13,kind:'demeter',x:190,y:0,radius:65};
const s={
  player:{x:0,y:0,rotation:0},hullRadius:55,
  playerVelocity:{x:0,y:0},islands:[island],enemies:[],
  islandVisits:new Set([13]),contract:{id:'ct001',phase:'deliver',shelterId:13},
  chartDiscovered:new Set([13]),chartWaypointId:13,
  ended:false,sinking:false,islandDocked:false
};
assert.equal(I.nearest(s)?.island.id,13,'Deméter pode ser revisitada na entrega');
assert.equal(I.nearest(s)?.allowed,true);
s.contract={id:'ct001',phase:'clue',shelterId:13};
assert.equal(I.nearest(s),null,'ilha comum visitada permanece bloqueada');
s.contract={id:'ct001',phase:'chase',targetEnemyId:4,escapeAt:100};
const transport={id:4,x:600,y:100,radius:70,dead:false};
s.enemies=[transport];
s.chartWaypointId=null;
assert.equal(A.navigation(s).island.contractTracker,true);
assert.equal(A.navigation(s).island.x,600);
transport.x=700;
assert.equal(A.navigation(s).island.x,700,'rastreamento acompanha movimento');
transport.dead=true;
assert.equal(A.navigation(s),null,'navio afundado não fica marcado');
const report={
  laboratory:true,contractTitle:'O Dízimo dos Afogados',won:true,
  withdrawn:false,contractCompleted:true,contractBounty:251,
  kills:2,rammings:0,collected:320,previewReward:320,
  secret:'não exportar',
  contractDiagnostics:{
    stage:2,routeLength:5610,routeNodes:7,initialWindow:130,
    captureSeconds:41,escapeSeconds:null,failureReason:null,
    phase:'complete',choice:'free'
  }
};
const p=P.ct001Telemetry(report);
assert.equal(p.format,'mar-de-sangue-ct001-playtest');
assert.equal(p.schema,2);
assert.equal(p.benchmark,false);
assert.equal(p.seed,null);
assert.equal(p.result.simulatedReward,320);
assert.equal(p.captureSeconds,41);
assert.equal(p.route,'free');
assert.equal(p.secret,undefined,'informação arbitrária não sai no JSON');
assert.equal(P.ct001Telemetry({...report,laboratory:false}),null);
console.log('Interface CT-001: revisita, alvo móvel e exportação segura OK.');
