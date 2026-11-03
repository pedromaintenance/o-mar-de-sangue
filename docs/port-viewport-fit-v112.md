# Porto V112 — escala de menus e altura útil da tela

## Objetivo

Reduzir levemente os menus no desktop e eliminar a rolagem evitável da tela inicial em celulares.

## Decisões
- Desktop: reduzir discretamente banner, cartões e cabeçalhos sem alterar a resolução do canvas.
- Mobile retrato: atalhos do menu principal em duas colunas, inclusive em 320–420 px; Contratos e Conselho ficam em linha inteira. Áreas de toque com altura mínima de 44 px.
- Rodapé: controles de áudio, performance e acessibilidade aparecem no botão **ÁUDIO · OPÇÕES · FPS**, fechado por padrão somente no mobile. Todos continuam acessíveis; desktop permanece expandido. A preferência de leitura ampliada continua persistida como antes.
- Menus secundários (Estaleiro, Diário, Conselho, Contratos, restauração e resultados): espaçamento, cabeçalhos e ilustrações menores. Conteúdo longo permanece rolável, sem esconder funções.
- `PortViewportFit.css` é carregado após as folhas existentes; arquivo versionado e reversível.
- PWA cache V112.
- Fora de escopo: navegação naval, HUD Phaser, física, balanceamento, saves e performance de combate.

## QA
`tests/port-viewport-fit-v112.test.cjs` verifica em Chromium tamanhos 390×844, 360×740, 320×640, 844×390 e desktop 1280×720; verifica viewport, rolagem, botões e abertura do rodapé. Os testes do Porto e do cache também rodam.

Rollback: reverter o PR, sem migração de dados.
