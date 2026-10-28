/* Kraken coroado: four-frame original PNG, orientation and boss combat regression. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const vm=require('node:vm');
const asset='assets/v15/beast_kraken.png';
assert(fs.existsSync(asset),'Kraken sheet must exist at canonical asset path');
const png=fs.readFileSync(asset);
assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG signature');
assert.equal(png.readUInt32BE(16),2048,'four 512px frames arranged horizontally');
assert.equal(png.readUInt32BE(20),682,'original height 682px');
assert.deepEqual([...png.subarray(24,29)],[8,6,0,0,0],'retain full RGBA8 transparency');
assert.equal(crypto.createHash('sha256').update(png).digest('hex'),
 'dce9e05cf79c6631f23c77573b376af23dd4b7f08e802557254c06378134ade1',
 'Original user-provided PNG must remain byte-identical');
const game=fs.readFileSync('Game.js','utf8');
new vm.Script(game,{filename:'Game.js'});
assert(game.includes("this.load.spritesheet('kraken-animated', 'assets/v15/beast_kraken.png'"),
 'Use a real Phaser spritesheet for Kraken, not static image');
assert(/frameWidth:512,\s*frameHeight:682,\s*endFrame:3/.test(game),'load four frames');
assert(game.includes("kraken:'kraken-animated'"), 'Kraken spawn picks animated texture');
assert(game.includes("type==='kraken' && tex==='kraken-animated'"), 'scale using one frame height');
const frameZero=game.split('const initialMonsterFrame=(')[1]?.split(')?0:undefined;')[0]||'';
for(const type of ['dagon','coral','recife','afogados','kraken'])
 assert(frameZero.includes("type==='"+type+"'"), 'Frame zero on spawn for '+type);
assert(game.includes("if(e.type==='kraken' && e.ship.texture.key==='kraken-animated')"), 'animate in visual loop');
assert(game.includes('e.krakenFrame!==frame')&&game.includes('e.ship.setFrame(frame)'), 'cycle frames only as needed');
assert(!game.includes("this.load.image('v15-kraken'"), 'remove former static texture');
assert(game.includes("const fixedMonsterArt=e.isMonster && e.type!=='enguia';")&&game.includes("e.heading+(artFacesDown?Math.PI:0)"),
 'Non-eel monsters fixed; eel and ships still rotate');
assert(game.includes("kraken: { name: 'KRAKEN")&&game.includes("this.tentacleAttack(e)"),
 'retain Kraken stats and tentacle attack');
assert(game.includes("this.spawnEnemy('enguia',340+i*80)"), 'retain boss phase and eel summons');
const sw=fs.readFileSync('sw.js','utf8');
assert(sw.includes('"./assets/v15/beast_kraken.png"'), 'PWA must cache new Kraken');
const cacheVersion=Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1]);
assert(cacheVersion>=74, 'refresh cached Kraken sprite');
console.log('PASS exact original Kraken PNG, four-frame animation, unchanged mechanics, cache v74');
