/* Audio mixer 3.5b — no browser required.
 * node tests/audio-mixer-3-5b.test.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('SeaEffects.js','utf8');
const values=new Map();
const localStorage={getItem:k=>values.has(k)?values.get(k):null,
    setItem:(k,v)=>values.set(k,String(v))};
let contexts=0,connections=0;
class AudioContextFake {
 constructor(){contexts++;this.sampleRate=100;this.state='running';this.currentTime=2;this.destination={};}
 createGain(){return {gain:{value:0},connect(){connections++;}};}
 createBuffer(channels,frames){return {getChannelData:()=>new Float32Array(frames)};}
 suspend(){this.state='suspended';return Promise.resolve();}
 resume(){this.state='running';return Promise.resolve();}
}
const context={localStorage,
 window:{AudioContext:AudioContextFake,addEventListener(){}},console,
 Phaser:{Scenes:{Events:{SHUTDOWN:'shutdown'}}}};
vm.createContext(context);
const getAudio=()=>vm.runInContext('(function(){'+src+';return SEA_AUDIO;})()',context);
let sfx=getAudio();
assert.equal(sfx.effectsVolume,1,'Legacy users keep original effects gain');
assert.equal(sfx.unlock().master?.gain,undefined);
assert.equal(sfx.master.gain.value,.4,'Legacy original amplifier remains 0.4');
assert.equal(sfx.setEffectsVolume(.37),.37);
assert(Math.abs(sfx.master.gain.value-.148)<1e-8);
assert.equal(values.get('carcaca.mar.sfx.volume'),'.37');
assert.equal(sfx.setEffectsVolume(-10),0);
assert.equal(sfx.master.gain.value,0);
assert.equal(sfx.setEffectsVolume(999),1);
assert.equal(sfx.master.gain.value,.4);
assert.equal(sfx.setEffectsVolume(Number.NaN),1,'Bad number must be ignored');
sfx.setEffectsVolume(0);
const started=contexts;
sfx.play('cannon');
assert.equal(contexts,started,'Muted SFX should not create audio contexts');
sfx.toggle();
assert.equal(values.get('carcaca.mar-de-sangue.audio.v1'),'off');
assert.equal(sfx.effectsVolume,0,'Master mute cannot rewrite SFX preference');
sfx.toggle();
assert.equal(values.get('carcaca.mar-de-sangue.audio.v1'),'on');
assert.equal(sfx.effectsVolume,0,'Master unmute does not override zero FX');
sfx.setEffectsVolume(.7);
assert(Math.abs(sfx.master.gain.value-.28)<1e-8);
sfx=getAudio();
assert.equal(sfx.effectsVolume,.7,'New session reloads SFX preference');
assert.equal(sfx.unlock().master?.gain,undefined);
assert(Math.abs(sfx.master.gain.value-.28)<1e-8);
values.set('carcaca.mar.sfx.volume','not-a-number');
sfx=getAudio();
assert.equal(sfx.effectsVolume,1,'Corrupted preference keeps old gain');
values.set('carcaca.mar.sfx.volume','1000');
sfx=getAudio();assert.equal(sfx.effectsVolume,1,'Out of range preference clamped');
values.set('carcaca.mar.sfx.volume','-100');
sfx=getAudio();assert.equal(sfx.effectsVolume,0,'Negative volume clamped');
delete context.window;
assert(src.includes('this.master.gain.value=.4*this.effectsVolume')&&
 src.includes('this.master.gain.value = .4*this.effectsVolume'),
 'Stored SFX gain must affect both existing and new audio contexts');
assert(!/SeaProfile\.(?:store|settle|load)\(/.test(src),
 'Mixer may not access ship progress or save');
console.log('PASS 3.5b audio mixer: legacy baseline, persistence, clamp, zero and master mute');
