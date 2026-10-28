/* Animated eel and bow alignment — asset + renderer regression contract.
 * Physics heading 0 is up (0,-1); eel and V15 ram art face down and require
 * exactly +PI in the render rotation. No changes to collision/heading math.
 */
const assert=require('node:assert/strict'),fs=require('node:fs');
const game=fs.readFileSync('Game.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const path='assets/v15/beast_eel_swim.webp';
assert(fs.existsSync(path),'full resolution animated eel not committed');
const bytes=fs.readFileSync(path);
assert.equal(bytes.toString('ascii',0,4),'RIFF');
assert.equal(bytes.toString('ascii',8,12),'WEBP');
assert(!fs.existsSync('assets/v15/beast_eel.png'),'remove stale beast_eel.png');
assert(!fs.existsSync('assets/abyss/abyss_eel.png'),'remove obsolete fallback eel PNG');
assert(!game.includes('v15-eel')&&!game.includes('foe-eel'),'no legacy eel texture references');
assert(game.includes("this.load.spritesheet('eel-swim', 'assets/v15/beast_eel_swim.webp'"));
assert(game.includes('frameWidth:512, frameHeight:565, endFrame:3'));
assert(game.includes("enguia:'eel-swim'"));
assert(/type==='enguia'\?0:[A-Za-z_$][A-Za-z_$0-9]*/.test(game),
 'Eel must start with frame 0 even when another enemy has custom frames');
assert(game.includes("e.ship.setFrame(frame)"),'swim loop must actually update Phaser frame');
assert(game.includes("e.eelFrame!==frame"),'avoid redundant frame changes on every tick');
assert(game.includes("e.type==='ariete'&&e.ship.texture.key==='v15-ram'"));
assert(game.includes("e.heading+(artFacesDown?Math.PI:0)"));
assert(game.includes("const fixedMonsterArt=e.isMonster && e.type!=='enguia';"),'All monsters except the eel keep fixed visual orientation');
assert(game.includes("Math.sin(e.heading) * thrust")&&game.includes("Math.cos(e.heading) * thrust"),
 'Movement and physics still derive only from heading');
assert(sw.includes('"./assets/v15/beast_eel_swim.webp"'));
assert(!sw.includes('beast_eel.png')&&!sw.includes('abyss_eel.png'));
const cacheVersion=Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1]);
assert(Number.isFinite(cacheVersion)&&cacheVersion>=69,'PWA version must not regress below eel revision 69');
console.log('PASS eel source: original-size 4 frames, stale files deleted, heading and ram rendering isolated');
