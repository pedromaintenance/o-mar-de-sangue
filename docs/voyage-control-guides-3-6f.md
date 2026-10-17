# O Mar de Sangue — 3.6f: Guias Contextuais da Viagem

**Status:** implementação na branch; publicação sujeita à aprovação de smoke e Chromium.

## Objetivo

As ações de teclado, controle Xbox e toque já existiam nas interfaces do jogo, mas as legendas de algumas telas eram incompletas. Esta entrega **documenta os comandos no próprio jogo**, sem criar atalhos novos, sem modificar interações e sem alterar as regras de combate.

### O que o jogador vê

- **Diário do Capitão / pausa:** direcional ou setas para escolher; Enter ou A para confirmar; ESC, P ou B para voltar; toque nas opções.
- **Carta dos Náufragos:** toque em um marco para marcar/desmarcar o destino; setas ou direcional escolhem o marco; Enter ou A marca; ESC ou B fecha. Nenhum marco oculto é revelado.
- **Encontros das ilhas:** setas ↑↓ ou direcional para percorrer as escolhas; Enter ou A confirma; ESC ou B volta; toque nas opções.
- **Diário de Bordo no Porto:** nova entrada "DIÁRIOS E ENCONTROS" explicando controles das sobreposições, M/View para abrir a Carta e F/A/toque para atracar.

Essas legendas são apresentadas dentro dos overlays Phaser existentes. Não há mudanças no canvas, resolução lógica ou geometria dos botões. O guia das ilhas ocupa a área entre decisões e botão de retorno, sem aumentar a lista de escolhas.

## Não muda

- `Game.js`, bindings de keyboard/gamepad e input por toque;
- caixas de clique (`hit`), opções e resultados de encontros;
- estados de descoberta, waypoints, regras políticas ou maldição;
- `SeaProfile` v4, backups, áudio, HUD, arte, inimigos e dificuldade.

O service worker usa nova revisão de cache para distribuir a atualização offline.

## Verificações

- [x] Testes Node em `tests/mare-negra-overlays.test.cjs`, `tests/atlas-chart.test.cjs` e `tests/port-ui-rebuild.test.cjs`: legendas presentes, opções/hitboxes inalteradas, nenhum dado oculto revelado.
- [x] Testes reais de navegador em `tests/mare-negra-overlays-visual.test.cjs` (desktop e celular) e `tests/atlas-chart-visual.test.cjs` (1600×900, 1280×720 e Android 390×844): legendas renderizadas, fora dos botões de saída, nenhuma gravação de save.
- [ ] CI `port-smoke` e `port-visual` concluídos com sucesso.
- [ ] Validação física com gamepad Xbox, Android e PWA instalada; conferir contrastes em monitores modestos.

## Próximas etapas

**3.6g (proposta):** instrumentação de FPS/tempo por quadro e avaliação de desempenho em celulares modestos, sem alterar física ou IA sem testes específicos. **3.3b — reputação persistente:** permanece dependente da aprovação das regras e migração de save v4→v5.
