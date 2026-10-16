/* Functional smoke-test for the fully rebuilt port.
 * Run: node tests/port-ui-rebuild.test.cjs
 * No external dependency; does not run WebGL or make claims about screenshots.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
let lastBackup=null;
const downloads=[];
const URLStub={createObjectURL(blob){lastBackup=blob;return 'blob:test-save';},revokeObjectURL(){}};
class BlobStub{constructor(parts,options){this.content=parts.join('');this.type=options.type;}}


const script=fs.readFileSync('PortUI.js','utf8');
const css=fs.readFileSync('PortUI.css','utf8');
const game=fs.readFileSync('Game.js','utf8');
const html=fs.readFileSync('index.html','utf8');

class Element {
  constructor(tag){this.tag=tag;this.innerHTML='';this.dataset={};this.style={};
    this.listeners={};this.children=[];this.scrollTop=0;}
  setAttribute(k,v){this[k]=v;}
  append(c){this.children.push(c);}
  remove(){this.removed=true;}
  click(){if(this.tag==='a')downloads.push({file:this.download,href:this.href});}
  addEventListener(k,h){this.listeners[k]=h;}
  removeEventListener(k){delete this.listeners[k];}
  querySelector(s){
    if(s==='.port-toast')return {hidden:true,textContent:''};
    if(s==='[data-music-status]')return {textContent:''};
    return null;
  }
  querySelectorAll(){return [];}
}
const app=new Element('div'),classes=new Set();
const doc={
  activeElement:null,createElement:(tag)=>new Element(tag),
  getElementById:id=>id==='app-shell'?app:null,
  body:{append(){},classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)}}
};
const win={listeners:{},addEventListener(k,h){this.listeners[k]=h},
 removeEventListener(k){delete this.listeners[k]}};
const Phaser={Scenes:{Events:{SHUTDOWN:'shutdown'}}};
const p={version:4,gold:700,mission:5,sorties:12,bestWave:9,wins:4,kills:35,
 rammings:8,levels:{casco:1,canhoes:1}};
const upgrades=[
  {id:'casco',group:'casco',icon:'■',name:'Casco',desc:'Resistência',base:30},
  {id:'canhoes',group:'armas',icon:'✹',name:'Canhões',desc:'Dano',base:50}
];
const starts=[];
const scene={page:'menu',yardGroup:'armas',
 scene:{start:(...args)=>starts.push(args)},events:{once:(name,fn)=>{scene.shutdown=fn}}};
const SeaProfile={
  load:()=>p,stats:()=>({maxHP:135,cannonDamage:30,maxSpeed:198}),
  selectMode:mode=>p.mode=mode,price:(u,n)=>u.base*(n+1),
  buy:id=>{
    const u=upgrades.find(u=>u.id===id),cost=u.base*(p.levels[id]+1);
    if(p.gold<cost)return {ok:false,error:'ouro insuficiente'};
    p.gold-=cost;p.levels[id]++;return {ok:true};
  },
  reset:()=>{p.gold=55;p.levels.casco=0;}
};
const SEA_MATH={nice:v=>String(Math.floor(v||0))};
const SEA_MUSIC={volume:.25,load:async()=>true,status:()=> 'FLAC',
 setVolume(v){this.volume=Math.max(0,Math.min(.6,v))},
 importFiles:async()=>2};
const SEA_AUDIO={enabled:true,effectsVolume:1,
 toggle(){this.enabled=!this.enabled},
 setEffectsVolume(n){this.effectsVolume=Math.max(0,Math.min(1,Math.round(n*100)/100));}};
const SEA_SAVE_TRANSFER={lastRollback:()=>null,maxSize:262144};
const SEA_GAMEPAD={poll:()=>({connected:false})};
const context={document:doc,window:win,Phaser,Blob:BlobStub,URL:URLStub,setTimeout:fn=>fn(),
 SeaProfile,SEA_MATH,SEA_MUSIC,SEA_AUDIO,SEA_GAMEPAD,SEA_SAVE_TRANSFER,SEA_UPGRADES:upgrades};
vm.createContext(context);
vm.runInContext(script+'\nthis.ui=SEA_PORT_UI;',context);
const ui=context.ui;
assert(ui.mount(scene));
assert(classes.has('port-ui-open'));
for(const action of ['mission','sandbox','yard:armas','help','reset']){
 assert(ui.root.innerHTML.includes('data-action="'+action+'"'));
}
assert(ui.root.innerHTML.includes('ship_flagship.png'));
assert(ui.root.innerHTML.includes('700'));
assert(ui.root.innerHTML.includes('export-backup'),'Backup should be visible from port');
ui.action('mission');assert.equal(starts.at(-1)[0],'Game');
assert.equal(starts.at(-1)[1].stage,5);
ui.action('sandbox');assert.equal(starts.at(-1)[1].mode,'sandbox');
scene.page='yard';ui.render();assert(ui.root.innerHTML.includes('buy:canhoes'));
ui.action('buy:canhoes');assert.equal(p.levels.canhoes,2);
scene.page='help';ui.render();assert(ui.root.innerHTML.includes('DIÁRIO DE BORDO'));
scene.page='reset';ui.render();assert(ui.root.innerHTML.includes('reset-confirm'));
assert(ui.root.innerHTML.includes('GUARDAR CÓPIA DO SAVE'));
const previous=JSON.stringify(p);
ui.action('export-backup');
assert.equal(downloads.length,1,'Export must invoke file download once');
assert(downloads[0].file.startsWith('mar-de-sangue-save-v4-'));
const backup=JSON.parse(lastBackup.content);
assert.equal(backup.format,'mar-de-sangue-captain-backup');
assert.equal(backup.schema,4);
assert.equal(backup.profile.gold,p.gold);
assert.deepEqual(backup.profile,p,'Export should contain the normalized profile');
assert.equal(JSON.stringify(p),previous,'Export cannot change player progress');
assert(ui.root.innerHTML.includes('reset-confirm'),'Export must not confirm the reset');

scene.page='result';scene.report={won:true,mode:'mission',collected:200,reward:150,
 bank:850,kills:8,rammings:3,stage:4,islands:2};
ui.render();assert(ui.root.innerHTML.includes('OURO RECUPERADO'));
ui.action('volume:up');assert.equal(SEA_MUSIC.volume,.3);
assert(ui.root.innerHTML.includes('fx-volume:down'),
 'SFX buttons must be reachable on every port screen');
ui.action('fx-volume:down');
assert.equal(SEA_AUDIO.effectsVolume,.9);
assert.equal(SEA_MUSIC.volume,.3,'FX gain must not change music gain');
assert(ui.root.innerHTML.includes('90%'),'SFX gain must show its percentage');
ui.action('fx-volume:up');
assert.equal(SEA_AUDIO.effectsVolume,1);
assert.equal(SEA_MUSIC.volume,.3);
ui.action('mute');assert.equal(SEA_AUDIO.enabled,false);
ui.action('yard:casco');assert.equal(starts.at(-1)[1].group,'casco');
ui.action('reset-confirm');assert.equal(p.gold,55);
scene.shutdown();assert(!classes.has('port-ui-open'));
assert.equal(ui.scene,null);
assert(css.includes('grid-template-columns:minmax(175px,245px) minmax(0,1fr) minmax(175px,245px)'));
assert(css.includes('@media(max-width:780px)'));
assert(html.includes('src="PortUI.js"')&&html.includes('href="PortUI.css"'));
assert(game.includes('SEA_PORT_UI.mount(this)'));
assert(!game.includes('SEA_UI.portDecor(this)'));
console.log('PASS: responsive port, all canonical menu actions, audio, persistence and shutdown');
