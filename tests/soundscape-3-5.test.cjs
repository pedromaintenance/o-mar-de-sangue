/* Mar de Sangue 3.5a: audio context, fade targets, and non-conflicting hotkeys.
 * Run: node tests/soundscape-3-5.test.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const weatherSrc=fs.readFileSync('SeaWeather.js','utf8');
const audioSrc=fs.readFileSync('SeaEffects.js','utf8');
const gameSrc=fs.readFileSync('Game.js','utf8');
const portSrc=fs.readFileSync('PortUI.js','utf8');
const values=new Map();
const storage={
    getItem:k=>values.has(k)?values.get(k):null,
    setItem:(k,v)=>values.set(k,String(v))
};
const context={localStorage:storage,SEA_AUDIO:{enabled:true},console};
vm.createContext(context);
vm.runInContext(weatherSrc+';this.music=SEA_MUSIC;',context);
const music=context.music;
assert.equal(music.resolveMood({seaEvent:'calm',curse:0}),'sailing');
assert.equal(music.resolveMood({seaEvent:'storm',curse:0}),'danger');
assert.equal(music.resolveMood({seaEvent:'maelstrom',curse:0}),'danger');
assert.equal(music.resolveMood({seaEvent:'calm',curse:65}),'danger');
assert.equal(music.resolveMood({seaEvent:'calm',curse:90,bossAlert:'KRAKEN'}),'boss');
assert.equal(music.resolveMood({islandDocked:true,islandSelected:{kind:'parley'},seaEvent:'storm',curse:95}),'parley');
assert.equal(music.resolveMood({islandDocked:true,islandSelected:{kind:'demeter'},seaEvent:'storm'}),'island');
for(const [mood,track,level] of [
    ['port','crimson',.55],['sailing','crimson',1],
    ['island','crimson',.62],['parley','black',.72],
    ['danger','black',.9],['boss','black',1],
    ['crimson','crimson',1],['black','black',1]
]){
    music.setMood(mood);
    assert.equal(music.currentMood,mood);
    assert.equal(music.wanted,track);
    assert.equal(music.intensity,level);
}
music.setVolume(.5);
assert.equal(values.get('carcaca.mar.music.volume'),'0.5','Music volume key remains compatible');
const player=()=>({volume:0,paused:false,pause(){this.paused=true;}});
music.players={crimson:player(),black:player()};
music.gestureSeen=true;music.started=true;
for(let i=0;i<65;i++)music.tick(.05,'parley');
assert(Math.abs(music.players.black.volume-.36)<.003,'Parley volume should fade to reduced black track');
assert.equal(music.players.crimson.volume,0,'Other track faded out');
for(let i=0;i<80;i++)music.tick(.05,'sailing');
assert(Math.abs(music.players.crimson.volume-.5)<.003,'Calm navigation reaches user volume');
assert.equal(music.players.black.volume,0,'Black track faded out');
// Silence should pause decoding and preserve the existing stored user volume.
context.SEA_AUDIO.enabled=false;
for(let i=0;i<80;i++)music.tick(.05,'boss');
assert.equal(music.players.crimson.volume,0);
assert.equal(music.players.black.volume,0);
assert(music.players.crimson.paused&&music.players.black.paused,
    'Disabled sound should pause decoded tracks');
assert.equal(values.get('carcaca.mar.music.volume'),'0.5');
assert(weatherSrc.includes('async importFiles(files)')&&weatherSrc.includes('manual-v2'),
    'Legacy imported MP3/FLAC support must remain');
assert(gameSrc.includes("SEA_MUSIC.resolveMood(this)"),'Voyage must evaluate context each update');
assert(gameSrc.includes("'port'"),'Port must have its own music mood');
assert(gameSrc.includes("this.input.keyboard.on('keydown-M', this.onAtlas)"));
assert(portSrc.includes('M abre a carta. N silencia.'),'Help should describe correct keys');
// Bind audio on a dummy scene, confirm M cannot toggle audio.
const audioContext={localStorage:storage,console};
vm.createContext(audioContext);
vm.runInContext(audioSrc+';this.audio=SEA_AUDIO;',audioContext);
const audio=audioContext.audio;
const handlers={};
const button={setOrigin(){return this;},setDepth(){return this;},
 setInteractive(){return this;},setScrollFactor(){return this;},
 setText(value){this.text=value;return this;},
 on(name,fn){this[name]=fn;return this;}};
let cleanup=null;
const scene={
 add:{text:()=>button},
 input:{keyboard:{on:(name,fn)=>{handlers[name]=fn;},
 off:(name)=>{delete handlers[name];}}},
 events:{once:(evt,fn)=>{cleanup=fn;}}
};
const initial=audio.enabled;
audio.bind(scene,10,10,true);
assert(handlers['keydown-N'],'N should be wired as sound toggle');
assert(!handlers['keydown-M'],'M must be exclusively Atlas');
handlers['keydown-N']();
assert.notEqual(audio.enabled,initial);
button.pointerdown();
assert.equal(audio.enabled,initial,'Touch/click sound icon continues to work');
cleanup();
assert(!handlers['keydown-N'],'Scene shutdown removes hotkey listener');
assert(!audioSrc.includes("keydown-M"),'No second M hotkey in audio module');
assert(!/SeaProfile\.(?:store|settle)\(/.test(weatherSrc),
 'Music modules must not change gameplay profile');
console.log('PASS Soundscape 3.5a: six contexts, fades, mute, import compatibility, Atlas M / audio N');
