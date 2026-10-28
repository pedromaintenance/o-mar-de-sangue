/* Corte Feérica — integrity and geometry contract. No runtime gameplay changes. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const folder='assets/player/corte_feerica/';
const paths=[
  [
    "assets/player/corte_feerica/mar_de_sangue_navio_corte_feerica_20_evolucoes.png",
    "967d842e203429c403953947fc4b6a65920d47bee9852f3328d0bf90e51ef1da"
  ],
  [
    "assets/player/corte_feerica/mar_de_sangue_navio_corte_feerica_manifest.json",
    "8849260c51f2e950ce28819dffe05812ada605db7db3dda67b2a641c1d9c80f6"
  ],
  [
    "assets/player/corte_feerica/evolucoes/navio_corte_feerica_nivel_01.png",
    "5cccb684ee259145c8bd2735de223a54b760fa8fb70c56d9593a40034db6d9ae"
  ],
  [
    "assets/player/corte_feerica/evolucoes/navio_corte_feerica_nivel_02.png",
    "174640b0e908ac6e87ef67f902afc7c81186631e9edf9f84d1b068d6baaa06d4"
  ],
  [
    "assets/player/corte_feerica/evolucoes/navio_corte_feerica_nivel_03.png",
    "dc94bb8fad29d1531be48ca4696db0dcdd73a34fcacf155746002364395b0f93"
  ],
  [
    "assets/player/corte_feerica/evolucoes/navio_corte_feerica_nivel_04.png",
    "1bceea6352345f44b2f47757c2039ba1de44f5dec7709f1d44ed78695c18aae7"
  ],
  [
    "assets/player/corte_feerica/evolucoes/navio_corte_feerica_nivel_05.png",
    "18a4304e6621b631a92f2f6854dfadfdc2e9f3c6de20e94a21c27866f0a94d63"
  ],
  [
    "assets/player/corte_feerica/evolucoes/navio_corte_feerica_nivel_06.png",
    "9713a0ec814d9a617ab6b13971162b246645ec2069522e64857a3e775caae592"
  ],
  [
    "assets/player/corte_feerica/evolucoes/navio_corte_feerica_nivel_07.png",
    "51b0721d9f67a515ae14f57719779341cbdb7e0292a98165a233c1be1be1022c"
  ],
  [
    "assets/player/corte_feerica/evolucoes/navio_corte_feerica_nivel_08.png",
    "9a39ac8a42ee960f661671564a571ae8008c4f778c37a2802ccd47be7f51839f"
  ],
  [
    "assets/player/corte_feerica/evolucoes/navio_corte_feerica_nivel_09.png",
    "3dfb34830c139163e27f2af6677fcd3bd33b0002d42913abf3bcfa989dedcee3"
  ],
  [
    "assets/player/corte_feerica/evolucoes/navio_corte_feerica_nivel_10.png",
    "39a710bf59e9b1d5f2e7142d60fbfe285ea41869166994e10183fb1c4ed77121"
  ],
  [
    "assets/player/corte_feerica/evolucoes/navio_corte_feerica_nivel_11.png",
    "bae59bfe8ed8d3af677cf4f999d0bfb0e349d88826ea2f49bf694a73537f33bc"
  ],
  [
    "assets/player/corte_feerica/evolucoes/navio_corte_feerica_nivel_12.png",
    "88aa0e6b7ea13f35b452b7850df778333f76d1935f9ec9d7d428868516092e7a"
  ],
  [
    "assets/player/corte_feerica/evolucoes/navio_corte_feerica_nivel_13.png",
    "42e3eea7371ac0390ae963f5ebed9cb2baf4b88b3a4ca0aff2761d1aff81b34a"
  ],
  [
    "assets/player/corte_feerica/evolucoes/navio_corte_feerica_nivel_14.png",
    "cbc9617cfa2a41fbab6ab004181c61dafcf5ee5183d4922aad4519adce63759a"
  ],
  [
    "assets/player/corte_feerica/evolucoes/navio_corte_feerica_nivel_15.png",
    "597fcc61e3cb8d8f297ec83d634f35634386170dbdd5758bdaf470e30851a1c5"
  ],
  [
    "assets/player/corte_feerica/evolucoes/navio_corte_feerica_nivel_16.png",
    "2f5b74973d8555d50d6f56d32e4d1a0fbef2e0d13e566cc335eba14ada31eb6c"
  ],
  [
    "assets/player/corte_feerica/evolucoes/navio_corte_feerica_nivel_17.png",
    "c190e5117f4a306c17610a6a70396de4539318952afbc365a3f1188105da9039"
  ],
  [
    "assets/player/corte_feerica/evolucoes/navio_corte_feerica_nivel_18.png",
    "a33269619609ca2733f624eb1727499f6d788e7da977c828a3ea12ee6b28eff0"
  ],
  [
    "assets/player/corte_feerica/evolucoes/navio_corte_feerica_nivel_19.png",
    "33074b5ea9c90b284dd886ca79611a8ac16b9ee2b617da583108cc672b5bf93a"
  ],
  [
    "assets/player/corte_feerica/evolucoes/navio_corte_feerica_nivel_20.png",
    "8a952dca5a0063fda9208f4281edb8391431c6996e770e64bc7dced86aa904fb"
  ],
  [
    "assets/player/corte_feerica/referencia_final/Navio_Feerico_Sombrio_da_Colheita_final_original.png",
    "10e1b8bbaded63b416e8549a4360e86d7cf73d2556e3618f781bbc998b7f71bf"
  ]
];
function info(path) {
 const b=fs.readFileSync(path);
 assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG signature: '+path);
 assert.equal(b[25],6,'RGBA PNG: '+path);
 return {width:b.readUInt32BE(16),height:b.readUInt32BE(20)};
}
for(const [path,sha] of paths){
 const bytes=fs.readFileSync(path);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),sha,'SHA-256 original preserved: '+path);
 if(path.endsWith('.png')){
  const dim=info(path);
  if(path.endsWith('20_evolucoes.png')) assert.deepEqual(dim,{width:1460,height:1560});
  else if(path.includes('/evolucoes/')) assert.deepEqual(dim,{width:260,height:360});
 }
}
const m=JSON.parse(fs.readFileSync(folder+'mar_de_sangue_navio_corte_feerica_manifest.json','utf8'));
assert.equal(m.faction,'Corte Feérica / Shadow Fey');
assert.equal(m.orientation.bow,'down');
assert.equal(m.orientation.stern,'up');
assert.deepEqual(m.grid,{rows:4,columns:5,cell_width:260,cell_height:360,gap_horizontal:40,gap_vertical:40,gap_rgba:[0,0,0,0]});
assert.equal(m.sprites.length,20);
for(let i=0;i<20;i++){
 const s=m.sprites[i];
 assert.equal(s.level,i+1);
 assert.equal(s.row,1+Math.floor(i/5));
 assert.equal(s.column,1+(i%5));
 assert.deepEqual(s.atlas_rect,{x:(i%5)*300,y:Math.floor(i/5)*400,width:260,height:360});
 assert.equal(s.file,`navio_corte_feerica_nivel_${String(i+1).padStart(2,'0')}.png`);
 assert(fs.existsSync(folder+'evolucoes/'+s.file));
}
assert.equal(m.sprites[19].is_approved_final,true);
assert(fs.existsSync(folder+'referencia_final/'+m.original_final_reference));
console.log('PASS Corte Feérica: 20 unchanged RGBA levels, atlas, original final artwork and manifest');
