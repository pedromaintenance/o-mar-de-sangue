# 3.7a.3 — A Caçada dos Condenados

**Estado:** implementação inicial em teste. Ainda não publicada na `main`.

## Objetivo de gameplay

Terceiro contrato da Costa Sul, diferente da missão comum `hunt` (contar fragatas abatidas). A expedição deve ter uma **pista**, um **alvo individual**, **perseguição de uma embarcação que foge** e uma **condição de fracasso real**.

### Fase 1 — O naufrágio

- Ao aceitar o contrato no Porto, o navio parte em modo sandbox de contrato, com save v4 inalterado.
- A Carta revela **somente o naufrágio com a pista**, escolhido entre as ruínas físicas do tipo `wreck` já existentes na geração do mundo. Outras ilhas não são reveladas.
- O jogador precisa navegar até a costa com velocidade até 67 unidades/s e sem inimigos próximos para atracar.
- A escolha **INVESTIGAR OS ÚLTIMOS REGISTROS** identifica um capitão condenado da Corte Feérica Sombria e marca sua fragata. A pista pode ser colhida mesmo quando o naufrágio tiver sido visitado no mesmo percurso (somente uma vez para o contrato).
- O relógio de fuga começa **após a investigação**, nunca durante a navegação inicial nem enquanto o encontro de ilha está aberto.

### Fase 2 — Perseguição

- Nasce **uma fragata identificável** a aproximadamente 640–900 unidades do local da pista, reutilizando as texturas e objetos existentes.
- O alvo tem **25% mais casco** e identificação `✦ CAPITÃO CONDENADO · FRAGATA`; não é uma unidade genérica cuja morte possa contar para o contrato.
- A fragata escolhe uma saída na borda oposta do mapa e navega em direção a ela, **acelerando quando o jogador se aproxima**, até um teto de 170 unidades/s.
- A posição atual aparece na Carta como **marcador dourado separado dos marcos de ilha**, apenas após a descoberta da pista. A bússola da Carta não vira autopiloto e nenhuma outra ilha oculta é revelada.
- O objetivo exibe o **prazo restante de 105 segundos**, contado em tempo de simulação; pausa, encontro em ilha e Carta não avançam o relógio.
- Canhões, impulso, abalroamento, rochas, dano e inimigos secundários continuam usando as regras normais, com seus riscos originais.

### Fase 3 — Resultado

- **Vitória:** abater exatamente a fragata marcada, independentemente de projéteis ou abalroamento, antes do prazo e da fuga. Encerrar a expedição imediatamente com **240 ouro de comissão contratual**, contabilizada **uma única vez** pelo fluxo existente `SeaProfile.settle`.
- **Fracasso:** se o navio marcado alcançar a saída (raio de 105 unidades) ou o prazo chegar a zero, **a presa foge**, a comissão é cancelada e a expedição é encerrada como retirada, sem avançar as missões da campanha.
- Matar fragatas genéricas não paga o contrato. Falha, pausa, reentrada na tela e clique duplicado não criam comissões extras.
- `SeaProfile` e seu esquema v4 **não mudam**, e as campanhas anteriores, resgate e contrabando seguem independentes.

## Componentes tocados

- `SeaContracts.js`: oferta `hunt`, fases `clue`/`chase`/`complete`/`escaped`, movimento evasivo, condição de vitória e fuga.
- `Game.js`: contrato permitido, desvio de IA **apenas para a fragata marcada**, hook do `sinkEnemy` quando ela afunda.
- `PortUI.js`: terceiro contrato e botão **ACEITAR CAÇADA**.
- `SeaIslands.js`: o naufrágio da pista pode ser utilizado mesmo que já visitado, sem alterar outras ilhas.
- `SeaAtlas.js`: marcador temporário da presa móvel sem tocar nas regras de descoberta.
- `sw.js`: PWA offline **v63**.
- `tests/hunt-contract-3-7a3.test.cjs`: testes de ponta a ponta do estado do contrato, proteção contra repetição, alvo falso, prazo, fuga, falha de spawn e isolamento do save.

## Critérios de publicação

- [x] Implementar seleção no Porto, pista real, fragata identificável e fuga ativa.
- [x] Aplicar recompensa condicionada ao alvo exato e cancelar na fuga.
- [x] Preservar `SeaProfile` v4 e as outras duas opções de contrato.
- [ ] CI `port-smoke` e `port-visual` aprovados no PR e pós-merge.
- [ ] GitHub Pages publicado e roadmap concluído.
- [ ] Testar fisicamente a janela de 105 s e ajustar distância/velocidade de fuga segundo playtests, sem prometer dificuldade perfeita por testes emulados.

### Roteiro de playtest

No Porto, entrar em **CONTRATOS DA COSTA SUL** → **ACEITAR CAÇADA**. Abrir a Carta (M): ela deve indicar apenas um naufrágio. Atracar (F / A), investigar e fechar a janela. Abra novamente a Carta: uma marca dourada indica a fragata **em movimento**, com contador de fuga. Use as velas e o impulso para alcançá-la. Somente afundar a presa marcada rende 240 ouro de contrato. Outra tentativa deve começar numa nova expedição.
