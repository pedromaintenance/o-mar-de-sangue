/* node tests/SeaCT001Benchmark.integration.test.cjs
 * A semente controla os spawns iniciais do comboio e das escoltas.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const ctx={Math,URLSearchParams,
  SEA_ECONOMY:{missionPayoutMultiplier:.25,missionCommission:stage=>24+stage*5},
  SEA_GUNNERY:{chargeMs:()=>2000},
  SEA_FOES:{
    patrulha:{name:'Patrulha'},corsario:{name:'Corsário'},
    fragata:{name:'Fragata'},bombardeiro:{name:'Bombardeiro'},galeao:{name:'Galeão'}
  }
};
vm.runInNewContext(
  read('SeaConvoyNavigation.js')+'\n'+read('SeaContractLab.js')+'\n'+
  read('SeaContractCT001.js')+
  '\nthis.T={NAV:SEA_CONVOY_NAV,LAB:SEA_CT001_LAB,CT:SEA_CT001};',ctx);
const {LAB,CT}=ctx.T;
function run(stage,seed){
  const config=LAB.config('?ct001Stage='+stage+'&ct001Seed='+seed,2);
  const s={W:8800,H:6800,ct001LabConfig:config,
    profile:{mission:2,levels:{cadencia:3}},
    shipStats:{cannonDamage:51,balls:2},elapsed:0,
    player:{x:4400,y:3400},
    islands:[{id:11,kind:'wreck',x:1200,y:1100,radius:70},
      {id:12,kind:'ruin',x:1700,y:1300,radius:62},
      {id:13,kind:'demeter',x:2100,y:1400,radius:65}],
    chartDiscovered:new Set(),enemies:[],announce(){},
    spawnEnemy(type,spacing,opts={}){
      assert.equal(typeof opts.random,'function');
      const x=4100+Math.floor(opts.random()*500);
      const y=3200+Math.floor(opts.random()*350);
      const radius=type==='galeao'?86:70;
      const e={id:this.enemies.length+1,type,x,y,radius,maxhp:300,
        speed:105,capturable:opts.capturable===true,dead:false,
        heading:opts.random()*Math.PI*2,
        label:{setText(){}},ship:{destroy(){}},wake:{destroy(){}},
        bar:{destroy(){}}};
      this.enemies.push(e);return e;
    }
  };
  assert.equal(CT.init(s),true);
  assert.equal(s.contract.activeMainMission,stage);
  assert.equal(s.contract.actualSaveMission,2);
  assert.equal(s.contract.labBenchmark,true);
  assert.equal(CT.launch(s),true);
  assert.ok(s.contract.routeWaypoints.length>=1);
  assert.equal(CT.metrics(s).seed,seed);
  return s.enemies.map(e=>({type:e.type,x:e.x,y:e.y,heading:e.heading}));
}
for(const stage of [2,10,25]){
  const a=run(stage,1234),b=run(stage,1234),c=run(stage,9876);
  assert.deepEqual(a,b,'mesma semente deve gerar spawns equivalentes');
  assert.notDeepEqual(a,c,'sementes distintas não devem ser idênticas');
  assert.equal(a.length,stage===25?5:3);
}
console.log('CT-001 benchmark: spawns reproduzíveis, faixas 2/10/25 e save real isolado OK.');
