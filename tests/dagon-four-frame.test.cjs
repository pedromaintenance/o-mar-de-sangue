/* Dagon and his herald are distinct RGBA four-frame sprites. */
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const crypto=require('node:crypto');
function art(path,sha){
  assert(fs.existsSync(path), 'Missing '+path);
  const png=fs.readFileSync(path);
  assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16),2048,'four equal 512px frames');
  assert.equal(png.readUInt32BE(20),682,'682px frame height');
  assert.deepEqual([...png.subarray(24,29)],[8,6,0,0,0],'RGBA8 transparent sprite');
  assert.equal(crypto.createHash('sha256').update(png).digest('hex'),sha,'original image bytes');
}
art('assets/v15/dagon_emerging.png','63b7c963d4e5c571ce6df3f48b91a3b7f7baa559925a66843a974346fd016995');
art('assets/abyss/dagon.png','d86664fc5cd48d208dfbe7984b83d4627671a739c365df34949326a4aca9e1ff');
const game=fs.readFileSync('Game.js','utf8');
new vm.Script(game,{filename:'Game.js'});
assert(game.includes("this.load.spritesheet('dagon-animated', 'assets/v15/dagon_emerging.png'"));
assert(game.includes("this.load.spritesheet('dagon-lord-animated', 'assets/abyss/dagon.png'"));
assert(game.includes("dagon: { name: 'Arauto de Dagon'"));
assert(game.includes("dagon_senhor: { name: 'Dagon · Senhor das Profundezas'"));
assert(game.includes("dagon:'dagon-animated'"));
assert(game.includes("dagon_senhor:'dagon-lord-animated'"));
assert(game.includes("type==='dagon_senhor' && tex==='dagon-lord-animated'"));
assert(game.includes("e.type==='dagon_senhor' && e.ship.texture.key==='dagon-lord-animated'"));
assert(game.includes("const fixedMonsterArt=e.isMonster && e.type!=='enguia';"),
 'Both Dagon entities and eyes must remain at zero art rotation');
assert(game.includes("e.ship.setFrame(frame)"));
assert(game.includes("if(type==='dagon') this.spawnDagonEyes(3)"),'herald retains its eye summons');
assert(game.includes("if(e.type==='dagon'){"),'herald keeps abyss lunge phases');
assert(game.includes("this.spawnEnemy('afogados',380)"));
assert(game.includes("this.spawnEnemy('coral',390)"));
const sw=fs.readFileSync('sw.js','utf8');
assert(sw.includes('"./assets/v15/dagon_emerging.png"'));
assert(sw.includes('"./assets/abyss/dagon.png"'));
assert(Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1])>=95);
console.log('PASS distinct Herald and Lord PNG hashes, RGBA, animation, zero rotation, unchanged Herald combat');
