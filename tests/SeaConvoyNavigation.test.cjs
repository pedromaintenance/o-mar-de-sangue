/* Planejador CT-001: geometrias, rotas e janelas de interceptação.
 * node tests/SeaConvoyNavigation.test.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'../SeaConvoyNavigation.js'),'utf8');
const sandbox={Math,SEA_GUNNERY:{chargeMs:level=>2000/(1+level*.1)}};
vm.runInNewContext(src+'\nthis.NAV=SEA_CONVOY_NAV;',sandbox);
const NAV=sandbox.NAV;
const open={W:8800,H:6800,islands:[]};
const start={x:1800,y:3400};
const straight=NAV.plan(open,start,true,70);
assert.ok(straight);
assert.equal(straight.waypoints.length,1);
assert.ok(Math.abs(straight.length-(straight.end.x-start.x))<1);
const rock={x:4400,y:3400,radius:520};
const blocked={...open,islands:[rock]};
const route=NAV.plan(blocked,start,true,70);
assert.ok(route&&route.waypoints.length>=2,'uma ilha na rota força desvio');
assert.ok(route.length>straight.length,'desvio custa distância');
let p=start;
for(const wp of route.waypoints){
  assert.equal(NAV.lineClear(p,wp,blocked.islands,70),true,'segmento fora da rocha');
  p=wp;
}
const closed={
  ...open,islands:Array.from({length:80},(_,i)=>({
    x:4400,y:85+i*85,radius:155
  }))
};
assert.equal(NAV.plan(closed,start,true,70),null,'bloqueio total não gera rota inválida');
let seed=0xC0FFEE;
const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296};
let successes=0;
for(let trial=0;trial<25;trial++){
  const islands=[];
  for(let row=0;row<10;row++)for(let col=0;col<14;col++){
    const x=295+col*628+(rand()-.5)*290;
    const y=285+row*670+(rand()-.5)*300;
    if(Math.hypot(x-4400,y-3400)<570)continue;
    islands.push({x,y,radius:52+56*rand()});
  }
  for(let i=0;i<140;i++){
    const x=150+rand()*8500,y=150+rand()*6500,radius=22+30*rand();
    if(islands.some(r=>Math.hypot(r.x-x,r.y-y)<r.radius+radius+90))continue;
    islands.push({x,y,radius});
  }
  const origin={x:4400+(rand()-.5)*1800,y:3400+(rand()-.5)*1800};
  if(!NAV.pointClear(origin,islands,70))continue;
  const result=NAV.plan({...open,islands},origin,rand()>.5,70);
  assert.ok(result,'mapa aberto deve oferecer rota navegável');
  let current=origin;
  for(const next of result.waypoints){
    assert.ok(NAV.lineClear(current,next,islands,70),'segmento da rota é seguro');
    current=next;
  }
  successes++;
}
assert.ok(successes>=12,'amostra precisa conter pontos de partida válidos');
const stages=[
  {rank:2,hp:167,damage:23,balls:1,cadencia:0},
  {rank:10,hp:648,damage:44,balls:2,cadencia:3},
  {rank:25,hp:1386,damage:86,balls:3,cadencia:8}
];
for(const row of stages){
  const scene={shipStats:{cannonDamage:row.damage,balls:row.balls},
    profile:{levels:{cadencia:row.cadencia}}};
  const window=NAV.captureWindow(scene,{maxhp:row.hp,speed:110},{length:6000},row.rank);
  assert.ok(window>=95&&window<=320,'janela razoável por escala');
  assert.ok(Number.isSafeInteger(window));
}
console.log('Navegação CT-001: rota segura, bloqueio detectado, '+successes+
  ' cenários e janelas 2/10/25 OK.');
