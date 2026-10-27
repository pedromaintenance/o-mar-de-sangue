// O MAR DE SANGUE v1.9.0 — o arquipélago dos condenados e encontros de costa
/*
 * O MAR DE SANGUE — Pixel Art & Bestiário Abissal v1.0 — CARCAÇA
 * Aplicação web independente (GitHub Pages/PWA). Usa Phaser e imagens locais.
 * Salve a pasta inteira; não é um script isolado para editor online.
 * Sistema de abalroamento e colisões baseado na versão v0.2/v0.3.
 * Teclado: WASD/setas, Q bombordo, E estibordo, espaço ambos, ESC pausa.
 * Progresso local v3 é migrado para v4 automaticamente.
 */
// Xbox/USB/Bluetooth gamepads, via the native Gamepad API (no CDN or add-ons).
// Standard mapping: left stick axes 0/1, LT/RT 6/7, LB/RB 4/5,
// A 0, B 1, Menu/Start 9, D-pad 12-15.
// Modo desktop: canvas horizontal real, sem controles móveis sobrepostos.
// Usa o dispositivo (mouse/teclado), não só a proporção da janela,
// para evitar esconder os comandos num celular em paisagem.
// A disposição 16:9 é comum ao PC e ao telefone; apenas a entrada varia.
const SEA_DESKTOP = true;
const SEA_TOUCH = typeof window !== 'undefined' && (
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '') ||
    !!window.matchMedia?.('(pointer: coarse)').matches);
const SEA_VIEW = { width: 1280, height: 720 };

const SEA_GAMEPAD = {
    previous: [], lastId: null,
    poll() {
        const neutral = { connected: false, x: 0, y: 0, port: false, starboard: false,
            up: false, down: false, left: false, right: false, a: false, b: false, menu: false, just: {} };
        if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function' ||
            (typeof document !== 'undefined' && document.visibilityState === 'hidden')) {
            this.previous = []; this.lastId = null; return neutral;
        }
        let pads;
        try { pads = navigator.getGamepads(); } catch (_) { this.previous = []; return neutral; }
        const pad = Array.from(pads || []).find(g => g && g.connected !== false);
        if (!pad) { this.previous = []; this.lastId = null; return neutral; }
        const padId = String(pad.index) + ':' + String(pad.id);
        if (padId !== this.lastId) { this.previous = []; this.lastId = padId; }
        const pressed = index => {
            const button = pad.buttons && pad.buttons[index];
            return !!button && (!!button.pressed || Number(button.value || 0) > .38);
        };
        const a = Number(pad.axes?.[0]) || 0, b = Number(pad.axes?.[1]) || 0;
        const magnitude = Math.min(1, Math.hypot(a, b)), deadzone = .16;
        const level = magnitude <= deadzone ? 0 : (magnitude - deadzone) / (1 - deadzone);
        const x = magnitude ? a / magnitude * level : 0, y = magnitude ? b / magnitude * level : 0;
        const buttons = Array.from({ length: 16 }, (_, i) => pressed(i));
        const just = {};
        for (let i = 0; i < buttons.length; i++) just[i] = buttons[i] && !this.previous[i];
        this.previous = buttons;
        return { connected: true, id: pad.id, x, y,
            port: buttons[6] || buttons[4], starboard: buttons[7] || buttons[5],
            up: buttons[12] || y < -.65, down: buttons[13] || y > .65,
            left: buttons[14] || x < -.65, right: buttons[15] || x > .65,
            a: buttons[0], b: buttons[1], menu: buttons[9], just };
    }
};
const SEA_SAVE_V4 = 'carcaca.mar-de-sangue.v4';
const SEA_SAVE_V3 = 'carcaca.mar-de-sangue.shipyard.v3';
let SEA_SESSION = null;
const SEA_MATH = {
    safe(n) { return Number.isFinite(n) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(n))) : Number.MAX_SAFE_INTEGER; },
    cost(base, factor, level) { return this.safe(Math.ceil(base * Math.pow(factor, Math.min(1000, level)))); },
    nice(n) { n = Math.max(0, n || 0); return n >= 1e12 ? (n / 1e12).toFixed(2) + 'T' : n >= 1e9 ? (n / 1e9).toFixed(2) + 'B' : n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(1) + 'k' : String(Math.floor(n)); },
    clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
};
const SEA_UPGRADES = [
    { id: 'casco', icon: '▣', name: 'Casco de Ironwood', desc: '+35 integridade máxima', base: 35, factor: 1.47, group: 'casco' },
    { id: 'blindagem', icon: '◈', name: 'Placas de Golzdov', desc: 'Reduz dano de projéteis e rochas', base: 85, factor: 1.52, group: 'casco' },
    { id: 'velas', icon: '▲', name: 'Velas Escarlates', desc: '+20 velocidade e aceleração', base: 30, factor: 1.46, group: 'motor' },
    { id: 'leme', icon: '⌁', name: 'Leme Ancestral', desc: 'Curvas mais rápidas', base: 25, factor: 1.44, group: 'motor' },
    { id: 'impulso', icon: '➶', name: 'Mestres da Arrancada', desc: 'Recarga do impulso: 10s, tende exponencialmente a 2s', base: 75, factor: 1.55, group: 'motor' },
    { id: 'canhoes', icon: '✹', name: 'Canhões Rúnicos', desc: '+7 dano por bola de canhão', base: 40, factor: 1.49, group: 'armas' },
    { id: 'cadencia', icon: '❖', name: 'Serventes Treinados', desc: 'Reduz exponencialmente a preparação do tiro (2s inicialmente)', base: 65, factor: 1.54, group: 'armas' },
    { id: 'bateria', icon: '☷', name: 'Baterias Geminadas', desc: 'Mais projéteis por bordo a cada 3 níveis', base: 120, factor: 1.58, group: 'armas' },
    { id: 'alcance', icon: '➤', name: 'Pólvora Alquímica', desc: 'Projéteis mais rápidos e mais alcance', base: 52, factor: 1.48, group: 'armas' },
    { id: 'esporao', icon: '⚔', name: 'Esporão de Golzdov', desc: 'Amplifica dano de abalroamento', base: 45, factor: 1.52, group: 'casco' },
    { id: 'reforco', icon: '⬡', name: 'Escoras do Abismo', desc: 'Menos dano de choque e recuo dos canhões', base: 70, factor: 1.51, group: 'casco' },
    { id: 'oficina', icon: '✚', name: 'Carpinteiros de Bordo', desc: 'Reparo lento fora de combate', base: 110, factor: 1.57, group: 'apoio' },
    { id: 'ima', icon: '◉', name: 'Rede dos Catadores', desc: 'Captura ouro a uma distância maior', base: 44, factor: 1.48, group: 'apoio' },
    { id: 'cofre', icon: '◇', name: 'Cofre do Capitão', desc: 'Mais ouro resgatado por viagem', base: 65, factor: 1.59, group: 'apoio' },
    { id: 'cartas', icon: '✦', name: 'Cartas de Navegação', desc: 'Amplia o alcance do radar', base: 48, factor: 1.49, group: 'apoio' }
];
const SEA_MISSION_TITLES = [
    'O Ouro de Portomonte', 'Carga nas Águas Rubras', 'As Sentinelas de Daegon',
    'O Bloqueio dos Mercadores', 'O Almirante da Lua Morta', 'Rota dos Náufragos',
    'O Tesouro do Arquipélago', 'O Cerco dos Quatro Faróis', 'Sombras da Garganta',
    'A Ira do Kraken', 'Piratas da Maré Cinzenta', 'Os Cofres da Costa Sul',
    'O Reino de Peixes Mortos', 'A Caçada dos Ossos', 'Dagon, o Ídolo das Águas',
    'Os Dentes de Daegon', 'O Resgate das Redes', 'Tempestade na Boca do Abismo',
    'A Guarda do Mar Vermelho', 'A Fortaleza Abissal', 'Sinos sob as Ondas',
    'As Esmeraldas Perdidas', 'O Horizonte dos Afogados', 'A Frota das Lanternas',
    'O Trono Naval da Noite'
];
const SEA_FOES = {
    patrulha: { name: 'Patrulha da Corte', tint: 0xa47d8d, hp: 60, speed: 100, atk: 10, reward: 22, radius: 58, mass: 1, range: 430, cooldown: 1900, pattern: 'broadside' },
    corsario: { name: 'Corsário de Sangue', tint: 0xcc746b, hp: 68, speed: 150, atk: 11, reward: 29, radius: 54, mass: .95, range: 330, cooldown: 1150, pattern: 'chase' },
    ariete: { name: 'Aríete do Abismo', tint: 0xe1a765, hp: 125, speed: 160, atk: 9, reward: 41, radius: 78, mass: 1.85, range: 125, cooldown: 5000, pattern: 'ram' },
    fragata: { name: 'Fragata Sombria', tint: 0x9177bc, hp: 135, speed: 108, atk: 18, reward: 49, radius: 70, mass: 1.55, range: 510, cooldown: 1750, pattern: 'broadside' },
    bombardeiro: { name: 'Bombardeiro Élfico', tint: 0xb8b1a7, hp: 90, speed: 82, atk: 23, reward: 57, radius: 64, mass: 1.1, range: 670, cooldown: 2450, pattern: 'sniper' },
    espectral: { name: 'Nau Espectral', tint: 0x7fd0c2, hp: 115, speed: 133, atk: 20, reward: 62, radius: 62, mass: 1.05, range: 490, cooldown: 1400, pattern: 'flank' },
    galeao: { name: 'Galeão Uln-Shayr', tint: 0xefb9b8, hp: 205, speed: 89, atk: 27, reward: 95, radius: 86, mass: 2.5, range: 550, cooldown: 1700, pattern: 'broadside' },
    almirante: { name: 'Almirante das Sombras', tint: 0xffc970, hp: 390, speed: 117, atk: 36, reward: 170, radius: 102, mass: 3.4, range: 670, cooldown: 1150, pattern: 'boss' },
    cultista: { name: 'Nau do Culto de Daegon', hp: 170, speed: 107, atk: 23, reward: 84, radius: 76, mass: 2.2, range: 530, cooldown: 1750, pattern: 'broadside' },
    nauabissal: { name: 'Fortaleza Abissal', hp: 470, speed: 74, atk: 43, reward: 210, radius: 118, mass: 4.2, range: 590, cooldown: 1280, pattern: 'boss' },
    enguia: { name: 'Enguia das Profundezas', hp: 77, speed: 183, atk: 16, reward: 39, radius: 52, mass: .78, range: 168, cooldown: 2500, pattern: 'chase' },
    afogados: { name: 'Cortejo dos Afogados', hp: 100, speed: 125, atk: 18, reward: 53, radius: 60, mass: .91, range: 335, cooldown: 1900, pattern: 'flank' },
    coral: { name: 'Horror de Coral', hp: 143, speed: 64, atk: 22, reward: 62, radius: 76, mass: 1.65, range: 480, cooldown: 2250, pattern: 'sniper' },
    caranguejo: { name: 'Guardião Caranguejo', hp: 196, speed: 92, atk: 22, reward: 75, radius: 84, mass: 2.8, range: 145, cooldown: 5000, pattern: 'ram' },
    tartaruga: { name: 'Templo-Tartaruga', hp: 268, speed: 58, atk: 28, reward: 109, radius: 102, mass: 3.6, range: 445, cooldown: 2400, pattern: 'broadside' },
    kraken: { name: 'KRAKEN — O Abismo Desperta', hp: 690, speed: 61, atk: 53, reward: 380, radius: 166, mass: 7.5, range: 380, cooldown: 2750, pattern: 'tentacle' },
    dagon: { name: 'DAGON · Arauto de Daegon', hp: 860, speed: 78, atk: 56, reward: 510, radius: 176, mass: 8.7, range: 590, cooldown: 2150, pattern: 'abyss' }
};
const SeaProfile = {
    defaults() { const levels = {}; for (const x of SEA_UPGRADES) levels[x.id] = 0;
        return { version: 4, gold: 55, levels, sorties: 0, wins: 0, losses: 0, kills: 0, rammings: 0, earned: 0, best: 0,
            mission: 1, bestMission: 0, bestWave: 0, mode: 'mission' }; },
    load() {
        let raw = SEA_SESSION;
        try { raw = JSON.parse(localStorage.getItem(SEA_SAVE_V4)) || JSON.parse(localStorage.getItem(SEA_SAVE_V3)) || raw; } catch (e) {
            try { raw = JSON.parse(localStorage.getItem(SEA_SAVE_V3)) || raw; } catch (_) { /* editor sandbox */ }
        }
        const def = this.defaults();
        if (!raw || !raw.levels || typeof raw.gold !== 'number') return def;
        const levels = { ...def.levels };
        for (const u of SEA_UPGRADES) levels[u.id] = SEA_MATH.clamp(Math.floor(Number(raw.levels[u.id]) || 0), 0, 999999);
        const p = { ...def, ...raw, version: 4, levels, gold: SEA_MATH.safe(raw.gold), mission: Math.max(1, Math.floor(raw.mission || 1)),
            bestMission: Math.max(0, Math.floor(raw.bestMission || 0)), bestWave: Math.max(0, Math.floor(raw.bestWave || 0)) };
        if (!['mission', 'sandbox'].includes(p.mode)) p.mode = 'mission';
        return p;
    },
    store(p) { SEA_SESSION = JSON.parse(JSON.stringify(p)); try { localStorage.setItem(SEA_SAVE_V4, JSON.stringify(p)); } catch (_) { /* keep RAM copy */ } },
    price(u, level) { return SEA_MATH.cost(u.base, u.factor, level); },
    stats(p) {
        const u = p.levels;
        return {
            maxHP: 100 + u.casco * 35,
            armor: .82 * (1 - Math.exp(-u.blindagem / 18)),
            rockReduction: .72 * (1 - Math.exp(-(u.blindagem + u.casco * .35) / 20)),
            accel: 180 + u.velas * 25, maxSpeed: 198 + u.velas * 20,
            turnSpeed: 2.25 + 3.1 * (1 - Math.exp(-u.leme / 14)),
            cannonDamage: 23 + u.canhoes * 7, reload: Math.max(90, 360 / (1 + u.cadencia * .12)),
            balls: Math.min(7, 1 + Math.floor(u.bateria / 3)),
            shotSpeed: 440 + Math.min(660, u.alcance * 22), shotTTL: 1.25 + Math.min(2.5, u.alcance * .10),
            ramDamage: 1 + u.esporao * .25, ramProtection: .8 * (1 - Math.exp(-u.reforco / 15)),
            repair: Math.min(25, u.oficina * .45), pickup: 43 + Math.min(270, u.ima * 12),
            goldBonus: 1 + u.cofre * .15, radar: 460 + Math.min(1750, u.cartas * 95)
        };
    },
    buy(id) {
        const p = this.load(); const u = SEA_UPGRADES.find(x => x.id === id);
        if (!u) return { ok: false, error: 'Melhoria não encontrada' };
        const cost = this.price(u, p.levels[id]);
        if (p.gold < cost) return { ok: false, error: 'Ouro insuficiente' };
        p.gold -= cost; p.levels[id]++; this.store(p);
        return { ok: true, level: p.levels[id], gold: p.gold, cost };
    },
    selectMode(mode) { const p = this.load(); p.mode = mode; this.store(p); },
    settle(opts) {
        const p = this.load(); const won = !!opts.won, withdrawn = !!opts.withdrawn;
        const retention = won ? 1 : withdrawn ? .75 : .4;
        const reward = SEA_MATH.safe(Math.floor(opts.collected * retention * (1 + p.levels.cofre * .15)));
        p.gold = SEA_MATH.safe(p.gold + reward); p.earned = SEA_MATH.safe(p.earned + reward);
        p.sorties++; if (won) p.wins++; else if (!withdrawn) p.losses++;
        p.kills += opts.kills; p.rammings += opts.rammings;
        p.best = Math.max(p.best, opts.collected); p.bestWave = Math.max(p.bestWave, opts.wave || 0);
        if (opts.mode === 'mission' && won) {
            p.bestMission = Math.max(p.bestMission, opts.stage);
            p.mission = Math.max(p.mission, opts.stage + 1);
        }
        this.store(p);
        return { ...opts, reward, retention, bank: p.gold, mission: p.mission };
    },
    reset() { this.store(this.defaults()); }
};

