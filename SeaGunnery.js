/* 3.8a — preparacao das baterias e inercia das salvas.
 * Formulas puras: sem DOM, rede, saves ou efeitos colaterais.
 */
const SEA_GUNNERY = Object.freeze({
  chargeMs(level=0) {
    const n=Math.max(0,Math.min(999999,Number(level)||0));
    // 2 segundos no nivel 0; decai exponencialmente e tende a zero.
    // O intervalo de recarga existente ainda limita salvas consecutivas.
    return 2000*Math.exp(-.105*n);
  },
  recoil(damage=0,balls=1,braces=0,mass=1) {
    const power=Math.min(80,(8+Math.max(0,Number(damage)||0)*.24)*
      Math.sqrt(Math.max(1,Number(balls)||1)));
    return power*Math.exp(-Math.max(0,Number(braces)||0)/11)/
      Math.sqrt(Math.max(.7,Number(mass)||1));
  },
  ready(heldMs,requiredMs,now,lastShot,reload) {
    return heldMs>=requiredMs &&
      Number.isFinite(now) && now-lastShot>=reload;
  }
});
