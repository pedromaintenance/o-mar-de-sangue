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
  // Armar canhões exige reduzir velas e firmar os pés no convés.
  // Uma bateria a preparar: 60% da velocidade máxima; duas: 45%.
  brace(speedSides=0) {
    const sides=Math.max(0,Math.min(2,Math.floor(Number(speedSides)||0)));
    return sides===0
      ? {speed:1,thrust:1,drag:0}
      : sides===1
        ? {speed:.60,thrust:.55,drag:.9}
        : {speed:.45,thrust:.38,drag:1.25};
  },
  recoil(damage=0,balls=1,braces=0,mass=1) {
    // 3.8a.0 gave ~11 speed units to a basic ship: imperceptible
    // because the lateral drag removes most of it in a few frames.
    // A basic battery now transfers ~65 units of lateral velocity.
    const power=Math.min(205,(16+Math.max(0,Number(damage)||0)*.38)*
      Math.sqrt(Math.max(1,Number(balls)||1))*3.2);
    return power*Math.exp(-Math.max(0,Number(braces)||0)/11)/
      Math.sqrt(Math.max(.7,Number(mass)||1));
  },
  // Contrabateria: tiros certeiros desorganizam a salva de navios comuns.
  // A janela comeca em 60% da preparacao e cada casco so pode sofrer
  // uma interrupcao a cada cinco segundos, sem bloqueio permanente.
  // Chefes, monstros e arietes conservam suas regras proprias.
  counterbatteryReady(enemy, now, requiredMs) {
    if(!enemy || enemy.dead || enemy.isMonster || enemy.boss ||
       enemy.pattern==='ram' || !(enemy.hp>0) || !Number.isFinite(now) ||
       !Number.isFinite(requiredMs) || requiredMs<=0)return false;
    const held=Number(enemy.chargeMs);
    if(!Number.isFinite(held) || held<requiredMs*.60)return false;
    const last=Number.isFinite(enemy.lastCounterbatteryAt)
      ? enemy.lastCounterbatteryAt : -Infinity;
    return now-last>=5000;
  },
  ready(heldMs,requiredMs,now,lastShot,reload) {
    return heldMs>=requiredMs &&
      Number.isFinite(now) && now-lastShot>=reload;
  }
});
