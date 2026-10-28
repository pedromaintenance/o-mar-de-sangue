// Regression contracts for the updated Dagon King four-frame art.
// Run after uploading the user's unchanged 2048x682 RGBA image.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const crypto=require('node:crypto');
const file='assets/abyss/dagon.png';
assert(fs.existsSync(file),
  'Missing canonical dagon.png (new four-frame RGBA sprite).');
const data=fs.readFileSync(file);
assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG signature');
assert.equal(data.readUInt32BE(16),2048,'4 frames must be 512px wide each');
assert.equal(data.readUInt32BE(20),682,'Frame height must remain 682px');
assert.equal(crypto.createHash('sha256').update(data).digest('hex'),
 'd86664fc5cd48d208dfbe7984b83d4627671a739c365df34949326a4aca9e1ff',
 'The committed art must match the exact original file attached by the user');
const game=fs.readFileSync('Game.js','utf8');
new vm.Script(game,{filename:'Game.js'});
assert(game.includes("this.load.spritesheet('dagon-animated', 'assets/abyss/dagon.png'"),
  'Dagon must load sprite sheet');
assert(/frameWidth:512,\s*frameHeight:682,\s*endFrame:3/.test(game),
  'Load four equal frames');
assert(game.includes("dagon:'dagon-animated'"),'Spawn must select four-frame art');
assert(game.includes("type==='dagon' && e.ship.texture.key==='dagon-animated'"),
  'Visual update must cycle Dagon frames');
assert(game.includes("e.ship.setFrame(frame)"),'Frame progression required');
assert(game.includes("e.type==='dagon'?0:e.type==='olho_dagon'?0:"),'Never rotate Dagon or its eyes with heading');
assert(game.includes("if(e.type==='dagon'){")&&game.includes("this.spawnEnemy('afogados'"),
  'Existing Dagon summons must remain active');
assert(game.includes("this.spawnEnemy('coral'"),'Second summon phase must remain');
assert(game.includes('monsterLunge(e,distance)'),'Existing boss lunge unaffected');
const sw=fs.readFileSync('sw.js','utf8');
assert(sw.includes('"./assets/abyss/dagon.png"'),
  'Offline cache must include sprite sheet');
assert(!fs.existsSync('assets/v15/beast_dagon.png'), 'Remove old duplicate PNG');
assert(!fs.existsSync('assets/v15/dagon_emerging.webp'), 'Remove obsolete WebP');
assert(!game.includes('beast_dagon.png') && !game.includes('dagon_emerging.webp'),
  'Runtime must use only the canonical Dagon sprite');
assert(!sw.includes('beast_dagon.png') && !sw.includes('dagon_emerging.webp'),
  'Offline cache must not retain obsolete boss assets');
const cacheVersion=Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1]);
assert(cacheVersion>=72, 'Cache must refresh after Dagon asset consolidation');
console.log('PASS updated Dagon King 2048x682 sheet, four-frame animation, fixed facing and unchanged summons');
