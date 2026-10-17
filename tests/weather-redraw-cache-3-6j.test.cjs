/* 3.6j — pure visual weather cache contract; no browser/GPU required. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('SeaWeather.js','utf8');
const tests=[true,false];
for(const desktop of tests){
 const ctx={SEA_VIEW:{width:desktop?1280:480,height:desktop?720:800},
   SEA_DESKTOP:desktop,localStorage:{getItem:()=>null},
   SEA_AUDIO:{enabled:false},SEA_MATH:{clamp:(v,min,max)=>Math.min(max,Math.max(min,v))}};
 vm.createContext(ctx);
 vm.runInContext(src+';this.weather=SEA_WEATHER;',ctx);
 const w=ctx.weather;
 const calls={mist:0,overlay:0,label:0,barClear:0,barFill:0,
   skyClear:0,skyLine:0,skyFog:0,poolClear:0,poolCircle:0};
 function shape(kind){
   return {setAlpha(){calls.mist++;return this},
    setFillStyle(){calls.overlay++;return this},
    setText(){calls.label++;return this},
    clear(){
      if(kind==='bar')calls.barClear++;
      if(kind==='sky')calls.skyClear++;
      if(kind==='pool')calls.poolClear++;
      return this;
    },fillStyle(){return this},fillRect(){
      if(kind==='bar')calls.barFill++;
      return this;
    },lineStyle(){return this},lineBetween(){calls.skyLine++;return this},
    fillEllipse(){calls.skyFog++;return this},
    strokeCircle(){calls.poolCircle++;return this},
    fillCircle(){calls.poolCircle++;return this}};
 }
 const s={seaEvent:'calm',seaWeatherFrame:.13,seaMist:shape('mist'),
   seaOverlay:shape('overlay'),seaSky:shape('sky'),
   seaPoolArt:shape('pool'),seaWeatherLabel:shape('label'),
   seaCurseBar:shape('bar'),curse:18,seaCurrent:{x:0,y:0},
   elapsed:12,seaPool:null,seaRenderedEvent:null,
   seaRenderedLabel:null,seaRenderedCurseBar:null,
   seaPoolArtActive:false,seaSkyHasContent:false,
   playerVelocity:{x:23,y:12},gold:88,shipHP:100};
 w.render(s,.016);
 assert.equal(calls.mist,1);
 assert.equal(calls.overlay,1);
 assert.equal(calls.barClear,1);
 assert.equal(calls.barFill,2);
 assert.equal(calls.label,1);
 const baseline={...calls};
 for(let i=0;i<75;i++){
   s.seaWeatherFrame=.13;w.render(s,.016);
 }
 assert.deepEqual(calls,baseline,'Static calm state must not draw identical content again');
 const physics=[s.playerVelocity.x,s.playerVelocity.y,s.gold,s.shipHP];
 s.curse=18.11;s.seaWeatherFrame=.13;w.render(s,.016);
 assert.equal(calls.barClear,baseline.barClear,
   'Subpixel curse change does not force bar redraw');
 assert.equal(calls.label,baseline.label);
 s.curse=21;
 w.render(s,.016);
 assert.equal(calls.barClear,baseline.barClear+1);
 assert.equal(calls.label,baseline.label+1);
 s.seaEvent='storm';s.seaWeatherFrame=.13;
 w.render(s,.016);
 assert.equal(calls.mist,2);
 assert.equal(calls.overlay,2);
 assert.equal(calls.skyClear,1);
 assert.equal(calls.skyLine,desktop?86:38,
   'Storm geometry count unchanged');
 s.seaWeatherFrame=.13;w.render(s,.016);
 assert.equal(calls.skyLine,desktop?172:76,
   'Storm visuals keep original redraw cadence');
 assert.equal(calls.overlay,2);
 s.seaEvent='calm';s.seaWeatherFrame=.13;w.render(s,.016);
 assert.equal(calls.skyClear,3,'Leaving storm clears its old lines once');
 assert.equal(calls.mist,3);
 s.seaWeatherFrame=.13;w.render(s,.016);
 assert.equal(calls.skyClear,3,'Calm never clears an already empty sky');
 s.seaEvent='fog';s.seaWeatherFrame=.13;w.render(s,.016);
 assert.equal(calls.skyFog,13);
 s.seaEvent='calm';s.seaWeatherFrame=.13;w.render(s,.016);
 assert.equal(calls.skyClear,5,'Leaving fog also clears sky once');
 const poolStart=calls.poolClear;
 s.seaEvent='maelstrom';
 s.seaPool={x:100,y:200,age:3,life:19};
 s.seaWeatherFrame=.13;w.render(s,.016);
 assert.equal(calls.poolClear,poolStart+1);
 assert.equal(calls.poolCircle,15,'Maelstrom geometry preserved');
 s.seaPool=null;s.seaEvent='calm';
 w.render(s,.016);
 assert.equal(calls.poolClear,poolStart+2,'Leaving pool erases its art once');
 w.render(s,.016);
 assert.equal(calls.poolClear,poolStart+2,'Inactive pool stays idle');
 assert.deepEqual([s.playerVelocity.x,s.playerVelocity.y,s.gold,s.shipHP],physics,
   'Cosmetic redraw cannot alter player state');
 console.log('PASS 3.6j weather cache',desktop?'desktop':'mobile',calls);
}
