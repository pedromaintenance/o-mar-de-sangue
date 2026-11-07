/* O Mar de Sangue — motor de abordagens (laboratório CT-001).
 * Inativo para inimigos comuns: somente spawnEnemy(...,{capturable:true}).
 * Um navio capturável perde propulsão e armas abaixo de 24% do casco;
 * NÃO afunda, NÃO concede loot nem conta como navio destruído.
 * A abordagem é a curta distância, com baixa velocidade relativa.
 */
const SEA_BOARDING = Object.freeze({
  disableAt:0.24,
  maxGap:138,
  maxPlayerSpeed:67,
  maxRelativeSpeed:74,
  onDamage(s,e){
    if(!e?.capturable||e.dead||e.captured)return false;
    if(e.boardingDisabled){e.hp=Math.max(1,Math.min(e.maxhp,e.hp));return false;}
    if(!Number.isFinite(e.hp)||!Number.isFinite(e.maxhp)||e.maxhp<=0||
       e.hp>e.maxhp*this.disableAt)return false;
    e.hp=Math.max(1,Math.round(e.maxhp*.16));
    e.boardingDisabled=true;
    e.vx=(Number(e.vx)||0)*.25;
    e.vy=(Number(e.vy)||0)*.25;
    e.cooldown=Infinity;e.chargeMs=0;e.chargeStage=0;
    e.label?.setText('⚓ NAVIO AVARIADO · ABORDÁVEL');
    e.label?.setColor?.('#d8ebc0');
    s?.announce?.('VELAS E CANHÕES INUTILIZADOS · APROXIME-SE DEVAGAR PARA ABORDAR');
    return true;
  },
  updateDisabled(s,e,dt){
    if(!e?.boardingDisabled||e.dead||e.captured)return false;
    const safeDt=Math.max(0,Math.min(.1,Number(dt)||0));
    const damp=Math.exp(-4*safeDt);
    e.vx=(Number(e.vx)||0)*damp;
    e.vy=(Number(e.vy)||0)*damp;
    e.x+=e.vx*safeDt;
    e.y+=e.vy*safeDt;
    e.chargeMs=0;e.chargeStage=0;
    s?.collideWorldBounds?.(e);
    for(const isl of s?.islands||[]){s?.collideRock?.(e,isl,false);if(e.dead)break;}
    return true;
  },
  nearest(s){
    if(!s?.player||s.ended||s.sinking||s.islandDocked)return null;
    const pv=s.playerVelocity||{x:0,y:0};
    const speed=Math.hypot(pv.x||0,pv.y||0);
    let chosen=null;
    for(const e of s.enemies||[]){
      if(e.dead||e.captured||!e.capturable||!e.boardingDisabled)continue;
      const distance=Math.hypot(s.player.x-e.x,s.player.y-e.y);
      const gap=distance-(s.hullRadius||0)-e.radius;
      if(gap < -20 || gap > this.maxGap)continue;
      const relativeSpeed=Math.hypot((pv.x||0)-(e.vx||0),(pv.y||0)-(e.vy||0));
      const candidate={boarding:true,enemy:e,gap,speed,relativeSpeed,
        allowed:speed<=this.maxPlayerSpeed&&relativeSpeed<=this.maxRelativeSpeed};
      if(!chosen||gap<chosen.gap)chosen=candidate;
    }
    return chosen;
  },
  board(s,e){
    const near=this.nearest(s);
    if(!near||!near.allowed||near.enemy!==e)return false;
    e.captured=true;
    e.dead=true;
    for(const key of ['ship','wake','bar','label'])e[key]?.destroy?.();
    s.capturedVessels=(s.capturedVessels||0)+1;
    s.islandCandidate=null;
    s.anchorButton?.setVisible?.(false);
    s.anchorText?.setVisible?.(false);
    s.anchorHint?.setVisible?.(false);
    s.anchorPulse?.clear?.();
    s?.announce?.('ABORDAGEM CONCLUÍDA · EMBARCAÇÃO CAPTURADA, NÃO AFUNDADA');
    // Apenas contrato explicitamente interessado em captura recebe o callback.
    if(typeof SEA_CONTRACTS!=='undefined')SEA_CONTRACTS.onCapture?.(s,e);
    return true;
  }
});
