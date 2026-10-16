/* Navigation regression test, no Chromium required.
 * node tests/port-controller-navigation.test.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync('PortUI.js','utf8');
const document={activeElement:null};
let state={connected:true,just:{},left:false,right:false,up:false,down:false,x:0,y:0};
const SEA_GAMEPAD={poll:()=>state};
const win={location:{},addEventListener(){},removeEventListener(){}};
const ctx={document,window:win,SEA_GAMEPAD};
vm.createContext(ctx);
vm.runInContext(src+';this.ui=SEA_PORT_UI;',ctx);
const ui=ctx.ui;
const starts=[];
const scene={page:'menu',yardGroup:'armas',scene:{start:(...args)=>starts.push(args)}};
let count=0;
const buttons=[];
function button(action,x,y,w=166,h=70,disabled=false){
  const classes=new Set();
  const b={
    dataset:{action},disabled,rect:{left:x,top:y,width:w,height:h},
    classList:{add:v=>classes.add(v),remove:v=>classes.delete(v),contains:v=>classes.has(v)},
    getBoundingClientRect(){return this.rect;},
    focus(){document.activeElement=this;},
    scrollIntoView(){},
    click(){count++;},
  };
  buttons.push(b);
  return b;
}
const mission=button('mission',100,100),sandbox=button('sandbox',300,100);
const yard=button('yard:armas',100,200),help=button('help',300,200);
const footer=button('mute',300,450);
const hidden=button('reset-confirm',500,200,0,0);
const disabled=button('buy:unavailable',100,300,166,70,true);
const root={
  contains:b=>buttons.includes(b),
  querySelectorAll(sel){
    if(sel==='.is-controller-focused')return buttons.filter(b=>b.classList.contains('is-controller-focused'));
    if(sel==='button[data-action]:not(:disabled)')return buttons.filter(b=>!b.disabled);
    return [];
  }
};
ui.root=root;ui.scene=scene;
function focused(label){assert.equal(document.activeElement?.dataset.action,label);}
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
assert(mission.classList.contains('is-controller-focused'));

// D-pad directions must not collapse right into "next in document".
state={...state,right:true,just:{}};
ui.update(100);focused('sandbox');
state={...state,right:false,down:true};
ui.update(110);focused('help');
// Repeat delay blocks accidental double-moves on a held direction.
ui.update(200);focused('help');
state={...state,down:false,just:{0:true}};
ui.update(210);assert.equal(count,1);

// If focus is lost to the canvas, A recovers a valid default rather than
// clicking the old hidden/disabled DOM element.
document.activeElement=null;
ui.update(220);focused('mission');assert.equal(count,2);

// LB/RB: the tabs use a stable canonical order with cyclic navigation.
// RB: armas -> apoio; LB: armas -> motor; LB: casco -> apoio.
scene.page='yard';scene.yardGroup='armas';
state={connected:true,just:{5:true},up:false,down:false,left:false,right:false,x:0,y:0};
ui.update(300);assert.equal(starts.at(-1)[1].group,'apoio');
state.just={4:true};ui.update(330);assert.equal(starts.at(-1)[1].group,'motor');
scene.yardGroup='casco';ui.update(350);assert.equal(starts.at(-1)[1].group,'apoio');
scene.yardGroup='apoio';state.just={5:true};ui.update(400);
assert.equal(starts.at(-1)[1].group,'casco');
const before=starts.length;
state.just={6:true};ui.update(420);assert.equal(starts.length,before,
  'LT must not change tabs');
// B backs out, it must not be swallowed by bumper logic.
state.just={1:true};ui.update(430);assert.equal(starts.at(-1)[1].page,'menu');
console.log('PASS spatial arrows, focus, D-pad, repeat, A, LB/RB cyclic tabs, LT isolation, B');
