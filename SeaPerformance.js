/* O Mar de Sangue 3.6g — opt-in approximate Phaser frame diagnostics.
 * Presentation-only: no physics, enemy, economy or SeaProfile changes.
 * Phaser update delta is smoothed by the engine; figures are indicators,
 * not hardware/browser compositor benchmarks.
 */
const SEA_PERFORMANCE = {
  storageKey:'carcaca.mar.performance.visible.v1',
  enabled:false,scene:null,label:null,
  elapsedMs:0,frames:0,maxFrameMs:0,slowFrames:0,latest:null,
  load() {
    try { this.enabled=localStorage.getItem(this.storageKey)==='1'; }
    catch(_){this.enabled=false;}
    return this.enabled;
  },
  reset() {
    this.elapsedMs=0;this.frames=0;this.maxFrameMs=0;
    this.slowFrames=0;this.latest=null;
  },
  attach(scene) {
    this.detach();
    this.scene=scene;
    this.reset();
    if(this.enabled)this.show();
  },
  detach(scene) {
    if(scene&&this.scene!==scene)return;
    this.label?.destroy();
    this.scene=null;this.label=null;this.reset();
  },
  show() {
    if(!this.scene)return;
    if(!this.label){
      const {width,height}=SEA_VIEW;
      const y=SEA_DESKTOP?height-37:602;
      this.label=this.scene.add.text(width/2,y,'FPS: AMOSTRANDO…',{
        fontFamily:'monospace',fontSize:SEA_DESKTOP?'12px':'11px',
        color:'#e5d0ac',align:'center',lineSpacing:3,
        backgroundColor:'#081119e0',padding:{x:9,y:5}
      }).setOrigin(.5).setScrollFactor(0).setDepth(145);
    }
    this.label.setVisible(true);
  },
  setEnabled(value) {
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
  sample(delta) {
    // Called from Game.update; no extra RAF or listeners when disabled.
    if(!this.enabled||!this.scene||!Number.isFinite(delta)||
       delta<=0||delta>1000)return;
    this.elapsedMs+=delta;
    this.frames++;
    this.maxFrameMs=Math.max(this.maxFrameMs,delta);
    if(delta>33.3)this.slowFrames++;
    if(this.elapsedMs<1000)return;
    const mean=this.elapsedMs/this.frames;
    this.latest={
      fps:Math.round(1000/mean),
      meanMs:Math.round(mean*10)/10,
      maxMs:Math.round(this.maxFrameMs*10)/10,
      slowFrames:this.slowFrames,
      frames:this.frames
    };
    this.label?.setText('FPS ~'+this.latest.fps+' · MÉDIA '+this.latest.meanMs.toFixed(1)+'ms'+
      '\nPICO '+this.latest.maxMs.toFixed(1)+'ms · >33ms '+this.latest.slowFrames);
    this.elapsedMs=0;this.frames=0;this.maxFrameMs=0;this.slowFrames=0;
  }
};
SEA_PERFORMANCE.load();
