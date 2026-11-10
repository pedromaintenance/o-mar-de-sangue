/* Ensaio de movimento real do comboio sem Phaser ou browser.
 * node tests/SeaConvoyChase.test.cjs
 * Replica a ordem da física: rumo, inércia, limites e colisões com rochas.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const context={Math,SEA_ECONOMY:{missionPayoutMultiplier:.25,missionCommission:()=>60}};
vm.runInNewContext(read('SeaConvoyNavigation.js')+'\n'+
  read('SeaContractCT001.js')+
  '\nthis.test={NAV:SEA_CONVOY_NAV,CT:SEA_CT001};',context);
const {NAV,CT}=context.test;
let seed=58491;
const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return(seed>>>0)/4294967296;};
let trials=0;
for(let run=0;run<25;run++){
  const islands=[];
  for(let row=0;row<10;row++)for(let col=0;col<14;col++){
    const x=295+col*628+(random()-.5)*290;
    const y=285+row*670+(random()-.5)*300;
    if(Math.hypot(x-4400,y-3400)<570)continue;
    islands.push({x,y,radius:52+random()*56});
  }
  for(let k=0;k<140;k++){
    const x=150+random()*8500,y=150+random()*6500,radius=22+random()*30;
    if(islands.some(i=>Math.hypot(i.x-x,i.y-y)<i.radius+radius+90))continue;
    islands.push({x,y,radius});
  }
  let x=4400,y=3400;
  for(let tries=0;tries<100;tries++){
    x=800+random()*7200;y=800+random()*5300;
    if(NAV.pointClear({x,y},islands,70))break;
  }
  assert.ok(NAV.pointClear({x,y},islands,70));
  const stage=run%3===0?2:run%3===1?10:25;
  const s={
    W:8800,H:6800,islands,elapsed:0,
    shipStats:{cannonDamage:stage===25?72:stage===10?44:23,
      balls:stage===25?3:stage===10?2:1},
    profile:{levels:{cadencia:stage===25?8:stage===10?3:0}}
  };
  const e={id:1,x,y,radius:70,speed:110,heading:random()*2*Math.PI,
    vx:0,vy:0,maxhp:stage===2?167:stage===10?648:1386,
    ct001Transport:true};
  const route=NAV.plan(s,e,x<4400,70);
  assert.ok(route,'rota ausente, caso '+run);
  const window=NAV.captureWindow(s,e,route,stage);
  s.contract={id:'ct001',phase:'chase',targetEnemyId:1,
    routeIndex:0,routeWaypoints:route.waypoints,
    exitX:route.end.x,exitY:route.end.y};
  s.collideWorldBounds=ship=>{
    ship.x=Math.max(70,Math.min(s.W-70,ship.x));
    ship.y=Math.max(70,Math.min(s.H-70,ship.y));
  };
  s.collideRock=(ship,i)=>{
    const dx=ship.x-i.x,dy=ship.y-i.y,dist=Math.hypot(dx,dy);
    const minDist=i.radius+ship.radius;
    if(dist>=minDist)return false;
    const nx=dist?dx/dist:1,ny=dist?dy/dist:0;
    ship.x=i.x+nx*(minDist+1.2);ship.y=i.y+ny*(minDist+1.2);
    const normal=ship.vx*nx+ship.vy*ny;
    if(normal<0){
      ship.vx=(ship.vx-1.3*normal*nx)*.86;
      ship.vy=(ship.vy-1.3*normal*ny)*.86;
    }
    return true;
  };
  let reached=false;
  for(let time=0;time<window+25;time+=.05){
    CT.evade(s,e,.05);
    s.elapsed=time+.05;
    if(Math.hypot(e.x-s.contract.exitX,e.y-s.contract.exitY)<120){
      reached=true;break;
    }
  }
  assert.ok(reached,'comboio encalhou no cenário '+run);
  assert.ok(s.elapsed<=window,'comboio não fugiu no prazo calculado '+run);
  trials++;
}
assert.equal(trials,25);
{
  const e={id:3,dead:false,boardingDisabled:true};
  const s={contract:{id:'ct001',phase:'chase',completed:false,failed:false,
    activeMainMission:10,targetEnemyId:3,escapeAt:120,boardUntil:0},
    enemies:[e],elapsed:10,ended:false,sinking:false,announce(){},
    finish(won,withdrawn){this.finished={won,withdrawn};}};
  CT.update(s);
  assert.equal(s.contract.phase,'board');
  assert.ok(s.contract.boardUntil>10);
  s.elapsed=s.contract.boardUntil+1;
  CT.update(s);
  assert.equal(s.contract.failed,true,'janela de abordagem vencida');
  assert.equal(s.finished.won,false);
  assert.equal(s.contract.bounty,0);
}
console.log('Comboio CT-001: 25 navegações completas e prazo de abordagem OK.');
