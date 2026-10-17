# O Mar de Sangue 3.6d — Acessibilidade dos diálogos críticos

**Estado:** integrada à `main` em 16/10/2026 via [PR #40](https://github.com/pedromaintenance/o-mar-de-sangue/pull/40), com smoke e Chromium aprovados. Sem alteração de save, economia, navegação naval ou áudio. Testes físicos pendentes.

## Melhoria entregue

A tela de restauração criada na 3.6c agora apresenta sua comparação de progresso de forma compreensível também por leitores de tela:

- A área possui nome e instruções vinculados ao título, com `role="region"`, `aria-labelledby` e `aria-describedby`; evita declarar falsamente um modal cujo foco não está confinado.
- A grade de comparação possui cabeçalhos de coluna (`role="columnheader"`), cabeçalhos de linha (`role="rowheader"`) e células numéricas (`role="cell"`), além de linhas e tabela identificadas. Mantém as seis métricas e os estilos anteriores.
- Na segunda etapa de confirmação, o alerta é anunciado por `role="alert"`. **CANCELAR** continua recebendo o foco inicial, tanto na prévia quanto na confirmação final.
- O Diário de Bordo passa a explicar onde exportar/restaurar backups, por que são necessárias duas confirmações e como cancelar com ESC, Backspace ou B.
- A confirmação de reset recebe nome de seção `ESQUECER O MAR?` para facilitar a leitura por tecnologias assistivas.

Não existem botões destrutivos novos e a ordem existente das opções não muda. Todos os diálogos permanecem utilizáveis com teclado, toque, mouse e gamepad.

## Segurança e compatibilidade

A comparação e os avisos são exclusivamente apresentação. `SeaSaveTransfer.js` e `SeaProfile` continuam exatamente como na versão 3.6c, com esquema v4. Ações de cancelar não armazenam dados. O cache da PWA recebe versão v44 por causa da atualização da interface e dos testes.

## QA

- [x] `tests/port-visual.test.cjs`: Chromium 1600×900, 1280×720 e Android 390×844; conferir cabeçalhos/células acessíveis, foco em Cancelar, Escape/B sem escrita e confirmação final anunciada.
- [x] `tests/port-controller-navigation.test.cjs`: botão B elimina a confirmação pendente e retorna ao porto, sem aplicar restauração.
- [x] Preservar regressões existentes de save, música, estaleiro, Atlas e PWA.
- [x] `port-smoke` e `port-visual` concluídos com sucesso; squash merge `3a8e3a7`.
- [ ] Testar leitor de tela e controle físico Xbox em dispositivo real.

## Próximos passos

Continuar os testes físicos de navegação sem mouse, moderação dos efeitos visuais e desempenho em celulares; planejar a reputação persistente 3.3b somente após aprovação das regras e migração v4→v5.
