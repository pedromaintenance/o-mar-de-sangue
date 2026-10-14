# O Mar de Sangue v1.9.1 — Primeira revisão de pixel art

## Implementado

- `SeaPixelArt.js`: gera **8 texturas pixel-art locais** no Phaser, sem imagens externas: mar de sangue, mar espectral, redemoinho carmesim, redemoinho verde, recife, nau naufragada, boia amaldiçoada e tentáculo.
- Menu principal, estaleiro, manual, relatório, confirmação de reinício e Diário do Capitão: molduras quadradas com latão envelhecido, nós de sangue, cantos ornamentados e botões pintados sobre grade pixelada. Focus/hover/gamepad preservados.
- Menu de atracação: mesma paleta e bordas em pixel art, inclusive opções selecionadas.
- Mar: camada adicional de ondas pixeladas, uma segunda camada sobrenatural que ganha presença durante névoa e maldição e setpieces decorativos distribuídos pelo oceano.
- Redemoinho: sprite pixelado gira sincronizado ao redemoinho que **já causa dano**; nenhum dano adicional foi acrescentado.
- Recifes: ornamentação sobre ilhas com colisão já existente; destroços, boias e tentáculos são cenográficos (não são obstáculos nem encontros).
- Todas as texturas são geradas depois do preload e antes do menu; permanecem disponíveis no modo offline pelo Service Worker, com o módulo de arte pré-cacheado.

## Importante: sprites procedurais x PNGs de referência

Os **atlases PNG de alta resolução gerados no chat** ainda são materiais de direção artística. Esta PR implementa uma primeira versão procedural de pixel art, imediatamente executável no jogo, e **não contém os PNGs originais**. As artes geradas no chat continuam candidatas a substituir / enriquecer os sprites após recorte, transparência e envio binário ao repositório.

O código foi isolado no módulo `SeaPixelArt.js` justamente para facilitar a troca futura pelos sprites definitivos sem alterar a lógica de gameplay.

## Compatibilidade

Nenhuma mudança em:
- saves `carcaca.mar-de-sangue.v4`, preço de upgrades e progressão
- mecânicas de atracação e regras de combate
- música FLAC do GitHub Pages e WebAudio procedural
- resolução 1280×720 desktop e 480×800 celular
- controles de teclado, toque, gamepad e pause

## Como verificar

1. Acesse o jogo após atualizar a PWA/recarregar para invalidar o cache antigo.
2. Verifique foco dos botões no menu com mouse, teclado e controle.
3. Entre no estaleiro, manual, resultado de uma missão e Diário do Capitão (Esc/P).
4. Navegue por um mapa para ver boias, naufrágios, tentáculos e recifes pixelados.
5. Encontre um redemoinho e observe o giro, a atração e o dano.
6. Atracar numa ilha deve continuar possível conforme a v1.9.0.

## Próximo passe

Separar em sprites individuais as folhas de arte da conversa, revisar alpha e escala; importar PNGs como arquivos reais e preparar variantes animadas de água. Evitar enviar spritesheets grandes como base64 embutido em arquivos JS.
