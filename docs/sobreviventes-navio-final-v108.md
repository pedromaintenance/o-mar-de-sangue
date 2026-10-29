# Navio dos Sobreviventes nível 20 — Colheita Dourada (V108)

A arte de nível 20 dos Sobreviventes utiliza uma spritesheet original enviada pelo criador, de **2048 × 682** com **quatro quadros horizontais 512 × 682** (RGBA8). Nenhum pixel da spritesheet foi refeito. A miniatura de primeiro quadro é apenas um recorte exato dos pixels originais, sem redimensionamento.

- **Spritesheet:** `assets/player/sobreviventes/navio_sobreviventes_nivel_20_animado.png`
- **Miniatura:** `assets/player/sobreviventes/navio_sobreviventes_nivel_20_preview.png`
- **SHA-256 spritesheet:** `db4ea4a29702336da6c3fbd7ae66c00703365d6d495d8ffb2b567f504e4bbb14`
- **SHA-256 miniatura:** `1de25af63977358dcdabc08309f6dfbeb5f4fdfd24507ba93e99ad494152014f`
- **Animação:** quatro quadros, 4 FPS, quadro inicial 0.
- **Ativação:** somente **facção Sobreviventes**, estágio visual **20**. Esse estágio exige que as quinze melhorias tenham alcançado o nível necessário, de acordo com `SEA_PLAYER_SHIP.stage`.
- **Outros níveis / facções:** atlas original e seus 20 níveis permanecem intactos.
- **Escala:** baseada na altura de um frame (682); raio de colisão original continua inalterado.
- **Orientação:** proa para baixo, mesma compensação visual com `Math.PI`; física e movimentos preservados.
- **Porto:** painel principal, Conselho e pausa mostram a mesma arte final.
- **PWA:** cache V108, incluindo spritesheet e prévia.

Validar: `node tests/sobreviventes-final-level20.test.cjs` e workflow. Playtest manual recomendado com save de estágio 20.
