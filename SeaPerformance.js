/* O Mar de Sangue 3.6g — opt-in approximate Phaser frame diagnostics.
 * Presentation-only: no physics, enemy, economy or SeaProfile changes.
 * Phaser update delta is smoothed by the engine; figures are indicators,
 * not hardware/browser compositor benchmarks.
 */
const SEA_PERFORMANCE = {
  storageKey:'carcaca.mar.performance.visible.v1',
  enabled:false,scene:null,label:null,
  elapsedMs:0,frames:0,maxFrameMs:0,slowFrames:0,latest:null,
  fxReadings:0,fxTotal:0,fxPeak:0,fxAtLimit:0,fxLimit:0,
  // Memory-only bounded window samples. No FPS history in localStorage.
  history:[],lastVoyage:null,startedAt:null,seconds:0,maxSamples:180,
  load() {
    try { this.enabled=localStorage.getItem(this.storageKey)==='1'; }
    catch(_){this.enabled=false;}
    return this.enabled;
  },
  reset() {
    this.elapsedMs=0;this.frames=0;this.maxFrameMs=0;
    this.slowFrames=0;this.latest=null;
    this.fxReadings=0;this.fxTotal=0;this.fxPeak=0;
    this.fxAtLimit=0;this.fxLimit=0;
  },
  attach(scene) {
    this.detach();
    this.scene=scene;
    this.history=[];this.seconds=0;this.startedAt=new Date().toISOString();
    this.reset();
    if(this.enabled)this.show();
  },
  detach(scene) {
    if(scene&&this.scene!==scene)return;
    if(this.scene&&this.history.length)this.lastVoyage=this.makeReport(
      this.history,this.startedAt,'viagem-concluida',this.seconds);
    this.label?.destroy();
    this.scene=null;this.label=null;this.reset();
    this.history=[];this.seconds=0;this.startedAt=null;
  },
  show() {
    if(!this.scene)return;
    if(!this.label){
      const {width,height}=SEA_VIEW;
      const y=SEA_DESKTOP?height-37:580;
      this.label=this.scene.add.text(width/2,y,'FPS: AMOSTRANDO…',{
        fontFamily:'monospace',fontSize:SEA_DESKTOP?'12px':'11px',
        color:'#e5d0ac',align:'center',lineSpacing:3,
        backgroundColor:'#081119e0',padding:{x:9,y:5}
      }).setOrigin(.5).setScrollFactor(0).setDepth(145);
    }
    this.label.setVisible(true);
  },
  setEnabled(value) {
    if(this.enabled&& !value &&this.scene&&this.history.length){
      this.lastVoyage=this.makeReport(
        this.history,this.startedAt,'captura-interrompida',this.seconds);
    }
    this.enabled=!!value;
    try {localStorage.setItem(this.storageKey,this.enabled?'1':'0');}
    catch(_){/* Remains usable in this session when storage is blocked. */}
    this.reset();
    if(this.enabled){
      this.show();
      this.label?.setText('FPS: AMOSTRANDO…');
    } else {
      this.label?.setVisible(false);
    }
    return this.enabled;
  },
  toggle() {return this.setEnabled(!this.enabled);},
  makeReport(samples,startedAt,source,seconds) {
    if(!samples.length)return null;
    const windows=samples.map(s=>({
      ...s,...(s.effectBudget?{effectBudget:{...s.effectBudget}}:{})
    })); // deep copy optional effects telemetry
    const fpsSorted=windows.map(s=>s.fps).sort((a,b)=>a-b);
    const sum=key=>windows.reduce((acc,s)=>acc+s[key],0);
    const hasFx=windows.every(s=>s.effectBudget);
    const effectSummary=hasFx?{effectBudget:{
      meanActive:Math.round(windows.reduce((total,s)=>
        total+s.effectBudget.meanActive*s.frames,0)/sum('frames')*10)/10,
      peakActive:Math.max(...windows.map(s=>s.effectBudget.peakActive)),
      limit:Math.max(...windows.map(s=>s.effectBudget.limit)),
      atLimitFrames:windows.reduce((total,s)=>total+s.effectBudget.atLimitFrames,0)
    }}:{};
    return {
      format:'mar-de-sangue-performance-report',schema:1,
      capturedAt:new Date().toISOString(),source,
      view:SEA_DESKTOP?'desktop':'compact',
      metric:'Phaser Game.update delta (estimativa suavizada; não GPU)',
      startedAt,
      seconds:Math.round(seconds*10)/10,
      retainedWindows:windows.length,
      rollingLimit:this.maxSamples,
      truncated:seconds>this.maxSamples+2,
      summary:{
        minFps:fpsSorted[0],
        medianFps:fpsSorted[Math.floor((fpsSorted.length-1)/2)],
        meanFps:Math.round(sum('fps')/windows.length),
        worstFrameMs:Math.max(...windows.map(s=>s.maxMs)),
        slowFrames:sum('slowFrames'),
        updateFrames:sum('frames'),
        ...effectSummary
      },
      samples:windows
    };
  },
  report() {
    if(this.scene&&this.history.length)
      return this.makeReport(this.history,this.startedAt,'viagem-em-andamento',this.seconds);
    return this.lastVoyage?{
      ...this.lastVoyage,
      summary:{...this.lastVoyage.summary,
        ...(this.lastVoyage.summary.effectBudget?{
          effectBudget:{...this.lastVoyage.summary.effectBudget}}:{})},
      samples:this.lastVoyage.samples.map(s=>({...s,
        ...(s.effectBudget?{effectBudget:{...s.effectBudget}}:{})}))
    }:null;
  },
  sample(delta) {
    // Called from Game.update; no extra RAF or listeners when disabled.
    if(!this.enabled||!this.scene||!Number.isFinite(delta)||
       delta<=0||delta>1000)return;
    this.elapsedMs+=delta;
    this.frames++;
    this.maxFrameMs=Math.max(this.maxFrameMs,delta);
    if(delta>33.3)this.slowFrames++;
    // Passive reading of the existing FX budget. No effect is created,
    // suppressed or reconfigured by the performance observer.
    const active=this.scene.effectsActive,limit=this.scene.effectsLimit;
    if(Number.isInteger(active)&&Number.isInteger(limit)&&
       limit>0&&limit<=1000&&active>=0&&active<=limit){
      this.fxReadings++;
      this.fxTotal+=active;
      this.fxPeak=Math.max(this.fxPeak,active);
      this.fxLimit=limit;
      if(active===limit)this.fxAtLimit++;
    }
    if(this.elapsedMs<1000)return;
    const mean=this.elapsedMs/this.frames;
    this.seconds+=this.elapsedMs/1000;
    this.latest={
      second:Math.round(this.seconds*10)/10,
      fps:Math.round(1000/mean),
      meanMs:Math.round(mean*10)/10,
      maxMs:Math.round(this.maxFrameMs*10)/10,
      slowFrames:this.slowFrames,
      frames:this.frames
    };
    if(this.fxReadings){
      this.latest.effectBudget={
        meanActive:Math.round(this.fxTotal/this.fxReadings*10)/10,
        peakActive:this.fxPeak,limit:this.fxLimit,
        atLimitFrames:this.fxAtLimit
      };
    }
    this.history.push({...this.latest,
      ...(this.latest.effectBudget?{
        effectBudget:{...this.latest.effectBudget}}:{})});
    if(this.history.length>this.maxSamples)this.history.shift();
    this.label?.setText('FPS ~'+this.latest.fps+' · MÉDIA '+this.latest.meanMs.toFixed(1)+'ms'+
      '\nPICO '+this.latest.maxMs.toFixed(1)+'ms · >33ms '+this.latest.slowFrames+
      (this.latest.effectBudget?'\nFX '+this.latest.effectBudget.peakActive+'/'+
        this.latest.effectBudget.limit+' · NO LIMITE '+this.latest.effectBudget.atLimitFrames:''));
    this.elapsedMs=0;this.frames=0;this.maxFrameMs=0;this.slowFrames=0;
    this.fxReadings=0;this.fxTotal=0;this.fxPeak=0;
    this.fxAtLimit=0;this.fxLimit=0;
  }
};
SEA_PERFORMANCE.load();
