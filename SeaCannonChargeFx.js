/* 3.8a.3 — Faísca da mecha dos canhões.
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
            sprites[side] = s.add.image(this.positions[side], 0, this.key, 0)
                .setScale(.44).setAlpha(.66).setVisible(false);
            s.playerVisual.add(sprites[side]);
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
            sprite.setFrame(frame).setAlpha(.54+progress*.26)
                .setScale(.40+progress*.055).setVisible(true);
        }
    }
});
