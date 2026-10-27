/* Tentáculo errante e segundo Kraken: arte exata e gatilhos de jogo. */
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const vm=require('node:vm');
const path='assets/v15/beast_tentacle.png';
assert(fs.existsSync(path),'Tentacle original RGBA sheet missing');
const png=fs.readFileSync(path);
assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
assert.equal(png.readUInt32BE(16),2048,'four horizontal 512px frames');
assert.equal(png.readUInt32BE(20),682,'original 682px height');
assert.deepEqual([...png.subarray(24,29)],[8,6,0,0,0],'RGBA8 with transparency');
assert.equal(crypto.createHash('sha256').update(png).digest('hex'),
 '41ebca4be24a532b058043983824b77a7c9a483857cbddfef5f8d98e202bf6ad',
 'the image must be byte-identical to the supplied original');
const game=fs.readFileSync('Game.js','utf8');
new vm.Script(game,{filename:'Game.js'});
assert(game.includes("this.load.spritesheet('tentacle-animated', 'assets/v15/beast_tentacle.png'"));
assert(/frameWidth:512,\s*frameHeight:682,\s*endFrame:3/.test(game));
assert(game.includes("tentaculo:'tentacle-animated'"));
assert(game.includes("type==='tentaculo' && tex==='tentacle-animated'"));
assert(game.includes("if(e.type==='tentaculo' && e.ship.texture.key==='tentacle-animated')"));
assert(game.includes('e.tentacleFrame!==frame')&&game.includes('e.ship.setFrame(frame)'));
assert(!game.includes("this.load.image('v15-tentacle'"),'no static sheet loader');
assert(game.includes("tentaculo: { name: 'Tentáculo Errante'"));
assert(game.includes("const krakenEncounter = seaKrakenEncounterNumber(this.stage)"));
assert(game.includes('if (this.missionBoss === \'kraken\' && krakenEncounter >= 2)'));
assert(game.includes('const reinforcements = Math.min(7, krakenEncounter * 2)'));
assert(game.includes("this.spawnEnemy('tentaculo', 470 + i * 75)"));
const helper=game.match(/function seaKrakenEncounterNumber\(stage\)\s*\{[^}]+\}/);
assert(helper,'mission Kraken encounter helper required');
const encounter=vm.runInNewContext(helper[0]+';seaKrakenEncounterNumber');
for(const [stage,expected] of [[5,0],[10,1],[15,0],[20,0],[25,0],[30,2],[35,0],[50,3],[70,4]])
 assert.equal(encounter(stage),expected,'mission '+stage);
assert(game.includes("if (this.mode === 'sandbox' && !this.contractId) this.spawnEnemy('tentaculo', 1000)"));
assert(game.includes("this.mode === 'sandbox' && type === 'kraken' && !options.fromTentacle"),
 'Kraken cannot spawn automatically in sandbox');
assert(game.includes("const bosses=['almirante','dagon','nauabissal'];"),'no Kraken wave spawn');
assert(game.includes("enemy.sandboxSentinel = this.mode==='sandbox' && type==='tentaculo'"));
assert(game.includes("if(e.sandboxSentinel) this.summonSandboxKraken(e)"),
 'player cannon hit must summon Kraken');
assert(game.includes("if (enemy.sandboxSentinel) this.summonSandboxKraken(enemy)"),
 'ship ram into tentacle must summon Kraken');
assert(game.includes("if(hurt) this.summonSandboxKraken(e)"),
 'damage from tentacle must summon Kraken');
assert(game.includes("else if(e.type==='tentaculo')this.tentacleStrike(e)"),
 'tentacle must have independent attack');
assert(game.includes("!this.enemies.some(e => e.sandboxSentinel && !e.dead)"),
 'one roaming sentinel at a time');
assert(game.includes("this.spawnEnemy('kraken', 640, {fromTentacle:true})"),
 'only sentinel encounter may summon Kraken');
assert(game.includes("if(e.type==='kraken')this.tentacleAttack(e)"),
 'Kraken area attack must be intact');
assert(game.includes("this.spawnEnemy('enguia',340+i*80)"),'Kraken fury eels remain');
function extractMethod(name){
 const start=game.indexOf('\n    '+name+'(');
 assert(start>=0,'method '+name+' exists');
 const brace=game.indexOf('{',start+1);
 let level=0,end=brace;
 for(;end<game.length;end++){
   if(game[end]==='{')level++;
   else if(game[end]==='}' && --level===0)break;
 }
 assert(end<game.length,'balanced '+name);
 return vm.runInNewContext('({'+game.slice(start+1,end+1)+'}).'+name);
}
const summon=extractMethod('summonSandboxKraken');
let called=0;
const sandbox={
 mode:'sandbox',contractId:null,sandboxKrakenTriggered:false,ended:false,
 spawnEnemy(type,distance,options){
  assert.equal(type,'kraken');
  assert.equal(distance,640);
  assert.equal(options.fromTentacle,true);
  called++;return {type};
 },
 announce(){},burst(){}
};
const sentinel={sandboxSentinel:true,x:100,y:200};
assert.equal(summon.call(sandbox,{sandboxSentinel:false}),null,'other enemies cannot summon');
assert.equal(called,0);
assert.equal(summon.call(sandbox,sentinel).type,'kraken');
assert.equal(called,1);
assert.equal(sandbox.sandboxKrakenTriggered,true);
assert.equal(summon.call(sandbox,sentinel),null,'no duplicate invocation');
assert.equal(called,1);
const mission={...sandbox,mode:'mission',sandboxKrakenTriggered:false};
assert.equal(summon.call(mission,sentinel),null,'mission tentacles are not sandbox summons');
assert.equal(called,1);
const sw=fs.readFileSync('sw.js','utf8');
assert(sw.includes('"./assets/v15/beast_tentacle.png"'),'asset remains offline');
assert(Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1])>=75,'offline revision v75');
console.log('PASS exact 4-frame sprite, mission 10/30/50 and sandbox interaction triggers');
