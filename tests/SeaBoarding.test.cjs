/* Executar com: node tests/SeaBoarding.test.cjs
 * Testes puros de uma mecânica opt-in. Não requer Phaser nem browser.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../SeaBoarding.js'),'utf8');
const sandbox={Math};
vm.runInNewContext(source+'\nthis.SEABOARDING_TEST=SEA_BOARDING;',sandbox);
const B=sandbox.SEABOARDING_TEST;
let announcements=[];
let destroys=0;
let gold=0, kills=0;
const enemy=(opts={})=>({
  id:5, type:'fragata', x:223, y:100, radius:65, vx:0, vy:0,
  hp:200,maxhp:200, dead:false, captured:false,capturable:true,boardingDisabled:false,
  label:{setText(){},setColor(){}},
  ship:{destroy(){destroys++;}},wake:{destroy(){destroys++;}},
  bar:{destroy(){destroys++;}},label:{setText(){},setColor(){},destroy(){destroys++;}},
  ...opts
});
const scene=(e)=>({
  player:{x:100,y:100},hullRadius:55,playerVelocity:{x:0,y:0},
  enemies:[e],islands:[],ended:false,sinking:false,islandDocked:false,
  announce(text){announcements.push(text);},
  anchorButton:{setVisible(){}},anchorText:{setVisible(){}},
  anchorHint:{setVisible(){}},anchorPulse:{clear(){}}
});
const healthy=enemy(), s=scene(healthy);
assert.equal(B.onDamage(s,healthy),false,'navio saudável não é imobilizado');
healthy.hp=48;
assert.equal(B.onDamage(s,healthy),true,'exatamente 24% do casco incapacita');
assert.equal(healthy.boardingDisabled,true);
assert.ok(healthy.hp>0,'captura não afunda');
assert.equal(B.nearest(s)?.allowed,true,'parado e perto pode abordar');
assert.equal(B.board(s,healthy),true,'abordagem efetivada');
assert.equal(healthy.captured,true);
assert.equal(healthy.dead,true);
assert.equal(s.capturedVessels,1);
assert.equal(destroys,4,'sprites de navio capturado removidos');
assert.equal(B.board(s,healthy),false,'não pode abordar duas vezes');
assert.equal(gold,0,'não concede ouro');
assert.equal(kills,0,'não conta kill');
const fast=enemy({hp:20}),sf=scene(fast);
B.onDamage(sf,fast);
sf.playerVelocity.x=100;
assert.equal(B.nearest(sf)?.allowed,false,'não abordar em alta velocidade');
assert.equal(B.board(sf,fast),false);
sf.playerVelocity.x=0;fast.vx=90;
assert.equal(B.nearest(sf)?.allowed,false,'velocidade relativa perigosa bloqueia');
const ordinary=enemy({capturable:false,hp:0}),so=scene(ordinary);
assert.equal(B.onDamage(so,ordinary),false);
assert.equal(ordinary.hp,0,'navio comum continua destruível');
assert.equal(B.nearest(so),null);
const disabled=enemy({hp:-9,boardingDisabled:true}),sd=scene(disabled);
assert.equal(B.onDamage(sd,disabled),false);
assert.equal(disabled.hp,1,'atingir alvo incapacitado não afunda o casco');
assert.equal(B.updateDisabled(sd,disabled,.05),true,'navio capturado não mantém IA hostil');
console.log('SeaBoarding — 13 verificações concluídas sem falhas');
