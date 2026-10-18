# 3.8a.3 — Faísca da Mecha: feedback visual da preparação

**Situação:** entrega de VFX em validação de CI, aguardando merge e Pages. Não altera as regras de tiro da 3.8a.2.

## Asset escolhido

Partimos do **atlas de faíscas gerado e aprovado pelo jogador**, com cinco estágios de ignição e a sexta célula vazia (2 linhas por 3 colunas). A versão de produção está em `assets/fx/cannon_charge_sparks.png`: as cinco regiões originais foram recortadas e reduzidas de 512×512 para **96×96 px por quadro**, unidas horizontalmente (480×96), preservando transparência alfa e a evolução da faísca, com quantização de cores e atenuação do halo escuro. PNG final pesa ~3,9 KB. O efeito precisa ser visto pequeno, não estourado, sobre o casco.

**Licença/atribuição:** asset criado especificamente neste projeto a partir da imagem gerada nesta conversa; não utiliza pacotes externos nem áudio de terceiros.

## Comportamento

1. **Segurar Q/E, ESPAÇO, gatilhos Xbox ou o botão de toque** continua obrigatório para preparar o canhão. A imagem não substitui a carga de dois segundos ou a redução exponencial por melhoria de Serventes Treinados.
2. Assim que houver carga maior que zero, a mecha aparece junto ao **bordo correto do navio**, em escala compacta. Ao longo da preparação, o quadro progride do discreto até o brilho de ignição pré-disparo, com leve aumento de opacidade e escala.
3. Bombordo e estibordo têm **sprites separados e estados independentes**. Carregar os dois mostra duas faíscas locais, sem empilhar efeitos no centro, HUD ou controles.
4. Se soltar antes de disparar, abrir a Carta, pausar, atracar, afundar ou terminar a expedição, **a faísca desaparece imediatamente**.
5. Ao completar a carga, o tiro continua sendo uma única salva; o sprite de preparo desaparece e dá lugar ao **clarão de disparo já existente**, sem adicionar novo flash, dano ou áudio.
6. Manter o botão pressionado após atirar **não reinicia a faísca** e não recomeça a carga sem soltar o comando.

### Implementação e orçamento

- `SeaBoot.preload` carrega um `spritesheet` Phaser 96×96 com os cinco quadros; `index.html` carrega `SeaCannonChargeFx.js` antes de `Game.js`.
- `SEA_CHARGE_FX.init` cria **somente dois sprites persistentes**, ligados ao `playerVisual` para girar e acompanhar o balanço/recuo do navio.
- `SEA_CHARGE_FX.sync` altera apenas `visible`, `frame`, `alpha` e `scale` ao receber o estado de carga. Não instancia partículas nem timers por quadro.
- `resetCannonCharge` chama `clear` para esconder imediatamente os dois lados em interrupções. A trava `cannonNeedsRelease` determina a ocultação após disparar.
- **Sem alteração** de save v4, FPS telemetry, orçamento `effectsLimit=48`, física, recuo, velocidade, inimigos, contratos, hitboxes ou audio. PWA offline atualizada para **v59**, com PNG e novo módulo em precache.

### QA

- [x] `tests/cannon-charge-sparks-3-8a3.test.cjs`: verifica bytes e dimensões do PNG, cinco quadros, visibilidade por bordo, cancelamento, bloqueio após tiro, pausa/Atlas/doca e ausência de incremento de partículas/objetos durante a animação.
- [x] `tests/mare-negra-hud-visual.test.cjs`: testa na cena Phaser real o sprite visível na primeira carga, o outro bordo oculto, ambos associados ao casco e desaparecimento após soltar. Exercita três tamanhos de tela.
- [x] O teste regressivo de uma salva por pressão continua obrigatório no CI, assim como contratos, save, áudio e PWA.
- [ ] `port-smoke` e `port-visual` aprovados no PR, CI pós-merge verde.
- [ ] Merge, GitHub Pages e atualização conclusiva do roadmap.
- [ ] Inspeção visual em Android físico, desktop e controle Xbox para confirmar brilho discreto e legibilidade sobre o Mar de Sangue.

**Roteiro manual:** inicie uma viagem, segure Q por ~1 segundo (faísca discreta à esquerda), segure até 2 segundos (mais intensa e clarão), continue segurando por 10 segundos (não deve reacender), solte e repita. Teste E e ESPAÇO. Segure e solte aos 0,5 segundo: faísca apaga e não ocorre tiro.
