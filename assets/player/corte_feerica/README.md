# Corte Feérica — atlas de 20 evoluções

**Ativado no gameplay a partir da V100**, após juramento no Conselho das Três Bandeiras.

O atlas `mar_de_sangue_navio_corte_feerica_20_evolucoes.png` contém 20 estágios (1460 × 1560; 5 colunas × 4 linhas; quadros 260 × 360 com 40 px transparentes entre células). Os 20 PNGs individuais e a imagem final de referência continuam arquivados e preservados.

Textura Phaser: `player-ship-court`. A progressão visual usa `SEA_PLAYER_SHIP.stage(profile.levels)-1`, a mesma do navio neutro. A escolha não afeta características, física, colisões ou melhorias; só é aplicada depois de reputação suficiente, prova de serviço e juramento explícito.

Consulte `docs/faction-council-v100.md`. Regressão: `node tests/corte-feerica-assets.test.cjs`.


## V111 — Nave Mística, nível 20 animado

- Original preservado como `navio_corte_feerica_nivel_20_original.png`, spritesheet de quatro quadros 512 × 682 (2048 × 682), SHA-256 `0bf3dec9c4d01a98d40c778f4e740d290116ce210cf961a701a4f1d44fa7d910`.
- O arquivo entregue continha fundo preto com alfa opaco. A imagem usada pelo jogo (`navio_corte_feerica_nivel_20_animado.png`) mantém o RGB original e substitui somente o alfa da área externa conectada às bordas, com pequena suavização nas bordas dos efeitos de luz. SHA-256 `eb9498bfdea50344aa134410d8a96b20215d2bf2507b032b3dd5501c43174cac`.
- Prévia do Porto/Conselho: `navio_corte_feerica_nivel_20_preview.png`, primeiro quadro 512 × 682 (SHA-256 `40ffd1120e510c63dfd3d7f9ed62a1b0c2bd05f588cb379e3eae4ed28437726b`).
- Ativação exclusiva após juramento à **Corte Feérica** e quando o **estágio visual 20** estiver liberado pelas 15 melhorias. Loop de quatro quadros a **4 FPS**, mesma orientação e raio de colisão do navio anterior. Níveis 1–19 permanecem no atlas original.
- O Diário do Capitão usa a configuração visual genérica `SEA_FACTIONS.level20Asset`; o Porto e o Conselho selecionam o preview da Corte. Não houve alterações de física, save, atributos, IA ou progressão.
- Validação automatizada em `tests/court-final-v111.test.cjs` e navegador real em `tests/court-final-v111-visual.test.cjs`. PWA usa cache V111.
