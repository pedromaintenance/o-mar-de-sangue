/* Cortejo dos Afogados: original submerso four-frame RGBA, 27 Oct 2026. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const vm=require('node:vm');
const asset='assets/v15/beast_drowned.png';
assert(fs.existsSync(asset),'Original drowned spritesheet missing');
const png=fs.readFileSync(asset);
assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG signature');
assert.equal(png.readUInt32BE(16),2048,'four 512-pixel frames');
assert.equal(png.readUInt32BE(20),646,'submerged frame height');
assert.deepEqual([...png.subarray(24,29)],[8,6,0,0,0],'RGBA8 with transparency');
assert.equal(crypto.createHash('sha256').update(png).digest('hex'),
  '76567f55cc60baae73c1ac76447cbab75ab69cf03763e839ad6bf101acb6cf0b',
  'Committed bytes must match original artwork exactly');
const game=fs.readFileSync('Game.js','utf8');
new vm.Script(game,{filename:'Game.js'});
assert(game.includes("this.load.spritesheet('drowned-animated', 'assets/v15/beast_drowned.png'"));
assert(/frameWidth:512,\s*frameHeight:646,\s*endFrame:3/.test(game));
assert(game.includes("afogados:'drowned-animated'"));
assert(game.includes("type==='afogados' && tex==='drowned-animated' ? 646 :"), 'Use one frame height for scaling, regardless of preceding sprite types');
const frameZero=game.split('const initialMonsterFrame=(')[1]?.split(')?0:undefined;')[0]||'';
for(const type of ['dagon','coral','recife','afogados'])
 assert(frameZero.includes("type==='"+type+"'"), 'Spawn '+type+' at frame zero');
assert(game.includes("if(e.type==='afogados' && e.ship.texture.key==='drowned-animated')"));
assert(game.includes('e.drownedFrame!==frame')&&game.includes('e.ship.setFrame(frame)'));
assert(!game.includes("this.load.image('v15-drowned'"),'No static loader for four-frame sheet');
assert(game.includes("e.type==='dagon'?0:")&&game.includes("e.heading+(artFacesDown?Math.PI:0)"),
  'Existing monster orientation preserved');
assert(game.includes("e.type==='afogados' ? .79+.18*(.5+.5*pulse) : 1"),
  'Existing transparency pulse preserved');
assert(game.includes("afogados: { name: 'Cortejo dos Afogados'"), 'Enemy stats intact');
assert(game.includes("this.spawnEnemy('afogados',380)"), 'Dagon summons intact');
const sw=fs.readFileSync('sw.js','utf8');
assert(sw.includes('"./assets/v15/beast_drowned.png"'));
assert(Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1])>=73);
console.log('PASS Drowned original submerged RGBA sprite 2048x646, four frames, visual only, PWA');
