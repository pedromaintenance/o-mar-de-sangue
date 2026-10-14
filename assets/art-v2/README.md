# V2 Visual — Fase A (piloto de fidelidade)

**Estado: EM REVISÃO — NÃO MESCLAR À `main`**. A branch contém a integração experimental `SeaArtPilot.js` (inativa por padrão), mas os recortes PNG binários produzidos localmente ainda não estão no repositório. O pacote de arquivos e a prévia comparativa foram entregues à parte para aprovação visual; **não usar como prova de que os sprites já estão hospedados no GitHub Pages**.

## Objetivo

Retomar os PNGs RGBA gerados especificamente para O Mar de Sangue, preservar resolução e cores e evitar a regressão visual da v1.9.2.

## Assets reais recortados no pacote

- `ui/logo/main.png` — 790×282 px, alpha RGBA, sem quantização para 15 cores;
- `ui/buttons/dark_{left,middle,right}.png` — composição de três segmentos;
- `ui/buttons/focus_{left,middle,right}.png` — composição de três segmentos, alternativa em foco;
- `sea/hazards/reef_needles.png` — 277×239 px;
- `sea/hazards/wreck_reef.png` — 313×253 px.

Origem: `kit_de_interface_pixel_art_náutico_sombrio.png` e `atlas_de_pesadelos_náuticos_em_pixel_art.png` (ambos RGBA), incluídos no pacote offline fornecido ao usuário. O manifesto registra coordenadas, modos, tamanhos e SHA-256 por PNG; scripts reproduzem o recorte.

## Prévia Phaser opt-in

1. Publicar os 9 PNGs, preservando os caminhos relativos do pacote, sob `assets/art-v2/` **nesta branch**.
2. Abrir o app da branch em ambiente de prévia (não confundir com o GitHub Pages da `main`), adicionando `?artPilot=1`.
3. O loader de `SeaBoot.preload()` registra os sprites `art2-*`, caso o parâmetro esteja presente.
4. `SeaPort.banner()` usa o logotipo real, `SEA_UI.button()` usa as peças com composição horizontal, e `Game.buildWorld()` usa as artes de recife/destroços, **sem alterar colisão**.
5. Removendo o parâmetro, o mesmo código usa os sprites da v1.9.3 sem mudança visual.
6. Se a textura faltar, o sistema conserva a aparência original para aquela parte.

**Importante:** não colocar caminhos inexistentes na lista `ASSETS` do service worker. Quando as imagens forem publicadas, incluir os caminhos reais, atualizar `CACHE_NAME` e testar offline antes de integrar.

## Critérios de aceitação

- Conferir lado a lado logo, botão e recife na resolução exibida (sem bordas duras, glifos antigos repetidos ou halo preto).
- Confirmar legibilidade de textos dinâmicos, foco, toque, teclado, Xbox A/B e pause.
- Testar nas resoluções 480×800 (celular) e 1280×720 (desktop) **em navegador real**.
- Confirmar 60/30 FPS alvo, sem nova carga de memória excessiva.
- Confirmar saves v4 e música FLAC.
- Não mesclar antes da aprovação visual.

## Retrocompatibilidade

As mecânicas da v1.9.3 não são modificadas; o novo módulo tem escopo visual e fica desligado por padrão.