// Corrige o posicionamento deslocado pelo centralizador do editor Phaser.
// O canvas usa dimensões calculadas pelo Scale.FIT, mas o posicionamento é
// centralizado em relação à janela do preview, não às margens do container.
function seaCenterCanvas(game) {
    if (typeof document === 'undefined') return;
    const canvas = game && game.canvas;
    if (!canvas || !canvas.style) return;
    const st = canvas.style;
    st.setProperty('position', 'fixed', 'important');
    st.setProperty('left', '50%', 'important');
    st.setProperty('top', '50%', 'important');
    st.setProperty('transform', 'translate(-50%, -50%)', 'important');
    st.setProperty('margin', '0', 'important');
    st.setProperty('display', 'block', 'important');
}


// Cosmetic motion is always applied to render objects, never to physics positions.
const SEA_VISUALS = {
    distance2(a,b,c,d) { const dx=a-c,dy=b-d; return dx*dx+dy*dy; },
    frames(name) { return Array.from({length:4},(_,i)=>'fx-'+name+'-'+i); },
    cyclic(name,sec) { return 'fx-'+name+'-'+(Math.floor(sec*9)%4); },
    lerp(a,b,t) { return a+(b-a)*t; }
};

class SeaBoot extends Phaser.Scene {
    constructor() { super('SeaBoot'); }
    preload() {
        this.load.setPath('');
        this.load.image('menu-bg', 'assets/menu_bg.png');
        this.load.image('sea-base', 'assets/tiles/sea_base.png');
        this.load.image('sea-blood', 'assets/tiles/sea_blood.png');
        this.load.image('sea-foam', 'assets/tiles/sea_foam.png');
        this.load.image('sea-mist', 'assets/tiles/sea_mist.png');
        this.load.image('player-ship', 'assets/sprites/player_ship.png');
        this.load.image('foe-sloop', 'assets/sprites/enemy_court_ship.png');
        this.load.image('foe-galleon', 'assets/sprites/enemy_galleon.png');
        this.load.image('foe-ram', 'assets/sprites/enemy_ram.png');
        this.load.image('foe-corsair', 'assets/sprites/enemy_corsair.png');
        this.load.image('foe-bombard', 'assets/sprites/enemy_bombard.png');
        this.load.image('foe-spectral', 'assets/sprites/enemy_spectral.png');
        this.load.image('foe-admiral', 'assets/sprites/enemy_admiral.png');
        this.load.image('foe-cult', 'assets/abyss/cult_barge.png');
        this.load.image('foe-dreadnought', 'assets/abyss/dreadnought.png');
        this.load.image('foe-drowned', 'assets/abyss/drowned_choir.png');
        this.load.image('foe-coral', 'assets/abyss/coral_horror.png');
        this.load.image('foe-shell', 'assets/abyss/shell_guardian.png');
        this.load.image('foe-turtle', 'assets/abyss/temple_turtle.png');
        this.load.image('boss-kraken', 'assets/abyss/kraken.png');
        // Arauto de Dagon: spritesheet fornecida pelo criador (4 x 512×682).
        // Carregada uma vez; ele não altera a orientação visual ao navegar.
        this.load.spritesheet('dagon-animated', 'assets/v15/beast_dagon.png', {
            frameWidth:512, frameHeight:682, endFrame:3
        });
        this.load.image('fx-tentacle', 'assets/abyss/kraken_tentacle.png');
        this.load.image('fx-dagon-eye', 'assets/abyss/dagon_eye.png');
        this.load.spritesheet('fx-cannon-charge', 'assets/fx/cannon_charge_sparks.png', {frameWidth:96,frameHeight:96,endFrame:4});
        this.load.image('fx-splash-0', 'assets/fx/splash_0.png');
        this.load.image('fx-splash-1', 'assets/fx/splash_1.png');
        this.load.image('fx-splash-2', 'assets/fx/splash_2.png');
        this.load.image('fx-splash-3', 'assets/fx/splash_3.png');
        this.load.image('v15-chapel', 'assets/v15/ship_chapel.png');
        this.load.image('v15-blood', 'assets/v15/ship_blood.png');
        this.load.image('v15-royal', 'assets/v15/ship_royal.png');
        this.load.image('v15-ram', 'assets/v15/ship_ram.png');
        this.load.image('v15-spectral', 'assets/v15/ship_spectral.png');
        this.load.image('v15-admiral', 'assets/v15/ship_admiral.png');
        this.load.image('v15-sloop', 'assets/v15/ship_sloop.png');
        this.load.image('v15-merchant', 'assets/v15/ship_merchant.png');
        this.load.image('v15-flagship', 'assets/v15/ship_flagship.png');
        this.load.image('v15-wrecked', 'assets/v15/ship_wrecked.png');
        this.load.image('v15-kraken', 'assets/v15/beast_kraken.png');
        // O novo Dagon usa exclusivamente a textura dagon-animated.
        this.load.image('v15-tentacle', 'assets/v15/beast_tentacle.png');
        this.load.image('v15-drowned', 'assets/v15/beast_drowned.png');
        // Original-resolution transparent serpent sheet: 4 frames, 512 × 565 px each.
        // Its head is at the BOTTOM: paintEnemies offsets its artwork by 180 degrees.
        this.load.spritesheet('eel-swim', 'assets/v15/beast_eel_swim.webp', {
            frameWidth:512, frameHeight:565, endFrame:3
        });
        this.load.image('v15-coral', 'assets/v15/beast_coral.png');
        this.load.image('v15-fx-0', 'assets/v15/fx_frame_00.png');
        this.load.image('v15-fx-1', 'assets/v15/fx_frame_01.png');
        this.load.image('v15-fx-2', 'assets/v15/fx_frame_02.png');
        this.load.image('v15-fx-3', 'assets/v15/fx_frame_03.png');
        this.load.image('v15-fx-4', 'assets/v15/fx_frame_04.png');
        this.load.image('v15-fx-5', 'assets/v15/fx_frame_05.png');
        this.load.image('v15-fx-6', 'assets/v15/fx_frame_06.png');
        this.load.image('v15-fx-7', 'assets/v15/fx_frame_07.png');
        this.load.image('v15-fx-8', 'assets/v15/fx_frame_08.png');
        this.load.image('v15-fx-9', 'assets/v15/fx_frame_09.png');
        this.load.image('v15-fx-10', 'assets/v15/fx_frame_10.png');
        this.load.image('v15-fx-11', 'assets/v15/fx_frame_11.png');
        this.load.image('v15-fx-12', 'assets/v15/fx_frame_12.png');
        this.load.image('v15-fx-13', 'assets/v15/fx_frame_13.png');
        this.load.image('v15-fx-14', 'assets/v15/fx_frame_14.png');
        this.load.image('v15-fx-15', 'assets/v15/fx_frame_15.png');
        this.load.image('fx-muzzle-0', 'assets/fx/muzzle_0.png');
        this.load.image('fx-muzzle-1', 'assets/fx/muzzle_1.png');
        this.load.image('fx-muzzle-2', 'assets/fx/muzzle_2.png');
        this.load.image('fx-muzzle-3', 'assets/fx/muzzle_3.png');
        this.load.image('fx-splinters-0', 'assets/fx/splinters_0.png');
        this.load.image('fx-splinters-1', 'assets/fx/splinters_1.png');
        this.load.image('fx-splinters-2', 'assets/fx/splinters_2.png');
        this.load.image('fx-splinters-3', 'assets/fx/splinters_3.png');
        this.load.image('fx-foam-0', 'assets/fx/foam_0.png');
        this.load.image('fx-foam-1', 'assets/fx/foam_1.png');
        this.load.image('fx-foam-2', 'assets/fx/foam_2.png');
        this.load.image('fx-foam-3', 'assets/fx/foam_3.png');
        this.load.image('fx-gold-0', 'assets/fx/gold_0.png');
        this.load.image('fx-gold-1', 'assets/fx/gold_1.png');
        this.load.image('fx-gold-2', 'assets/fx/gold_2.png');
        this.load.image('fx-gold-3', 'assets/fx/gold_3.png');
        this.load.image('fx-violet-0', 'assets/fx/violet_0.png');
        this.load.image('fx-violet-1', 'assets/fx/violet_1.png');
        this.load.image('fx-violet-2', 'assets/fx/violet_2.png');
        this.load.image('fx-violet-3', 'assets/fx/violet_3.png');
        this.load.image('fx-blast-0', 'assets/fx/blast_0.png');
        this.load.image('fx-blast-1', 'assets/fx/blast_1.png');
        this.load.image('fx-blast-2', 'assets/fx/blast_2.png');
        this.load.image('fx-blast-3', 'assets/fx/blast_3.png');
        this.load.image('fx-smoke-0', 'assets/fx/smoke_0.png');
        this.load.image('fx-smoke-1', 'assets/fx/smoke_1.png');
        this.load.image('fx-smoke-2', 'assets/fx/smoke_2.png');
        this.load.image('fx-smoke-3', 'assets/fx/smoke_3.png');
        this.load.image('fx-shrine-glow', 'assets/fx/shrine_glow.png');
        this.load.image('island-reef', 'assets/islands/island_reef.png');
        this.load.image('island-ruin', 'assets/islands/island_ruin.png');
        this.load.image('island-monastery', 'assets/islands/island_monastery.png');
        this.load.image('island-daegon', 'assets/islands/island_daegon.png');
        this.load.image('island-demeter', 'assets/islands/island_demeter.png');
        this.load.image('island-wreck', 'assets/islands/island_wreck.png');
        this.load.image('treasure-coin', 'assets/items/treasure_coin.png');
        this.load.image('treasure-crate', 'assets/items/treasure_crate.png');
        this.load.image('treasure-chest', 'assets/items/treasure_chest.png');
        this.load.image('command-console-analog', 'assets/ui/command_console_analog.png');
        this.load.image('hud-helm-landscape', 'assets/ui/hud-helm-landscape.png');
        this.load.image('hud-combat-landscape', 'assets/ui/hud-combat-landscape.png');
        this.load.image('upgrade-hull', 'assets/upgrades/upgrade_hull.png');
        this.load.image('upgrade-sails', 'assets/upgrades/upgrade_sails.png');
        this.load.image('upgrade-guns', 'assets/upgrades/upgrade_guns.png');
        this.load.image('upgrade-ram', 'assets/upgrades/upgrade_ram.png');

        const cx = this.scale.width / 2;
        const cy = this.scale.height / 2;
        this.add.rectangle(cx, cy, 426, 28, 0x0f1720, .88).setStrokeStyle(1, 0xcaa077);
        this._bar = this.add.rectangle(cx - 208, cy, 4, 20, 0xe6c58f).setOrigin(0, .5);
        this._txt = this.add.text(cx, cy - 44, 'Carregando O Mar de Sangue…', {
            fontFamily: 'Georgia', fontSize: '18px', color: '#f6d59b'
        }).setOrigin(.5);
        this.load.on('progress', (v)=>{ this._bar.width = 4 + 416 * v; });
    }
    create() { this.scene.start('SeaPort'); }
}

class SeaPort extends Phaser.Scene {
    constructor() { super('SeaPort'); }
    init(data) {
        this.page=data?.page||'menu';
        this.mode=data?.mode||SeaProfile.load().mode;
        this.yardGroup=data?.group||'armas';
        this.report=data?.report||null;
    }
    create() {
        seaCenterCanvas(this.game);
        SEA_MUSIC.setMood('crimson');
        SEA_MUSIC.load();
        // O porto é completamente independente da renderização procedimental
        // do Phaser. O jogo começa somente ao pressionar um botão de ação.
        if (typeof SEA_PORT_UI !== 'undefined' && SEA_PORT_UI.mount(this))return;
        console.error('A interface do porto não carregou. Exibindo acesso emergencial.');
        const center=SEA_VIEW.width/2;
        this.add.rectangle(center,SEA_VIEW.height/2,SEA_VIEW.width,SEA_VIEW.height,0x10151e);
        this.add.text(center,SEA_VIEW.height*.28,'O MAR DE SANGUE',{
            fontFamily:'Georgia',fontSize:'30px',color:'#f4d3a0'}).setOrigin(.5);
        const addFallback=(label,y,handler)=>{
            const t=this.add.text(center,y,label,{fontFamily:'Georgia',
                fontSize:'20px',color:'#ffdfab',
                backgroundColor:'#362630',padding:{x:20,y:13}})
                .setOrigin(.5).setInteractive({useHandCursor:true});
            t.on('pointerdown',handler);
        };
        addFallback('MISSÕES',SEA_VIEW.height*.47,()=>{
            const p=SeaProfile.load();SeaProfile.selectMode('mission');
            this.scene.start('Game',{mode:'mission',stage:p.mission});
        });
        addFallback('SANDBOX',SEA_VIEW.height*.59,()=>{
            SeaProfile.selectMode('sandbox');this.scene.start('Game',{mode:'sandbox'});
        });
    }
    update(time,delta) {
        SEA_MUSIC.tick(Math.min((delta||16)/1000,.05),'port');
        if (typeof SEA_PORT_UI !== 'undefined' && SEA_PORT_UI.scene===this)
            SEA_PORT_UI.update(time);
    }
}

