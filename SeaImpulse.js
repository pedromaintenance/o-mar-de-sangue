/* 3.8b — Arrancada naval; somente fórmulas determinísticas.
 * Cooldown inicia no acionamento: 10s no nível 0, tende a 2s.
 * Invulnerabilidade NÃO é concedida: abalroamentos continuam arriscados.
 */
const SEA_IMPULSE=Object.freeze({
    duration:.7,
    cooldown(level=0) {
        const n=Math.max(0,Math.min(999999,Number(level)||0));
        return 2+8*Math.exp(-.13*n);
    },
    ready(now,last,level=0) {
        return Number.isFinite(now) && now>=0 &&
            now-(Number.isFinite(last)?last:-1000)>=this.cooldown(level)-1e-8;
    },
    speedFactor(remaining) {
        const phase=Math.max(0,Math.min(1,(Number(remaining)||0)/this.duration));
        return 1+.85*Math.pow(phase,.45);
    },
    thrust(maxSpeed) {
        return Math.max(0,Number(maxSpeed)||0)*1.35;
    }
});
