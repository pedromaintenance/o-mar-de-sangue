# Culto de Dagon — 20 evoluções da nau eldritch

**Estado:** pacote gráfico integrado ao GitHub e validado. **Não habilitado no gameplay** até existir aliança explícita e persistente com o Culto.

## Arquivos publicados

- `Evolucao_de_Navios_Eldritch_Culto_de_Dagon_original.png` — PNG original do criador (1213 × 1296, RGBA); SHA-256 `59d50d3ef2371af640b6a4f98ba60cd1b91b090daebc3f3ff31345ea65c98008`.
- `mar_de_sangue_navio_culto_dagon_20_evolucoes.png` — atlas normalizado (1460 × 1560, RGBA); SHA-256 `07b5591fd7f4aa23666c376a099addae6a3c69531066ad1c41e065b44df40b3c`.
- `mar_de_sangue_navio_culto_dagon_manifest.json` — 20 quadros com origem, destino, alinhamento e hashes individuais.
- `evolucoes/navio_culto_dagon_nivel_01.png` até `nivel_20.png` — sprites RGBA individuais 260 × 360.

**Formato:** 5 colunas × 4 linhas, espaçamento transparente de 40 px, leitura esquerda → direita e cima → baixo. Proa apontada para baixo. Os quadros reproduzem os pixels originais, sem girar, redimensionar nem repintar a imagem. O atlas padronizado respeita o mesmo contrato visual da Corte Feérica e dos Sobreviventes.

## Geração e validação

A importação foi executada por `.github/workflows/dagon-ships.yml` após o PNG ser enviado ao repositório, com conclusão **success** em 28/10/2026.

- Gerador: `python tools/preparar_evolucao_culto_dagon.py`.
- Teste de regressão: `node tests/culto-dagon-assets.test.cjs`.
- Todos os 20 arquivos e o manifesto estão versionados.
- O teste valida SHA-256, RGBA, geometria, posições e consistência de cada quadro.
- O processo preserva o original para futuras regenerações.

## Integração funcional futura

As três facções **Corte Feérica**, **Sobreviventes** e **Culto de Dagon** têm arte pronta, mas o jogador ainda utiliza `player-ship-stages` por padrão. As aparências especiais só devem entrar no gameplay após a implementação de uma **aliança canônica persistente**. O campo `faction:'culto'` de decisões em `SeaPoliticalEvents.js` não equivale a uma adesão permanente.

Ao ativar no futuro, registrar `allegiance` no perfil com compatibilidade de saves; carregar o atlas como spritesheet 260×360 com `spacing:40`; usar `SEA_PLAYER_SHIP.stage(profile.levels)-1` para escolher o quadro; preservar orientação local `Math.PI`, colisões, 15 upgrades, câmera e controles; incluir atlas no PWA e nas prévias de menu.

**Não adicionar a textura ao preload nem ao precache antes de ser efetivamente usada:** evita carregar 1,8 MB extras em cada sessão. Consulte `docs/faction-ship-art-status.md`.