class Game extends Phaser.Scene {
    constructor() { super('Game'); }
    init(data) {
        const p = SeaProfile.load();
        this.mode = data?.mode || p.mode || 'mission';
        this.stage = data?.stage || p.mission || 1;
        this.wave = 1;
        this.contractId = this.mode==='sandbox' && ['rescue','smuggle','hunt'].includes(data?.contract) ? data.contract : null;
    }
    create() {
        seaCenterCanvas(this.game);
        this.W = 4400; this.H = 3400;
        this.profile = SeaProfile.load(); this.shipStats = SeaProfile.stats(this.profile);
        this.maxShipHP = this.shipStats.maxHP;
        this.shipHP = this.maxShipHP;
        this.playerVelocity = { x: 0, y: 0 }; this.hullRadius = 68;
        this.gold = 0; this.kills = 0; this.bossKills = 0; this.rammingSinks = 0; this.impactCount = 0; this.rockHits = 0;
        this.impactMessage = null; this.pauseElements = null; this.huntKills=0;
        this.elapsed = 0; this.waveElapsed = 0; this.ended = false; this.pausedByCaptain = false;
        this.gracePeriod = 3.0; // tempo para orientar o navio antes do primeiro ataque
        this.resultsBanked = false; this.speed = 0; this.lastImpact = -1000;
        this.lastRockContact = -1000; this.lastShot = -1000;
        this.lastPortShot = -1000; this.lastStarboardShot = -1000; this.lastDamageTime = -1000;
        // Controle independente por dedo: a mão do leme não impede a dos canhões.
        this.joystick = { id: null, x: 0, y: 0, centerX: 140, centerY: 576, radius: 55, deadzone: .12 };
        this.cannonPointers = new Map();
        this.cannonCharge = {port:0,starboard:0};
        // Um único disparo por acionamento: soltar é obrigatório para rearmar.
        this.cannonNeedsRelease = {port:false,starboard:false};
        this.cannonBracing = 0;
        this.recoilVisual = 0;this.recoilDamping = 0;
        this.impulseRemaining=0;this.lastImpulseAt=-1000;
        this.impulseKeyHeld=false;this.impulseTapQueued=false;
        this.shots = []; this.enemies = []; this.islands = []; this.treasures = [];
        this.landmarkGlows = []; this.flotsam = []; this.effectsActive = 0; this.effectsLimit = 48;
        this.foeSerial = 0; this.waveClock = 0; this.nextSpawnTime = 0; this.targetKills = 0; this.targetGold = 0;
        this.survivalTime = 0; this.goalName = ''; this.bossAlert = '';
        this.currentDifficulty = this.mode === 'mission' ? this.stage : 1;
        if (this.mode === 'mission') {
            this.objective = this.stage % 5 === 0 ? 'boss' : this.stage % 4 === 1 ? 'kill' : this.stage % 4 === 2 ? 'cargo' : this.stage % 4 === 3 ? 'survive' : 'hunt';
            this.targetKills = this.objective === 'boss' ? 1 : 3 + Math.ceil(this.stage * .75);
            this.targetGold = 70 + this.stage * 28;
            this.survivalTime = 50 + this.stage * 3;
            this.huntTarget = 1 + Math.floor(this.stage / 9); this.huntKills = 0;
        } else { this.objective = 'endless'; }
        this.cameras.main.setBackgroundColor('#2b1929'); this.cameras.main.setBounds(0, 0, this.W, this.H);
        this.createSeaLayers();
        SEA_PIXEL.seaInit(this);
        this.buildWorld();
        const start = this.findWaterSpot(this.W / 2, this.H / 2, 400);
        this.player = this.add.container(start.x, start.y).setDepth(20);
        const playerScale = (this.hullRadius * 2.25) / this.textures.get('player-ship').getSourceImage().height;
        this.playerSprite = this.add.image(0, 0, 'player-ship').setScale(playerScale);
        this.upgradeLayer = this.add.container(0, 0);
        this.playerVisual = this.add.container(0, 0);
        this.playerVisual.add([this.playerSprite, this.upgradeLayer]);
        SEA_COMBAT.init(this);
        this.player.add(this.playerVisual);
        this.playerWake = this.add.image(start.x,start.y,'fx-foam-0').setDepth(13).setAlpha(0).setScale(1.75);
        this.decorateUpgradedShip();
        SEA_CHARGE_FX.init(this);
        this.playerHull = {
            ship: this.player, isPlayer: true, radius: this.hullRadius, mass: 1.5,
            get x() { return this.ship.x; }, set x(v) { this.ship.x = v; },
            get y() { return this.ship.y; }, set y(v) { this.ship.y = v; },
            get heading() { return this.ship.rotation; },
            get lastRamming() { return this.ship._lastRamming ?? -1000; },
            set lastRamming(v) { this.ship._lastRamming = v; }
        };
        this.cameras.main.startFollow(this.player, true, .095, .095);
        const startingFoes = this.mode === 'mission' ? (this.objective === 'boss' ? 5 : 7) : 6;
        for (let i = 0; i < startingFoes; i++) this.spawnEnemy(this.chooseFoe(i), 430 + i * 95);
        if (this.objective === 'boss') {
            const bossTypes = ['almirante','kraken','dagon','nauabissal'];
            this.missionBoss = bossTypes[(Math.floor(this.stage / 5) - 1) % bossTypes.length];
            this.spawnEnemy(this.missionBoss, this.missionBoss === 'kraken' ? 560 : 600);
            this.bossAlert = `ALERTA · ${SEA_FOES[this.missionBoss].name}`;
        }
        if (this.objective === 'hunt') for(let j = 0; j < Math.min(3,this.huntTarget); j++) this.spawnEnemy('fragata', 570 + j * 90);
        this.createHUD();
        SEA_PERFORMANCE.attach(this);
        SEA_WEATHER.init(this);
        SEA_ISLANDS.init(this);
        SEA_ATLAS.init(this);
        SEA_CONTRACTS.init(this,this.contractId);
        SEA_POLITICAL_EVENTS.init(this);
        SEA_MUSIC.load();
        SEA_AUDIO.bind(this, SEA_DESKTOP ? 520 : 468, 22, true);
        this.createTouchControls();
        if (this.bossAlert) this.announce(this.bossAlert);
        this.keys = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,SPACE,Q,E,R,ESC,P,ENTER,F,M');
        // Não vincular eventos de disparo imediato: updateCannonCharge
        // é o único caminho do jogador e exige press→carga→tiro→release.
        this.onPause = () => {
            if (this.atlasOpen) { SEA_ATLAS.close(this); return; }
            if (this.islandDocked) SEA_ISLANDS.close(this);
            else if (!this.ended) this.toggleCaptainMenu();
        };
        this.onDock = e => { if (!e?.repeat && !this.atlasOpen) SEA_ISLANDS.tryDock(this); };
        this.onAtlas = e => { if(!e?.repeat) SEA_ATLAS.toggle(this); };
        this.onPerformance = e => {if(!e?.repeat) SEA_PERFORMANCE.toggle();};
        // Q/E/ESPAÇO agora são lidos enquanto estão pressionados por quadro.
        // Não disparar instantaneamente no keydown.
        this.input.keyboard.on('keydown-ESC', this.onPause);
        this.input.keyboard.on('keydown-P', this.onPause);
        this.input.keyboard.on('keydown-F', this.onDock);
        this.input.keyboard.on('keydown-M', this.onAtlas);
        this.input.keyboard.on('keydown-F3', this.onPerformance);
        this.onPauseMenuKey = e => {
            if (this.atlasOpen) {
                if (e.code === 'ArrowDown' || e.code === 'ArrowRight') {
                    e.preventDefault?.(); SEA_ATLAS.focus(this,1);
                } else if (e.code === 'ArrowUp' || e.code === 'ArrowLeft') {
                    e.preventDefault?.(); SEA_ATLAS.focus(this,-1);
                } else if (e.code === 'Enter') {
                    e.preventDefault?.(); SEA_ATLAS.mark(this);
                }
                return;
            }
            if (this.islandDocked) {
                if (e.code === 'ArrowDown' || e.code === 'ArrowUp') {
                    e.preventDefault?.();
                    SEA_ISLANDS.navigate(this,e.code==='ArrowDown'?1:-1);
                } else if (e.code === 'Enter') SEA_ISLANDS.select(this);
                return;
            }
            if (!this.pausedByCaptain || !this.pausePadOptions?.length) return;
            if (e.code === 'ArrowDown') {
                e.preventDefault?.(); this.setPausePadFocus((this.pausePadIndex + 1) % this.pausePadOptions.length);
            } else if (e.code === 'ArrowUp') {
                e.preventDefault?.(); this.setPausePadFocus((this.pausePadIndex - 1 + this.pausePadOptions.length) % this.pausePadOptions.length);
            } else if (e.code === 'Enter') this.pausePadOptions[this.pausePadIndex].onTap();
        };
        this.input.keyboard.on('keydown', this.onPauseMenuKey);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.keyboard.off('keydown-SPACE', this.onBoth);
            this.input.keyboard.off('keydown-Q', this.onPort);
            this.input.keyboard.off('keydown-E', this.onStarboard);
            this.input.keyboard.off('keydown-ESC', this.onPause);
            this.input.keyboard.off('keydown-P', this.onPause);
            this.input.keyboard.off('keydown-F', this.onDock);
            this.input.keyboard.off('keydown-M', this.onAtlas);
            this.input.keyboard.off('keydown-F3', this.onPerformance);
            SEA_PERFORMANCE.detach(this);
            this.input.keyboard.off('keydown', this.onPauseMenuKey);
        });
        // Eventos por pointer: soltar um dedo NÃO cancela o movimento dos demais.
        // Mouse (desktop) usa Phaser. Touch (celular) usa changedTouches diretamente:
        // Phaser pode reciclar a atribuição de pointers quando um de dois dedos sai.
        this.input.on('pointerdown', p => {
            if (!this.isNativeTouchPointer(p)) {
                if (!this.handleCaptainPointer(p.x, p.y)) this.touchStart(p);
            }
        });
        this.input.on('pointermove', p => { if (!this.isNativeTouchPointer(p)) this.touchMove(p); });
        this.input.on('pointerup', p => { if (!this.isNativeTouchPointer(p)) this.touchEnd(p); });
        this.input.on('pointerupoutside', p => { if (!this.isNativeTouchPointer(p)) this.touchEnd(p); });
        if (SEA_TOUCH) this.installNativeTouch();
        this.onLoseFocus = () => this.touchReset();
        window.addEventListener('blur', this.onLoseFocus);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.touchReset();
            this.removeNativeTouch();
            window.removeEventListener('blur', this.onLoseFocus);
        });
        const tip = this.add.text(SEA_VIEW.width / 2, 137,
            (this.contract ? 'CONTRATO · '+SEA_CONTRACTS.offers[this.contract.id].title :
             this.mode === 'mission' ? `MISSÃO ${this.stage}` : 'SANDBOX INFINITO') +
            (SEA_DESKTOP
                ? '\nSEGURE Q/E ATÉ A SALVA · SOLTAR CANCELA A CARGA\nR: IMPULSO PARA FUGIR OU ABALROAR · X NO XBOX'
                : '\nARRASTE O ANALÓGICO PARA NAVEGAR!\nSEGURE ATÉ DISPARAR · SOLTAR CANCELA A CARGA\nCARREGAR DESACELERA · SOLTE PARA REARMAR'), {
                fontFamily: 'Georgia', fontSize: '15px', color: '#ffe4bc', align: 'center', lineSpacing: 6,
                backgroundColor: '#111e29eb', padding: { x: 12, y: 12 }
            }).setOrigin(.5, 0).setDepth(160).setScrollFactor(0);
        this.tweens.add({ targets: tip, alpha: 0, delay: 3700, duration: 950, onComplete: () => tip.destroy() });
        this.updateHUD();
    }
    decorateUpgradedShip() {
        const lv = this.profile.levels;
        if (!this.upgradeLayer || !this.playerSprite) return;
        this.upgradeLayer.removeAll(true);
        const scale = this.playerSprite.scaleX || 1;
        const addOverlay = (key, tint = null, alpha = 1, extraScale = 1) => {
            const img = this.add.image(0, 0, key).setScale(scale * extraScale).setAlpha(alpha);
            if (tint !== null) img.setTint(tint);
            this.upgradeLayer.add(img);
            return img;
        };
        const hullScore = (lv.casco || 0) + (lv.blindagem || 0);
        if (hullScore > 0) {
            const tint = hullScore >= 24 ? 0xffd08a : hullScore >= 12 ? 0xe6bd82 : 0xcaa27d;
            addOverlay('upgrade-hull', tint, Math.min(.96, .48 + hullScore * .03));
        }
        const sailScore = (lv.velas || 0);
        if (sailScore > 0) {
            const tint = sailScore >= 18 ? 0xffd37d : sailScore >= 9 ? 0xf1c06e : 0xdca0a8;
            addOverlay('upgrade-sails', tint, Math.min(.95, .35 + sailScore * .05));
        }
        const gunScore = (lv.canhoes || 0) + (lv.bateria || 0);
        if (gunScore > 0) {
            const tint = gunScore >= 20 ? 0x1e2632 : 0x111923;
            addOverlay('upgrade-guns', tint, Math.min(.98, .45 + gunScore * .03));
        }
        const ramScore = (lv.esporao || 0);
        if (ramScore > 0) {
            const tint = ramScore >= 16 ? 0xffd388 : ramScore >= 8 ? 0xd6dee8 : 0xb3c1cf;
            addOverlay('upgrade-ram', tint, Math.min(.98, .5 + ramScore * .05));
        }
    }
    createSeaLayers() {
        this.seaBase = this.add.tileSprite(SEA_VIEW.width / 2, SEA_VIEW.height / 2, SEA_VIEW.width, SEA_VIEW.height, 'sea-base').setScrollFactor(0).setDepth(-110);
        this.seaBlood = this.add.tileSprite(SEA_VIEW.width / 2, SEA_VIEW.height / 2, SEA_VIEW.width, SEA_VIEW.height, 'sea-blood').setScrollFactor(0).setDepth(-109).setAlpha(.85);
        this.seaFoam = this.add.tileSprite(SEA_VIEW.width / 2, SEA_VIEW.height / 2, SEA_VIEW.width, SEA_VIEW.height, 'sea-foam').setScrollFactor(0).setDepth(-108).setAlpha(.56);
        this.seaMist = this.add.tileSprite(SEA_VIEW.width / 2, SEA_VIEW.height / 2, SEA_VIEW.width, SEA_VIEW.height, 'sea-mist').setScrollFactor(0).setDepth(-107).setAlpha(.57);
    }
    drawShipTextures() { return; }
    buildWorld() {
        const rng = new Phaser.Math.RandomDataGenerator(['carcaca-mar-sangue-pwa']);
        const spots = [];
        const kinds = ['reef', 'ruin', 'monastery', 'daegon', 'demeter', 'wreck'];
        for (let row = 0; row < 5; row++) for (let col = 0; col < 7; col++) {
            const x = 295 + col * 628 + rng.between(-145, 145);
            const y = 285 + row * 670 + rng.between(-150, 150);
            if (Math.hypot(x - this.W / 2, y - this.H / 2) < 570) continue;
            spots.push([x, y, rng.between(52, 108), kinds[(row * 7 + col) % kinds.length]]);
        }
        for (let i = 0; i < 35; i++) {
            const x = rng.between(150, this.W - 150), y = rng.between(150, this.H - 150), radius = rng.between(22, 52);
            if (Math.hypot(x - this.W / 2, y - this.H / 2) < 550) continue;
            if (spots.some(z => Math.hypot(z[0] - x, z[1] - y) < z[2] + radius + 90)) continue;
            spots.push([x, y, radius, radius < 34 ? 'reef' : kinds[rng.between(0, kinds.length - 1)]]);
        }
        const labels = ['COSTA SUL', 'DENTES DE DAEGON', 'ILHA DAS TARTARUGAS', 'FAROL VERMELHO', 'RECIFES TABAXI', 'RUÍNAS DE TETRA', 'PORTO DE SAL', 'ILHA DO TEMPLO'];
        const keyMap = { reef: 'island-reef', ruin: 'island-ruin', monastery: 'island-monastery', daegon: 'island-daegon', demeter: 'island-demeter', wreck: 'island-wreck', parley: 'island-wreck' };
        // Exactly one of the existing wreck landmarks hosts the political
        // encounter per voyage; position, dimensions and RNG are unchanged.
        let parleyPlaced = false;
        spots.forEach(([x, y, radius, baseKind], i) => {
            const kind = baseKind === 'wreck' && !parleyPlaced ? 'parley' : baseKind;
            if(kind === 'parley') parleyPlaced = true;
            this.islands.push({ id: i, x, y, radius, kind });
            const islandScaleMap = { reef: 1.0, ruin: 1.0, monastery: 1.08, daegon: 1.0, demeter: 1.08, wreck: 1.08 };
            const img = this.add.image(x, y, keyMap[kind] || 'island-reef').setDepth(0).setScale(((radius * 2.8) / 256) * (islandScaleMap[kind] || 1));
            if (kind !== 'reef') {
                const tint = kind === 'demeter' ? 0xb6e6b1 : kind === 'daegon' ? 0xcf7894 : 0x82bbb4;
                const glow = this.add.image(x + radius*.12, y - radius*.16, 'fx-shrine-glow')
                    .setScale(Math.max(.7,radius/46)).setTint(tint).setAlpha(.28).setDepth(1);
                this.landmarkGlows.push({ glow, x, y, phase: i*.51, alpha: kind==='demeter'?.52:.30 });
            }
            if (radius > 82 && i % 3 === 0) {
                this.add.text(x, y + radius + 25, labels[i % labels.length], {
                    fontFamily: 'monospace', fontSize: '13px', color: kind === 'demeter' ? '#dde7d2' : '#e1bca0',
                    backgroundColor: '#151b24a9', padding: { x: 5, y: 3 }
                }).setOrigin(.5).setDepth(4);
            }
        });
        for (let i = 0; i < 52; i++) {
            const x = rng.between(130, this.W - 130), y = rng.between(130, this.H - 130);
            if (this.islands.some(isl => Math.hypot(isl.x - x, isl.y - y) < isl.radius + 55)) continue;
            this.dropTreasure(x, y, false, 10 + Math.floor(this.currentDifficulty * 1.1) + rng.between(0, 14));
        }
        for (let i = 0; i < 16; i++) {
            const x = rng.between(120, this.W - 120), y = rng.between(120, this.H - 120);
            if (this.islands.some(isl => Math.hypot(isl.x - x, isl.y - y) < isl.radius + 60)) continue;
            const s = this.add.image(x, y, i % 2 ? 'treasure-crate' : 'treasure-chest').setDepth(.2).setAlpha(.34).setRotation((i % 7) * .3).setScale((0.42 + (i % 3) * .06) * 1.6);
            this.flotsam.push({ sprite: s, y, phase: i*.63 });
        }
        const border = this.add.graphics().setDepth(2).lineStyle(6, 0xba8c77, .36);
        border.strokeRect(5, 5, this.W - 10, this.H - 10);
    }
    findWaterSpot(x, y, radius = 200) {
        for (let attempt = 0; attempt < 90; attempt++) {
            let px = attempt ? Phaser.Math.Between(120, this.W - 120) : x;
            let py = attempt ? Phaser.Math.Between(120, this.H - 120) : y;
            if (Math.hypot(px - this.W / 2, py - this.H / 2) < 300 && attempt > 0) continue;
            if (!this.islands.some(isl => Math.hypot(isl.x - px, isl.y - py) < isl.radius + radius)) return { x: px, y: py };
        }
        return { x: this.W / 2, y: this.H / 2 };
    }
    drawSea(t) {
        if (!this.seaBase) return;
        const sx = this.cameras.main.scrollX || 0, sy = this.cameras.main.scrollY || 0;
        this.seaBase.tilePositionX = sx * .18 + t * 9;
        this.seaBase.tilePositionY = sy * .10 + t * 6;
        this.seaBlood.tilePositionX = sx * .25 + t * 16;
        this.seaBlood.tilePositionY = sy * .16 + t * 10;
        this.seaFoam.tilePositionX = sx * .40 + t * 20;
        this.seaFoam.tilePositionY = sy * .28 + t * 15;
        this.seaMist.tilePositionX = sx * .08 - t * 3;
        this.seaMist.tilePositionY = sy * .05 - t * 2;
    }
    chooseFoe(seed = 0) {
        const rank = this.currentDifficulty;
        const pool = ['patrulha', 'corsario', 'ariete'];
        if (rank >= 2) pool.push('fragata');
        if (rank >= 3) pool.push('bombardeiro','enguia');
        if (rank >= 4) pool.push('espectral','afogados');
        if (rank >= 5) pool.push('cultista');
        if (rank >= 6) pool.push('galeao','coral');
        if (rank >= 8) pool.push('caranguejo');
        if (rank >= 10) pool.push('tartaruga');
        return pool[(Math.floor(Math.random() * pool.length) + (seed % 2)) % pool.length];
    }
    spawnEnemy(type = 'patrulha', spacing = 450) {
        const f = SEA_FOES[type]; if (!f) return null;
        if (this.enemies.filter(e => !e.dead).length >= 29) return null;
        const px = this.player?.x ?? this.W / 2, py = this.player?.y ?? this.H / 2;
        let pos = null;
        for (let tries = 0; tries < 34; tries++) {
            const angle = Math.random() * 2 * Math.PI;
            const d = spacing + Math.random() * 260;
            const x = SEA_MATH.clamp(px + Math.cos(angle) * d, 115, this.W - 115);
            const y = SEA_MATH.clamp(py + Math.sin(angle) * d, 115, this.H - 115);
            if (Math.hypot(x - px, y - py) < 190) continue;
            if (this.islands.some(isl => Math.hypot(isl.x - x, isl.y - y) < isl.radius + f.radius + 44)) continue;
            if (this.enemies.some(e => !e.dead && Math.hypot(e.x - x, e.y - y) < 110)) continue;
            pos = { x, y }; break;
        }
        if (!pos) pos = this.findWaterSpot(this.W / 2, this.H / 2, f.radius + 40);
        const scaleDifficulty = 1 + Math.max(0, this.currentDifficulty - 1) * (this.mode === 'sandbox' ? .24 : .12);
        const elite = ['almirante','nauabissal','kraken','dagon'].includes(type);
        const maxhp = Math.round(f.hp * scaleDifficulty), id = ++this.foeSerial;
        let tex = ({ ariete:'foe-ram', corsario:'foe-corsair', bombardeiro:'foe-bombard',
            espectral:'foe-spectral', fragata:'foe-galleon', galeao:'foe-galleon',
            almirante:'foe-admiral', cultista:'foe-cult', nauabissal:'foe-dreadnought',
            enguia:'eel-swim', afogados:'foe-drowned', coral:'foe-coral',
            caranguejo:'foe-shell', tartaruga:'foe-turtle', kraken:'boss-kraken', dagon:'dagon-animated' })[type] || 'foe-sloop';
        // v1.5.1 — physical and visual scales both doubled from v1.3.
        // Render height is tied to the encounter collision radius, independent of sprite source dimensions.
        const v15Visuals = { patrulha:'v15-sloop', corsario:'v15-blood', ariete:'v15-ram',
            fragata:'v15-royal', bombardeiro:'v15-chapel', espectral:'v15-spectral',
            galeao:'v15-flagship', almirante:'v15-admiral', cultista:'v15-blood',
            nauabissal:'v15-merchant', kraken:'v15-kraken', dagon:'dagon-animated',
            afogados:'v15-drowned', coral:'v15-coral' };
        if (v15Visuals[type] && this.textures.exists(v15Visuals[type])) tex = v15Visuals[type];
        const sourceH = type==='dagon' && tex==='dagon-animated' ? 682 :
            (this.textures.get(tex).getSourceImage().height || 160);
        const supernatural = ['enguia','afogados','coral','caranguejo','tartaruga','kraken','dagon'].includes(type);
        const heightFactor = supernatural ? (elite ? 2.12 : 2.02) : ['foe-galleon','foe-admiral'].includes(tex) ? 2.35 : tex === 'foe-ram' ? 2.15 : 2.45;
        const dagonInitialFrame=type==='dagon'?0:undefined;
        const ship = this.add.image(pos.x, pos.y, tex,
            type==='enguia'?0:dagonInitialFrame)
            .setScale((f.radius * 2.25) / sourceH).setDepth(15);
        const enemy = { id, type, ship, x: pos.x, y: pos.y, hp: maxhp, maxhp,
            cooldown: Phaser.Math.Between(450, 1250), heading: Math.random() * 6.28,
            speed: f.speed * (1 + Math.min(.85, this.currentDifficulty * .014)),
            atk: f.atk * (1 + Math.max(0, this.currentDifficulty - 1) * (this.mode === 'sandbox' ? .16 : .095)),
            reward: Math.round(f.reward * (1 + this.currentDifficulty * .31)),
            vx: 0, vy: 0, radius: f.radius, mass: f.mass,
            lastRockContact: -1000, lastRamming: -1000, specialPhase: 0, dead: false,
            maxRange: f.range, cooldownBase: f.cooldown, pattern: f.pattern, elite, boss: elite, bar: null };
        enemy.spriteScale = ship.scaleX;
        enemy.visualPhase = id * 1.39;
        enemy.isMonster = supernatural;
        enemy.chargeMs=0;enemy.chargeStage=0;
        enemy.wake = this.add.image(pos.x,pos.y,supernatural ? 'fx-violet-0' : 'fx-foam-0')
            .setDepth(13).setAlpha(0).setScale(supernatural ? 2.2 : 1.35);
        enemy.flashUntil = 0;
        enemy.lastHitVisualTime = -1000;
        enemy.nextDamageSmokeAt = 0;
        enemy.bar = this.add.graphics().setDepth(22);
        enemy.label = this.add.text(pos.x, pos.y - f.radius - 54, f.name, {
            fontFamily: 'monospace', fontSize: '12px', color: elite ? '#ffe2a2' : '#edb6b8',
            backgroundColor: '#131720bd', padding: { x: 2, y: 2 }
        }).setOrigin(.5).setDepth(24);
        this.enemies.push(enemy);
        return enemy;
    }
    dropTreasure(x, y, fromEnemy = false, value = 14) {
        const coin=this.add.container(x,y).setDepth(8);
        const kind=fromEnemy?'treasure-chest':((Math.floor(x+y+value)%3===0)?'treasure-crate':'treasure-coin');
        const scaleMap={'treasure-coin':.68,'treasure-crate':.84,'treasure-chest':1.0};
        coin.add(this.add.image(0,0,kind).setScale(scaleMap[kind]||.38).setAngle(((x+y)%18)-9));
        const sparkle=this.add.image(0,-22,'fx-gold-0').setScale(fromEnemy?1.02:.72).setAlpha(.72);
        coin.add(sparkle);
        this.treasures.push({x,y,coin,value:Math.round(value),taken:false,phase:(x+y)*.021,sparkle});
    }
    updateImpulse(dt,pad) {
        const held=!!this.keys?.R?.isDown;
        const pressed=(held&&!this.impulseKeyHeld)||!!pad?.just?.[2]||!!this.impulseTapQueued;
        this.impulseKeyHeld=held;this.impulseTapQueued=false;
        this.impulseRemaining=Math.max(0,(this.impulseRemaining||0)-Math.max(0,dt));
        if(!pressed||this.ended||this.sinking||this.atlasOpen||this.pausedByCaptain||this.islandDocked)return false;
        if(!SEA_IMPULSE.ready(this.elapsed,this.lastImpulseAt,this.profile?.levels?.impulso||0))return false;
        this.lastImpulseAt=this.elapsed;this.impulseRemaining=SEA_IMPULSE.duration;
        const fx=Math.sin(this.player.rotation),fy=-Math.cos(this.player.rotation);
        this.playerVelocity.x+=fx*SEA_IMPULSE.thrust(this.shipStats.maxSpeed);
        this.playerVelocity.y+=fy*SEA_IMPULSE.thrust(this.shipStats.maxSpeed);
        const sp=Math.hypot(this.playerVelocity.x,this.playerVelocity.y),cap=this.shipStats.maxSpeed*SEA_IMPULSE.speedFactor(this.impulseRemaining);
        if(sp>cap){this.playerVelocity.x*=cap/sp;this.playerVelocity.y*=cap/sp;}
        this.resetCannonCharge();
        this.cannonNeedsRelease.port=true;this.cannonNeedsRelease.starboard=true;
        this.cameras?.main?.shake?.(110,.0011);
        return true;
    }
    createHUD() {
        this.add.rectangle(SEA_DESKTOP ? 266 : 240, 51, SEA_DESKTOP ? 532 : 480, 101, 0x080e12, .97).setScrollFactor(0).setDepth(90);
        this.add.rectangle(SEA_DESKTOP ? 266 : 240, 51, SEA_DESKTOP ? 524 : 472, 93, 0x11171a, .92).setStrokeStyle(1, 0x715b45, .9).setScrollFactor(0).setDepth(91);
        // Maré Negra 3.2: graphic trim never intercepts gameplay pointers.
        this.add.rectangle(SEA_DESKTOP ? 266 : 240, 3, SEA_DESKTOP ? 518 : 466, 3, 0x8e3940, .8).setScrollFactor(0).setDepth(92);
        this.add.rectangle(SEA_DESKTOP ? 266 : 240, 30, SEA_DESKTOP ? 502 : 458, 1, 0x534337, .8).setScrollFactor(0).setDepth(92);
        this.damageFlash = this.add.rectangle(SEA_VIEW.width / 2, SEA_VIEW.height / 2,
            SEA_VIEW.width, SEA_VIEW.height, 0x99283a, 0).setScrollFactor(0).setDepth(82);
        this.statusBars=this.add.graphics().setScrollFactor(0).setDepth(101);
        this.add.text(14, 9, this.mode === 'mission' ? `MISSÃO ${this.stage} · ${SEA_MISSION_TITLES[(this.stage - 1) % SEA_MISSION_TITLES.length]}` : `O MAR DE SANGUE · SANDBOX ONDA ${this.wave}`, {
            fontFamily: 'Georgia', fontSize: '14px', fontStyle: 'bold', color: '#ddc5a4'
        }).setScrollFactor(0).setDepth(100);
        this.hud = this.add.text(14, 37, '', { fontFamily: 'monospace', fontSize: '12px', color: '#e8d9c4' }).setScrollFactor(0).setDepth(100);
        this.quest = this.add.text(15, 63, '', {
            fontFamily: 'monospace', fontSize: '12px', color: '#d2b58f'
        }).setScrollFactor(0).setDepth(100);
        // Botão visível em desktop e celular; clique e toque passam pelo mesmo
        // roteador, evitando disputas entre Phaser e o joystick nativo.
        this.pauseButtonHitbox = {x: SEA_DESKTOP ? 454 : 412, y: 78, w: 120, h: 40};
        const ph=this.pauseButtonHitbox;
        this.add.rectangle(ph.x,ph.y,ph.w,ph.h,0x301d22,.99)
            .setStrokeStyle(2,0xb98e72).setDepth(111).setScrollFactor(0);
        this.add.text(ph.x,ph.y,'☰ PAUSA',{
            fontFamily:'Georgia',fontSize:'16px',fontStyle:'bold',color:'#f3d6b5'
        }).setOrigin(.5).setDepth(112).setScrollFactor(0);
        // O botão existe em desktop e mobile; o toque nativo passa pelo roteador.
        const ib=this.impulseButtonHitbox={x:1104,y:630,w:94,h:94};
        // O botão de impulso é parte do HUD de combate. Texto de recarga discreto.
        this.impulseButtonText=this.add.text(1104,699,'',{
            fontFamily:'monospace',fontSize:'11px',fontStyle:'bold',color:'#f3d6a8',align:'center',
            backgroundColor:'#101014aa',padding:{x:3,y:1}
        }).setOrigin(.5).setScrollFactor(0).setDepth(114);
        if (!SEA_DESKTOP) this.add.text(240, 566, 'ANALÓGICO: RUMO / PROPULSÃO    •    CANHÕES LATERAIS', {
            fontFamily: 'monospace', fontSize: '10px', color: '#bbab93',
            stroke: '#101720', strokeThickness: 3
        }).setOrigin(.5).setScrollFactor(0).setDepth(103);
        this.impactMessage = this.add.text(SEA_VIEW.width / 2, 125, '', { fontFamily: 'monospace', fontSize: '16px',
            color: '#f3d8b1', align: 'center', backgroundColor: '#241419df', padding: { x: 8, y: 5 }
        }).setOrigin(.5).setScrollFactor(0).setDepth(140).setAlpha(0);
        this.radar = this.add.graphics().setScrollFactor(0).setDepth(110);
        this.add.text(SEA_DESKTOP ? SEA_VIEW.width - 112 : 390, 144, 'CARTA · M', { fontFamily: 'monospace', fontSize: '10px', color: '#c3ae8c' })
            .setScrollFactor(0).setDepth(112);
        // A small two-line sea/curse badge sits BELOW the unchanged radar.
        this.hudConditions=this.add.text(SEA_DESKTOP?SEA_VIEW.width-126:338,239,'',{
            fontFamily:'monospace',fontSize:'10px',fontStyle:'bold',color:'#c8b2a0',
            lineSpacing:2,backgroundColor:'#091014d9',padding:{x:5,y:4},
            wordWrap:{width:132}
        }).setScrollFactor(0).setDepth(112);
    }
    createTouchControls() {
        // HUDs separados: os desenhos podem ser redimensionados sem mudar as áreas de toque.
        // Em desktop, aparecem também para manter a identidade visual unificada.
        this.add.image(140, 573, 'hud-helm-landscape')
            .setDisplaySize(270, 270).setScrollFactor(0).setDepth(102).setAlpha(.94);
        this.add.image(1104, 576, 'hud-combat-landscape')
            .setDisplaySize(320, 240).setScrollFactor(0).setDepth(102).setAlpha(.96);
        const jc={x:140,y:576}, port={x:1051,y:548}, starboard={x:1158,y:548};
        this.joystick.centerX=jc.x; this.joystick.centerY=jc.y; this.joystick.radius=55;
        const shadow=this.add.circle(jc.x+2,jc.y+4,25,0x140d0c,.66)
            .setScrollFactor(0).setDepth(110);
        const knob=this.add.circle(jc.x,jc.y,24,0x704d2b,1)
            .setStrokeStyle(3,0xc79058,.96).setScrollFactor(0).setDepth(111);
        const inner=this.add.circle(jc.x,jc.y,10,0x25303d,.92)
            .setStrokeStyle(2,0xd8b17a,.8).setScrollFactor(0).setDepth(112);
        this.joystick.knob=knob;this.joystick.shadow=shadow;this.joystick.inner=inner;
        this.cannonHighlights={
            port:this.add.circle(port.x,port.y,38,0xffb35d,0).setScrollFactor(0).setDepth(108),
            starboard:this.add.circle(starboard.x,starboard.y,38,0xffb35d,0).setScrollFactor(0).setDepth(108)
        };
        this.touchLayout={
            joystick:{x:jc.x,y:jc.y,radius:94},
            port:{x:port.x,y:port.y,radius:48},
            starboard:{x:starboard.x,y:starboard.y,radius:48}
        };
        this.cannonUiFx={port,starboard};
    }
    isNativeTouchPointer(pointer) {
        const event = pointer?.event;
        return event && (event.pointerType === 'touch' ||
            event.type?.startsWith('touch') || 'changedTouches' in event);
    }
    installNativeTouch() {
        this.touchCanvas = this.game.canvas;
        const options = { passive: false };
        this.nativeTouchHandlers = {};
        const consume = (kind, event) => {
            if (!this.scene.isActive() || this.ended) return;
            event.preventDefault();
            const rect = this.touchCanvas.getBoundingClientRect();
            const xScale = this.scale.width / Math.max(1, rect.width);
            const yScale = this.scale.height / Math.max(1, rect.height);
            for (const touch of Array.from(event.changedTouches || [])) {
                const point = { id: `touch-${touch.identifier}`,
                    x: (touch.clientX - rect.left) * xScale,
                    y: (touch.clientY - rect.top) * yScale };
                if (kind === 'start' && !this.handleCaptainPointer(point.x,point.y)) this.touchStart(point);
                if (kind === 'move') this.touchMove(point);
                if (kind === 'end') this.touchEnd(point);
            }
        };
        const handlers = {
            touchstart: e => consume('start', e),
            touchmove: e => consume('move', e),
            touchend: e => consume('end', e),
            touchcancel: e => consume('end', e)
        };
        for (const [type, fn] of Object.entries(handlers)) this.touchCanvas.addEventListener(type, fn, options);
        this.nativeTouchHandlers = handlers;
    }
    removeNativeTouch() {
        if (this.touchCanvas && this.nativeTouchHandlers)
            for (const [type, fn] of Object.entries(this.nativeTouchHandlers))
                this.touchCanvas.removeEventListener(type, fn);
        this.nativeTouchHandlers = null;
    }
    touchStart(pointer) {
        if (this.ended || this.pausedByCaptain || this.islandDocked || this.atlasOpen || !pointer) return;
        if (!this.touchLayout) return; // mouse no desktop não é um joystick virtual
        const { joystick, port, starboard } = this.touchLayout;
        const near = (area) => Math.hypot(pointer.x - area.x, pointer.y - area.y) <= area.radius;
        if (near(joystick) && this.joystick.id === null) {
            this.joystick.id = pointer.id;
            this.touchMove(pointer);
            return;
        }
        // Canhões são independentes e funcionam enquanto o primeiro dedo gira o leme.
        // Ambas as baterias também podem ser acionadas com dois dedos diferentes.
        if (near(port) || near(starboard)) {
            const side = near(port) ? 'port' : 'starboard';
            this.cannonPointers.set(pointer.id, side);
            this.updateCannonHighlights();
        }
    }
    touchMove(pointer) {
        if (!pointer || this.joystick.id !== pointer.id || !this.touchLayout) return;
        const j = this.joystick;
        let x = (pointer.x - j.centerX) / j.radius;
        let y = (pointer.y - j.centerY) / j.radius;
        const magnitude = Math.hypot(x, y);
        if (magnitude > 1) { x /= magnitude; y /= magnitude; }
        // Eixos analógicos com zona morta: desvio sutil é suave; centro não deriva.
        const remap = v => Math.abs(v) < j.deadzone ? 0 : Math.sign(v) *
            (Math.abs(v) - j.deadzone) / (1 - j.deadzone);
        j.x = remap(x); j.y = remap(y);
        const dx = x * j.radius, dy = y * j.radius;
        j.knob?.setPosition(j.centerX + dx, j.centerY + dy);
        j.shadow?.setPosition(j.centerX + dx + 2, j.centerY + dy + 4);
        j.inner?.setPosition(j.centerX + dx, j.centerY + dy);
    }
    touchEnd(pointer) {
        if (!pointer) return;
        if (this.joystick?.id === pointer.id) this.releaseJoystick();
        this.cannonPointers?.delete(pointer.id);
        this.updateCannonHighlights();
    }
    releaseJoystick() {
        const j = this.joystick;
        if (!j) return;
        j.id = null; j.x = 0; j.y = 0;
        j.knob?.setPosition(j.centerX, j.centerY);
        j.shadow?.setPosition(j.centerX + 2, j.centerY + 4);
        j.inner?.setPosition(j.centerX, j.centerY);
    }
    updateCannonHighlights() {
        if (!this.cannonHighlights) return;
        const sides = new Set(this.cannonPointers.values());
        for (const [side, circle] of Object.entries(this.cannonHighlights)) {
            circle.setAlpha(sides.has(side) ? .16 : 0);
        }
    }
    touchReset() {
        this.resetCannonCharge();
        this.releaseJoystick();
        this.cannonPointers?.clear();
        this.impulseTapQueued=false;
        this.updateCannonHighlights();
    }
    resetCannonCharge() {
        if(!this.cannonCharge)return;
        // Pausa, Atlas, atracação e perda de foco interrompem a preparação.
        // Não permitir que um botão ainda pressionado reinicie a carga
        // ao fechar o modal; requer uma nova soltura.
        for(const side of ['port','starboard']){
            if(this.cannonCharge[side]>0)this.cannonNeedsRelease[side]=true;
            this.cannonCharge[side]=0;
        }
        this.cannonBracing=0;
        if(typeof SEA_CHARGE_FX!=='undefined')SEA_CHARGE_FX.clear(this);
    }
    updateCannonCharge(dt,pad) {
        if(!this.cannonCharge||!this.keys||!this.shipStats)return;
        if(this.impulseRemaining>0){
            this.resetCannonCharge();
            this.cannonNeedsRelease.port=true;this.cannonNeedsRelease.starboard=true;
            return;
        }
        const pressed={
            port:!!(this.keys.Q.isDown||this.keys.SPACE.isDown||pad?.port||
                [...(this.cannonPointers?.values()||[])].includes('port')),
            starboard:!!(this.keys.E.isDown||this.keys.SPACE.isDown||pad?.starboard||
                [...(this.cannonPointers?.values()||[])].includes('starboard'))
        };
        const required=SEA_GUNNERY.chargeMs(this.profile?.levels?.cadencia||0);
        for(const side of ['port','starboard']){
            if(!pressed[side]){
                // Apenas a soltura completa de TODAS as fontes daquele bordo
                // rearma a bateria (teclado + gamepad + múltiplos dedos).
                this.cannonCharge[side]=0;
                this.cannonNeedsRelease[side]=false;
                continue;
            }
            if(this.cannonNeedsRelease[side])continue;
            this.cannonCharge[side]=Math.min(required,this.cannonCharge[side]+
                Math.max(0,Math.min(dt,.05))*1000);
            const last=this[side==='port'?'lastPortShot':'lastStarboardShot'];
            if(SEA_GUNNERY.ready(this.cannonCharge[side],required,this.time.now,
                    last,this.shipStats.reload)&&this.fire(side)){
                this.cannonCharge[side]=0;
                this.cannonNeedsRelease[side]=true;
            }
        }
        // Only genuinely charging batteries slow the ship: holding after
        // the single shot cannot apply a fresh penalty or auto-reload.
        this.cannonBracing=Number(this.cannonCharge.port>0)+
            Number(this.cannonCharge.starboard>0);
        if(typeof SEA_CHARGE_FX!=='undefined')SEA_CHARGE_FX.sync(this);
    }
    // A proa agora aponta para cima; canhões disparam perpendicularmente ao rumo.
    // Bombordo = esquerda do capitão, estibordo = direita.
    fire(side = 'both') {
        if (!this.player || this.ended || this.sinking || this.pausedByCaptain || this.islandDocked || this.atlasOpen) return false;
        let fired = false;
        const rot = this.player.rotation;
        const rightX = Math.cos(rot), rightY = Math.sin(rot);
        const foreX = Math.sin(rot), foreY = -Math.cos(rot);
        const sides = side === 'both' ? [-1, 1] : [side === 'port' ? -1 : 1];
        for (const sign of sides) {
            const key = sign < 0 ? 'lastPortShot' : 'lastStarboardShot';
            if (this.time.now - this[key] < this.shipStats.reload) continue;
            this[key] = this.time.now;
            fired = true;
            const count = this.shipStats.balls;
            for (let j = 0; j < count; j++) {
                const along = (j - (count - 1) / 2) * 18;
                const x = this.player.x + sign * rightX * 54 + foreX * along;
                const y = this.player.y + sign * rightY * 54 + foreY * along;
                const speed = this.shipStats.shotSpeed;
                const dirX = sign * rightX, dirY = sign * rightY;
                this.makeShot(x, y, dirX * speed + this.playerVelocity.x * .22,
                    dirY * speed + this.playerVelocity.y * .22, true,
                    this.shipStats.cannonDamage, this.shipStats.shotTTL);
                this.splash(x, y, 0xffdfab, 5);
                this.v15Burst(x,y,0,.27); this.v15Burst(x,y,4,.19);
            }
            // Conservação de impulso: baterias mais fortes deslocam mais;
            // as Escoras do Abismo amortecem sem anular instantaneamente o empuxo.
            const recoil=SEA_GUNNERY.recoil(this.shipStats.cannonDamage,count,
                this.profile?.levels?.reforco||0,1.5);
            this.playerVelocity.x -= sign * rightX * recoil;
            this.playerVelocity.y -= sign * rightY * recoil;
            // The player camera follows the hull, making tiny displacements
            // hard to perceive. Brief hull lean + soft camera shake sell
            // the impulse, without moving the collision volume or hitboxes.
            this.recoilVisual=SEA_MATH.clamp((this.recoilVisual||0)-sign*recoil*.22,-24,24);
            this.recoilDamping=Math.max(this.recoilDamping||0,.5);
            this.cameras?.main?.shake?.(145,Math.min(.0038,.0016+recoil/26000));
            this.triggerCannonUiFx(sign < 0 ? 'port' : 'starboard');
        }
        if (fired) SEA_AUDIO.play('cannon', .85 + Math.min(.45, this.shipStats.balls * .11));
        return fired;
    }
    v15Burst(x,y,start=0,scale=1) {
        if (!this.textures.exists('v15-fx-'+start) || this.effectsActive >= this.effectsLimit) return;
        const spr=this.add.image(x,y,'v15-fx-'+start).setScale(scale).setDepth(48);
        this.effectsActive++;
        for(let i=1;i<4;i++) this.time.delayedCall(i*70,()=>{
            if(spr.active && this.textures.exists('v15-fx-'+(start+i))) spr.setTexture('v15-fx-'+(start+i));
        });
        this.time.delayedCall(300,()=>{if(spr.active)spr.destroy();this.effectsActive=Math.max(0,this.effectsActive-1);});
    }
    triggerCannonUiFx(side) {
        const pos = this.cannonUiFx?.[side];
        if (!pos || !this.textures.exists('fx-muzzle-0')) return;
        const spr = this.add.image(pos.x, pos.y, 'fx-muzzle-0').setScrollFactor(0).setDepth(113).setScale(0.25);
        const frames = ['v15-fx-0','v15-fx-1','v15-fx-2'];
        if (this.textures.exists(frames[0])) spr.setTexture(frames[0]);
        frames.slice(1).forEach((frame, i) => this.time.delayedCall((i + 1) * 55, () => { if (spr.active) spr.setTexture(frame); }));
        this.tweens.add({ targets: spr, alpha: 0, duration: 190, delay: 70, onComplete: () => spr.destroy() });
        const highlight = this.cannonHighlights?.[side];
        if (highlight) { highlight.setAlpha(.22); this.tweens.add({ targets: highlight, alpha: 0, duration: 180 }); }
    }

    makeShot(x, y, vx, vy, friendly, damage = 9, ttl = 1.5) {
        const sprite = this.add.circle(x, y, friendly ? 10 : 11, friendly ? 0xffd6a1 : 0xd78aa5)
            .setStrokeStyle(2, friendly ? 0xffffff : 0x512a47).setDepth(30).setAlpha(.95);
        this.shots.push({ x, y, px: x, py: y, vx, vy, friendly, object: sprite, ttl, damage });
    }
    burst(x,y,kind='blast',scale=1) {
        if(this.ended || this.effectsActive >= this.effectsLimit) return;
        const key = 'fx-'+kind+'-0';
        if(!this.textures.exists(key))return;
        const spr=this.add.image(x,y,key).setScale(scale).setDepth(46);
        this.effectsActive++;
        const duration=kind==='smoke'?520:kind==='violet'?500:340;
        this.tweens.add({targets:spr,alpha:0,scale:scale*1.22,duration,
            onUpdate: tween => { if(spr.active) spr.setTexture('fx-'+kind+'-'+Math.min(3,Math.floor(tween.progress*4))); },
            onComplete:()=>{if(spr.active)spr.destroy();this.effectsActive=Math.max(0,this.effectsActive-1);}});
    }
    animateWorldVisuals(dt=.016) {
        SEA_COMBAT.animate(this);
        // Throttled visual update. Physics uses unmodified player/enemy positions.
        const t=this.elapsed;
        if(this.playerVisual) {
            this.recoilVisual=(this.recoilVisual||0)*Math.exp(-8*Math.max(0,Math.min(dt,.05)));
            this.playerVisual.x=this.recoilVisual;
            this.playerVisual.y=Math.sin(t*3.5)*1.5;
            this.playerVisual.rotation=Math.sin(t*2.1)*.025;
        }
        const speed=Math.hypot(this.playerVelocity.x,this.playerVelocity.y);
        if(this.playerWake) {
            this.playerWake.setPosition(this.player.x - Math.sin(this.player.rotation)*62,
                this.player.y + Math.cos(this.player.rotation)*62)
                .setRotation(this.player.rotation).setTexture(SEA_VISUALS.cyclic('foam',t))
                .setAlpha(Math.min(.75, speed/175));
        }
        for(const e of this.enemies) {
            if(e.dead || !e.ship?.active)continue;
            const near=SEA_VISUALS.distance2(e.x,e.y,this.player.x,this.player.y)<1100*1100;
            if(!near) {e.ship.setVisible(false);e.wake?.setVisible(false);if(e.bar)e.bar.setVisible(false);if(e.label)e.label.setVisible(false);continue;}
            e.ship.setVisible(true);e.wake?.setVisible(true);if(e.bar)e.bar.setVisible(true);if(e.label)e.label.setVisible(true);
            const pulse=Math.sin(t*(e.boss?2.35:3.4)+e.visualPhase);
            if(e.type==='dagon' && e.ship.texture.key==='dagon-animated'){
                // Quatro quadros em sequência, sem aplicar heading à imagem.
                // Apenas a textura muda; IA, redemoinhos e conjurações continuam intactos.
                const frame=Math.floor((t*4+e.visualPhase)%4);
                if(e.dagonFrame!==frame){
                    e.ship.setFrame(frame);
                    e.dagonFrame=frame;
                }
            }
            if(e.type==='enguia' && e.ship.texture.key==='eel-swim'){
                // This is a four-frame swim loop; animation never rotates the physics body.
                const frame=Math.floor((t*5.5+e.visualPhase)%4);
                if(e.eelFrame!==frame){e.ship.setFrame(frame);e.eelFrame=frame;}
            }
            if(e.isMonster) {
                const dx=(e.type==='enguia'? .045: .012)*pulse;
                e.ship.setScale(e.spriteScale*(1+dx),e.spriteScale*(1-dx*.48));
                e.ship.setAlpha(e.type==='afogados' ? .79+.18*(.5+.5*pulse) : 1);
            } else {
                e.ship.setScale(e.spriteScale);
                e.ship.setAlpha(1);
            }
            e.ship.setY(e.y+Math.sin(t*2.7+e.visualPhase)*(e.boss?2.5:1.15));
            if(e.wake) {
                const sx=Math.sin(e.heading),sy=-Math.cos(e.heading);
                e.wake.setPosition(e.x-sx*e.radius*.85,e.y-sy*e.radius*.85)
                    .setRotation(e.heading).setTexture(SEA_VISUALS.cyclic(e.isMonster?'violet':'foam',t+e.visualPhase))
                    .setAlpha(e.isMonster?.36+Math.abs(pulse)*.28:Math.min(.7,Math.hypot(e.vx,e.vy)/180));
            }
            if(e.flashUntil && this.time.now > e.flashUntil){e.ship.clearTint();e.flashUntil=0;}
        }
        for(const o of this.landmarkGlows){
            if(!o.glow.active)continue;
            const near=SEA_VISUALS.distance2(o.x,o.y,this.player.x,this.player.y)<780*780;
            o.glow.setVisible(near);
            if(near)o.glow.setAlpha(o.alpha*(.55+.45*Math.sin(t*1.7+o.phase)**2));
        }
        for(const f of this.flotsam){
            if(!f.sprite.active)continue;
            const near=SEA_VISUALS.distance2(f.sprite.x,f.y,this.player.x,this.player.y)<750*750;
            f.sprite.setVisible(near);
            if(near)f.sprite.y=f.y+Math.sin(t*1.9+f.phase)*2;
        }
        for(const loot of this.treasures){
            if(loot.taken || !loot.coin?.active)continue;
            const near=SEA_VISUALS.distance2(loot.x,loot.y,this.player.x,this.player.y)<750*750;
            loot.coin.setVisible(near);
            if(near){
                loot.coin.y=loot.y-5+Math.sin(t*2.5+loot.phase)*3;
                if(loot.sparkle)loot.sparkle.setTexture(SEA_VISUALS.cyclic('gold',t+loot.phase)).setAlpha(.55+.3*Math.sin(t*3+loot.phase)**2);
            }
        }
    }
    pixelFx(name,x,y,scale=1) {
        const key='fx-'+name+'-0';
        if (!this.textures.exists(key)) return;
        const spr=this.add.image(x,y,key).setDepth(44).setScale(scale);
        for(let i=1;i<4;i++)this.time.delayedCall(i*62,()=>{if(spr.active)spr.setTexture('fx-'+name+'-'+i);});
        this.time.delayedCall(260,()=>{if(spr.active)spr.destroy();});
    }
    splash(x, y, color = 0xe4bbc1, r = 6) {
        this.v15Burst(x,y,8,Math.min(.46,Math.max(.16,r/90)));
        const ring = this.add.circle(x, y, r, 0x000000, 0).setStrokeStyle(2, color, .8).setDepth(11);
        this.tweens.add({ targets: ring, scale: 3, alpha: 0, duration: 380, onComplete: () => ring.destroy() });
    }
    damageShip(amount, x, y, source = 'normal') {
        if (this.ended || this.sinking || this.islandDocked || this.elapsed < this.gracePeriod || this.time.now - this.lastImpact < 330) return false;
        this.lastImpact = this.time.now; this.lastDamageTime = this.time.now;
        const reduction = source === 'rock' ? this.shipStats.rockReduction :
            source === 'ram' ? this.shipStats.ramProtection : this.shipStats.armor;
        amount = Math.max(1, Math.round(amount * (1 - reduction)));
        this.shipHP = Math.max(0, this.shipHP - amount);
        this.cameras.main.shake(120, .004); this.burst(x,y,'smoke',.75);
        this.splash(x, y, 0xffd4ad, 11);
        SEA_COMBAT.damagePlayer(this, x, y, amount);
        this.updateHUD();
        if (this.shipHP <= 0) SEA_COMBAT.sinkPlayer(this);
        return true;
    }
    // Exibe fragmentos de madeira, espuma e a força do impacto.
    impactFX(x, y, magnitude, label, isRock = false) {
        this.v15Burst(x,y,12,Math.min(.68,magnitude/580+.18)); this.burst(x,y,'blast',Math.min(2.1,magnitude/120+.7));
        const strength = Phaser.Math.Clamp(magnitude / 170, 0.25, 1);
        this.splash(x, y, isRock ? 0xffbdb1 : 0xffd69d, 9 + strength * 15);
        for (let i = 0; i < 7; i++) {
            const a = Math.PI * 2 * i / 7 + this.elapsed;
            const particle = this.add.circle(x, y, 2 + (i % 3),
                isRock ? 0xb5a8a2 : 0xc78a61).setDepth(42);
            this.tweens.add({ targets: particle,
                x: x + Math.cos(a) * (18 + magnitude * 0.19),
                y: y + Math.sin(a) * (18 + magnitude * 0.19),
                alpha: 0, scale: 0.25, duration: 350 + i * 28,
                onComplete: () => particle.destroy() });
        }
        const text = this.add.text(x, y - 40, label, {
            fontFamily: 'monospace', fontSize: '17px', fontStyle: 'bold',
            color: isRock ? '#ffc2b0' : '#ffe0a4',
            stroke: '#120c12', strokeThickness: 4
        }).setOrigin(0.5).setDepth(55);
        this.tweens.add({ targets: text, y: y - 90, alpha: 0,
            duration: 950, onComplete: () => text.destroy() });
        if (this.impactMessage) {
            this.impactMessage.setText(label);
            this.impactMessage.alpha = 1;
        }
        if (this.impactMessage) this.tweens.add({ targets: this.impactMessage,
            alpha: 0, delay: 700, duration: 420 });
        this.cameras.main.shake(100 + Math.min(125, magnitude),
            0.002 + strength * 0.005);
        SEA_AUDIO.play(isRock ? 'rock' : 'ram', strength * 1.35);
    }

    // Madeira contra rocha: obstáculo sólido, restituição, arrasto e dano.
    // body tem x,y e vx,vy; caso seja o jogador usa playerVelocity.
    collideRock(body, island, isPlayer = false) {
        const dx = body.x - island.x;
        const dy = body.y - island.y;
        const minDist = island.radius + (isPlayer ? this.hullRadius : body.radius);
        const dsq = dx * dx + dy * dy;
        if (dsq >= minDist * minDist) return false;
        const dist = Math.sqrt(dsq);
        const nx = dist > 0.00001 ? dx / dist : 1;
        const ny = dist > 0.00001 ? dy / dist : 0;
        // Resolve penetração ANTES de aplicar forças, evitando atravessar ilhas.
        body.x = island.x + nx * (minDist + 1.2);
        body.y = island.y + ny * (minDist + 1.2);
        const v = isPlayer ? this.playerVelocity : { x: body.vx, y: body.vy };
        const normalSpeed = v.x * nx + v.y * ny;
        if (normalSpeed < 0) {
            const impact = -normalSpeed;
            // Pequeno ricochete e fricção na componente tangencial.
            v.x = (v.x - (1.30 * normalSpeed) * nx) * 0.86;
            v.y = (v.y - (1.30 * normalSpeed) * ny) * 0.86;
            const now = this.time.now;
            if (impact > 29 && now - (body.lastRockContact || -1000) > 620) {
                body.lastRockContact = now;
                const dmg = Phaser.Math.Clamp(Math.round((impact - 16) * 0.17), 3, 30 + this.currentDifficulty * 2);
                if (isPlayer) {
                    this.rockHits++;
                    const hurt = this.damageShip(dmg, body.x, body.y, 'rock');
                    this.impactFX(body.x, body.y, impact,
                        hurt ? `ROCHA -${dmg} CASCO` : 'ROCHA! RICOCHETE', true);
                } else {
                    body.hp -= dmg;
                    this.impactFX(body.x, body.y, impact, `ROCHEDO -${dmg}`, true);
                    if (body.hp <= 0) this.sinkEnemy(body, false);
                }
            }
        }
        if (!isPlayer) { body.vx = v.x; body.vy = v.y; }
        return true;
    }

    // Colisão de duas embarcações com conservação aproximada de impulso.
    // O jogador pesa mais do que um barco de patrulha da Corte.
    collideShips(a, b) {
        if (a.dead || b.dead) return false;
        const nx0 = b.x - a.x, ny0 = b.y - a.y;
        const minDist = a.radius + b.radius;
        const sq = nx0 * nx0 + ny0 * ny0;
        if (sq >= minDist * minDist) return false;
        const dist = Math.sqrt(sq);
        const nx = dist > 0.00001 ? nx0 / dist : 1;
        const ny = dist > 0.00001 ? ny0 / dist : 0;
        const invA = 1 / a.mass, invB = 1 / b.mass;
        const penetration = minDist - dist + 0.6;
        a.x -= nx * penetration * invA / (invA + invB);
        a.y -= ny * penetration * invA / (invA + invB);
        b.x += nx * penetration * invB / (invA + invB);
        b.y += ny * penetration * invB / (invA + invB);
        const va = a.isPlayer ? this.playerVelocity : { x: a.vx, y: a.vy };
        const vb = b.isPlayer ? this.playerVelocity : { x: b.vx, y: b.vy };
        const closingSpeed = -((vb.x - va.x) * nx + (vb.y - va.y) * ny);
        if (closingSpeed <= 0) return true;
        // Impulso elástico parcial: faz os dois cascos se repelirem.
        const j = (1 + 0.36) * closingSpeed / (invA + invB);
        va.x -= j * invA * nx;
        va.y -= j * invA * ny;
        vb.x += j * invB * nx;
        vb.y += j * invB * ny;
        if (!a.isPlayer) { a.vx = va.x; a.vy = va.y; }
        if (!b.isPlayer) { b.vx = vb.x; b.vy = vb.y; }
        if (closingSpeed < 27) return true; // Encostar devagar não destrói o casco.
        const now = this.time.now;
        if (now - (a.lastRamming || -1000) < 530 ||
            now - (b.lastRamming || -1000) < 530) return true;
        a.lastRamming = now;
        b.lastRamming = now;
        this.impactCount++;
        const damage = Phaser.Math.Clamp(Math.round((closingSpeed - 16) * 0.14), 3, 28 + Math.floor(this.currentDifficulty * 2));
        // Bonus por abalroar com a proa alinhada ao outro barco.
        const dotA = Math.sin(a.heading) * nx - Math.cos(a.heading) * ny;
        const dotB = Math.sin(b.heading) * -nx - Math.cos(b.heading) * -ny;
        const bonusA = dotA > 0.72 ? 1.35 : 1;
        const bonusB = dotB > 0.72 ? 1.35 : 1;
        const da = Math.max(2, Math.round(damage * (bonusB > 1 ? 1.22 : 1) * (bonusA > 1 ? 0.65 : 1)));
        const db = Math.max(2, Math.round(damage * (bonusA > 1 ? 1.45 : 1) * (bonusB > 1 ? 0.65 : 1)));
        const hitX = (a.x + b.x) * 0.5, hitY = (a.y + b.y) * 0.5;
        if (a.isPlayer || b.isPlayer) {
            const pd = a.isPlayer ? da : db;
            const ed = a.isPlayer ? db : da;
            const playerHit = this.damageShip(pd, hitX, hitY, 'ram');
            const enemy = a.isPlayer ? b : a;
            enemy.hp = Math.max(0, enemy.hp - Math.round(ed * this.shipStats.ramDamage));
            this.impactFX(hitX, hitY, closingSpeed,
                `ABALROAMENTO -${playerHit ? Math.round(pd * (1 - this.shipStats.ramProtection)) : 0} / -${Math.round(ed * this.shipStats.ramDamage)}`);
            if (enemy.hp <= 0) this.sinkEnemy(enemy, true);
        } else {
            a.hp -= da;
            b.hp -= db;
            this.impactFX(hitX, hitY, closingSpeed,
                `CASCO CONTRA CASCO`);
            if (a.hp <= 0) this.sinkEnemy(a, false);
            if (b.hp <= 0) this.sinkEnemy(b, false);
        }
        return true;
    }

    sinkEnemy(enemy, ramming = false) {
        if (enemy.dead) return;
        enemy.dead = true;
        SEA_WEATHER.onSink(this, enemy, ramming);
        if(enemy.wake) enemy.wake.destroy();
        this.burst(enemy.x,enemy.y,enemy.boss?'blast':'smoke',enemy.boss?2.4:1.4);
        SEA_COMBAT.sinkEnemy(this, enemy);
        enemy.bar.destroy();
        if (enemy.label) enemy.label.destroy();
        this.dropTreasure(enemy.x, enemy.y, true, enemy.reward);
        this.kills++;
        if (this.objective === 'hunt' && enemy.type === 'fragata') this.huntKills = (this.huntKills || 0) + 1;
        this.totalKills = (this.totalKills || 0) + 1;
        if (enemy.boss) this.bossKills = (this.bossKills || 0) + 1;
        if (ramming) this.rammingSinks++;
        this.splash(enemy.x, enemy.y, 0xffc697, 16);
        SEA_CONTRACTS.onSink(this,enemy);
    }

    collideWorldBounds(body, isPlayer = false) {
        const r = isPlayer ? this.hullRadius : body.radius;
        const v = isPlayer ? this.playerVelocity : { x: body.vx, y: body.vy };
        let magnitude = 0;
        if (body.x < r) {
            body.x = r + 1;
            magnitude = Math.max(magnitude, -v.x);
            v.x = Math.abs(v.x) * 0.3;
        }
        if (body.x > this.W - r) {
            body.x = this.W - r - 1;
            magnitude = Math.max(magnitude, v.x);
            v.x = -Math.abs(v.x) * 0.3;
        }
        if (body.y < r) {
            body.y = r + 1;
            magnitude = Math.max(magnitude, -v.y);
            v.y = Math.abs(v.y) * 0.3;
        }
        if (body.y > this.H - r) {
            body.y = this.H - r - 1;
            magnitude = Math.max(magnitude, v.y);
            v.y = -Math.abs(v.y) * 0.3;
        }
        if (!isPlayer) { body.vx = v.x; body.vy = v.y; }
        if (isPlayer && magnitude > 32) {
            const dmg = Phaser.Math.Clamp(Math.round(magnitude * 0.10), 3, 18);
            this.damageShip(dmg, body.x, body.y, 'rock');
            this.impactFX(body.x, body.y, magnitude, `BORDA -${dmg} CASCO`, true);
        }
    }

    update(time, delta) {
        SEA_PERFORMANCE.sample(delta);
        const pad = SEA_GAMEPAD.poll();
        SEA_MUSIC.tick(Math.min((delta || 16) / 1000, .05),
            SEA_MUSIC.resolveMood(this));
        if (this.ended || this.sinking) return;
        if(this.atlasOpen||this.islandDocked||this.pausedByCaptain)
            this.resetCannonCharge();
        // Xbox View (button 8) opens/returns the voyage atlas. Pause and
        // island dialogs take precedence; no fire or ship physics under it.
        if (this.atlasOpen) {
            if(pad.just?.[8] || pad.just?.[1] || pad.just?.[9]) {
                SEA_ATLAS.close(this); return;
            }
            if(pad.just?.[12] || pad.just?.[14]) SEA_ATLAS.focus(this,-1);
            else if(pad.just?.[13] || pad.just?.[15]) SEA_ATLAS.focus(this,1);
            if(pad.just?.[0]) SEA_ATLAS.mark(this);
            return;
        }
        if (pad.just?.[8] && !this.islandDocked && !this.pausedByCaptain) {
            SEA_ATLAS.toggle(this); return;
        }
        if (this.islandDocked) {
            if (pad.just[1] || pad.just[9]) SEA_ISLANDS.close(this);
            else if (pad.just[0]) SEA_ISLANDS.select(this);
            else {
                const dir=pad.up?-1:pad.down?1:0;
                if (!dir) this.islandNavAt=0;
                else if(time>=(this.islandNavAt||0)){
                    SEA_ISLANDS.navigate(this,dir);
                    this.islandNavAt=time+230;
                }
            }
            return;
        }
        if (pad.just[0] && this.islandCandidate?.allowed) {
            SEA_ISLANDS.tryDock(this);
            return;
        }
        if (pad.just[9] || (pad.just[1] && !this.pausedByCaptain)) { this.toggleCaptainMenu(); return; }
        if (this.pausedByCaptain) {
            if (pad.just[1]) { this.toggleCaptainMenu(); return; }
            const move = pad.up ? -1 : pad.down ? 1 : 0;
            if (!move) this.pauseNavAt = 0;
            if (move && time >= (this.pauseNavAt || 0)) {
                this.setPausePadFocus((this.pausePadIndex || 0) + move);
                this.pauseNavAt = time + 235;
            }
            if (pad.just[0]) this.pausePadOptions?.[this.pausePadIndex || 0]?.onTap();
            return;
        }
        const dt = Math.min(delta / 1000, .05);
        this.elapsed += dt; this.waveElapsed += dt;
        // Discovery is only recorded while sailing; no persistent save writes.
        if(this.chartDiscovered && this.elapsed >= (this.chartScanAt||0)) {
            SEA_ATLAS.discover(this);this.chartScanAt=this.elapsed+.5;
        }
        if (this.waveElapsed > .065) { this.waveElapsed = 0; this.drawSea(this.elapsed); }
        SEA_PIXEL.seaUpdate(this,dt);
        this.updateImpulse(dt,pad);
        const keyboardTurn = Number(this.keys.RIGHT.isDown || this.keys.D.isDown) -
            Number(this.keys.LEFT.isDown || this.keys.A.isDown);
        const keyboardThrottle = Number(this.keys.UP.isDown || this.keys.W.isDown) -
            Number(this.keys.DOWN.isDown || this.keys.S.isDown);
        const turn = SEA_MATH.clamp(keyboardTurn + this.joystick.x + pad.x, -1, 1);
        const throttle = SEA_MATH.clamp(keyboardThrottle - this.joystick.y - pad.y, -1, 1);
        this.player.rotation += turn * this.shipStats.turnSpeed * dt;
        const faceX = Math.sin(this.player.rotation), faceY = -Math.cos(this.player.rotation);
        const up = throttle > 0.01, down = throttle < -0.01;
        // The charge is deliberate: steering works, but sails/thrust and
        // top speed must be reduced while the gun crew braces for a salvo.
        this.updateCannonCharge(dt,pad);
        const brace=SEA_GUNNERY.brace(this.cannonBracing||0);
        if (up) { this.playerVelocity.x += faceX * this.shipStats.accel * throttle * brace.thrust * dt; this.playerVelocity.y += faceY * this.shipStats.accel * throttle * brace.thrust * dt; }
        if (down) { this.playerVelocity.x += faceX * 210 * throttle * dt; this.playerVelocity.y += faceY * 210 * throttle * dt; }
        const vx = this.playerVelocity.x, vy = this.playerVelocity.y;
        const forward = vx * faceX + vy * faceY;
        const sideX = vx - forward * faceX, sideY = vy - forward * faceY;
        const friction = Math.exp(-((up || down ? .58 : 1.28)+brace.drag)*dt);
        // After a salvo, momentarily preserve lateral inertia; otherwise
        // the original side drag erases the kick almost immediately.
        const lateral = Math.exp(-(this.recoilDamping>0?.75:2.35)*dt);
        this.recoilDamping=Math.max(0,(this.recoilDamping||0)-dt);
        this.playerVelocity.x = (forward * faceX + sideX * lateral) * friction;
        this.playerVelocity.y = (forward * faceY + sideY * lateral) * friction;
        const sp = Math.hypot(this.playerVelocity.x, this.playerVelocity.y);
        const speedCap=this.shipStats.maxSpeed*brace.speed*SEA_IMPULSE.speedFactor(this.impulseRemaining||0);
        if (sp > speedCap) { this.playerVelocity.x *= speedCap / sp; this.playerVelocity.y *= speedCap / sp; }
        this.player.x += this.playerVelocity.x * dt;
        this.player.y += this.playerVelocity.y * dt;
        this.collideWorldBounds(this.player, true);
        for (const isl of this.islands) this.collideRock(this.player, isl, true);
        this.updateEnemies(dt);
        SEA_WEATHER.update(this, dt);
        if (this.sinking) return;
        SEA_ISLANDS.update(this,dt);
        for (let i = 0; i < this.enemies.length; i++) {
            const e = this.enemies[i]; if (e.dead) continue;
            this.collideShips(this.playerHull, e);
            if (this.ended) break;
            for (let j = i + 1; j < this.enemies.length; j++) if (!this.enemies[j].dead) this.collideShips(e, this.enemies[j]);
        }
        if (this.ended || this.sinking) return;
        this.speed = Math.round(this.playerVelocity.x * faceX + this.playerVelocity.y * faceY);
        this.paintEnemies();
        this.animateWorldVisuals(dt);
        this.updateShots(dt);
        if (this.sinking) return;
        SEA_CONTRACTS.update(this,dt);
        if (this.ended) return;
        SEA_POLITICAL_EVENTS.update(this);
        if (this.ended) return;
        this.collectTreasures(dt);
        this.progressBattle(dt);
        if (this.ended) return;
        if (this.shipStats.repair > 0 && this.elapsed * 1000 - this.lastDamageTime > 5300) {
            this.shipHP = Math.min(this.maxShipHP, this.shipHP + this.shipStats.repair * dt);
        }
        this.updateHUD();
    }
    updateEnemies(dt) {
        for (const e of this.enemies) {
            if (e.dead) continue;
            if(e.huntTarget&&SEA_CONTRACTS.evade(this,e,dt))continue;
            const distance = Math.max(.01, Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y));
            const aim = Math.atan2(this.player.x - e.x, -(this.player.y - e.y));
            const sideAngle = Phaser.Math.Angle.Wrap(aim - e.heading);
            const aggressive = e.isMonster || ['ram','chase','tentacle'].includes(e.pattern);
            const kiting = !e.isMonster && e.pattern === 'sniper' && distance < e.maxRange * .52;
            let desired;
            if (aggressive) desired = aim;
            else {
                const sign = Math.sin(sideAngle) >= 0 ? 1 : -1;
                desired = aim - sign * Math.PI * .5;
                if (e.pattern === 'flank') desired += .27;
                if (e.pattern === 'boss' || e.pattern === 'abyss') desired += .14;
            }
            if (kiting) desired = aim + Math.PI;
            if (distance < (e.isMonster?1400:850)) {
                const diff = Phaser.Math.Angle.Wrap(desired - e.heading);
                e.heading += SEA_MATH.clamp(diff, -1.75 * dt, 1.75 * dt);
                const throttle = aggressive ? 1 : distance > e.maxRange * .75 ? .8 : distance < 135 ? .38 : .57;
                const thrust=e.isMonster?260:180;
                e.vx += Math.sin(e.heading) * thrust * throttle * dt;
                e.vy -= Math.cos(e.heading) * thrust * throttle * dt;
                e.cooldown -= dt * 1000;
                if(e.isMonster){
                    // Criaturas investem e chocam-se contra o casco; nenhuma
                    // arma de projéteis pode ser emitida por este ramo.
                    e.chargeMs=0;
                    if(distance<e.radius+this.hullRadius+105&&e.cooldown<=0){
                        if(e.type==='kraken')this.tentacleAttack(e);
                        else this.monsterLunge(e,distance);
                        e.cooldown=e.cooldownBase*(.85+Math.random()*.35);
                    }
                }else if(e.pattern!=='ram'&&distance<e.maxRange){
                    const duration=SEA_GUNNERY.chargeMs(Math.max(0,
                        (this.currentDifficulty-1)*.5));
                    e.chargeMs=Math.min(duration,(e.chargeMs||0)+dt*1000);
                    const stage=Math.floor(e.chargeMs/duration*4);
                    if(stage!==e.chargeStage){
                        e.chargeStage=stage;
                        e.label?.setText(SEA_FOES[e.type].name+
                            (stage>0?' · '+Math.min(100,stage*25)+'%':''));
                    }
                    if(e.chargeMs>=duration&&e.cooldown<=0){
                        this.enemyFire(e,distance);
                        e.chargeMs=0;e.chargeStage=0;
                        e.label?.setText(SEA_FOES[e.type].name);
                        e.cooldown=e.cooldownBase*(1-Math.min(.44,.016*this.currentDifficulty))*
                            (.85+Math.random()*.35);
                    }
                }else{
                    if(e.chargeStage)e.label?.setText(SEA_FOES[e.type].name);
                    e.chargeMs=0;e.chargeStage=0;
                }
            } else {
                e.chargeMs=0;e.chargeStage=0;
                e.heading += Math.sin(this.elapsed + e.id) * dt * .2;
                e.vx += Math.sin(e.heading) * 95 * dt;
                e.vy -= Math.cos(e.heading) * 95 * dt;
            }
            SEA_WEATHER.enemyCurrent(this, e, dt);
            const drag = Math.exp(-1.25 * dt);
            e.vx *= drag; e.vy *= drag;
            const speed = Math.hypot(e.vx, e.vy);
            const cap=e.isMonster?e.speed*1.35:e.speed;
            if (speed > cap) { e.vx *= cap / speed; e.vy *= cap / speed; }
            e.x += e.vx * dt; e.y += e.vy * dt;
            this.collideWorldBounds(e);
            for (const island of this.islands) {
                this.collideRock(e, island, false);
                if (e.dead) break;
            }
        }
    }
    enemyFire(e, distance) {
        // Monstros nunca passam pelo emissor de projéteis.
        if(e.isMonster)return;
        const dx = (this.player.x - e.x) / distance, dy = (this.player.y - e.y) / distance;
        const rx = Math.cos(e.heading), ry = Math.sin(e.heading);
        const sign = dx * rx + dy * ry > 0 ? 1 : -1;
        const sideVX = rx * sign, sideVY = ry * sign;
        const fireDX = (e.pattern === 'chase' || e.pattern === 'sniper') ? dx : sideVX;
        const fireDY = (e.pattern === 'chase' || e.pattern === 'sniper') ? dy : sideVY;
        const bullets = e.boss ? 3 : e.pattern === 'broadside' && (e.type === 'galeao' || e.type === 'tartaruga') ? 2 : 1;
        for (let j = 0; j < bullets; j++) {
            const offset = (j - (bullets - 1) / 2) * 15;
            this.makeShot(e.x + fireDX * 31 + Math.sin(e.heading) * offset,
                e.y + fireDY * 31 - Math.cos(e.heading) * offset,
                fireDX * (e.pattern === 'sniper' ? 370 : 265), fireDY * (e.pattern === 'sniper' ? 370 : 265),
                false, e.atk, e.pattern === 'sniper' ? 2.2 : 1.85);
        }
        const impulse=SEA_GUNNERY.recoil(e.atk,bullets,0,e.mass);
        e.vx-=fireDX*impulse;e.vy-=fireDY*impulse;
        this.splash(e.x + fireDX * 29, e.y + fireDY * 29, e.boss ? 0xffac83 : 0xc8a8bd, 7);
        if (distance < 840) SEA_AUDIO.play('enemy', e.boss ? .8 : .46, distance);
    }
    tentacleAttack(e) {
        if (e.dead || this.ended) return;
        const cx=this.player.x + this.playerVelocity.x*.3, cy=this.player.y + this.playerVelocity.y*.3;
        const r=62;
        // Aviso claro antes do golpe, especialmente em tela de toque.
        const warning=this.add.circle(cx,cy,r,0x922838,.14).setStrokeStyle(3,0xf39d8d,.9).setDepth(36);
        this.tweens.add({ targets:warning,alpha:.52,scale:1.10,duration:470,onComplete:()=>warning.destroy() });
        this.announce('KRAKEN · TENTÁCULOS À VISTA!'); this.burst(cx,cy,'violet',1.5);
        this.time.delayedCall(560,()=>{
            if (this.ended || !e.ship.active || e.dead) return;
            const fx=this.add.image(cx,cy,'fx-tentacle').setDepth(36).setScale(.75).setAlpha(.9);
            this.tweens.add({targets:fx,alpha:0,scale:1.3,duration:570,onComplete:()=>fx.destroy()});
            this.splash(cx,cy,0xf2bcc1,20);
            if (Math.hypot(this.player.x-cx,this.player.y-cy)<r+this.hullRadius) {
                this.damageShip(e.atk,cx,cy,'ram');
            }
        });
        if (e.hp/e.maxhp<.51 && e.specialPhase<1) {
            e.specialPhase=1;
            this.announce('O KRAKEN ENFURECEU · ENGUiAS EMERGEM');
            for(let i=0;i<2;i++)this.spawnEnemy('enguia',340+i*80);
            e.cooldownBase*=.76;
        }
    }
    monsterLunge(e,distance) {
        if(e.dead||this.ended)return;
        const dx=(this.player.x-e.x)/Math.max(1,distance);
        const dy=(this.player.y-e.y)/Math.max(1,distance);
        const impulse=e.speed*(e.type==='dagon'?2.1:1.35);
        e.vx+=dx*impulse;e.vy+=dy*impulse;
        this.splash(e.x,e.y,0x79d2ca,9);
        if(e.type==='dagon'){
            this.announce('DAGON · INVESTIDA DO ABISMO!');
            // As duas fases de reforcos do chefe continuam existindo.
            if(e.hp/e.maxhp<.66&&e.specialPhase===0){
                e.specialPhase=1;
                this.spawnEnemy('afogados',380);this.spawnEnemy('afogados',450);
            }else if(e.hp/e.maxhp<.34&&e.specialPhase===1){
                e.specialPhase=2;
                this.spawnEnemy('coral',390);this.spawnEnemy('caranguejo',470);
            }
        }
    }
    paintEnemies() {
        for (const e of this.enemies) {
            if (e.dead) continue;
            // O Dagon emerge da água: seu horizonte permanece horizontal.
            // A direção de ataque e a física continuam usando e.heading.
            // Gameplay headings are measured from image-UP (0°).
            // The new eel and the V15 ram ship are drawn with the HEAD/BOW
            // at image-BOTTOM. Turn ONLY these render sprites 180°; physics,
            // charges, collision normals, wake and heading remain untouched.
            const artFacesDown=e.type==='enguia'||
                (e.type==='ariete'&&e.ship.texture.key==='v15-ram');
            e.ship.setPosition(e.x,e.y).setRotation(e.type==='dagon'?0:
                e.heading+(artFacesDown?Math.PI:0));
            if (e.label) e.label.setPosition(e.x, e.y - e.radius - 54);
            const width=e.boss?112:58;
            e.bar.clear(); e.bar.fillStyle(0x160f1c, .84).fillRect(e.x - width/2-1, e.y - e.radius - 32, width+2, 8);
            e.bar.fillStyle(e.boss ? 0xf3bb6e : 0xc87c86).fillRect(e.x - width/2, e.y - e.radius - 31, Math.max(0, width * e.hp / e.maxhp), 6);
        }
    }
    // Colisão contínua de projéteis para não atravessar cascos quando estão rápidos.
    segmentNear(x1, y1, x2, y2, px, py, radius) {
        const dx = x2 - x1, dy = y2 - y1, d2 = dx * dx + dy * dy;
        const t = d2 > 0 ? SEA_MATH.clamp(((px - x1) * dx + (py - y1) * dy) / d2, 0, 1) : 0;
        const vx = x1 + t * dx - px, vy = y1 + t * dy - py;
        return vx * vx + vy * vy < radius * radius;
    }
    updateShots(dt) {
        for (let i = this.shots.length - 1; i >= 0; i--) {
            const p = this.shots[i]; p.px = p.x; p.py = p.y;
            p.x += p.vx * dt; p.y += p.vy * dt; p.ttl -= dt;
            p.object.setPosition(p.x, p.y);
            let hit = false;
            for (const isl of this.islands) {
                if (this.segmentNear(p.px, p.py, p.x, p.y, isl.x, isl.y, isl.radius + 4)) {
                    hit = true; this.splash(p.x, p.y, 0xd3b19d, 4); break;
                }
            }
            if (!hit && p.friendly) {
                for (const e of this.enemies) {
                    if (e.dead) continue;
                    if (this.segmentNear(p.px, p.py, p.x, p.y, e.x, e.y, e.radius + 4)) {
                        hit = true; e.hp = Math.max(0, e.hp - p.damage);
                        if(e.ship?.active){e.ship.setTintFill(0xffe3b9);e.flashUntil=this.time.now+120;}
                        SEA_COMBAT.hitEnemy(this, e, p.x, p.y, p.damage);
                        this.splash(p.x, p.y, 0xffdfb4, 9);
                        if (e.hp <= 0) this.sinkEnemy(e);
                        break;
                    }
                }
            } else if (!hit && this.segmentNear(p.px, p.py, p.x, p.y, this.player.x, this.player.y, this.hullRadius)) {
                hit = true; this.damageShip(p.damage, p.x, p.y, 'cannon');
            }
            if (hit || p.ttl <= 0 || p.x < 0 || p.y < 0 || p.x > this.W || p.y > this.H) {
                p.object.destroy(); this.shots.splice(i, 1);
            }
        }
    }
    collectTreasures(dt) {
        const range = this.shipStats.pickup;
        for (const t of this.treasures) {
            if (t.taken) continue;
            const dist = Math.hypot(this.player.x - t.x, this.player.y - t.y);
            if (dist < range + 90 && range > 50) {
                // A rede puxa lentamente a carga até o navio.
                const strength = Math.min(1, dt * (2 + this.profile.levels.ima * .1));
                t.x += (this.player.x - t.x) * strength;
                t.y += (this.player.y - t.y) * strength;
                t.coin.setPosition(t.x, t.y - 5);
            }
            if (Math.hypot(this.player.x - t.x, this.player.y - t.y) < Math.max(96, range + 16)) {
                t.taken = true; this.gold = SEA_MATH.safe(this.gold + t.value);
                t.coin.destroy(); this.burst(t.x,t.y,'gold',.75); this.splash(t.x,t.y,0xf9d77b,8);
                SEA_AUDIO.play('gold', .65);
            }
        }
    }
    progressBattle(dt) {
        if (this.ended) return;
        this.waveClock += dt;
        if (this.contract) {
            // One-off contract sortie: regular enemies remain dangerous, but
            // endless waves must not overtake a two-stop rescue objective.
            const alive=this.enemies.reduce((n,e)=>n+(!e.dead?1:0),0);
            if(alive<3&&this.elapsed>this.nextSpawnTime){
                this.spawnEnemy(this.chooseFoe(),460);
                this.nextSpawnTime=this.elapsed+7;
            }
        } else if (this.mode === 'sandbox') {
            if (this.waveClock > 52) {
                this.waveClock -= 52; this.wave++; this.currentDifficulty = this.wave;
                this.shipHP = Math.min(this.maxShipHP, this.shipHP + Math.max(8, this.maxShipHP * .10));
                this.announce(`ONDA ${this.wave} · AS SOMBRAS SE FORTALECEM`);
                if (this.wave % 5 === 0) {
                    const bosses=['almirante','kraken','dagon','nauabissal'];
                    const selected=bosses[(this.wave / 5 - 1) % bosses.length];
                    this.spawnEnemy(selected, 530);
                    this.announce(`ONDA ${this.wave} · ${SEA_FOES[selected].name}`);
                }
                for (let j = 0; j < Math.min(9, 2 + Math.floor(this.wave / 2)); j++) this.spawnEnemy(this.chooseFoe(j), 490 + j * 50);
                this.dropTreasure(this.player.x + 150, this.player.y + 150, false, 20 + this.wave * 17);
            }
            const alive = this.enemies.reduce((n, e) => n + (!e.dead ? 1 : 0), 0);
            if (alive < Math.min(11, 4 + this.wave * .35) && this.elapsed > this.nextSpawnTime) {
                this.spawnEnemy(this.chooseFoe(), 460); this.nextSpawnTime = this.elapsed + 4;
            }
        } else {
            // Missões escalam em dificuldade e alternam objetivos reais.
            if (this.objective === 'boss' && (this.bossKills || 0) >= 1) return this.finish(true);
            if (this.objective === 'kill' && this.kills >= this.targetKills) return this.finish(true);
            if (this.objective === 'hunt' && this.huntKills >= this.huntTarget) return this.finish(true);
            if (this.objective === 'cargo' && this.gold >= this.targetGold) return this.finish(true);
            if (this.objective === 'survive' && this.waveClock >= this.survivalTime) return this.finish(true);
            let alive = this.enemies.reduce((n, e) => n + (!e.dead ? 1 : 0), 0);
            if (alive < 5 && this.elapsed > this.nextSpawnTime) {
                this.spawnEnemy(this.objective === 'hunt' && (this.huntKills || 0) < this.huntTarget ? 'fragata' : this.chooseFoe(), 440);
                this.nextSpawnTime = this.elapsed + 3;
            }
        }
        // Limpeza de objetos antigos — necessária para o modo infinito.
        if ((this.elapsed | 0) % 10 === 0 && this.enemies.length > 75) this.enemies = this.enemies.filter(e => !e.dead);
        if ((this.elapsed | 0) % 15 === 0 && this.treasures.length > 120) this.treasures = this.treasures.filter(t => !t.taken);
    }
    objectiveText() {
        if (this.contract)return SEA_CONTRACTS.status(this);
        if (this.mode === 'sandbox') return `ONDA ${this.wave} · +${Math.max(0, Math.ceil(52 - this.waveClock))}s até reforços`;
        if (this.objective === 'boss') return `ENFRENTAR ${SEA_FOES[this.missionBoss]?.name || 'O CHEFE'} · ${this.bossKills || 0}/1`;
        if (this.objective === 'kill') return `CAÇA À CORTE · ${this.kills}/${this.targetKills} navios`;
        if (this.objective === 'hunt') return `ROMPER BLOQUEIO · FRAGATAS ${this.huntKills || 0}/${this.huntTarget}`;
        if (this.objective === 'cargo') return `RECUPERAR CARGA · ${SEA_MATH.nice(this.gold)}/${SEA_MATH.nice(this.targetGold)} ouro`;
        return `SOBREVIVER AO CERCO · ${Math.max(0, Math.ceil(this.survivalTime - this.waveClock))} s`;
    }
    updateHUD() {
        this.hud.setText(`CASCO ${Math.ceil(this.shipHP)}/${SEA_MATH.nice(this.maxShipHP)}   OURO ${SEA_MATH.nice(this.gold)}   NÓS ${Math.abs(this.speed | 0)}`);
        if(this.impulseButtonText){
            const cd=SEA_IMPULSE.cooldown(this.profile?.levels?.impulso||0);
            const remaining=Math.max(0,cd-(this.elapsed-this.lastImpulseAt));
            this.impulseButtonText.setText(this.impulseRemaining>0?'ARRANCADA':remaining>0?`${remaining.toFixed(1)}s`:'PRONTO');
        }
        this.quest.setText(this.objectiveText());
        // Keep unusually long mission text away from the fixed pause button.
        this.quest.setScale(Math.max(.78,Math.min(1,(SEA_DESKTOP?370:320)/Math.max(1,this.quest.width))));
        const curse=Math.round(this.curse||0);
        const nav=SEA_ATLAS.navigation(this);
        this.hudConditions.setText((SEA_WEATHER.names?.[this.seaEvent]||'MAR SERENO')+
            '\nMALDIÇÃO '+curse+'%'+(nav?'\nDESTINO '+nav.bearing+'° · '+nav.distance+'u':''));
        this.hudConditions.setColor(curse>=65?'#f0a3a3':'#c8b2a0');
        if(this.statusBars){
            const g=this.statusBars;g.clear();
            const hp=SEA_MATH.clamp(this.shipHP/this.maxShipHP,0,1);
            this.hud.setColor(hp<.28?'#f2a5a0':'#e8d9c4');
            const required=SEA_GUNNERY.chargeMs(this.profile?.levels?.cadencia||0);
            const p=SEA_MATH.clamp((this.cannonCharge?.port||0)/required,0,1);
            const st=SEA_MATH.clamp((this.cannonCharge?.starboard||0)/required,0,1);
            const parts=[[16,151,hp,hp<.28?0xc14c55:hp<.55?0xc4a26c:0x91b3a4],[175,63,p,0xc3a273],[249,63,st,0xc3a273]];
            for(const [x,w,value,color] of parts){
                // Original x and width preserved; thicker contrast at y=92.
                g.fillStyle(0x04090c,.96).fillRect(x,92,w,7);
                g.fillStyle(0x534438,.8).fillRect(x+1,93,w-2,5);
                if(value>0)g.fillStyle(color,.98).fillRect(x+1,93,Math.max(0,(w-2)*value),5);
            }
        }
        this.drawRadar();
    }
    drawRadar() {
        if (!this.radar || !this.player) return;
        const x = SEA_DESKTOP ? SEA_VIEW.width - 82 : 390, y = 187, size = 74, range = this.shipStats.radar, g = this.radar;
        g.clear(); g.fillStyle(0x091216, .96); g.fillRoundedRect(x - 40, y - 35, 80, 80, 4);
        g.lineStyle(1, 0x977658, .91); g.strokeRect(x - 40, y - 35, 80, 80);
        g.lineStyle(1, 0x6b716c, .29); g.strokeCircle(x, y + 5, 24);
        g.lineStyle(1, 0x6b716c, .17); g.lineBetween(x - 32, y + 5, x + 32, y + 5); g.lineBetween(x, y - 27, x, y + 37);
        for (const isl of this.islands) {
            const dx = (isl.x - this.player.x) / range * (size / 2), dy = (isl.y - this.player.y) / range * (size / 2);
            if (Math.abs(dx) <= 37 && Math.abs(dy) <= 37) {
                const col = this.islandVisits?.has(isl.id) ? 0x5f717d : isl.kind === 'demeter' ? 0xbad7b5 : isl.kind === 'daegon' ? 0xc66f7d : 0x926f6d;
                g.fillStyle(col, .85); g.fillCircle(x + dx, y + 5 + dy, isl.radius > 70 ? 3.2 : 2.3);
            }
        }
        for (const e of this.enemies) {
            if (e.dead) continue;
            const dx = (e.x - this.player.x) / range * (size / 2), dy = (e.y - this.player.y) / range * (size / 2);
            if (Math.abs(dx) <= 37 && Math.abs(dy) <= 37) { g.fillStyle(e.boss ? 0xf1c48e : 0xd67680, 1); g.fillCircle(x + dx, y + 5 + dy, e.boss ? 4 : 2.6); }
        }
        for (const t of this.treasures) {
            if (t.taken) continue;
            const dx = (t.x - this.player.x) / range * (size / 2), dy = (t.y - this.player.y) / range * (size / 2);
            if (Math.abs(dx) <= 37 && Math.abs(dy) <= 37) { g.fillStyle(0xddba82, 1); g.fillCircle(x + dx, y + 5 + dy, 1.8); }
        }
        // Waypoint is a manual navigation aid, never autopilot. A target
        // beyond radar reach is pinned to the rim, not falsely shown nearby.
        const nav=SEA_ATLAS.navigation(this);
        if(nav) {
            const dx=(nav.island.x-this.player.x)/range*(size/2);
            const dy=(nav.island.y-this.player.y)/range*(size/2);
            const edge=Math.max(1,Math.abs(dx)/32,Math.abs(dy)/32);
            const mx=x+dx/edge,my=y+5+dy/edge;
            g.lineStyle(2,0xf6d19b,.98).strokeCircle(mx,my,4.5);
            g.fillStyle(0xf6d19b,.94).fillCircle(mx,my,1.7);
        }
        // marcador do jogador com rumo
        g.fillStyle(0xd7edca); g.fillCircle(x, y + 5, 3);
        const hx = x + Math.sin(this.player.rotation) * 7, hy = y + 5 - Math.cos(this.player.rotation) * 7;
        g.lineStyle(2, 0xd7edca, .9); g.lineBetween(x, y + 5, hx, hy);
    }
    announce(msg) {
        if (this.impactMessage) { this.impactMessage.setText(msg); this.impactMessage.alpha = 1;
            this.tweens.add({ targets: this.impactMessage, alpha: 0, delay: 1250, duration: 650 }); }
    }
    setPausePadFocus(index) {
        if (!this.pausePadOptions?.length) return;
        this.pausePadIndex = ((index % this.pausePadOptions.length) + this.pausePadOptions.length) % this.pausePadOptions.length;
        this.pausePadOptions.forEach((item,i)=>{
            item.box.setStrokeStyle(i===this.pausePadIndex?4:2,
                i===this.pausePadIndex?0xffe2a0:item.base);
        });
    }
    handleCaptainPointer(x,y) {
        if (this.ended || this.sinking) return false;
        const inside=(h)=>h&&Math.abs(x-h.x)<=h.w/2&&Math.abs(y-h.y)<=h.h/2;
        if (this.atlasOpen) return SEA_ATLAS.pointer(this,x,y);
        if (this.islandDocked) return SEA_ISLANDS.pointer(this,x,y);
        if (this.pausedByCaptain) {
            const option=this.pausePadOptions?.find(o=>inside(o.hit));
            if (option) option.onTap();
            // Pausa cobre toda a tela; jamais transfere o toque para os canhões.
            return true;
        }
        if (this.chartHitbox && inside(this.chartHitbox)) {
            SEA_ATLAS.toggle(this);return true;
        }
        if (this.islandCandidate && inside(this.anchorHitbox)) {
            SEA_ISLANDS.tryDock(this);
            return true;
        }
        if (inside(this.pauseButtonHitbox)) {
            this.toggleCaptainMenu();
            return true;
        }
        if(inside(this.impulseButtonHitbox)){
            this.impulseTapQueued=true;
            return true;
        }
        return false;
    }
    toggleCaptainMenu() {
        if (this.ended || this.sinking || this.islandDocked || this.atlasOpen) return;
        if (this.pausedByCaptain) {
            this.pauseElements?.destroy(true);
            this.pauseElements=null;
            this.pausedByCaptain=false;
            this.pausePadOptions=null;
            this.pauseNavAt=0;
            this.touchReset();
            return;
        }
        this.pausedByCaptain=true;
        this.touchReset();
        this.pausePadOptions=[];
        this.pausePadIndex=0;
        this.pauseNavAt=0;
        SEA_UI.pause(this);
    }
    finish(won, withdrawn = false) {
        if (this.ended || this.resultsBanked) return;
        if (won) SEA_AUDIO.play('victory', 1);
        else if (withdrawn) SEA_AUDIO.play('gold', .8);
        else if (!this.sinking) SEA_AUDIO.play('defeat', 1);
        this.ended = true; this.resultsBanked = true; this.pausedByCaptain = false;
        this.playerVelocity.x = this.playerVelocity.y = 0;
        if (this.pauseElements) { this.pauseElements.destroy(true); this.pauseElements = null; }
        if (this.atlasOpen) SEA_ATLAS.close(this);
        let commission = 0;
        if (won && this.mode === 'mission') commission = Math.round(42 * Math.pow(1.25, Math.min(this.stage, 90)));
        const contractBounty=won&&this.contract?.completed ? this.contract.bounty : 0;
        const report = SeaProfile.settle({ won, withdrawn, mode: this.mode, stage: this.stage, wave: this.wave,
            collected: SEA_MATH.safe(this.gold + commission + contractBounty), kills: this.kills,
            rammings: this.rammingSinks, islands: this.islandVisits?.size || 0 });
        // The after-action chronicle is passed to Port in memory, not the save.
        report.politicalChronicle=(this.politicalEvents||[]).slice(0,8).map(entry=>({
            text:String(entry.text||''),terms:String(entry.terms||'')
        }));
        if(this.contract){
            report.contractTitle=SEA_CONTRACTS.offers[this.contract.id].title;
            report.contractBounty=contractBounty;
            report.contractCompleted=!!this.contract.completed;
            report.contractSeized=!!this.contract.intercepted;
            report.contractEscaped=!!this.contract.escaped;
            report.contractHunt=this.contract.id==='hunt';
            report.contractRoute=this.contract.route||null;
        }
        // Ir ao porto garante que todos os efeitos e eventos da cena sejam encerrados.
        this.scene.start('SeaPort', { page: 'result', report });
    }
}
const config = {
    type: Phaser.AUTO,
    width: SEA_VIEW.width,
    height: SEA_VIEW.height,
    parent: 'game-container',
    backgroundColor: '#251423',
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    render: { pixelArt: true, antialias: false, roundPixels: true },
    input: { activePointers: 3 },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.NO_CENTER },
    scene: [SeaBoot, SeaPort, Game]
};
const game = new Phaser.Game(config);
// A posição inicial é corrigida no primeiro frame e em cada tela.
if (typeof window !== 'undefined' && typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(() => seaCenterCanvas(game));
}
