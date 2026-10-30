# Culto de Dagon — atlas de 20 evoluções eldritch

**Ativado no gameplay a partir da V100**, após juramento no Conselho das Três Bandeiras.

Arquivos preservados: imagem original `Evolucao_de_Navios_Eldritch_Culto_de_Dagon_original.png` (1213×1296), atlas `mar_de_sangue_navio_culto_dagon_20_evolucoes.png` (1460×1560, RGBA), manifesto com hashes e 20 sprites individuais em `evolucoes/`. Os recortes foram gerados sem alterar os pixels originais.

Textura Phaser: `player-ship-dagon`. Os 20 quadros seguem a mesma evolução das 15 melhorias, com sprites fixos e proa para baixo. A adesão requer 40 de confiança, prova de sacrifício ou pacto e juramento em Portomonte.

O cache PWA V100 inclui o atlas. Consulte `docs/faction-council-v100.md`. Regressão: `node tests/culto-dagon-assets.test.cjs`.


## V110 — Navio final animado do Culto de Dagon

- **Imagem enviada e preservada byte a byte:** `navio_culto_dagon_nivel_20_original.png`, 2048 × 512 (4 × 512 × 512), SHA-256 `e3b60d315c00929623d9d570909d12ac47ad8f116842173ef2e8ef7ade484665`.
- **Arte de jogo:** `navio_culto_dagon_nivel_20_animado.png`. A imagem de entrada tinha um fundo preto totalmente opaco; para compor com a água, o fundo externo foi isolado por conectividade a partir das bordas (valor RGB máximo ≤ 28) e somente o canal alfa foi alterado. Todos os valores RGB continuam idênticos. SHA-256 `72b8bcac99cf9a4813c139ee2cd56eb204f96de4a055f1e712f6bb48ae55eb56`.
- **Prévia:** `navio_culto_dagon_nivel_20_preview.png`, cópia exata em pixels do quadro 0 do derivado transparente (512 × 512).
- **Tempo:** 4 quadros em loop a 4 FPS, a partir do quadro 0; mesma orientação de proa do atlas anterior.
- **Ativação:** exclusiva para o Culto de Dagon, estágio visual 20 definido pelo menor nível entre as 15 melhorias; nenhuma mudança para níveis 1–19, outras facções, colisões, física ou saves.
- **UI:** mesma prévia no Porto, Conselho e Diário do Capitão. Cache PWA V110.
