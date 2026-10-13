# O Mar de Sangue — Plano de Produção de Assets (vFinal)

**Direção artística aprovada:** pixel art medieval sombria, top-down, cenário Carcaça.  
**Workflow:** branch `develop/assets-pixel-art` → extração → QC → replanejamento → integração → testes → PR → merge `main`.

1. [x] F0 — Repositório confirmado, GitHub conectado, branch criada.
2. [x] F1 — sprites de jogador, Corte, galeão, aríete, moeda e baú recortados e com proas alinhadas.
3. [x] F2 — mar rubro + overlays alfa de sangue, espuma, névoa; ilhas Daegon, ruína, recife, Deméter, monastério e destroços. Redesenho do conteúdo faltante em pixel art e validação de bordas dos tiles.
4. [x] F3 — atualização do Phaser e PWA com assets locais, sem alterar física e progressão; texturas ajustadas às colisões anteriores.
5. [x] F4 — quatro variantes adicionais de navios, porto pixel art, canhoneio e estilhaços em quatro quadros e apresentação refinada.
6. [x] F5 — checagem de sintaxe, imagens, cenas, missões, sandbox, compras, projéteis e efeitos com Chromium; Service Worker em precache completo.

## Ajustes após QC
- Concepts gerados não eram sprites perfeitos: recortados manualmente, transparência e escala normalizadas.
- Tiles de mar refeitos com bordas correspondentes; neblina e espuma alfa preservados.
- A versão v06 tinha assets misturados; substituímos tudo por conjunto coeso, inclusive refúgios e destroços.
- Spritesheets de efeitos falharam no navegador de QA com URLs em data URI; replanejamos como 4 PNGs individuais por animação, carregados de forma confiável pelo Phaser.
- Versões de sprites muito grandes foram reduzidas na renderização para manter as mesmas colisões físicas (espaço real de movimentação não mudou).
- O arquivo de cache antigo não incluía as texturas novas; foi regenerado com todos os assets e versionado.

## Qualidade e próximos testes
- Teste programático em Chromium: concluído, logs em `docs/RELEASE-QA.md`.
- Smoke test de PWA instalada no Chrome Android: pendente fora do ambiente automatizado.
- Backups: preservados os arquivos originais e as versões de assets na branch de desenvolvimento.
