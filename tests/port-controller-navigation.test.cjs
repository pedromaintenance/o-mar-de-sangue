/* Regression: shipyard tabs are pointer-only; LB/RB and Q/E are tab controls.
 * node tests/port-controller-navigation.test.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('PortUI.js','utf8');
const document={activeElement:null};
let pad={connected:true,just:{},left:false,right:false,up:false,down:false,x:0,y:0};
const starts=[],rendered=[];
const win={addEventListener(){},removeEventListener(){}};
const scene={page:'menu',yardGroup:'armas',scene:{start:(...args)=>starts.push(args)}};
const upgrades=[
 {id:'canhoes',group:'armas',base:40},{id:'bateria',group:'armas',base:50},
 {id:'oficina',group:'apoio',base:40},{id:'cofre',group:'apoio',base:50},
 {id:'casco',group:'casco',base:40},{id:'velas',group:'motor',base:40}
];
let gold=150;
const SeaProfile={load:()=>({gold,levels:{}}),price:u=>u.base};
const ctx={document,window:win,SEA_GAMEPAD:{poll:()=>pad},SEA_UPGRADES:upgrades,SeaProfile};
vm.createContext(ctx);
vm.runInContext(src+';this.ui=SEA_PORT_UI;',ctx);
const ui=ctx.ui;
const buttons=[];
function button(action,x,y,w=160,h=64,zone='main',options={}){
 const flags=new Set(),box={left:x,top:y,width:w,height:h,right:x+w,bottom:y+h};
 const b={
  dataset:{action,...(options.pointer?{nav:'pointer'}:{})},disabled:!!options.disabled,
  getBoundingClientRect(){return box;},getClientRects(){return w&&h?[box]:[];},
  closest(sel){return (sel==='#port-main'&&zone==='main'||
    sel==='.port-top'&&zone==='header'||sel==='.port-footer'&&zone==='footer')?{}:null;},
  classList:{add:c=>flags.add(c),remove:c=>flags.delete(c),contains:c=>flags.has(c)},
  focus(){document.activeElement=b;},blur(){document.activeElement=null;},
  scrollIntoView(){},click(){b.clicked=(b.clicked||0)+1;}
 };
 buttons.push(b);return b;
}
let active=buttons;
const root={contains:b=>active.includes(b),querySelectorAll(sel){
 if(sel==='.is-controller-focused')return active.filter(b=>b.classList.contains('is-controller-focused'));
 if(sel==='button[data-action]:not(:disabled)')return active.filter(b=>!b.disabled);
 return [];
}};
ui.root=root;ui.scene=scene;
const focused=id=>assert.equal(document.activeElement?.dataset?.action,id);
const mission=button('mission',90,100),sandbox=button('sandbox',290,100);
const yard=button('yard:armas',90,200),help=button('help',290,200);
button('mute',290,460,140,35,'footer');
active=buttons.slice();
ui.focusByAction('mission');focused('mission');
ui.moveFocus('right');focused('sandbox');
ui.moveFocus('down');focused('help');
ui.moveFocus('left');focused('yard:armas');
ui.moveFocus('up');focused('mission');
// Prepare a realistic shipyard layout: category tabs are above the buy cards.
// Return button is far below. Old behavior jumped directly to Return.
buttons.length=0;scene.page='yard';scene.yardGroup='armas';
const activeTab=button('yard:armas',90,185,170,44,'main',{pointer:true});
const otherTab=button('yard:apoio',300,185,170,44,'main',{pointer:true});
const buy0=button('buy:canhoes',330,320,120,45);
const buy1=button('buy:bateria',630,485,120,45);
const footerReturn=button('menu',180,720,320,55);
const headerReturn=button('menu',1080,25,150,40,'header');
const disabled=button('buy:disabled',330,610,120,45,'main',{disabled:true});
active=buttons.slice();
ui.focusByAction(null);focused('buy:canhoes');
assert(!ui.navigableButtons().includes(activeTab));
assert(!ui.navigableButtons().includes(otherTab));
assert(!ui.navigableButtons().includes(disabled));
assert(!activeTab.classList.contains('is-controller-focused'));
// Even with a wide gap between affordable upgrade columns, down must
// visit the next purchase instead of skipping to the bottom Return button.
ui.moveFocus('down');focused('buy:bateria');
ui.moveFocus('down');focused('menu');
assert.equal(document.activeElement,footerReturn);
ui.moveFocus('up');focused('buy:bateria');
ui.moveFocus('up');focused('buy:canhoes');
// A / Enter confirms only real purchase controls, never a tab.
pad.just={0:true};ui.update(100);assert.equal(buy0.clicked,1);
assert.equal(activeTab.clicked,undefined);
// Preserve second card index across RB; no scenes recreated.
ui.focusTarget(buy1);
ui.render=pref=>{
 rendered.push({pref,group:scene.yardGroup});
 // Mirror the real render(): a changed tab creates new buttons and moves
 // the DOM focus to the equivalent upgrade in the new category.
 if(pref)document.activeElement={dataset:{action:pref}};
};
pad.just={5:true};ui.update(200);
assert.equal(scene.yardGroup,'apoio');
assert.equal(rendered.at(-1).pref,'buy:cofre');
assert.equal(starts.length,0);
pad.just={4:true};ui.update(230);
assert.equal(scene.yardGroup,'armas');
assert.equal(rendered.at(-1).pref,'buy:bateria');
// Q/E targets and controller switch share the same mechanism.
const qBefore=scene.yardGroup;
ui.switchYardTab(-1);assert.equal(scene.yardGroup,'motor');
ui.switchYardTab(1);assert.equal(scene.yardGroup,qBefore);
// Pointer focus never becomes a controller selection; remembered purchase survives.
scene.yardGroup='armas';ui.focusTarget(buy0);
document.activeElement=activeTab;
ui.paintFocus(null);
assert(!activeTab.classList.contains('is-controller-focused'));
ui.changeYardTab('apoio');
assert.equal(rendered.at(-1).pref,'buy:oficina');
// Unaffordable target card cannot steal focus; fallback chooses an eligible button.
gold=0;scene.yardGroup='armas';
ui.focusTarget(buy0);ui.changeYardTab('apoio');
assert.equal(rendered.at(-1).pref,null);
assert.equal(starts.length,0);
pad.just={6:true};const before=rendered.length;ui.update(250);
assert.equal(rendered.length,before,'LT must not act as RB');
pad.just={1:true};ui.update(300);
assert.equal(starts.at(-1)[1].page,'menu','B must return from yard to menu');
// Critical restore dialog: gamepad B cancels without invoking apply().
scene.page='restore';
ui.pendingRestore={profile:{gold:999}};
ui.restoreArmed=true;
pad.just={1:true};
const previousStarts=starts.length;
ui.update(410);
assert.equal(starts.length,previousStarts+1);
assert.equal(starts.at(-1)[1].page,'menu');
assert.equal(ui.pendingRestore,null);
assert.equal(ui.restoreArmed,false);
console.log('PASS: no ghost tab focus, buy-first, ↓ buys not return, LB/RB, Q/E mechanism, B');
