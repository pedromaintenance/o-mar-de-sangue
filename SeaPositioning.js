/* V103 — O costado importa. Geometria pura: sem sprite, save ou aleatoriedade.
 * Rumos: 0 aponta para cima, PI/2 para a direita.
 * Vetor do projétil ALINHADO à proa = aproxima-se pela popa.
 */
const SEA_POSITIONING=Object.freeze({
  zone(heading,vx,vy) {
    if(!Number.isFinite(heading)||!Number.isFinite(vx)||
       !Number.isFinite(vy))return 'broadside';
    const speed=Math.hypot(vx,vy);
    if(speed<1)return 'broadside';
    const dot=(Math.sin(heading)*vx-Math.cos(heading)*vy)/speed;
    return dot>=.72?'stern':dot<=-.72?'bow':'broadside';
  },
  impact(raw,heading,vx,vy,elite=false) {
    const zone=this.zone(heading,vx,vy);
    const multiplier=zone==='stern'?(elite?1.10:1.20):
      zone==='bow'?(elite?.95:.90):1;
    const base=Number.isFinite(raw)?Math.max(0,raw):0;
    // Só a direção modifica o dano: broadside mantém o valor original.
    return {zone,multiplier,damage:Math.max(1,Math.round(base*multiplier))};
  }
});
