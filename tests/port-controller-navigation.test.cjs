/* Contextual controller navigation regression tests (Node, no browser).
 * node tests/port-controller-navigation.test.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const script=fs.readFileSync('PortUI.js','utf8');
const document={activeElement:null};
let state={connected:true,just:{},left:false,right:false,up:false,down:false,x:0,y:0};
const SEA_GAMEPAD={poll:()=>state};
const starts=[],renders=[];
const win={location:{},addEventListener(){},removeEventListener(){}};
const scene={page:'menu',yardGroup:'armas',scene:{start:(...args)=>starts.push(args)}};
const upgrades=[
 {id:'canhoes',group:'armas',base:50},
 {id:'bateria',group:'armas',base:50},
 {id:'oficina',group:'apoio',base:50},
 {id:'cofre',group:'apoio',base:50},
 {id:'casco',group:'casco',base:50},
 {id:'velas',group:'motor',base:50}
];
const SeaProfile={load:()=>({gold:200,levels:{}}),price:u=>u.base};
const ctx={document,window:win,SEA_GAMEPAD,SEA_UPGRADES:upgrades,SeaProfile};
vm.createContext(ctx);vm.runInContext(script+';this.ui=SEA_PORT_UI;',ctx);
const ui=ctx.ui;
ui.render=(pref)=>{renders.push({pref,group:scene.yardGroup});};
const buttons=[];
let pressed=0;
function button(action,x,y,w=165,h=68,zone='main',disabled=false){
  const classes=new Set(),rect={left:x,top:y,width:w,height:h,right:x+w,bottom:y+h};
  const b={
    dataset:{action},disabled,rect,
    classList:{add:v=>classes.add(v),remove:v=>classes.delete(v),contains:v=>classes.has(v)},
    closest(selector){
      if(selector==='#port-main')return zone==='main'?{}:null;
      if(selector==='.port-footer')return zone==='footer'?{}:null;
      if(selector==='.port-top')return zone==='header'?{}:null;
      return null;
    },
    getBoundingClientRect(){return this.rect;},
    getClientRects(){return w&&h?[this.rect]:[];},
    focus(){document.activeElement=this;},
    scrollIntoView(){},
    click(){pressed++;}
  };
  buttons.push(b);return b;
}
// Main menu is two columns. Footer sits below and to the right.
const mission=button('mission',100,100),sandbox=button('sandbox',300,100);
const yard=button('yard:armas',100,200),help=button('help',300,200);
const footer=button('mute',300,450,140,35,'footer');
const hidden=button('reset-confirm',500,200,0,0);
const disabled=button('buy:disabled',100,300,165,68,'main',true);
const buy=button('buy:canhoes',100,310);
const root={
 contains:b=>buttons.includes(b),
 querySelectorAll(sel){
   if(sel==='.is-controller-focused')return buttons.filter(b=>b.classList.contains('is-controller-focused'));
   if(sel==='button[data-action]:not(:disabled)')return buttons.filter(b=>!b.disabled);
   return [];
 }
};
ui.root=root;ui.scene=scene;
const focused=label=>assert.equal(document.activeElement?.dataset.action,label);
ui.focusByAction('mission');focused('mission');
assert(mission.classList.contains('is-controller-focused'));
assert(ui.moveFocus('right'));focused('sandbox');
assert(ui.moveFocus('down'));focused('help');
assert(ui.moveFocus('left'));focused('yard:armas');
assert(ui.moveFocus('up'));focused('mission');
assert(!ui.moveFocus('left'));focused('mission');
assert(!ui.navigableButtons().includes(hidden));
assert(!ui.navigableButtons().includes(disabled));
assert(!sandbox.classList.contains('is-controller-focused'));
// A rightward move at the edge of the main grid never jumps into audio.
ui.focusTarget(help);assert(!ui.moveFocus('right'));focused('help');
// But ↓ may intentionally move to the footer after the last main action.
ui.focusTarget(help);assert(ui.moveFocus('down'));focused('mute');
// As soon as the player moves up, focus returns into the main menu.
assert(ui.moveFocus('up'));focused('help');

ui.focusTarget(mission);
state={...state,right:true,just:{}};ui.update(100);focused('sandbox');
state={...state,right:false,down:true};ui.update(110);focused('help');
ui.update(200);focused('help'); // no repeat before threshold
state={...state,down:false,just:{0:true}};ui.update(210);
assert.equal(pressed,1);
document.activeElement=null;ui.update(220);focused('mission');
assert.equal(pressed,2);

// LB/RB is in-place and cyclic; no scene.start and no gamepad teardown.
scene.page='yard';scene.yardGroup='armas';
ui.focusTarget(yard);
state={connected:true,just:{5:true},up:false,down:false,left:false,right:false,x:0,y:0};
ui.update(300);assert.equal(scene.yardGroup,'apoio');
assert.equal(renders.at(-1).pref,'yard:apoio');assert.equal(starts.length,0);
state.just={4:true};ui.update(330);assert.equal(scene.yardGroup,'armas');
scene.yardGroup='casco';ui.update(350);assert.equal(scene.yardGroup,'apoio');
state.just={5:true};ui.update(400);assert.equal(scene.yardGroup,'casco');
// Keep card index when the next tab is affordable.
scene.yardGroup='armas';ui.focusTarget(buy);
state.just={5:true};ui.update(415);assert.equal(scene.yardGroup,'apoio');
assert.equal(renders.at(-1).pref,'buy:oficina');
state.just={6:true};const before=renders.length;ui.update(420);
assert.equal(renders.length,before,'LT is not RB');
// B still backs out.
state.just={1:true};ui.update(430);
assert.equal(starts.at(-1)[1].page,'menu');
console.log('PASS 2D geometry, zone isolation, repeat, Xbox A, LB/RB in-place, focus memory, LT and B');
