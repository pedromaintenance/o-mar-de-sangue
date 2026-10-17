# 3.8a.0 — Preparar a salva, sentir o recuo, temer os monstros

**Situação:** publicada em 17/10/2026 após [PR #52](https://github.com/pedromaintenance/o-mar-de-sangue/pull/52), squash `74c28be`; CI PR e pós-merge aprovado ([run 39076723611](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39076723611)); [GitHub Pages](https://pedromaintenance.github.io/o-mar-de-sangue/) confirmado ([run 39076723306](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39076723306)). A mudança foi priorizada por feedback sobre a sensação física do combate.

## Regras do novo tiro

- **Navio do jogador:** em vez de disparar ao apertar, é necessário **segurar** Q (bombordo), E (estibordo), ESPAÇO (ambos), LT/LB e RT/RB do controle, ou os botões táteis existentes. Cada bordo prepara uma salva **independentemente**. Soltar cancela a carga daquele bordo.
- A preparação base é de **2 segundos**, e a melhoria existente **Serventes Treinados** reduz o tempo com a função **2000 × exp(-0,105 × nível)**, em milissegundos. Aproxima-se de zero à medida que o nível aumenta; não há redução linear nem requisito de aumentar o nível do save.
- Exemplos aproximados: nível 0 = 2000 ms, nível 10 = 700 ms, nível 20 = 245 ms e nível 30 = 86 ms. O intervalo de recarga já existente ainda limita disparos consecutivos (mínimo técnico de 90 ms).
- A carga avança por tempo efetivo de quadros em navegação (delta limitado a 50 ms). Pausa, Atlas e atracação cancelam a carga e impedem o acúmulo clandestino enquanto o jogador está em menus.
- As barras de cada bordo existentes no HUD representam agora **preparação da salva**, em vez de apenas o intervalo de recarga; a posição e o tamanho dos três indicadores permanecem intactos.

## Recuo físico

- A salva continua saindo perpendicularmente ao rumo do navio.
- O impulso inverso da bateria depende de **dano do canhão** e **raiz quadrada da quantidade de projéteis**, com amortecimento **exponencial** pela melhoria já existente **Escoras do Abismo** e ajuste pela massa do navio:
  `impulso = min(80, (8 + 0,24 × dano) × raiz(projéteis)) × exp(-reforço/11) / raiz(máx(0,7, massa))`.
- O recuo desloca o navio lateralmente e afeta seu vetor de velocidade. Dois bordos disparados simultaneamente têm impulsos opostos; a percepção do impacto também vem do FX e áudio existentes.
- Os **navios inimigos** agora também carregam uma salva antes de atirar. Nível de dificuldade 1 usa 2 s; dificuldade crescente reduz o tempo de forma exponencial e separada da recarga já existente.
- Inimigos recebem impulso contrário ao sentido dos canhões, amortecido por sua massa. Isso mantém comportamento físico coerente em galeões e embarcações leves.

## Bestiário: predadores, não artilheiros

- Criaturas marcadas como `isMonster` **nunca** passam pelo emissor de projéteis. Enguias, afogados, corais, caranguejos, tartarugas, Kraken e Dagon avançam diretamente contra o navio.
- Criaturas perseguem a distâncias maiores, aceleram agressivamente e têm limite de velocidade aumentado em 35%.
- Criaturas menores e Dagon executam uma **investida com impulso** a curta distância; o dano ocorre pelo sistema de colisão/abalroamento preexistente, não por tiros invisíveis.
- **Kraken** mantém o tentáculo telegrafado a curta distância, sem tiro convencional.
- **Dagon** deixa de lançar projéteis/ataques à distância, investe fisicamente e mantém as duas fases de invocação de criaturas quando enfraquece.

## Compatibilidade e QA

- Módulo novo `SeaGunnery.js` com funções matemáticas puras; integrado a `Game.js`, `index.html`, cache PWA **v56**.
- **Sem migração de save:** os níveis `cadencia` e `reforco` já existem no v4 e conservam o progresso anterior. Apenas descrições do estaleiro/diário foram atualizadas.
- Não altera geometria nem posições dos alvos táteis, padrões políticos, mapas ou contratos de resgate/contrabando.
- [x] Teste Node `tests/gunnery-windup-3-8a.test.cjs`: valores de carga, aproximação exponencial, intervalo de recarga, cancelamento, os dois bordos, fórmula de recuo, criaturas sem projéteis e navio inimigo preparando disparo.
- [x] QA visual em `tests/mare-negra-hud-visual.test.cjs`: segurar um canhão durante a expedição, registrar a barra parcial e confirmar o disparo no navegador real em três tamanhos.
- [x] `port-smoke` e `port-visual` verdes no PR.
- [x] PR #52 integrado, CI pós-merge verde na `main` e deploy concluído no Pages.
- [ ] Jogo real em Android físico, teclado, controle Xbox, com testes de balanceamento de dificuldade e recuo, especialmente nos níveis altos de canhão.

## Pontos de atenção

- Esta mudança altera intencionalmente **o ritmo de combate e a dificuldade**. Precisará de avaliação jogável: 2 s podem tornar fases iniciais difíceis; navios inimigos mais lentos para atirar podem compensar.
- O recoil não deve gerar atravessamento de rochas ou da borda: física e limites originais continuam responsáveis por colisões.
- O Kraken e Dagon são chefes; investidas e tentáculos devem ser legíveis para o jogador. Somente o teste no navegador não prova balanceamento.
- Nenhuma otimização gráfica de partículas está implícita, e o orçamento FX não foi alterado.

**Sequência recomendada:** validar e publicar esta entrega; então retomar **3.7a.3 Caçada** e **3.8a** para outras armas com recargas próprias. A futura reputação política ainda depende do projeto v4→v5.
