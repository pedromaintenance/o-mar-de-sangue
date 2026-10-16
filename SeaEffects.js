/* O MAR DE SANGUE v1.7 — áudio e feedback de combate. Sem novos assets. */
const SEA_AUDIO = {
    key: 'carcaca.mar-de-sangue.audio.v1',
    enabled: (() => { try { return localStorage.getItem('carcaca.mar-de-sangue.audio.v1') !== 'off'; } catch (_) { return true; } })(),
    ctx: null, master: null, noise: null, last: {},
    effectsKey: 'carcaca.mar.sfx.volume',
    effectsVolume: (() => {
        try {
            const raw=localStorage.getItem('carcaca.mar.sfx.volume');
            if(raw===null)return 1; // old players keep exactly the old gain
            const n=Number(raw);
            return Number.isFinite(n)?Math.max(0,Math.min(1,n)):1;
        } catch (_) { return 1; }
    })(),
    setEffectsVolume(n) {
        const value=Number(n);
        if(!Number.isFinite(value))return this.effectsVolume;
        this.effectsVolume=Math.max(0,Math.min(1,Math.round(value*100)/100));
        if(this.master)this.master.gain.value=.4*this.effectsVolume;
        try{localStorage.setItem(this.effectsKey,String(this.effectsVolume));}catch(_){}
        return this.effectsVolume;
    },
    unlock() {
        if (!this.enabled || typeof window === 'undefined') return null;
        try {
            if (!this.ctx) {
                const Ctor = window.AudioContext || window.webkitAudioContext;
                if (!Ctor) return null;
                this.ctx = new Ctor();
                this.master = this.ctx.createGain();
                this.master.gain.value = .4*this.effectsVolume;
                this.master.connect(this.ctx.destination);
                const n = Math.floor(this.ctx.sampleRate * .85);
                this.noise = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
                const data = this.noise.getChannelData(0);
                for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * .72;
            }
            if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
            return this.ctx;
        } catch (_) { return null; }
    },
    toggle() {
        this.enabled = !this.enabled;
        try { localStorage.setItem(this.key, this.enabled ? 'on' : 'off'); } catch (_) {}
        if (this.enabled) this.unlock();
        else if (this.ctx?.state === 'running') this.ctx.suspend().catch(() => {});
        return this.enabled;
    },
    bind(scene, x, y, fixed = false) {
        const btn = scene.add.text(x, y, '', {
            fontFamily: 'monospace', fontSize: '12px', color: '#ffe2ac',
            backgroundColor: '#111c29dc', padding: { x: 5, y: 4 }
        }).setOrigin(1, 0).setDepth(260).setInteractive({ useHandCursor: true });
        if (fixed) btn.setScrollFactor(0);
        const render = () => btn.setText(this.enabled ? '♪ SOM ON' : '♪ SOM OFF');
        const flip = () => { this.toggle(); render(); };
        btn.on('pointerdown', flip);
        if (scene.input.keyboard) {
            scene.input.keyboard.on('keydown-N', flip);
            scene.events.once(Phaser.Scenes.Events.SHUTDOWN,
                () => scene.input.keyboard.off('keydown-N', flip));
        }
        render();
        return btn;
    },
    play(kind, power = 1, distance = 0) {
        // A zero effect volume means no oscillator or noise work at all.
        if(this.effectsVolume<=0)return;
        const ctx = this.unlock();
        if (!ctx || ctx.state !== 'running') return;
        const now = ctx.currentTime;
        const cooldown = { cannon: .075, enemy: .18, hit: .065, hurt: .22,
            ram: .25, rock: .26, sink: .3, gold: .11, victory: .9, defeat: .9 };
        if (now - (this.last[kind] ?? -100) < (cooldown[kind] ?? .1)) return;
        this.last[kind] = now;
        const v = Math.max(.002, Math.min(.47, .28 * power / (1 + Math.max(0, distance) / 640)));
        const tone = (f0, f1, duration, gainLevel, type = 'triangle', delay = 0) => {
            const at = now + delay, src = ctx.createOscillator(), g = ctx.createGain();
            src.type = type;
            src.frequency.setValueAtTime(Math.max(1, f0), at);
            src.frequency.exponentialRampToValueAtTime(Math.max(1, f1), at + duration);
            g.gain.setValueAtTime(.0001, at);
            g.gain.exponentialRampToValueAtTime(Math.max(.0002, gainLevel), at + .009);
            g.gain.exponentialRampToValueAtTime(.0001, at + duration);
            src.connect(g); g.connect(this.master);
            src.start(at); src.stop(at + duration + .025);
        };
        const noise = (duration, gainLevel, cutoff = 1100) => {
            const src = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), g = ctx.createGain();
            src.buffer = this.noise;
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(cutoff, now);
            filter.frequency.exponentialRampToValueAtTime(Math.max(100, cutoff * .42), now + duration);
            g.gain.setValueAtTime(.0001, now);
            g.gain.exponentialRampToValueAtTime(Math.max(.0002, gainLevel), now + .006);
            g.gain.exponentialRampToValueAtTime(.0001, now + duration);
            src.connect(filter); filter.connect(g); g.connect(this.master);
            src.start(now); src.stop(now + duration + .015);
        };
        try {
            if (kind === 'cannon') { noise(.29, v, 1300); tone(105, 37, .34, v * .74); }
            else if (kind === 'enemy') { noise(.21, v * .48, 950); tone(112, 49, .24, v * .38); }
            else if (kind === 'hit') { noise(.15, v * .8, 2200); tone(190, 76, .13, v * .32, 'sawtooth'); }
            else if (kind === 'hurt') { noise(.27, v * .86, 1150); tone(94, 37, .36, v * .63); }
            else if (kind === 'ram' || kind === 'rock') {
                noise(kind === 'ram' ? .47 : .27, v, kind === 'ram' ? 850 : 1800);
                tone(88, 29, .45, v * .77);
            } else if (kind === 'sink') {
                noise(.68, v * .66, 540); tone(165, 39, .81, v * .68, 'sine'); tone(93, 30, .75, v * .44);
            } else if (kind === 'gold') {
                tone(540, 800, .12, v * .38, 'sine'); tone(800, 1120, .16, v * .32, 'sine', .09);
            } else if (kind === 'victory') {
                [392, 523, 659, 784].forEach((n, i) => tone(n, n * 1.01, .24, v * .44, 'sine', i * .13));
            } else if (kind === 'defeat') {
                [280, 218, 147].forEach((n, i) => tone(n, n * .72, .31, v * .44, 'triangle', i * .17));
            }
        } catch (_) { /* Som é cosmético; falha nunca interrompe o jogo. */ }
    }
};
if (typeof window !== 'undefined') {
    for (const event of ['pointerdown', 'touchstart', 'keydown'])
        window.addEventListener(event, () => SEA_AUDIO.unlock(), { capture: true, passive: true });
}

