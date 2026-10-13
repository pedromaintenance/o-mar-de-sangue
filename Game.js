// PIXEL_ASSET_PACK_V1
/*
 * O MAR DE SANGUE — v0.4, FROTAS & ESTALEIRO INFINITO — CARCAÇA
 * Compatível com o editor Phaser 3: substitua SOMENTE Game.js.
 * Recursos desenhados por código; não depende de sprites ou bibliotecas adicionais.
 * Sistema de abalroamento e colisões baseado na versão v0.2/v0.3.
 * Teclado: WASD/setas, Q bombordo, E estibordo, espaço ambos, ESC pausa.
 * Progresso local v3 é migrado para v4 automaticamente.
 */
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
    { id: 'canhoes', icon: '✹', name: 'Canhões Rúnicos', desc: '+7 dano por bola de canhão', base: 40, factor: 1.49, group: 'armas' },
    { id: 'cadencia', icon: '❖', name: 'Serventes Treinados', desc: 'Diminui tempo de recarga lateral', base: 65, factor: 1.54, group: 'armas' },
    { id: 'bateria', icon: '☷', name: 'Baterias Geminadas', desc: 'Mais projéteis por bordo a cada 3 níveis', base: 120, factor: 1.58, group: 'armas' },
    { id: 'alcance', icon: '➤', name: 'Pólvora Alquímica', desc: 'Projéteis mais rápidos e mais alcance', base: 52, factor: 1.48, group: 'armas' },
    { id: 'esporao', icon: '⚔', name: 'Esporão de Golzdov', desc: 'Amplifica dano de abalroamento', base: 45, factor: 1.52, group: 'casco' },
    { id: 'reforco', icon: '⬡', name: 'Escoras do Abismo', desc: 'Menos dano e recuo por choque', base: 70, factor: 1.51, group: 'casco' },
    { id: 'oficina', icon: '✚', name: 'Carpinteiros de Bordo', desc: 'Reparo lento fora de combate', base: 110, factor: 1.57, group: 'apoio' },
    { id: 'ima', icon: '◉', name: 'Rede dos Catadores', desc: 'Captura ouro a uma distância maior', base: 44, factor: 1.48, group: 'apoio' },
    { id: 'cofre', icon: '◇', name: 'Cofre do Capitão', desc: 'Mais ouro resgatado por viagem', base: 65, factor: 1.59, group: 'apoio' },
    { id: 'cartas', icon: '✦', name: 'Cartas de Navegação', desc: 'Amplia o alcance do radar', base: 48, factor: 1.49, group: 'apoio' }
];
const SEA_MISSION_TITLES = [
    'O Ouro de Portomonte', 'Carga nas Águas Rubras', 'As Sentinelas de Daegon',
    'O Bloqueio dos Mercadores', 'O Almirante da Lua Morta', 'Rota dos Náufragos',
    'O Tesouro do Arquipélago', 'O Cerco dos Quatro Faróis', 'Sombras da Garganta',
    'O Galeão de Uln-Shayr', 'Piratas da Maré Cinzenta', 'Os Cofres da Costa Sul',
    'O Reino de Peixes Mortos', 'A Caçada dos Ossos', 'O Sangue do Almirante',
    'Os Dentes de Daegon', 'O Resgate das Redes', 'Tempestade na Boca do Abismo',
    'A Guarda do Mar Vermelho', 'A Coroa do Corsário', 'Sinos sob as Ondas',
    'As Esmeraldas Perdidas', 'O Horizonte dos Afogados', 'A Frota das Lanternas',
    'O Trono Naval da Noite'
];
const SEA_FOES = {
    patrulha: { name: 'Patrulha da Corte', tint: 0xa47d8d, hp: 60, speed: 100, atk: 10, reward: 22, radius: 29, mass: 1, range: 430, cooldown: 1900, pattern: 'broadside' },
    corsario: { name: 'Corsário de Sangue', tint: 0xcc746b, hp: 68, speed: 150, atk: 11, reward: 29, radius: 27, mass: .95, range: 330, cooldown: 1150, pattern: 'chase' },
    ariete: { name: 'Aríete do Abismo', tint: 0xe1a765, hp: 125, speed: 160, atk: 9, reward: 41, radius: 39, mass: 1.85, range: 125, cooldown: 5000, pattern: 'ram' },
    fragata: { name: 'Fragata Sombria', tint: 0x9177bc, hp: 135, speed: 108, atk: 18, reward: 49, radius: 35, mass: 1.55, range: 510, cooldown: 1750, pattern: 'broadside' },
    bombardeiro: { name: 'Bombardeiro Élfico', tint: 0xb8b1a7, hp: 90, speed: 82, atk: 23, reward: 57, radius: 32, mass: 1.1, range: 670, cooldown: 2450, pattern: 'sniper' },
    espectral: { name: 'Nau Espectral', tint: 0x7fd0c2, hp: 115, speed: 133, atk: 20, reward: 62, radius: 31, mass: 1.05, range: 490, cooldown: 1400, pattern: 'flank' },
    galeao: { name: 'Galeão Uln-Shayr', tint: 0xefb9b8, hp: 205, speed: 89, atk: 27, reward: 95, radius: 43, mass: 2.5, range: 550, cooldown: 1700, pattern: 'broadside' },
    almirante: { name: 'Almirante das Sombras', tint: 0xffc970, hp: 390, speed: 117, atk: 36, reward: 170, radius: 51, mass: 3.4, range: 670, cooldown: 1150, pattern: 'boss' }
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
        this.load.image('fx-splash-0', 'assets/fx/splash_0.png');
        this.load.image('fx-splash-1', 'assets/fx/splash_1.png');
        this.load.image('fx-splash-2', 'assets/fx/splash_2.png');
        this.load.image('fx-splash-3', 'assets/fx/splash_3.png');
        this.load.image('fx-muzzle-0', 'assets/fx/muzzle_0.png');
        this.load.image('fx-muzzle-1', 'assets/fx/muzzle_1.png');
        this.load.image('fx-muzzle-2', 'assets/fx/muzzle_2.png');
        this.load.image('fx-muzzle-3', 'assets/fx/muzzle_3.png');
        this.load.image('fx-splinters-0', 'assets/fx/splinters_0.png');
        this.load.image('fx-splinters-1', 'assets/fx/splinters_1.png');
        this.load.image('fx-splinters-2', 'assets/fx/splinters_2.png');
        this.load.image('fx-splinters-3', 'assets/fx/splinters_3.png');
        this.load.image('island-reef', 'assets/islands/island_reef.png');
        this.load.image('island-ruin', 'assets/islands/island_ruin.png');
        this.load.image('island-monastery', 'assets/islands/island_monastery.png');
        this.load.image('island-daegon', 'assets/islands/island_daegon.png');
        this.load.image('island-demeter', 'assets/islands/island_demeter.png');
        this.load.image('island-wreck', 'assets/islands/island_wreck.png');
        this.load.image('treasure-coin', 'assets/items/treasure_coin.png');
        this.load.image('treasure-crate', 'assets/items/treasure_crate.png');
        this.load.image('treasure-chest', 'assets/items/treasure_chest.png');

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
    init(data) { this.page = data?.page || 'menu'; this.mode = data?.mode || SeaProfile.load().mode; this.yardGroup = data?.group || 'armas'; this.report = data?.report || null; }
    create() {
        seaCenterCanvas(this.game);
        this.paintBackground();
        if (this.page === 'yard') this.showYard();
        else if (this.page === 'help') this.showHelp();
        else if (this.page === 'reset') this.showReset();
        else if (this.page === 'result') this.showResult();
        else this.showMenu();
    }
    txt(x, y, value, size = 14, color = '#e9d6c4', opt = {}) {
        return this.add.text(x, y, String(value), { fontFamily: 'Georgia, serif', fontSize: size + 'px', color,
            wordWrap: { width: opt.width || 430 }, align: opt.align || 'left', lineSpacing: opt.spacing || 4,
            fontStyle: opt.bold ? 'bold' : 'normal' }).setOrigin(opt.center ? .5 : 0, opt.mid ? .5 : 0).setDepth(opt.depth || 20);
    }
    button(y, label, onTap, style = 'dark', x = 240, w = 416, h = 43, font = 16) {
        const colors = style === 'gold' ? [0xb9915c, 0xefcd90, '#17212b'] : style === 'red' ? [0x513042, 0xb67980, '#f4e0d6'] : [0x1a303f, 0x718d95, '#dfddce'];
        const rect = this.add.rectangle(x, y, w, h, colors[0], 1).setStrokeStyle(1.5, colors[1])
            .setDepth(24).setInteractive({ useHandCursor: true });
        this.txt(x, y, label, font, colors[2], { center: true, mid: true, bold: true, depth: 25, width: w - 15 });
        rect.on('pointerdown', () => onTap()); return rect;
    }
    paintBackground() {
        if (this.textures.exists('menu-bg')) {
            this.add.image(240, 400, 'menu-bg').setDepth(-60);
        } else {
            const fallback = this.add.graphics().setDepth(-60);
            fallback.fillStyle(0x172434, 1).fillRect(0,0,480,800);
        }
        const g = this.add.graphics().setDepth(-50);
        g.fillStyle(0x0e1924, .35); g.fillRect(0, 0, 480, 800);
        g.lineStyle(2, 0xb3956a, .75); g.lineBetween(16, 17, 464, 17); g.lineBetween(16, 783, 464, 783);
    }
    banner(label, subtitle = '') {
        this.txt(240, 41, 'CRÔNICAS DA CARCAÇA', 11, '#ddc19a', { center: true, bold: true });
        this.txt(240, 95, label, 30, '#f5d49f', { center: true, bold: true });
        if (subtitle) this.txt(240, 141, subtitle, 13, '#dec5bf', { center: true });
    }
    showMenu() {
        const p = SeaProfile.load(), s = SeaProfile.stats(p);
        this.banner('O MAR DE SANGUE', 'O ouro compra aço. O oceano cobra cada erro.');
        this.txt(240, 362, `COFRE  ◉ ${SEA_MATH.nice(p.gold)}       VIAGENS  ${p.sorties}`, 16, '#edce9f', { center: true, bold: true });
        this.txt(240, 393, `CASCO ${SEA_MATH.nice(s.maxHP)}   CANHÕES ${SEA_MATH.nice(s.cannonDamage)}   VELAS ${SEA_MATH.nice(s.maxSpeed)}`, 12, '#b9d9dd', { center: true });
        this.txt(240, 437, 'ESCOLHA O MODO DE JOGO', 14, '#e4c68d', { center: true, bold: true });
        this.button(480, `✦ MISSÕES  ·  ETAPA ${p.mission}`, () => {
            SeaProfile.selectMode('mission'); this.scene.start('Game', { mode: 'mission', stage: p.mission });
        }, 'gold');
        this.button(537, `♾ SANDBOX  ·  RECORDE ONDA ${p.bestWave}`, () => {
            SeaProfile.selectMode('sandbox'); this.scene.start('Game', { mode: 'sandbox' });
        });
        this.button(594, '⚒  ESTALEIRO INFINITO', () => this.scene.start('SeaPort', { page: 'yard', group: 'armas' }));
        this.button(651, '◈  MANUAL / COMANDOS', () => this.scene.start('SeaPort', { page: 'help' }));
        this.button(709, 'REINICIAR PROGRESSO', () => this.scene.start('SeaPort', { page: 'reset' }), 'red', 240, 320, 36, 13);
        this.txt(240, 753, `Vitórias ${p.wins}   ·   Navios afundados ${p.kills}   ·   Abalroamentos ${p.rammings}`, 11, '#bec3c1', { center: true });
    }
    showYard() {
        const p = SeaProfile.load(); this.banner('ESTALEIRO', `◉ ${SEA_MATH.nice(p.gold)} moedas  ·  melhorias sem limite de nível`);
        const groups = [['casco', 'CASCO'], ['motor', 'NAVEGAÇÃO'], ['armas', 'ARMAMENTO'], ['apoio', 'APOIO']];
        groups.forEach(([id, name], i) => this.button(206, name, () => this.scene.start('SeaPort', { page: 'yard', group: id }),
            this.yardGroup === id ? 'gold' : 'dark', 66 + i * 116, 112, 34, 11));
        const upgrades = SEA_UPGRADES.filter(x => x.group === this.yardGroup);
        upgrades.forEach((u, i) => {
            const lv = p.levels[u.id] || 0, cost = SeaProfile.price(u, lv), y = 271 + i * 108;
            this.add.rectangle(240, y + 20, 441, 97, 0x202e39, .97).setStrokeStyle(1, 0x705a4b).setDepth(10);
            this.txt(31, y - 19, `${u.icon}  ${u.name}`, 18, '#f4d2a2', { bold: true });
            this.txt(31, y + 9, u.desc, 12, '#bdd0d0');
            this.txt(31, y + 39, `NÍVEL ${SEA_MATH.nice(lv)}  ·  PRÓXIMO: ${SEA_MATH.nice(cost)} ◉`, 13, '#d5bc99');
            const can = p.gold >= cost;
            this.button(y + 22, can ? 'COMPRAR' : 'SEM OURO', () => {
                const res = SeaProfile.buy(u.id);
                if (res.ok) this.scene.start('SeaPort', { page: 'yard', group: this.yardGroup });
            }, can ? 'gold' : 'dark', 392, 104, 35, 12);
            // Bloqueio de compra é feito pela rotina SeaProfile.buy, também para clicks antigos.
        });
        this.button(750, '◀ VOLTAR AO PORTO', () => this.scene.start('SeaPort', { page: 'menu' }), 'dark', 240, 407, 43, 16);
    }
    showHelp() {
        this.banner('DIÁRIO DE BORDO', 'Regras do mar, da guerra e do estaleiro');
        const lines = [
            '↑/W acelerar   ↓/S ré/freio   ←→/AD virar\nQ = bombordo   E = estibordo   ESPAÇO = dois bordos',
            'CANHÕES LATERAIS: navegue em paralelo ao alvo e\nuse Q ou E. No celular, toque BOMB. ou ESTIB.',
            'ABALROAR: proa e velocidade aumentam o impacto.\nRochas são sólidas; impacto forte danifica os cascos.',
            'MISSÕES: etapas de escolta de carga, caça,\nsobrevivência e chefes. A etapa avança ao vencer.',
            'SANDBOX: ondas sem fim. A cada onda surgem\ninimigos mais numerosos, resistentes e perigosos.',
            'ESTALEIRO: 14 melhorias sem teto artificial.\nCada nível custa exponencialmente mais ouro.',
            'SALVAMENTO: automático no navegador. O ouro\nda expedição só vira saldo ao retornar ao porto.'
        ];
        lines.forEach((line, i) => {
            const y = 179 + i * 75;
            this.add.rectangle(240, y + 18, 439, 65, 0x1c2c39, .95).setStrokeStyle(1, 0x625451).setDepth(8);
            this.txt(32, y, line, 13, '#e2dbcc');
        });
        this.button(746, '◀ VOLTAR AO MENU', () => this.scene.start('SeaPort', { page: 'menu' }), 'gold', 240, 400, 43);
    }
    showReset() {
        this.banner('ESQUECER O MAR?');
        this.txt(240, 234, 'Isso apaga ouro, melhorias, missões, ondas e\no histórico de expedições guardado neste aparelho.', 17, '#ead7cb', { center: true });
        this.button(467, 'NÃO, VOLTAR AO PORTO', () => this.scene.start('SeaPort'), 'gold');
        this.button(532, 'SIM, APAGAR PROGRESSO', () => { SeaProfile.reset(); this.scene.start('SeaPort'); }, 'red');
    }
    showResult() {
        const r = this.report;
        if (!r) { this.showMenu(); return; }
        this.banner(r.won ? 'MISSÃO CUMPRIDA' : r.withdrawn ? 'DE VOLTA AO PORTO' : 'O MAR TE RECLAMOU');
        this.txt(240, 284, `Modo: ${r.mode === 'mission' ? 'MISSÕES · Etapa ' + r.stage : 'SANDBOX · Onda ' + r.wave}\n\nNavios afundados: ${r.kills}\nAbalroamentos: ${r.rammings}\nOuro encontrado: ${SEA_MATH.nice(r.collected)}\nOuro depositado: ${SEA_MATH.nice(r.reward)}\nCofre atual: ${SEA_MATH.nice(r.bank)}`, 20, '#f0dec4', { center: true, mid: true, spacing: 9 });
        this.button(502, '⚒ ESTALEIRO E MELHORIAS', () => this.scene.start('SeaPort', { page: 'yard', group: 'armas' }), 'gold');
        this.button(566, '⚓ MENU PRINCIPAL', () => this.scene.start('SeaPort', { page: 'menu' }));
        this.button(630, r.mode === 'mission' ? '✦ PRÓXIMA MISSÃO' : '♾ NOVA JORNADA SANDBOX', () => {
            const p = SeaProfile.load(); this.scene.start('Game', { mode: r.mode, stage: p.mission });
        });
    }
}

