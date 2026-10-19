/* 3.8a.5 — decode every PNG scanline and reject dark smoke / corrupt IDAT.
 * Earlier versions only inspected PNG signature and dimensions; one passed
 * despite an unreadable data stream. No third-party dependencies.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),zlib=require('node:zlib');
const png=fs.readFileSync('assets/fx/cannon_charge_sparks.png');
assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
assert.equal(width,480);assert.equal(height,96);
assert.deepEqual([...png.subarray(24,29)],[8,6,0,0,0],
  'real 8-bit RGBA texture, not palette alpha approximation');
const table=Array.from({length:256},(_,i)=>{
 let c=i;for(let j=0;j<8;j++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;
});
const crc32=bytes=>{
 let c=0xffffffff;for(const b of bytes)c=table[(c^b)&255]^(c>>>8);
 return (c^0xffffffff)>>>0;
};
let offset=8,idats=[],seenEnd=false;
while(offset<png.length){
 const len=png.readUInt32BE(offset),end=offset+12+len;
 assert(end<=png.length,'truncated chunk');
 const tag=png.toString('ascii',offset+4,offset+8);
 assert.equal(crc32(png.subarray(offset+4,offset+8+len)),
  png.readUInt32BE(offset+8+len),'CRC '+tag);
 if(tag==='IDAT')idats.push(png.subarray(offset+8,offset+8+len));
 offset=end;
 if(tag==='IEND'){seenEnd=true;break}
}
assert(seenEnd&&idats.length,'valid PNG chunks');
const raw=zlib.inflateSync(Buffer.concat(idats));
assert.equal(raw.length,(width*4+1)*height,'fully decodable PNG scanlines');
const pixels=Buffer.alloc(width*height*4),stride=width*4;
let previous=Buffer.alloc(stride);
for(let y=0;y<height;y++){
 const p=y*(stride+1),method=raw[p],current=Buffer.alloc(stride);
 assert(method>=0&&method<=4,'valid PNG scanline filter');
 for(let i=0;i<stride;i++){
   const a=i>=4?current[i-4]:0,b=previous[i],c=i>=4?previous[i-4]:0;
   let predict=0;
   if(method===1)predict=a;
   if(method===2)predict=b;
   if(method===3)predict=(a+b)>>1;
   if(method===4){
     const z=a+b-c,da=Math.abs(z-a),db=Math.abs(z-b),dc=Math.abs(z-c);
     predict=da<=db&&da<=dc?a:db<=dc?b:c;
   }
   current[i]=(raw[p+1+i]+predict)&255;
 }
 current.copy(pixels,y*stride);
 previous=current;
}
const count=[];
for(let frame=0;frame<5;frame++){
 let bright=0,dark=0,nontransparent=0,transparent=0;
 for(let y=0;y<96;y++)for(let x=frame*96;x<(frame+1)*96;x++){
   const p=(y*width+x)*4;
   const [r,g,b,a]=[pixels[p],pixels[p+1],pixels[p+2],pixels[p+3]];
   if(!a)transparent++;else nontransparent++;
   if(r>=240&&g>=190&&a>=200)bright++;
   if(a>60&&r<90&&g<90&&b<90)dark++;
 }
 assert(bright>=15,'bright spark present in frame '+frame);
 assert.equal(dark,0,'no opaque/dark smudge in frame '+frame);
 assert(transparent>8000,'predominantly empty/transparent frame '+frame);
 assert(nontransparent>10&&nontransparent<1200,'compact local effect '+frame);
 count.push(nontransparent);
}
for(let i=1;i<count.length;i++)
 assert(count[i]>count[i-1],'progressively larger ignition footprint');
const fx=fs.readFileSync('SeaCannonChargeFx.js','utf8');
assert(fx.includes('Phaser.BlendModes.ADD'),'light must brighten the scene');
assert(fx.includes('cannonNeedsRelease'),'held button cannot restart effects');
const sw=fs.readFileSync('sw.js','utf8');
assert(sw.includes('./assets/fx/cannon_charge_sparks.png'));
assert(Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1])>=61,
 'PWA cache must preserve luminous sparks on later releases');
console.log('PASS 3.8a.5: full PNG CRC/IDAT/filters, five bright transparent frames, additive blend and cache v61');
