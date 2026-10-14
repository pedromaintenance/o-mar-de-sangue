# O Mar de Sangue — Atlas pixel art integrado (v1.9.2)

## O que está no jogo

A arte gerada para O Mar de Sangue foi recortada e convertida para pequenos sprites **pixelados de verdade**. A fonte é a ilustração original, mas os pixels foram reduzidos, quantizados e compactados. O carregamento da PWA não depende das grandes imagens de conceito.

**Biblioteca incluída no GitHub:**
- `SeaRasterAssets.js`: decodificador de sprites PNG-like paletizados, 4 bits por pixel, com Deflate e CanvasTexture Phaser.
- `SeaRasterDataA.js`: logotipo **O MAR DE SANGUE**, botões normal/focado, texturas oceânicas rubras e escuras.
- `SeaRasterDataB.js`: redemoinho, recifes, destroços, ossadas, tentáculo, farol/boia e coral sobrenatural.

São **12 sprites reais**, armazenados como dados de pixels compactados em arquivos JS UTF-8, não como imagens PNG individuais. Os arquivos são decodificados uma vez pelo `SeaBoot` antes de iniciar o porto. As texturas são registradas com chaves `pixel-<nome>` no Phaser.

**Aplicações:**
- Porto: logotipo pixelado original, molduras dos botões com três segmentos, alternância visual do botão em foco.
- Mundo: texturas do mar de sangue e mar amaldiçoado em camadas parallax.
- Ilhas: substituição visual para recife, ruínas, altar de Daegon e destroços, mantendo os raios de colisão originais.
- Costa: faróis e tentáculos ornamentais perto de alguns santuários.
- Clima: redemoinho original pixelado acompanha a física preexistente.
- UI e cenários anteriores continuam como fallback em navegadores incapazes de decodificar o pacote.

## Pixel art e renderização

A renderização do jogo continua `pixelArt: true`, `antialias: false`, `roundPixels: true`. As imagens são renderizadas em canvas com pixels discretos e filtro NEAREST; os botões usam uma composição horizontal de três segmentos para conservar ornamentos das extremidades quando mudam de largura.

## Formato interno dos dados

Cada registro tem o formato `[nome, largura, altura, paletaHex, conteudoDeflateBase64]`.

- A primeira cor (índice zero) é transparente.
- Cada byte descompactado guarda dois pixels de quatro bits.
- A paleta de até quinze cores opacas é convertida em RGBA.
- `DecompressionStream('deflate')` decodifica o mapa, sem bibliotecas externas.
- Navegadores incompatíveis retornam ao visual preexistente.

## Direitos e evolução

A direção de arte deriva dos atlas de conceitos criados especificamente para este projeto em outubro de 2026. A futura etapa pode substituir partes dos menus restantes e adicionar mais navios/efeitos. Os arquivos-fonte em alta resolução são conservados separadamente das versões compactas para facilitar reedição e novos recortes.

Esta atualização não altera os saves v4, as regras de atracação, o balanceamento, os controles e nem a trilha sonora FLAC.
