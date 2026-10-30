/* V110: Culto de Dagon — four-frame player ship, exact original and alpha-only derivative. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm');
const root='assets/player/culto_dagon/';
const originals=[
 ['navio_culto_dagon_nivel_20_original.png',2048,512,'e3b60d315c00929623d9d570909d12ac47ad8f116842173ef2e8ef7ade484665'],
 ['navio_culto_dagon_nivel_20_animado.png',2048,512,'72b8bcac99cf9a4813c139ee2cd56eb204f96de4a055f1e712f6bb48ae55eb56'],
 ['navio_culto_dagon_nivel_20_preview.png',512,512,'ce32e5307b25a3818f74458acd8c7ae1e09e35b0d1061544d8f6525a614dd715']
];
for(const [name,w,h,sha] of originals){
 const data=fs.readFileSync(root+name);
 assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a',name+' PNG');
 assert.equal(data.readUInt32BE(16),w,name+' width');
 assert.equal(data.readUInt32BE(20),h,name+' height');
 assert.deepEqual([...data.subarray(24,29)],[8,6,0,0,0],name+' RGBA8');
 assert.equal(crypto.createHash('sha256').update(data).digest('hex'),sha,name+' SHA256');
}
const fSrc=fs.readFileSync('SeaFactions.js','utf8');
const gSrc=fs.readFileSync('Game.js','utf8');
const mSrc=fs.readFileSync('SeaMenus.js','utf8');
const pSrc=fs.readFileSync('PortUI.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
for(const [path,code] of [['SeaFactions.js',fSrc],['Game.js',gSrc],['SeaMenus.js',mSrc],['PortUI.js',pSrc]])new vm.Script(code,{filename:path});
const context={};vm.runInNewContext(fSrc+';this.F=SEA_FACTIONS;',context);
const F=context.F,p=id=>({faction:{allegiance:id}});
assert.equal(F.level20Asset(p('culto'),19),null);
assert.equal(F.level20Texture(p('culto'),19),null);
assert.equal(F.level20Texture(p('culto'),20),'player-ship-dagon-final');
assert.equal(F.level20Asset(p('culto'),20).image,root+'navio_culto_dagon_nivel_20_animado.png');
assert.equal(F.visualPreview('culto',20),root+'navio_culto_dagon_nivel_20_preview.png');
assert.equal(F.visualPreview('culto',19),F.preview('culto',19));
assert.equal(F.level20Texture(p('sobreviventes'),20),'player-ship-survivors-final');
assert.equal(F.level20Asset(p('sobreviventes'),20).frameHeight,682);
assert.equal(F.level20Texture(p('corte'),20),null);
assert.equal(F.level20Texture({faction:F.initial()},20),null);
assert.equal(F.cultFinal20.frameCount,4);
assert.equal(F.cultFinal20.frameWidth,512);
assert.equal(F.cultFinal20.frameHeight,512);
assert.equal(F.cultFinal20.fps,4);
assert(gSrc.includes('this.load.spritesheet(SEA_FACTIONS.cultFinal20.texture,SEA_FACTIONS.cultFinal20.image'));
assert(gSrc.includes('frameWidth:512,frameHeight:512,endFrame:3'));
assert(gSrc.includes('SEA_FACTIONS.level20Asset(this.profile,playerStage)'));
assert(gSrc.includes('this.playerShipAnimation?.frameHeight'),'scale by a single frame');
assert(gSrc.includes('this.playerShipAnimated?0:playerStage-1'),'4 frame animations not original atlas cells');
assert(gSrc.includes('this.playerSprite.setFrame(frame)'),'real frame update');
assert(gSrc.includes('this.playerShipAnimation.fps')&&gSrc.includes('this.playerShipAnimation.frameCount'));
assert(gSrc.includes('this.hullRadius = 68'),'unchanged hit radius');
assert(gSrc.includes('this.player = this.add.container(start.x, start.y).setDepth(20).setRotation(Math.PI)'));
assert(gSrc.includes('.setScale(playerScale).setRotation(Math.PI)'),'same visual bow direction');
assert(mSrc.includes('SEA_FACTIONS.level20Asset(pauseProfile,pauseStage)'));
assert(pSrc.includes("id==='sobreviventes'||id==='culto'"));
assert(pSrc.includes('SEA_FACTIONS.visualPreview(id,level)'));
assert(pSrc.includes('SEA_FACTIONS.visualPreview(p.faction.allegiance'));
for(const [filename] of originals)assert(sw.includes('"./'+root+filename+'"'),'PWA precache '+filename);
assert(Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1])>=110,'invalidate PWA');
console.log('PASS V110: pixel-identical original, transparent derivative hash, Cult-only level 20, four frames and PWA');
