/* 3.6k: reference commands are from SeaPixelPolish 3.6j seaFrame. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('SeaPixelPolish.js','utf8');
function graphics(){
 const calls=[];
 return {calls,
  clear(){calls.push(['clear']);return this},
  fillStyle(...a){calls.push(['style',...a]);return this},
  fillRect(...a){calls.push(['rect',...a]);return this},
  setScrollFactor(){return this},setDepth(){return this}};
}
function reference(hash,s,t,view,desktop){
 const g=s.seaPixelG,width=view.width,height=view.height;
 const camX=s.cameras.main.scrollX||0,camY=s.cameras.main.scrollY||0;
 const tile=28,step=6,offX=((camX*.44+t*12)%tile+tile)%tile,
       offY=((camY*.37+t*8)%tile+tile)%tile;
 g.clear();
 const storm=s.seaEvent==='storm',fog=s.seaEvent==='fog',cursed=s.curse>=65;
 const count=desktop?190:110;
 for(let i=0;i<count;i++){
   const x=Math.floor(hash(i,3)*(width+tile));
   const y=Math.floor(hash(i,9)*(height+tile));
   const px=Math.floor((x-offX)/step)*step,py=Math.floor((y-offY)/step)*step;
   const flicker=hash(i,Math.floor(t*1.5));
   if(flicker<.22)continue;
   const color=storm?0x8b9ba4:
     cursed?(i%4===0?0xb54d55:0x61283b):
     i%5===0?0xbd7770:i%3===0?0x9e8d7d:0x3b7879;
   const alpha=(fog?.24:.20)+(flicker>.90?.17:0);
   g.fillStyle(color,alpha);
   g.fillRect(px,py,3+(i%3)*3,i%6===0?3:2);
   if(i%11===0){
     g.fillStyle(i%2?0xcf6b72:0x9fbbba,alpha*.72);
     g.fillRect(px+6,py+4,12,2);
   }
 }
 if(cursed||storm)for(let i=0;i<11;i++){
   const x=Math.floor((hash(i,19)*width+t*8*(i%2?1:-1)+width*8)%width);
   const y=Math.floor(hash(i,23)*height);
   g.fillStyle(cursed?0xaa354c:0xc0d0c9,.25);
   g.fillRect(x,y,18+(i%3)*9,2);
 }
}
for(const desktop of [true,false]){
 const view={width:desktop?1280:480,height:desktop?720:800};
 const context={SEA_VIEW:view,SEA_DESKTOP:desktop};vm.createContext(context);
 vm.runInContext(source+';this.pixel=SEA_PIXEL;',context);
 const pixel=context.pixel,origHash=pixel.hash.bind(pixel);
 let hashes=0;pixel.hash=function(...args){hashes++;return origHash(...args)};
 const scene=()=>({seaBase:{},seaEvent:'calm',curse:0,
   seaPixelG:graphics(),cameras:{main:{scrollX:0,scrollY:0}},
   add:{graphics}});
 const a=scene(),b=scene(),count=desktop?190:110;
 pixel.seaInit(a);reference(origHash,b,0,view,desktop);
 assert.deepEqual(a.seaPixelG.calls,b.seaPixelG.calls,'Initial frame differs');
 assert.equal(hashes,3*count+22,'First frame should hash coordinates once');
 const cache=a.seaPixelFrameCache;
 for(const [event,curse,cx,cy,t] of [
   ['calm',0,0,0,.12],['calm',0,100,210,.34],
   ['storm',0,100,210,.53],['storm',70,200,120,.65],
   ['fog',70,-20,160,.68],['calm',67,200,120,.91],
   ['maelstrom',80,1020,800,1.25],['fog',10,-640,130,2.333],
   ['storm',100,5400,-200,9.78],['calm',0,0,0,18.59]
 ]){
   a.seaEvent=b.seaEvent=event;a.curse=b.curse=curse;
   a.cameras.main.scrollX=b.cameras.main.scrollX=cx;
   a.cameras.main.scrollY=b.cameras.main.scrollY=cy;
   a.seaPixelG.calls.length=0;b.seaPixelG.calls.length=0;
   pixel.seaFrame(a,t);reference(origHash,b,t,view,desktop);
   assert.deepEqual(a.seaPixelG.calls,b.seaPixelG.calls,
     'Draw parity failure '+JSON.stringify({desktop,event,curse,t}));
   assert.strictEqual(a.seaPixelFrameCache,cache);
 }
 pixel.seaFrame(a,20.25);
 hashes=0;pixel.seaFrame(a,20.26);
 assert.equal(hashes,0,'Static flicker tick must avoid all hash calls');
 hashes=0;pixel.seaFrame(a,21.25);
 assert.equal(hashes,count,'New flicker tick hashes each pixel only once');
 assert.equal(cache.points.length,count);
 assert.equal(cache.accents.length,11);
 pixel.seaInit(a);
 assert.notStrictEqual(a.seaPixelFrameCache,cache,'Scene reset must rebuild cache');
 console.log('PASS 3.6k sea draw parity',desktop?'desktop':'mobile');
}
