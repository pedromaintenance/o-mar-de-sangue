/* O Mar de Sangue — original floating chest sprite regression. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const vm=require('node:vm');
const path='assets/items/treasure_chest.png';
assert(fs.existsSync(path),'Floating chest artwork missing');
const png=fs.readFileSync(path);
assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG signature');
assert.equal(png.readUInt32BE(16),2048,'four 512px frames');
assert.equal(png.readUInt32BE(20),682,'frame height');
assert.deepEqual([...png.subarray(24,29)],[8,6,0,0,0],'RGBA8 noninterlaced');
assert.equal(crypto.createHash('sha256').update(png).digest('hex'),
 '1f5bdfd7f017d0797d381833d1c4f9bb516d66865a9b2b1374c53047f6e38e9a',
 'Committed sprite must be byte-for-byte equal to supplied PNG');
const game=fs.readFileSync('Game.js','utf8');
new vm.Script(game,{filename:'Game.js'});
assert(game.includes("this.load.spritesheet('treasure-chest', 'assets/items/treasure_chest.png'"),'Phaser spritesheet loader');
assert(/frameWidth:512,\s*frameHeight:682,\s*endFrame:3/.test(game));
assert(!game.includes("this.load.image('treasure-chest'"),'no static texture preload');
assert(game.includes("this.add.image(0,0,kind,(kind==='treasure-chest'||kind==='treasure-coin')?0:undefined)"),
 'loot spritesheet must start at frame 0');
assert(game.includes("this.add.image(x, y, kind, kind==='treasure-chest'?0:undefined)"),
 'scenery spritesheet must start at frame 0');
assert(game.includes('chestSprite:kind===') && game.includes("chestFrame:0"),
 'treasure must keep reference to animated graphic');
assert(game.includes("f.sprite.texture.key==='treasure-chest'"),
 'floating decorative chest must animate');
assert(game.includes('loot.chestSprite.setFrame(frame)') && game.includes('f.sprite.setFrame(frame)'),
 'both kinds of chest must cycle frames');
assert(game.includes("Math.floor((t*4+loot.phase)%4)")&&game.includes("Math.floor((t*4+f.phase)%4)"),
 'animated at 4 FPS');
assert(game.includes("'treasure-chest':.22"),'normalize new 512px sprite proportions');
assert(/this\.gold = SEA_MATH\.safe\(this\.gold \+\s*SEA_FACTION_POLITICS\.treasure\(this,t\.value\)\)/.test(game),
 'collection retains the established V101 political treasure modifier');
assert(game.includes("t.coin.destroy(); this.burst("),'collected chest is removed');
assert(game.includes("const kind=fromEnemy?'treasure-chest'"),
 'enemies must still drop chests');
assert(game.includes("this.load.image('treasure-crate'") &&
       game.includes("this.load.spritesheet('treasure-coin'"),
 'crate stays static while coin is now a separate spritesheet');
const sw=fs.readFileSync('sw.js','utf8');
assert(sw.includes('"./assets/items/treasure_chest.png"'),'PWA precache path');
assert(Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1])>=77,'new PWA cache version');
console.log('PASS floating chest PNG, 4 frames, 4 FPS, pickups, scenery, and PWA');
