/* Maré Negra combat overlays: stable Phaser draw/action contracts.
 * Run: node tests/mare-negra-overlays.test.cjs
 * No browser required. This is intentionally a logic regression suite:
 * decorative changes must never move controls or alter callbacks.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
function makeScene(){
  const all=[];
  const addShape=(kind,args)=>{const o={
    kind,args,stroke:null,text:kind==='text'?args[2]:null,children:[],
    setStrokeStyle(...x){this.stroke=x;return this;},
    setInteractive(){this.interactive=true;return this;},
    setScrollFactor(){return this;},setDepth(){return this;},
    setVisible(){return this;},setAlpha(){return this;},
    setScale(){return this;},setOrigin(){return this;},
    setText(value){this.text=value;return this;},
    add(v){this.children.push(v);return this;},
    destroy(){this.destroyed=true;return this;},
    lineStyle(){return this;},lineBetween(){return this;},
    fillStyle(){return this;},fillCircle(){return this;}
  };all.push(o);return o;};
  const obj={add:{
    rectangle(...args){return addShape('rectangle',args);},
    graphics(...args){return addShape('graphics',args);},
    text(...args){return addShape('text',args);},
    image(...args){return addShape('image',args);},
    container(...args){return addShape('container',args);}
  },
  textures:{
    get:()=>({getSourceImage:()=>({height:180})}),
    exists:()=>false
  },
  mode:'mission',stage:3,wave:7,shipHP:90,maxShipHP:135,gold:87,kills:4,
  seaEvent:'calm',curse:23,pausedByCaptain:true,pausePadOptions:[],
  objectiveText:()=> 'Derrotar o arauto abissal',
  setPausePadFocus(index){this.initialFocus=index;},
  toggleCaptainMenu(){this.continued=(this.continued||0)+1;},
  finish(...args){this.lastFinish=args;},
  islandSelected:{kind:'reef',id:'reef-test'},islandChoiceIndex:0,
  islandError:'',islandOutcome:'',islandVisits:new Set(),
  isIslandDocked:true,gold:100,
  };
  return {scene:obj,all};
}
function load(desktop){
 const ctx={SEA_VIEW:{width:desktop?1280:480,height:720},SEA_DESKTOP:desktop,
   SEA_MATH:{nice:v=>String(Math.floor(v))},
   SEA_WEATHER:{names:{calm:'MAR SERENO'}},
   SEA_AUDIO:{enabled:true,toggle(){this.enabled=!this.enabled;return this.enabled;}},
   };
 vm.createContext(ctx);
 vm.runInContext(fs.readFileSync('SeaMenus.js','utf8')+
   '\n'+fs.readFileSync('SeaIslands.js','utf8')+
   '\nthis.pause=SEA_UI.pause;this.islands=SEA_ISLANDS;',ctx);
 return ctx;
}
for(const desktop of [true,false]){
 const ctx=load(desktop);
 const {scene,all}=makeScene();
 scene.pausePadOptions=[];
 const root=ctx.pause(scene);
 assert.equal(root,scene.pauseElements,'pause must attach the container');
 assert.equal(scene.initialFocus,0,'first option remains focused');
 assert.equal(scene.pausePadOptions.length,3,'continue, audio, return');
 assert.equal(scene.pausePadOptions[0].hit.x,ctx.SEA_VIEW.width/2);
 assert.deepEqual(scene.pausePadOptions.map(o=>o.hit.h),[55,55,55]);
 assert.deepEqual(scene.pausePadOptions.map(o=>o.hit.w),
   Array(3).fill(desktop?520:392));
 assert(scene.pausePadOptions[0].hit.y<scene.pausePadOptions[1].hit.y);
 assert(scene.pausePadOptions[1].hit.y<scene.pausePadOptions[2].hit.y);
 assert(all.some(o=>o.kind==='rectangle'&&o.interactive&&
   o.args[2]===ctx.SEA_VIEW.width&&o.args[3]===ctx.SEA_VIEW.height),
   'pause overlay must intercept taps from the game');
 const labels=all.filter(o=>o.kind==='text').map(o=>o.text);
 assert(labels.some(s=>String(s).includes('DIÁRIO DO CAPITÃO')));
 assert(labels.some(s=>String(s).includes('MALDIÇÃO 23%')));
 assert(labels.some(s=>String(s).includes('Derrotar o arauto')));
 assert(labels.some(s=>String(s).includes('REGISTRO POLÍTICO · NENHUM ACORDO')),
    'the captain should see a neutral political ledger before any parley');
 assert(!labels.some(s=>String(s).includes('PÓLVORA RITUAL')||
    String(s).includes('NOMES ENTREGUES')||
    String(s).includes('NÁUFRAGOS PROTEGIDOS')),
    'unvisited political encounters must not be spoiled');
 for(const [choiceId,expected] of [
    ['refuge','SOBREVIVENTES'],
    ['tribute','CORTE FEÉRICA'],
    ['bloodpowder','CULTO DE DAEGON']
 ]){
    scene.politicalChoice=choiceId;
    scene.pausePadOptions=[];
    const from=all.length;
    ctx.pause(scene);
    const political=all.slice(from).filter(o=>o.kind==='text').map(o=>o.text);
    assert(political.some(t=>String(t).includes(expected)),
      'diary must reflect recorded '+expected+' decision');
    assert(political.some(t=>String(t).startsWith('Termos:')),
      'diary must distinguish resource terms from political reputation');
    assert.equal(scene.pausePadOptions.length,3,
      'political notes must not add pause button/hitbox');
 }
 scene.politicalChoice=null;
 scene.pausePadOptions=[];
 ctx.pause(scene);
 const [resume,audio,withdraw]=scene.pausePadOptions;
 resume.onTap();assert.equal(scene.continued,1);
 audio.onTap();assert.equal(ctx.SEA_AUDIO.enabled,false);
 assert(audio.text.text.includes('ATIVAR ÁUDIO'));
 withdraw.onTap();
 assert.deepEqual(Array.from(scene.lastFinish),[false,true],
   'withdrawal commission contract preserved');
 // Island encounter has 3 choices plus cancel, same choice data/callbacks.
 const renderedBefore=all.length;
 ctx.islands.render(scene);
 assert(scene.islandOverlay,'island overlay must be attached');
 assert.equal(scene.islandOptions.length,4,'three island choices plus return');
 assert(all.slice(renderedBefore).some(o=>o.kind==='rectangle'&&
   o.args[2]===ctx.SEA_VIEW.width&&o.args[3]===ctx.SEA_VIEW.height),
   'island modal must cover gameplay');
 assert(all.slice(renderedBefore).filter(o=>o.kind==='text')
   .some(o=>String(o.text).includes('RECIFES TABAXI')));
 assert.deepEqual(Array.from(scene.islandOptions.slice(0,3),o=>o.hit.h),
   [63,63,63]);
 assert.equal(scene.islandOptions[3].hit.h,49);
 // Keep the original effect data; the callback must still dispatch choice #2.
 let applied=null,closed=0;
 ctx.islands.apply=(_s,choice)=>{applied=choice;};
 ctx.islands.close=()=>{closed++;};
 scene.islandOptions[1].onTap();
 assert.equal(applied.id,'channel');
 scene.islandOptions[3].onTap();assert.equal(closed,1);
 // Post-choice outcome should only show the return control.
 scene.islandOutcome='Escolha registrada';
 ctx.islands.render(scene);
 assert.equal(scene.islandOptions.length,1);
 scene.islandOptions[0].onTap();assert.equal(closed,2);
 console.log('PASS Maré Negra overlay logic',desktop?'desktop':'compact');
}
