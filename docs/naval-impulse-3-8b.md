# 3.8b.0 — Arrancada Naval e Mestres da Arrancada

**Estado:** publicada em 18/10/2026, [PR #58](https://github.com/pedromaintenance/o-mar-de-sangue/pull/58), squash `aa59e7f`. Testes PR/pós-merge aprovados ([run 39185589085](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39185589085)); [GitHub Pages publicado](https://pedromaintenance.github.io/o-mar-de-sangue/) ([run 39185589073](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39185589073)).

## Proposta de gameplay

Um impulso curto e intencional no rumo da proa permite **escapar, interceptar ou abalroar**. Continua perigoso: a física das colisões, rochas, dano ao casco e monstros **não concede invulnerabilidade**.

- **Teclado:** `R` (uma arrancada por novo pressionamento).
- **Xbox:** botão `X` (índice 2 no gamepad), usando o evento de pressão nova `just[2]`.
- **Toque/mouse:** botão **IMPULSO** visível durante a viagem, com relógio de recarga. Desktop: centro aproximado (613,77); celular: centro (240,616), acima do painel dos canhões; não sobrepõe joystick nem os dois gatilhos táteis.
- **Duração:** `0,7 s` de impulso. A ativação aplica velocidade instantânea para frente igual a `1,35 × velocidade máxima normal`, limitada ao teto `1,85 × velocidade máxima`.
- Enquanto dura, o teto de velocidade é `velocidadeMax × [1+0,85×(tempoRestante/0,7)^0,45]`, diminuindo gradualmente para o máximo normal. A direção pode ser controlada; impulso não é teleporte e as colisões/limites são processados a cada frame.
- **Uma arrancada por acionamento:** manter R apertado, manter X pressionado ou tocar repetidamente durante recarga não dispara outras arrancadas. O contador permanece pausado nas telas de pausa, Atlas e atracação, como o tempo de simulação.
- **Canhões:** ativar impulso interrompe qualquer preparação em curso; enquanto a arrancada está ativa, não permite carregar salvas. Antes de uma nova preparação, todos os controles da bateria precisam ser soltos. O sistema anti-metralhadora é preservado.
- **Feedback:** o botão exibe **ARRANCADA** durante a aceleração e a contagem restante durante o cooldown; um tremor de câmera leve e curto confirma o acionamento. Sem emissões de partículas novas.

## Melhoria do estaleiro

Nova melhoria **Mestres da Arrancada** no grupo **Motor**, começando no nível zero para todos os jogadores. Preço inicial 75 ouro, multiplicador 1,55 por nível.

**Recarga em segundos:** `T(n)=2+8×exp(-0,13×n)` (nível não negativo).

| Nível | Recarga aproximada |
|---:|---:|
| 0 | 10,00 s |
| 5 | 6,18 s |
| 10 | 4,18 s |
| 20 | 2,59 s |
| 30 | 2,16 s |
| 50 | 2,01 s |

O intervalo **se aproxima exponencialmente de 2 segundos e nunca é menor do que 2 segundos**. A recarga começa **no instante da ativação**, e não após os 0,7 s de aceleração. O progresso só aumenta dentro das expedições, sem contar tempo em menus.

## Compatibilidade

**Save permanece v4.** `SeaProfile.load` faz a fusão dos níveis existentes com o novo valor `impulso:0`; nenhuma compra antiga é perdida. O importador `SeaSaveTransfer.profile` continua estrito, mas aceita tanto os backups v4 antigos (14 níveis, sem `impulso`) quanto os novos (15 níveis). Backups antigos são normalizados com `impulso:0`; chaves extras desconhecidas e níveis inválidos continuam rejeitados. O fluxo de rollback e restauração é preservado.

## Arquivos principais

- `SeaImpulse.js`: fórmulas puras para duração, recarga, janela de prontidão, força e fator de velocidade.
- `Game.js`: botão e hitbox de toque, entrada R/X, estado temporário, velocidade, compatibilidade com canhões, HUD e melhoria no estaleiro.
- `SeaSaveTransfer.js`: importação compatível de 14/15 melhorias no mesmo schema v4.
- `PortUI.js`: Diário de Bordo e novo total de melhorias.
- `index.html` e `sw.js`: carregamento do módulo e cache PWA **v62**.
- `tests/naval-impulse-3-8b.test.cjs`, `tests/save-restore-3-6c.test.cjs`, `tests/mare-negra-hud-visual.test.cjs` e regressões prévias.

## Qualidade e riscos

- [x] Verificações novas de fórmula 10→2, um impulso por acionamento, recarga, teclado, Xbox e toque, cancelamento de canhões e compatibilidade de backup antigo.
- [x] Teste de navegador em três resoluções para localizar o botão, acionar impulso e validar a janela de cooldown; mantém QA do canhão.
- [x] PR #58 aprovado com `port-smoke` e `port-visual` verdes; squash merge em `main` e CI pós-merge verde ([run 39185589085](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39185589085)).
- [x] Publicação no Pages confirmada ([run 39185589073](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39185589073)).
- [ ] Testes manuais: celular físico, Xbox, confronto de abalroamento, rochas/bordas e custos de melhoria nos níveis superiores.

**Balanceamento intencional:** o impulso dá vantagem de velocidade, mas aumenta o risco de colisão. Não multiplica diretamente o dano de abalroamento; o dano existente depende da velocidade real e do ângulo da proa. Ajustar apenas com feedback de jogabilidade, sem alterar silenciosamente o risco físico.