class Game extends Phaser.Scene {
    constructor() { super('Game'); }
    init(data) {
        const p = SeaProfile.load();
        this.mode = data?.mode || p.mode || 'mission';
        this.stage = data?.stage || p.mission || 1;
        this.wave = 1;
    }
    create() {
        seaCenterCanvas(this.game);
        this.W = 4400; this.H = 3400;
        this.profile = SeaProfile.load(); this.shipStats = SeaProfile.stats(this.profile);
        this.maxShipHP = this.shipStats.maxHP;
        this.shipHP = this.maxShipHP;
        this.playerVelocity = { x: 0, y: 0 }; this.hullRadius = 34;
        this.gold = 0; this.kills = 0; this.rammingSinks = 0; this.impactCount = 0; this.rockHits = 0;
        this.elapsed = 0; this.waveElapsed = 0; this.ended = false; this.pausedByCaptain = false;
        this.resultsBanked = false; this.speed = 0; this.lastImpact = -1000;
        this.lastRockContact = -1000; this.lastShot = -1000;
        this.lastPortShot = -1000; this.lastStarboardShot = -1000; this.lastDamageTime = -1000;
        this.touch = { left: false, right: false, up: false, down: false };
        this.shots = []; this.enemies = []; this.islands = []; this.treasures = [];
        this.foeSerial = 0; this.waveClock = 0; this.nextSpawnTime = 0; this.targetKills = 0; this.targetGold = 0;
        this.survivalTime = 0; this.goalName = '';
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
        this.buildWorld();
        const start = this.findWaterSpot(this.W / 2, this.H / 2, 400);
        this.player = this.add.container(start.x, start.y).setDepth(20);
        const playerScale = (this.hullRadius * 2.25) / this.textures.get('player-ship').getSourceImage().height;
        this.playerSprite = this.add.image(0, 0, 'player-ship').setScale(playerScale);
        this.player.add(this.playerSprite);
        this.sail = this.add.triangle(0, -5, -15, 15, 0, -43, 16, 16, 0xe7d7b5, 0).setStrokeStyle(0, 0x987f67, 0);
        this.player.add(this.sail); this.decorateUpgradedShip();
        this.playerHull = {
            ship: this.player, isPlayer: true, radius: this.hullRadius, mass: 1.5,
            get x() { return this.ship.x; }, set x(v) { this.ship.x = v; },
            get y() { return this.ship.y; }, set y(v) { this.ship.y = v; },
            get heading() { return this.ship.rotation; },
            get lastRamming() { return this.ship._lastRamming ?? -1000; },
            set lastRamming(v) { this.ship._lastRamming = v; }
        };
        this.tweens.add({ targets: this.sail, angle: { from: -6, to: 6 }, duration: 1080, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        this.cameras.main.startFollow(this.player, true, .095, .095);
        const startingFoes = this.mode === 'mission' ? (this.objective === 'boss' ? 5 : 7) : 6;
        for (let i = 0; i < startingFoes; i++) this.spawnEnemy(this.chooseFoe(i), 430 + i * 95);
        if (this.objective === 'boss') this.spawnEnemy('almirante', 600);
        if (this.objective === 'hunt') for(let j = 0; j < Math.min(3,this.huntTarget); j++) this.spawnEnemy('fragata', 570 + j * 90);
        this.createHUD(); this.createTouchControls();
        this.keys = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,SPACE,Q,E,R,ESC');
        this.onBoth = () => this.fire('both'); this.onPort = () => this.fire('port'); this.onStarboard = () => this.fire('starboard');
        this.onPause = () => { if (!this.ended) this.toggleCaptainMenu(); };
        this.input.keyboard.on('keydown-SPACE', this.onBoth);
        this.input.keyboard.on('keydown-Q', this.onPort);
        this.input.keyboard.on('keydown-E', this.onStarboard);
        this.input.keyboard.on('keydown-ESC', this.onPause);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.keyboard.off('keydown-SPACE', this.onBoth);
            this.input.keyboard.off('keydown-Q', this.onPort);
            this.input.keyboard.off('keydown-E', this.onStarboard);
            this.input.keyboard.off('keydown-ESC', this.onPause);
        });
        this.input.on('pointerup', () => this.clearTouch()); this.input.on('gameout', () => this.clearTouch());
        const tip = this.add.text(240, 137,
            (this.mode === 'mission' ? `MISSÃO ${this.stage}` : 'SANDBOX INFINITO') +
            '\nCANHÕES AGORA DISPARAM PELOS BORDOS!\nQ: bombordo · E: estibordo · ESPAÇO: ambos\nO mapa é grande: use o radar no alto.', {
                fontFamily: 'Georgia', fontSize: '15px', color: '#ffe4bc', align: 'center', lineSpacing: 6,
                backgroundColor: '#111e29eb', padding: { x: 12, y: 12 }
            }).setOrigin(.5, 0).setDepth(160).setScrollFactor(0);
        this.tweens.add({ targets: tip, alpha: 0, delay: 3700, duration: 950, onComplete: () => tip.destroy() });
        this.updateHUD();
    }
    decorateUpgradedShip() {
        const lv = this.profile.levels;
        if (lv.casco || lv.blindagem) {
            const g = this.add.graphics();
            g.lineStyle(2 + Math.min(5, lv.casco * .25 + lv.blindagem * .2), 0xe6bd82, .85);
            g.strokeRoundedRect(-30, -25, 60, 76, 15);
            for (let j = 0; j < Math.min(5, Math.ceil((lv.casco + lv.blindagem) / 2)); j++)
                g.lineBetween(-25, -12 + j * 12, 25, -12 + j * 12);
            this.player.add(g);
        }
        if (lv.velas) {
            this.sail.setFillStyle(lv.velas >= 6 ? 0xd65c71 : 0xe0a596);
            this.sail.setStrokeStyle(2 + Math.min(4, lv.velas * .15), 0xf5d5ac);
        }
        if (lv.canhoes || lv.bateria) {
            const g = this.add.graphics().fillStyle(0x0e1722);
            const count = Math.min(5, Math.ceil((lv.canhoes + lv.bateria) / 3) + 1);
            for (let j = 0; j < count; j++) {
                g.fillCircle(-28, -22 + j * 15, 5); g.fillCircle(28, -22 + j * 15, 5);
            }
            this.player.add(g);
        }
        if (lv.esporao) {
            const g = this.add.graphics().fillStyle(lv.esporao >= 8 ? 0xffd58b : 0xb5c5cc);
            g.fillTriangle(0, -85 - Math.min(18, lv.esporao * 2), -10, -43, 10, -43);
            g.lineStyle(2, 0xf0ce91); g.lineBetween(0, -84, 0, -41);
            this.player.add(g);
        }
    }
    createSeaLayers() {
        this.seaBase = this.add.tileSprite(240, 400, 480, 800, 'sea-base').setScrollFactor(0).setDepth(-110);
        this.seaBlood = this.add.tileSprite(240, 400, 480, 800, 'sea-blood').setScrollFactor(0).setDepth(-109).setAlpha(.85);
        this.seaFoam = this.add.tileSprite(240, 400, 480, 800, 'sea-foam').setScrollFactor(0).setDepth(-108).setAlpha(.75);
        this.seaMist = this.add.tileSprite(240, 400, 480, 800, 'sea-mist').setScrollFactor(0).setDepth(-107).setAlpha(.85);
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
        const keyMap = { reef: 'island-reef', ruin: 'island-ruin', monastery: 'island-monastery', daegon: 'island-daegon', demeter: 'island-demeter', wreck: 'island-wreck' };
        spots.forEach(([x, y, radius, kind], i) => {
            this.islands.push({ x, y, radius, kind });
            const img = this.add.image(x, y, keyMap[kind] || 'island-reef').setDepth(0).setScale((radius * 2.8) / 256);
            if (kind === 'demeter') {
                const glow = this.add.circle(x, y - radius * .2, Math.max(14, radius * .3), 0xc8e8bd, .14).setDepth(1);
                this.tweens.add({ targets: glow, alpha: .04, duration: 1800 + i * 35, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
            } else if (kind !== 'reef') {
                const mist = this.add.circle(x + radius * .12, y - radius * .1, Math.max(12, radius * .24), kind === 'daegon' ? 0xd07684 : 0x8cc7c0, .08).setDepth(1);
                this.tweens.add({ targets: mist, alpha: .025, duration: 1700 + i * 31, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
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
            const s = this.add.image(x, y, i % 2 ? 'treasure-crate' : 'treasure-chest').setDepth(.2).setAlpha(.38).setRotation((i % 7) * .3).setScale(1.1 + (i % 3) * .2);
            this.tweens.add({ targets: s, y: y - 5, duration: 1400 + i * 60, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
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
        if (rank >= 3) pool.push('bombardeiro');
        if (rank >= 4) pool.push('espectral');
        if (rank >= 6) pool.push('galeao');
        if (rank >= 9) pool.push('almirante');
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
        const elite = type === 'almirante';
        const maxhp = Math.round(f.hp * scaleDifficulty), id = ++this.foeSerial;
        const tex = ({ ariete:'foe-ram', corsario:'foe-corsair', bombardeiro:'foe-bombard',
            espectral:'foe-spectral', fragata:'foe-galleon', galeao:'foe-galleon',
            almirante:'foe-admiral' })[type] || 'foe-sloop';
        const sourceH = this.textures.get(tex).getSourceImage().height || 160;
        const heightFactor = ['foe-galleon','foe-admiral'].includes(tex) ? 2.35 : tex === 'foe-ram' ? 2.15 : 2.45;
        const ship = this.add.image(pos.x, pos.y, tex)
            .setScale((f.radius * heightFactor) / sourceH).setDepth(15);
        const enemy = { id, type, ship, x: pos.x, y: pos.y, hp: maxhp, maxhp,
            cooldown: Phaser.Math.Between(450, 1250), heading: Math.random() * 6.28,
            speed: f.speed * (1 + Math.min(.85, this.currentDifficulty * .014)),
            atk: f.atk * (1 + Math.max(0, this.currentDifficulty - 1) * (this.mode === 'sandbox' ? .16 : .095)),
            reward: Math.round(f.reward * (1 + this.currentDifficulty * .31)),
            vx: 0, vy: 0, radius: f.radius, mass: f.mass,
            lastRockContact: -1000, lastRamming: -1000, dead: false,
            maxRange: f.range, cooldownBase: f.cooldown, pattern: f.pattern, elite, boss: elite, bar: null };
        enemy.bar = this.add.graphics().setDepth(22);
        enemy.label = this.add.text(pos.x, pos.y - f.radius - 38, f.name, {
            fontFamily: 'monospace', fontSize: '10px', color: elite ? '#ffe2a2' : '#edb6b8',
            backgroundColor: '#131720bd', padding: { x: 2, y: 2 }
        }).setOrigin(.5).setDepth(24);
        this.enemies.push(enemy);
        return enemy;
    }
    dropTreasure(x, y, fromEnemy = false, value = 14) {
        const coin = this.add.container(x, y).setDepth(8);
        const kind = fromEnemy ? 'treasure-chest' : ((Math.floor(x + y + value) % 3 === 0) ? 'treasure-crate' : 'treasure-coin');
        coin.add(this.add.image(0, 0, kind));
        this.tweens.add({ targets: coin, y: y - 7, duration: 950, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        this.treasures.push({ x, y, coin, value: Math.round(value), taken: false });
    }
    createHUD() {
        this.add.rectangle(240, 51, 480, 101, 0x111c28, .94).setScrollFactor(0).setDepth(90);
        this.add.rectangle(240, 51, 472, 93, 0x0f1620, .35).setStrokeStyle(1, 0x9c8267, .7).setScrollFactor(0).setDepth(91);
        this.add.text(14, 9, this.mode === 'mission' ? `MISSÃO ${this.stage} · ${SEA_MISSION_TITLES[(this.stage - 1) % SEA_MISSION_TITLES.length]}` : `O MAR DE SANGUE · SANDBOX ONDA ${this.wave}`, {
            fontFamily: 'Georgia', fontSize: '14px', fontStyle: 'bold', color: '#f0c58c'
        }).setScrollFactor(0).setDepth(100);
        this.hud = this.add.text(14, 37, '', { fontFamily: 'monospace', fontSize: '12px', color: '#f5e6d3' }).setScrollFactor(0).setDepth(100);
        this.quest = this.add.text(15, 63, '', {
            fontFamily: 'monospace', fontSize: '12px', color: '#ffce95'
        }).setScrollFactor(0).setDepth(100);
        this.add.rectangle(424, 79, 98, 29, 0x324453, .98).setStrokeStyle(1, 0xbe9a7a).setDepth(110)
            .setScrollFactor(0).setInteractive().on('pointerdown', () => this.toggleCaptainMenu());
        this.add.text(424, 79, '⚓ PORTO', { fontFamily: 'monospace', fontSize: '12px', color: '#ffe4b6' })
            .setOrigin(.5).setDepth(111).setScrollFactor(0);
        this.add.rectangle(240, 780, 480, 42, 0x111c28, .92).setScrollFactor(0).setDepth(90);
        this.add.text(242, 784, 'Q: bombordo  E: estibordo  ESPAÇO: ambos', {
            fontFamily: 'monospace', fontSize: '11px', color: '#ceb9b0'
        }).setOrigin(.5).setScrollFactor(0).setDepth(100);
        this.impactMessage = this.add.text(240, 125, '', { fontFamily: 'monospace', fontSize: '16px',
            color: '#ffe1b2', align: 'center', backgroundColor: '#171a29b0', padding: { x: 7, y: 4 }
        }).setOrigin(.5).setScrollFactor(0).setDepth(140).setAlpha(0);
        this.radar = this.add.graphics().setScrollFactor(0).setDepth(110);
        this.add.text(390, 144, 'CARTA', { fontFamily: 'monospace', fontSize: '10px', color: '#e0c7aa' })
            .setScrollFactor(0).setDepth(112);
    }
    createTouchControls() {
        this.control(57, 680, '◀', 'left'); this.control(139, 680, '▶', 'right');
        this.control(98, 598, '▲', 'up'); this.control(98, 731, '▼', 'down', 30);
        this.control(351, 674, '◀●', 'port', 49); this.control(442, 674, '●▶', 'starboard', 37);
    }
    control(x, y, label, key, radius = 35) {
        const circle = this.add.circle(x, y, radius, 0x243643, .82).setStrokeStyle(2, 0xba907a)
            .setScrollFactor(0).setDepth(105).setInteractive({ useHandCursor: true });
        this.add.text(x, y, label, { fontFamily: 'monospace', fontSize: label.includes('●') ? '20px' : '24px',
            color: label.includes('●') ? '#ffcba8' : '#e7d5bd' }).setOrigin(.5).setScrollFactor(0).setDepth(106);
        circle.on('pointerdown', () => {
            if (key === 'port' || key === 'starboard') this.fire(key);
            else this.touch[key] = true;
        });
        circle.on('pointerup', () => { if (this.touch[key] !== undefined) this.touch[key] = false; });
        circle.on('pointerout', () => { if (this.touch[key] !== undefined) this.touch[key] = false; });
    }
    clearTouch() { this.touch.left = this.touch.right = this.touch.up = this.touch.down = false; }
    // A proa agora aponta para cima; canhões disparam perpendicularmente ao rumo.
    // Bombordo = esquerda do capitão, estibordo = direita.
    fire(side = 'both') {
        if (!this.player || this.ended || this.pausedByCaptain) return false;
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
                const along = (j - (count - 1) / 2) * 12;
                const x = this.player.x + sign * rightX * 31 + foreX * along;
                const y = this.player.y + sign * rightY * 31 + foreY * along;
                const speed = this.shipStats.shotSpeed;
                const dirX = sign * rightX, dirY = sign * rightY;
                this.makeShot(x, y, dirX * speed + this.playerVelocity.x * .22,
                    dirY * speed + this.playerVelocity.y * .22, true,
                    this.shipStats.cannonDamage, this.shipStats.shotTTL);
                this.splash(x, y, 0xffdfab, 4);
                this.pixelFx('muzzle',x,y,1.2);
            }
            // Recuo lateral dos canhões: pequeno, mas perceptível em navios leves.
            this.playerVelocity.x -= sign * rightX * 2.5;
            this.playerVelocity.y -= sign * rightY * 2.5;
        }
        return fired;
    }
    makeShot(x, y, vx, vy, friendly, damage = 9, ttl = 1.5) {
        const sprite = this.add.circle(x, y, friendly ? 5 : 6, friendly ? 0xffd6a1 : 0xd78aa5)
            .setStrokeStyle(2, friendly ? 0xffffff : 0x512a47).setDepth(30);
        this.shots.push({ x, y, px: x, py: y, vx, vy, friendly, object: sprite, ttl, damage });
    }
    pixelFx(name,x,y,scale=1) {
        const key='fx-'+name+'-0';
        if (!this.textures.exists(key)) return;
        const spr=this.add.image(x,y,key).setDepth(44).setScale(scale);
        for(let i=1;i<4;i++)this.time.delayedCall(i*62,()=>{if(spr.active)spr.setTexture('fx-'+name+'-'+i);});
        this.time.delayedCall(260,()=>{if(spr.active)spr.destroy();});
    }
    splash(x, y, color = 0xe4bbc1, r = 6) {
        this.pixelFx('splash',x,y,Math.max(.6,r/9));
        const ring = this.add.circle(x, y, r, 0x000000, 0).setStrokeStyle(2, color, .8).setDepth(11);
        this.tweens.add({ targets: ring, scale: 3, alpha: 0, duration: 380, onComplete: () => ring.destroy() });
    }
    damageShip(amount, x, y, source = 'normal') {
        if (this.ended || this.time.now - this.lastImpact < 330) return false;
        this.lastImpact = this.time.now; this.lastDamageTime = this.time.now;
        const reduction = source === 'rock' ? this.shipStats.rockReduction :
            source === 'ram' ? this.shipStats.ramProtection : this.shipStats.armor;
        amount = Math.max(1, Math.round(amount * (1 - reduction)));
        this.shipHP = Math.max(0, this.shipHP - amount);
        this.cameras.main.shake(120, .004);
        this.splash(x, y, 0xffd4ad, 11);
        if (this.shipHP <= 0) this.finish(false);
        return true;
    }
    // Exibe fragmentos de madeira, espuma e a força do impacto.
    impactFX(x, y, magnitude, label, isRock = false) {
        this.pixelFx('splinters',x,y,Math.min(2,magnitude/90+.5));
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
        enemy.ship.destroy();
        enemy.bar.destroy();
        if (enemy.label) enemy.label.destroy();
        this.dropTreasure(enemy.x, enemy.y, true, enemy.reward);
        this.kills++;
        if (this.objective === 'hunt' && enemy.type === 'fragata') this.huntKills = (this.huntKills || 0) + 1;
        this.totalKills = (this.totalKills || 0) + 1;
        if (enemy.boss) this.bossKills = (this.bossKills || 0) + 1;
        if (ramming) this.rammingSinks++;
        this.splash(enemy.x, enemy.y, 0xffc697, 16);
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
        if (this.ended || this.pausedByCaptain) return;
        const dt = Math.min(delta / 1000, .05);
        this.elapsed += dt; this.waveElapsed += dt;
        if (this.waveElapsed > .065) { this.waveElapsed = 0; this.drawSea(this.elapsed); }
        const left = this.touch.left || this.keys.LEFT.isDown || this.keys.A.isDown;
        const right = this.touch.right || this.keys.RIGHT.isDown || this.keys.D.isDown;
        const up = this.touch.up || this.keys.UP.isDown || this.keys.W.isDown;
        const down = this.touch.down || this.keys.DOWN.isDown || this.keys.S.isDown;
        if (left) this.player.rotation -= this.shipStats.turnSpeed * dt;
        if (right) this.player.rotation += this.shipStats.turnSpeed * dt;
        const faceX = Math.sin(this.player.rotation), faceY = -Math.cos(this.player.rotation);
        if (up) { this.playerVelocity.x += faceX * this.shipStats.accel * dt; this.playerVelocity.y += faceY * this.shipStats.accel * dt; }
        if (down) { this.playerVelocity.x -= faceX * 210 * dt; this.playerVelocity.y -= faceY * 210 * dt; }
        const vx = this.playerVelocity.x, vy = this.playerVelocity.y;
        const forward = vx * faceX + vy * faceY;
        const sideX = vx - forward * faceX, sideY = vy - forward * faceY;
        const friction = Math.exp(-(up || down ? .58 : 1.28) * dt), lateral = Math.exp(-2.35 * dt);
        this.playerVelocity.x = (forward * faceX + sideX * lateral) * friction;
        this.playerVelocity.y = (forward * faceY + sideY * lateral) * friction;
        const sp = Math.hypot(this.playerVelocity.x, this.playerVelocity.y);
        if (sp > this.shipStats.maxSpeed) { this.playerVelocity.x *= this.shipStats.maxSpeed / sp; this.playerVelocity.y *= this.shipStats.maxSpeed / sp; }
        this.player.x += this.playerVelocity.x * dt;
        this.player.y += this.playerVelocity.y * dt;
        this.collideWorldBounds(this.player, true);
        for (const isl of this.islands) this.collideRock(this.player, isl, true);
        this.updateEnemies(dt);
        for (let i = 0; i < this.enemies.length; i++) {
            const e = this.enemies[i]; if (e.dead) continue;
            this.collideShips(this.playerHull, e);
            if (this.ended) break;
            for (let j = i + 1; j < this.enemies.length; j++) if (!this.enemies[j].dead) this.collideShips(e, this.enemies[j]);
        }
        if (this.ended) return;
        this.speed = Math.round(this.playerVelocity.x * faceX + this.playerVelocity.y * faceY);
        this.paintEnemies();
        this.player.y += Math.sin(this.elapsed * 3.1) * .08;
        this.updateShots(dt); this.collectTreasures(dt);
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
            const distance = Math.max(.01, Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y));
            const aim = Math.atan2(this.player.x - e.x, -(this.player.y - e.y));
            const sideAngle = Phaser.Math.Angle.Wrap(aim - e.heading);
            const aggressive = e.pattern === 'ram' || e.pattern === 'chase';
            const kiting = e.pattern === 'sniper' && distance < e.maxRange * .52;
            let desired;
            if (aggressive) desired = aim;
            else {
                const sign = Math.sin(sideAngle) >= 0 ? 1 : -1;
                desired = aim - sign * Math.PI * .5;
                if (e.pattern === 'flank') desired += .27;
                if (e.pattern === 'boss') desired += .14;
            }
            if (kiting) desired = aim + Math.PI;
            if (distance < 850) {
                const diff = Phaser.Math.Angle.Wrap(desired - e.heading);
                e.heading += SEA_MATH.clamp(diff, -1.75 * dt, 1.75 * dt);
                const throttle = aggressive ? 1 : distance > e.maxRange * .75 ? .8 : distance < 135 ? .38 : .57;
                e.vx += Math.sin(e.heading) * 180 * throttle * dt;
                e.vy -= Math.cos(e.heading) * 180 * throttle * dt;
                e.cooldown -= dt * 1000;
                if (e.pattern !== 'ram' && distance < e.maxRange && e.cooldown <= 0) {
                    this.enemyFire(e, distance);
                    e.cooldown = e.cooldownBase * (1 - Math.min(.44, .016 * this.currentDifficulty)) * (.85 + Math.random() * .35);
                }
            } else {
                e.heading += Math.sin(this.elapsed + e.id) * dt * .2;
                e.vx += Math.sin(e.heading) * 95 * dt;
                e.vy -= Math.cos(e.heading) * 95 * dt;
            }
            const drag = Math.exp(-1.25 * dt);
            e.vx *= drag; e.vy *= drag;
            const speed = Math.hypot(e.vx, e.vy);
            if (speed > e.speed) { e.vx *= e.speed / speed; e.vy *= e.speed / speed; }
            e.x += e.vx * dt; e.y += e.vy * dt;
            this.collideWorldBounds(e);
            for (const island of this.islands) {
                this.collideRock(e, island, false);
                if (e.dead) break;
            }
        }
    }
    enemyFire(e, distance) {
        const dx = (this.player.x - e.x) / distance, dy = (this.player.y - e.y) / distance;
        // Inimigos também usam bordadas, exceto o corsário (arma giratória) e o atirador de precisão.
        const rx = Math.cos(e.heading), ry = Math.sin(e.heading);
        const sign = dx * rx + dy * ry > 0 ? 1 : -1;
        const sideVX = rx * sign, sideVY = ry * sign;
        const fireDX = (e.pattern === 'chase' || e.pattern === 'sniper') ? dx : sideVX;
        const fireDY = (e.pattern === 'chase' || e.pattern === 'sniper') ? dy : sideVY;
        const f = SEA_FOES[e.type];
        const bullets = e.pattern === 'boss' ? 3 : e.pattern === 'broadside' && e.type === 'galeao' ? 2 : 1;
        for (let j = 0; j < bullets; j++) {
            const offset = (j - (bullets - 1) / 2) * 15;
            this.makeShot(e.x + fireDX * 31 + Math.sin(e.heading) * offset,
                e.y + fireDY * 31 - Math.cos(e.heading) * offset,
                fireDX * (e.pattern === 'sniper' ? 370 : 265), fireDY * (e.pattern === 'sniper' ? 370 : 265),
                false, e.atk, e.pattern === 'sniper' ? 2.2 : 1.85);
        }
        this.splash(e.x + fireDX * 29, e.y + fireDY * 29, e.boss ? 0xffac83 : 0xc8a8bd, 7);
        void f;
    }
    paintEnemies() {
        for (const e of this.enemies) {
            if (e.dead) continue;
            e.ship.setPosition(e.x, e.y).setRotation(e.heading);
            if (e.label) e.label.setPosition(e.x, e.y - e.radius - 38);
            e.bar.clear(); e.bar.fillStyle(0x160f1c, .84).fillRect(e.x - 29, e.y - e.radius - 24, 58, 7);
            e.bar.fillStyle(e.boss ? 0xf3bb6e : 0xc87c86).fillRect(e.x - 28, e.y - e.radius - 23, Math.max(0, 56 * e.hp / e.maxhp), 5);
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
            if (dist < range + 55 && range > 50) {
                // A rede puxa lentamente a carga até o navio.
                const strength = Math.min(1, dt * (2 + this.profile.levels.ima * .1));
                t.x += (this.player.x - t.x) * strength;
                t.y += (this.player.y - t.y) * strength;
                t.coin.setPosition(t.x, t.y - 5);
            }
            if (Math.hypot(this.player.x - t.x, this.player.y - t.y) < Math.max(40, range)) {
                t.taken = true; this.gold = SEA_MATH.safe(this.gold + t.value);
                t.coin.destroy(); this.splash(t.x, t.y, 0xf9d77b, 12);
            }
        }
    }
    progressBattle(dt) {
        if (this.ended) return;
        this.waveClock += dt;
        if (this.mode === 'sandbox') {
            if (this.waveClock > 52) {
                this.waveClock -= 52; this.wave++; this.currentDifficulty = this.wave;
                this.shipHP = Math.min(this.maxShipHP, this.shipHP + Math.max(8, this.maxShipHP * .10));
                this.announce(`ONDA ${this.wave} · AS SOMBRAS SE FORTALECEM`);
                if (this.wave % 5 === 0) this.spawnEnemy('almirante', 530);
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
        if (this.mode === 'sandbox') return `ONDA ${this.wave} · +${Math.max(0, Math.ceil(52 - this.waveClock))}s até reforços`;
        if (this.objective === 'boss') return `CAÇA AO ALMIRANTE · CHEFE ${this.bossKills || 0}/1`;
        if (this.objective === 'kill') return `CAÇA À CORTE · ${this.kills}/${this.targetKills} navios`;
        if (this.objective === 'hunt') return `ROMPER BLOQUEIO · FRAGATAS ${this.huntKills || 0}/${this.huntTarget}`;
        if (this.objective === 'cargo') return `RECUPERAR CARGA · ${SEA_MATH.nice(this.gold)}/${SEA_MATH.nice(this.targetGold)} ouro`;
        return `SOBREVIVER AO CERCO · ${Math.max(0, Math.ceil(this.survivalTime - this.waveClock))} s`;
    }
    updateHUD() {
        this.hud.setText(`CASCO ${Math.ceil(this.shipHP)}/${SEA_MATH.nice(this.maxShipHP)}   OURO ${SEA_MATH.nice(this.gold)}   NÓS ${Math.abs(this.speed | 0)}`);
        this.quest.setText(this.objectiveText());
        this.drawRadar();
    }
    drawRadar() {
        if (!this.radar || !this.player) return;
        const x = 390, y = 187, size = 74, range = this.shipStats.radar, g = this.radar;
        g.clear(); g.fillStyle(0x0c1822, .91); g.fillRoundedRect(x - 40, y - 35, 80, 80, 4);
        g.lineStyle(1, 0x9b866c, .85); g.strokeRect(x - 40, y - 35, 80, 80);
        g.lineStyle(1, 0x58727c, .35); g.strokeCircle(x, y + 5, 24);
        g.lineStyle(1, 0x58727c, .22); g.lineBetween(x - 32, y + 5, x + 32, y + 5); g.lineBetween(x, y - 27, x, y + 37);
        for (const isl of this.islands) {
            const dx = (isl.x - this.player.x) / range * (size / 2), dy = (isl.y - this.player.y) / range * (size / 2);
            if (Math.abs(dx) <= 37 && Math.abs(dy) <= 37) {
                const col = isl.kind === 'demeter' ? 0xbad7b5 : isl.kind === 'daegon' ? 0xc66f7d : 0x926f6d;
                g.fillStyle(col, .85); g.fillCircle(x + dx, y + 5 + dy, isl.radius > 70 ? 3.2 : 2.3);
            }
        }
        for (const e of this.enemies) {
            if (e.dead) continue;
            const dx = (e.x - this.player.x) / range * (size / 2), dy = (e.y - this.player.y) / range * (size / 2);
            if (Math.abs(dx) <= 37 && Math.abs(dy) <= 37) { g.fillStyle(e.boss ? 0xffd18d : 0xe18091, 1); g.fillCircle(x + dx, y + 5 + dy, e.boss ? 4 : 2.6); }
        }
        for (const t of this.treasures) {
            if (t.taken) continue;
            const dx = (t.x - this.player.x) / range * (size / 2), dy = (t.y - this.player.y) / range * (size / 2);
            if (Math.abs(dx) <= 37 && Math.abs(dy) <= 37) { g.fillStyle(0xf4d18b, 1); g.fillCircle(x + dx, y + 5 + dy, 1.8); }
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
    toggleCaptainMenu() {
        if (this.ended) return;
        if (this.pauseElements) {
            this.pauseElements.destroy(true); this.pauseElements = null; this.pausedByCaptain = false; this.clearTouch(); return;
        }
        this.pausedByCaptain = true; this.clearTouch();
        this.pauseElements = this.add.container(0, 0).setScrollFactor(0).setDepth(240);
        const c = this.pauseElements;
        c.add(this.add.rectangle(240, 400, 480, 800, 0x08111b, .92));
        c.add(this.add.text(240, 252, 'DIÁRIO DE BORDO', { fontFamily: 'Georgia', fontSize: '31px', color: '#f6d59b' }).setOrigin(.5));
        c.add(this.add.text(240, 340, `${this.objectiveText()}\n\nOuro encontrado: ${SEA_MATH.nice(this.gold)}\nAfundados: ${this.kills} · Casco: ${Math.ceil(this.shipHP)}/${this.maxShipHP}`, {
            fontFamily: 'Georgia', fontSize: '17px', color: '#e9d6c8', align: 'center', lineSpacing: 5
        }).setOrigin(.5));
        const mk = (y, txt, cb) => {
            const box = this.add.rectangle(240, y, 390, 51, 0x9d774e).setStrokeStyle(2, 0xe5c894).setInteractive();
            c.add(box); c.add(this.add.text(240, y, txt, { fontFamily: 'Georgia', fontSize: '16px', color: '#142029' }).setOrigin(.5));
            box.on('pointerdown', cb);
        };
        mk(491, 'CONTINUAR NAVEGAÇÃO', () => this.toggleCaptainMenu());
        mk(558, 'RETORNAR AO PORTO (75% DO OURO)', () => this.finish(false, true));
    }
    finish(won, withdrawn = false) {
        if (this.ended || this.resultsBanked) return;
        this.ended = true; this.resultsBanked = true; this.pausedByCaptain = false;
        this.playerVelocity.x = this.playerVelocity.y = 0;
        if (this.pauseElements) { this.pauseElements.destroy(true); this.pauseElements = null; }
        let commission = 0;
        if (won && this.mode === 'mission') commission = Math.round(42 * Math.pow(1.25, Math.min(this.stage, 90)));
        const report = SeaProfile.settle({ won, withdrawn, mode: this.mode, stage: this.stage, wave: this.wave,
            collected: SEA_MATH.safe(this.gold + commission), kills: this.kills, rammings: this.rammingSinks });
        // Ir ao porto garante que todos os efeitos e eventos da cena sejam encerrados.
        this.scene.start('SeaPort', { page: 'result', report });
    }
}
const config = {
    type: Phaser.AUTO,
    width: 480,
    height: 800,
    parent: 'game-container',
    backgroundColor: '#251423',
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    render: { pixelArt: true, antialias: false, roundPixels: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.NO_CENTER },
    scene: [SeaBoot, SeaPort, Game]
};
const game = new Phaser.Game(config);
// A posição inicial é corrigida no primeiro frame e em cada tela.
if (typeof window !== 'undefined' && typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(() => seaCenterCanvas(game));
}