const SEA_COMBAT = {
    init(s) {
        s.hullScars = s.add.graphics();
        s.playerVisual.add(s.hullScars);
        s.lastHullScarStage = -1;
        s.nextPlayerSmokeAt = 0;
        s.floatingNumbers = 0;
        s.wrecks = [];
        s.sinking = false;
    },
    scars(s) {
        const hp = s.shipHP / Math.max(1, s.maxShipHP);
        const stage = hp < .2 ? 3 : hp < .43 ? 2 : hp < .73 ? 1 : 0;
        if (stage === s.lastHullScarStage) return;
        s.lastHullScarStage = stage;
        const g = s.hullScars; g.clear();
        const lines = [
            [[-18,-34],[-9,-19],[-16,-7],[-5,7]],
            [[18,15],[6,8],[17,-2],[8,-18]],
            [[-7,34],[5,23],[-5,12],[4,3]]
        ];
        for (let i = 0; i < stage; i++) {
            const pts = lines[i];
            g.lineStyle(4, 0x1d0d14, .85);
            for (let j = 1; j < pts.length; j++) g.lineBetween(...pts[j-1], ...pts[j]);
            g.lineStyle(1, 0xe09c78, .62);
            for (let j = 1; j < pts.length; j++)
                g.lineBetween(pts[j-1][0] + 2, pts[j-1][1], pts[j][0] + 2, pts[j][1]);
        }
    },
    animate(s) {
        this.scars(s);
        const hp = s.shipHP / Math.max(1, s.maxShipHP);
        if (hp < .7 && s.elapsed >= s.nextPlayerSmokeAt && s.effectsActive < s.effectsLimit - 9) {
            s.burst(s.player.x + Math.sin(s.player.rotation) * 16,
                s.player.y - Math.cos(s.player.rotation) * 20, 'smoke', hp < .3 ? 1.04 : .62);
            s.nextPlayerSmokeAt = s.elapsed + (hp < .3 ? .33 : .68);
        }
        for (const e of s.enemies) {
            if (e.dead || e.hp / e.maxhp >= .58 || s.elapsed < e.nextDamageSmokeAt ||
                s.effectsActive >= s.effectsLimit - 9) continue;
            if ((e.x-s.player.x)**2 + (e.y-s.player.y)**2 > 720*720) continue;
            s.burst(e.x + Math.cos(e.heading)*11, e.y + Math.sin(e.heading)*11,
                e.isMonster ? 'violet' : 'smoke', e.hp / e.maxhp < .24 ? .95 : .53);
            e.nextDamageSmokeAt = s.elapsed + (e.hp/e.maxhp < .24 ? .64 : 1.26) + e.id % 4 * .13;
        }
    },
    floating(s, x, y, amount, color = '#ffd9a0') {
        if (s.floatingNumbers >= 14) return;
        s.floatingNumbers++;
        const label = s.add.text(x + Phaser.Math.Between(-10,10), y - 38,
            '-' + Math.max(1, Math.round(amount)), {
                fontFamily:'monospace', fontSize:'17px', fontStyle:'bold',
                color, stroke:'#190d17', strokeThickness:4
            }).setOrigin(.5).setDepth(56);
        s.tweens.add({ targets:label, y:label.y-42, alpha:0, duration:620,
            onComplete:()=>{ if(label.active)label.destroy(); s.floatingNumbers=Math.max(0,s.floatingNumbers-1); } });
    },
    debris(s, x, y, radius, monster = false) {
        const count = monster ? 5 : Math.min(14, 6 + Math.floor(radius/24));
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = radius * (.3 + Math.random() * .5);
            const p = monster
                ? s.add.circle(x+Math.cos(angle)*dist, y+Math.sin(angle)*dist,
                    3+Math.random()*5, 0x632d45, .85)
                : s.add.rectangle(x+Math.cos(angle)*dist, y+Math.sin(angle)*dist,
                    5+Math.random()*9, 2+Math.random()*4, i%2 ? 0xc0916b : 0x5c3931, .95).setRotation(angle);
            p.setDepth(19);
            s.tweens.add({targets:p, x:p.x+Math.cos(angle)*(25+Math.random()*radius*.5),
                y:p.y+Math.sin(angle)*(25+Math.random()*radius*.5),
                alpha:0, duration:1000+Math.random()*900,
                onComplete:()=>{if(p.active)p.destroy();}});
        }
    },
    hitEnemy(s, e, x, y, amount) {
        if (s.time.now - e.lastHitVisualTime < 95) return;
        e.lastHitVisualTime = s.time.now;
        this.floating(s, x, y, amount);
        s.burst(x, y, 'splinters', .6);
        SEA_AUDIO.play('hit', .82, Math.hypot(e.x-s.player.x, e.y-s.player.y));
    },
    damagePlayer(s, x, y, amount) {
        SEA_AUDIO.play('hurt', Math.min(1.5, .65+amount/25));
        this.floating(s, x, y, amount, '#ffb3ae');
        this.scars(s);
        if (s.damageFlash) {
            s.tweens.killTweensOf(s.damageFlash);
            s.damageFlash.setAlpha(.11);
            s.tweens.add({targets:s.damageFlash, alpha:0, duration:340});
        }
    },
    sinkEnemy(s, e) {
        this.debris(s, e.x, e.y, e.radius, e.isMonster);
        if (!e.isMonster && s.textures.exists('v15-wrecked')) {
            const h = s.textures.get('v15-wrecked').getSourceImage().height;
            const wreck = s.add.image(e.x, e.y, 'v15-wrecked').setDepth(12)
                .setRotation(e.heading).setScale(e.radius*2/Math.max(1,h))
                .setTint(0x977778).setAlpha(0);
            s.wrecks = s.wrecks.filter(w=>w.active);
            s.wrecks.push(wreck);
            if(s.wrecks.length > 14)s.wrecks.shift().destroy();
            s.tweens.add({targets:wreck, alpha:.52, duration:550});
            s.tweens.add({targets:wreck, alpha:0, duration:2300, delay:6500,
                onComplete:()=>{if(wreck.active)wreck.destroy();}});
        }
        const dist = Math.hypot(e.x-s.player.x, e.y-s.player.y);
        if (dist < 1150) SEA_AUDIO.play('sink', e.boss ? 1.45 : .68, dist);
        s.tweens.add({targets:e.ship, y:e.y+e.radius*.4, alpha:0,
            scaleX:e.spriteScale*.70, scaleY:e.spriteScale*.51,
            rotation:e.heading+(e.id%2 ? .3 : -.3),
            duration:e.boss ? 1450 : 850, ease:'Sine.easeIn',
            onComplete:()=>{if(e.ship.active)e.ship.destroy();}});
    },
    sinkPlayer(s) {
        if (s.sinking || s.ended) return;
        s.sinking = true;
        s.touchReset();
        s.playerVelocity.x = s.playerVelocity.y = 0;
        s.playerWake?.setVisible(false);
        SEA_AUDIO.play('sink', 1.4);
        SEA_AUDIO.play('defeat', 1);
        const x=s.player.x, y=s.player.y;
        this.debris(s, x, y, s.hullRadius);
        s.burst(x,y,'blast',1.6); s.splash(x,y,0xf2bcae,24);
        s.v15Burst(x,y,8,.76);
        s.announce('O MAR RECLAMA SUA EMBARCAÇÃO');
        s.tweens.add({targets:s.playerVisual, alpha:0, scale:.56, y:43,
            duration:1270, ease:'Sine.easeIn'});
        s.time.delayedCall(1350, ()=>s.finish(false));
    }
};
