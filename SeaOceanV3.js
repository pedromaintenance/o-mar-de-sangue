/* O MAR DE SANGUE — Oceano V3 (apenas apresentação).
 * Quatro chunks de 1024 px, oito quadros a 160 ms; atlas 4x2.
 * As posições são ancoradas no mundo e recicladas conforme a câmera.
 * Em dispositivos com pouca memória gráfica, usa os chunks estáticos.
 */
const SEA_OCEAN_V3 = {
    tileSize: 1024,
    frames: 8,
    frameDuration: 160,
    animated: false,
    key(index) { return 'sea-v3-'+index; },
    // Distribuição determinística: nenhum tile muda de arte enquanto o navio navega.
    variant(col,row) {
        const x = Math.imul(col, 374761393);
        const y = Math.imul(row, 668265263);
        let h = x ^ y ^ 0x6d617233;
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        return 1 + (((h ^ (h >>> 16)) >>> 0) % 4);
    },
    preload(scene) {
        const gl = scene.game?.renderer?.gl;
        const maxTexture = gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 0;
        this.animated = !SEA_TOUCH && !!gl && maxTexture >= 4096;
        for (let i = 1; i <= 4; i++) {
            const path = 'assets/tiles/sea-v3/sea_chunk_0'+i+'_';
            if (this.animated) {
                scene.load.spritesheet(this.key(i), path+'atlas.webp', {
                    frameWidth: this.tileSize, frameHeight: this.tileSize,
                    endFrame: this.frames - 1
                });
            } else {
                scene.load.image(this.key(i), path+'base.webp');
            }
        }
    },
    available(scene) {
        return [1,2,3,4].every(i=>scene.textures.exists(this.key(i)));
    },
    create(scene) {
        if (!this.available(scene)) return false;
        scene.seaV3Active = true;
        scene.seaV3Tiles = [];
        const columns = Math.ceil(SEA_VIEW.width / this.tileSize) + 2;
        const rows = Math.ceil(SEA_VIEW.height / this.tileSize) + 2;
        for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) {
            const sprite = scene.add.image(0, 0, this.key(1), this.animated ? 0 : undefined)
                .setOrigin(0, 0).setDepth(-110);
            scene.seaV3Tiles.push({sprite, x, y, col: NaN, row: NaN, frame: -1});
        }
        // NEAREST impede que um frame do atlas sangre nas bordas do vizinho.
        if (this.animated && typeof Phaser !== 'undefined' && Phaser.Textures?.FilterMode) {
            for (let i = 1; i <= 4; i++)
                scene.textures.get(this.key(i)).setFilter?.(Phaser.Textures.FilterMode.NEAREST);
        }
        // Compatibilidade com SEA_PIXEL.seaInit, que testa this.seaBase.
        scene.seaBase = scene.seaV3Tiles[0]?.sprite;
        this.update(scene, 0, true);
        return true;
    },
    update(scene, elapsedSeconds, force = false) {
        if (!scene.seaV3Tiles) return;
        const cam = scene.cameras.main;
        const firstCol = Math.floor((cam.scrollX || 0) / this.tileSize) - 1;
        const firstRow = Math.floor((cam.scrollY || 0) / this.tileSize) - 1;
        const frame = this.animated
            ? Math.floor(Math.max(0, elapsedSeconds) * 1000 / this.frameDuration) % this.frames
            : 0;
        for (const tile of scene.seaV3Tiles) {
            const col = firstCol + tile.x, row = firstRow + tile.y;
            if (force || col !== tile.col || row !== tile.row || frame !== tile.frame) {
                if (force || col !== tile.col || row !== tile.row) {
                    tile.sprite.setPosition(col * this.tileSize, row * this.tileSize);
                    tile.col = col; tile.row = row;
                }
                tile.sprite.setTexture(this.key(this.variant(col,row)), this.animated ? frame : undefined);
                tile.frame = frame;
            }
        }
    }
};