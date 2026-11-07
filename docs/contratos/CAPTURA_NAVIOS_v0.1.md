# MECÂNICA DE CAPTURA DE NAVIOS — LABORATÓRIO v0.1

**Estado:** motor técnico opt-in implementado em 07/11/2026; **não é ainda o CT-001 jogável**.  
**Código:** [SeaBoarding.js](../../SeaBoarding.js), [Game.js](../../Game.js), [SeaIslands.js](../../SeaIslands.js).  
**Testes automatizáveis:** [SeaBoarding.test.cjs](../../tests/SeaBoarding.test.cjs).

## 1. Regra mecânica

Apenas embarcações criadas explicitamente com `spawnEnemy(tipo,distancia,{capturable:true})` são capturáveis. Os inimigos normais permanecem inalterados. Navios de chefes, criaturas e classes que não estejam na lista branca não são capturáveis.

**Sequência:**

1. O jogador enfrenta o navio normalmente.
2. Ao cair para **24% ou menos** do casco máximo, o alvo entra em estado **avariado** (mantém ao menos 1 PV). Velas e canhões deixam de atuar, o navio desacelera e sinaliza abordagem no nome.
3. O jogador navega até a lateral do alvo; o botão **ABORDAR** substitui o **ATRACAR** na interface de proximidade.
4. É necessário ter **velocidade própria até 67** e **velocidade relativa até 74**, além da distância de abordagem de no máximo 138 unidades além dos raios dos cascos. Não é permitido abordar com navios sobrepostos.
5. Apertar **F** (teclado), **A** (gamepad) ou tocar o comando contextual completa a captura.

**Resultado:** a embarcação é removida dos navios hostis, registrada como capturada na cena e **não** conta para kills, afundamentos, recompensas por destruição ou loot automático. Não concede prêmio monetário na versão de laboratório.

## 2. Proteções implementadas

- O comportamento novo é ativado somente quando `capturable:true`.
- O disparo, o abalroamento e os eventos de afundamento podem provocar a incapacitação.
- Depois de incapacitado, novos danos não o afundam: o casco permanece com ao menos 1 PV, para que o objetivo de captura não se torne impossível por tiros subsequentes.
- O navio avariado deixa de executar IA hostil, interrompe recarga de armas e perde velocidade gradualmente.
- Não se pode abordar por acidente um navio intacto, capturar duas vezes ou transformar uma captura em tesouro de naufrágio.
- A chegada ao alvo reutiliza a interface contextual de atracação já existente para teclado, controle e toque. Missões e contratos antigos continuam usando a lógica de afundamento.
- `SEA_CONTRACTS.onCapture?.(scene,enemy)` foi reservado como **gancho futuro**; CT-001 ainda não implementa o callback nem registra seu objetivo.

## 3. Como experimentar sem alterar a campanha

Abra a versão publicada do jogo com a query de laboratório:

`https://pedromaintenance.github.io/o-mar-de-sangue/?boardingLab=1`

Entre no **modo sandbox**. Uma fragata especial será gerada com o rótulo **LABORATÓRIO · FRAGATA CAPTURÁVEL**, além dos inimigos habituais. Ataque-a até ficar avariada, aproxime-se lentamente e execute **ABORDAR**.

**Atenção:** isto é um ensaio manual, não um contrato com recompensa. O parâmetro só cria um alvo experimental no modo sandbox sem contrato; o jogo normal, sem o parâmetro, não muda. O link é uma rota prevista para o GitHub Pages do repositório — confirmar a publicação real e recarregar o cache do PWA antes de diagnosticar resultados.

## 4. Testes

Execute localmente, na raiz do repositório:

`node tests/SeaBoarding.test.cjs`

O teste verifica incapacitação, limite de PV, velocidade da abordagem, velocidade relativa, captura única, limpeza dos elementos visuais e isolamento dos navios comuns. **Verificações sintáticas dos JS integrados e testes de lógica foram executados na revisão; a execução real no navegador ainda precisa de QA.**

### Matriz de QA manual

- [ ] Teclado: F só aborda navio avariado e próximo.
- [ ] Gamepad: A aborda quando houver comando ativo.
- [ ] Touch: botão contextual aborda corretamente sem disparar canhões.
- [ ] O navio capturável não afunda mesmo sob disparo fatal ou abalroamento.
- [ ] Não há recompensa de morte, baú ou incremento de kills.
- [ ] Um navio comum ainda pode ser destruído normalmente.
- [ ] Não aborda com velocidade excessiva, nem depois de capturado.
- [ ] Não há travamento na mudança do texto ATRACAR/ABORDAR.
- [ ] O modo missão principal não gera embarcações capturáveis por acidente.
- [ ] O save v4 continua sendo carregado; campanha e dinheiro não sofrem mutação.
- [ ] Verificar colisão durante o estado avariado junto a ilhas e limites.
- [ ] Conferir se os inimigos comuns continuam agressivos durante a captura.

## 5. Integração pendente com CT-001

A **captura genérica** é a primeira peça. O Dízimo dos Afogados ainda depende de:

- selecionar o alvo de transporte e escoltas segundo a missão ativa;
- criar a rota e o temporizador de interceptação;
- ao capturar o transporte, disparar a escolha entre **abrir porões / tomar o cofre / vender manifesto**;
- executar cada desdobramento e seus objetivos;
- ligar o pagamento único ao relatório e ao save;
- implementar os efeitos especiais da próxima viagem;
- habilitar somente após testes e aprovação editorial.

A API `onCapture` evita acoplar a mecânica comum à história do CT-001: outro contrato poderá usar um navio capturado com objetivos completamente diferentes.

## 6. Decisão em aberto

**Modelo atual:** desabilitar por **dano no casco**, seguido de aproximação e abordagem imediata. Para versões futuras, considerar subsistemas **velas, leme, canhões e tripulação**, mas não introduzir essas dependências antes de comprovar que a captura básica melhora a jogabilidade.

**Próxima etapa:** validar a abordagem em navegação real e, depois, conectar o gancho `onCapture` à máquina de estados do CT-001. CT-002 permanece não iniciado, conforme a regra de autoria um a um.
