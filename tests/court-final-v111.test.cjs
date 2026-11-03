/* V111: Corte Feérica — assets originais, derivado com alfa e nave animada exclusiva no nível 20. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm');
const root='assets/player/corte_feerica/';
const art=[
 ['navio_corte_feerica_nivel_20_original.png',2048,682,'0bf3dec9c4d01a98d40c778f4e740d290116ce210cf961a701a4f1d44fa7d910'],
 ['navio_corte_feerica_nivel_20_animado.png',2048,682,'eb9498bfdea50344aa134410d8a96b20215d2bf2507b032b3dd5501c43174cac'],
 ['navio_corte_feerica_nivel_20_preview.png',512,682,'40ffd1120e510c63dfd3d7f9ed62a1b0c2bd05f588cb379e3eae4ed28437726b']
];
for(const [name,w,h,sha] of art){
 const data=fs.readFileSync(root+name);
 assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a',name+' header');
 assert.equal(data.readUInt32BE(16),w,name+' width');
 assert.equal(data.readUInt32BE(20),h,name+' height');
 assert.deepEqual([...data.subarray(24,29)],[8,6,0,0,0],name+' RGBA');
 assert.equal(crypto.createHash('sha256').update(data).digest('hex'),sha,name+' exact binary');
}
const f=fs.readFileSync('SeaFactions.js','utf8'),g=fs.readFileSync('Game.js','utf8');
const m=fs.readFileSync('SeaMenus.js','utf8'),p=fs.readFileSync('PortUI.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
for(const [name,code] of [['SeaFactions.js',f],['Game.js',g],['SeaMenus.js',m],['PortUI.js',p]])new vm.Script(code,{filename:name});
const ctx={};vm.runInNewContext(f+';this.F=SEA_FACTIONS;',ctx);
const F=ctx.F,profile=id=>({faction:{allegiance:id}});
assert.equal(F.level20Asset(profile('corte'),19),null,'levels 1–19 untouched');
assert.equal(F.level20Texture(profile('corte'),20),'player-ship-court-final');
assert.equal(F.courtFinal20.image,root+'navio_corte_feerica_nivel_20_animado.png');
assert.equal(F.visualPreview('corte',20),root+'navio_corte_feerica_nivel_20_preview.png');
assert.equal(F.visualPreview('corte',19),F.preview('corte',19));
assert.equal(F.level20Texture(profile('culto'),20),'player-ship-dagon-final');
assert.equal(F.level20Texture(profile('sobreviventes'),20),'player-ship-survivors-final');
assert.equal(F.level20Texture(profile('neutral'),20),null);
assert.equal(F.level20Texture({faction:F.initial()},20),null);
assert.equal(F.courtFinal20.frameCount,4);
assert.equal(F.courtFinal20.frameWidth,512);
assert.equal(F.courtFinal20.frameHeight,682);
assert.equal(F.courtFinal20.fps,4);
assert(g.includes('this.load.spritesheet(SEA_FACTIONS.courtFinal20.texture,SEA_FACTIONS.courtFinal20.image'));
assert(g.includes('frameWidth:512,frameHeight:682,endFrame:3'));
assert(g.includes('this.playerShipAnimation=SEA_FACTIONS.level20Asset(this.profile,playerStage)'));
assert(g.includes('this.playerShipAnimation?.frameHeight'));
assert(g.includes('this.playerShipAnimated?0:playerStage-1'));
assert(g.includes('this.playerSprite.setFrame(frame)'));
assert(g.includes('this.playerShipAnimation.fps')&&g.includes('this.playerShipAnimation.frameCount'));
assert(g.includes('this.hullRadius = 68'));
assert(g.includes('.setScale(playerScale).setRotation(Math.PI)'),'unchanged bow orientation');
assert(m.includes('SEA_FACTIONS.level20Asset(pauseProfile,pauseStage)'));
assert(p.includes("id==='sobreviventes'||id==='culto'||id==='corte'"));
assert(p.includes('SEA_FACTIONS.visualPreview(p.faction.allegiance'));
assert(p.includes('SEA_FACTIONS.visualPreview(id,level)'));
for(const [name] of art)assert(sw.includes('"./'+root+name+'"'),'missing PWA precache '+name);
assert(Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1])>=111,'V111 service worker');
console.log('PASS V111: original hash, 4 transparent frames, exclusive Court level 20, previews, mechanics and PWA');
