/* 3.8a.5 — Faísca legível: RGBA válido + blend aditivo sem borrão.
 * Só apresentação: dois sprites persistentes, nenhum emissor de partículas
 * nem alteração na preparação, no recuo ou no orçamento de efeitos.
 */
const SEA_CHARGE_FX = Object.freeze({
    key: 'fx-cannon-charge',
    sides: Object.freeze(['port','starboard']),
    positions: Object.freeze({port:-55,starboard:55}),
    init(s) {
        if (!s.playerVisual || !s.textures?.exists(this.key)) return false;
        const sprites = {};
        for (const side of this.sides) {
            const sprite=s.add.image(this.positions[side], 0, this.key, 0)
                .setScale(.82).setAlpha(.88).setVisible(false);
            // Additive mixing makes a lit spark brighten the dark crimson sea
            // instead of laying an opaque brown/black rectangle over the hull.
            if(typeof Phaser!=='undefined' && sprite.setBlendMode)
                sprite.setBlendMode(Phaser.BlendModes.ADD);
            sprites[side]=sprite;
            s.playerVisual.add(sprite);
        }
        s.chargeSparkSprites = sprites;
        return true;
    },
    clear(s) {
        for (const side of this.sides)
            s.chargeSparkSprites?.[side]?.setVisible(false);
    },
    sync(s) {
        const sprites=s.chargeSparkSprites;
        if(!sprites)return;
        const blocked=s.ended||s.sinking||s.islandDocked||
            s.atlasOpen||s.pausedByCaptain;
        const required=SEA_GUNNERY.chargeMs(s.profile?.levels?.cadencia||0);
        for(const side of this.sides) {
            const sprite=sprites[side];
            if(!sprite)continue;
            const charge=s.cannonCharge?.[side]||0;
            const active=!blocked&&charge>0&&!s.cannonNeedsRelease?.[side];
            if(!active) {
                sprite.setVisible(false);
                continue;
            }
            const progress=Math.max(0,Math.min(.999,charge/required));
            const frame=Math.min(4,Math.floor(progress*5));
            // The artwork itself grows in intensity: don't shrink the bright
            // core back into an indistinct dot or lower its alpha too much.
            sprite.setFrame(frame).setAlpha(.87+progress*.11)
                .setScale(.82+progress*.065).setVisible(true);
        }
    }
});
