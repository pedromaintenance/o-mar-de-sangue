# O Mar de Sangue — 3.6e: Leitura Ampliada do Porto

**Situação:** integrado à `main` em 16/10/2026 pelo [PR #41](https://github.com/pedromaintenance/o-mar-de-sangue/pull/41) (squash `11f8ceb`), com CI smoke e Chromium aprovados. Não há alteração de regras de jogo nem saves. QA físico no Pages/PWA pendente.

## O que muda
- Adiciona o botão **AMPLIAR TEXTO** no rodapé do Porto, acessível em todas as telas do Porto (menu, estaleiro, Diário de Bordo, resultados, backup, restauração e reset). Ao ativar, muda para **TEXTO PADRÃO**.
- Amplia de forma localizada textos dos cartões de navegação, descrições, Diário de Bordo, estaleiro, indicadores, comparação de saves e instruções de áudio. Os tamanhos não aumentam por escala do canvas e a interface continua rolável.
- No Android estreito, a barra de status do navio passa para duas colunas no modo ampliado, para preservar legibilidade e evitar overflow horizontal.
- O botão informa `aria-pressed="true/false"`; navegação por teclado, mouse, toque e gamepad continua pelas mesmas ações.
- O Diário de Bordo explica como reverter a opção.

## Persistência e compatibilidade
- Preferência independente: `localStorage['carcaca.mar.port.readable.v1']`, `'1'` ao ativar, `'0'` ao desativar; ausência da chave equivale ao aspecto original.
- Leitura do navegador usa `try/catch`: em navegadores que bloqueiam `localStorage`, o modo ainda pode funcionar na sessão.
- Não altera `SeaProfile` v4, ouro, melhorias, saves JSON, estado de áudio, configuração da PWA, atlas, sprites ou mecânicas de combate.
- O modo aplica-se exclusivamente ao Porto (HTML/CSS), não ao HUD do Phaser durante a navegação.

## Testes
- [x] Contrato Node: ação, alternância, `aria-pressed`, chave isolada e save intacto.
- [x] Chromium desktop 1600×900 e 1280×720 e Android emulado 390×844: tamanho computado maior, sem overflow horizontal em menu e restauração, screenshots, preferência após reload e isolamento de saves/áudio.
- [x] CI `port-smoke` e `port-visual` aprovados; PR #41 integrado.
- [ ] QA manual: dispositivo físico, gamepad e leitor de tela, inclusive com layout Android e PWA instalada.

## Como testar
Abra o Porto, procure **AMPLIAR TEXTO** no rodapé. Ative, visite o **Diário de Bordo**, abra o estaleiro e pré-visualize (sem confirmar) um save. Recarregue e verifique se a escolha permanece. Use **TEXTO PADRÃO** para voltar ao visual anterior.

## Próximo marco
3.6f: ampliar acessibilidade de sobreposições dentro da navegação e fazer testes de desempenho em hardware modesto. O sistema de reputação persistente 3.3b requer balanceamento aprovado e migração v4→v5 testada separadamente.
