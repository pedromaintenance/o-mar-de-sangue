# 3.8a.2 — Carregar exige manobra; recuo que se sente

**Estado:** implementação em validação. Feedback do jogador após v57: o tempo de 2 segundos está bom, segurar deve continuar obrigatório, e o navio precisa **perder velocidade preparando a salva** e **sofrer recuo perceptível**.

## Contrato do controle — sem mudança de intenção

- **Pressionar e SEGURAR** Q, E, ESPAÇO, gatilho Xbox ou botão de toque inicia a preparação **independente por bordo**.
- A preparação leva **2 segundos no nível inicial** e diminui exponencialmente com **Serventes Treinados**, conforme já implementado desde a 3.8a.0.
- **Soltar antes de terminar cancela integralmente o disparo**; não há carga acumulada, nem tiro ao soltar, nem toque único que prepare sozinho.
- Quando conclui a preparação, ocorre **UMA salva**; manter pressionado depois **não dispara outra nem reinicia a carga**. Soltar e pressionar de novo rearma o bordo. Duas fontes de entrada pressionadas simultaneamente não permitem contornar isso.
- Pausar, atracar e abrir a Carta interrompem o carregamento, sem disparo gratuito ao voltar.

## Custo tático de velocidade

Carregar a artilharia obriga a recolher parte das velas, ajustar rumo e estabilizar o casco:

| Condição | Velocidade máxima | Aceleração do motor/velas | Arrasto extra |
|---|---:|---:|---:|
| Nenhuma bateria sendo preparada | 100% | 100% | 0/s |
| Um bordo sendo preparado | **60%** | **55%** | +0,9/s |
| Dois bordos sendo preparados | **45%** | **38%** | +1,25/s |

O penalizador vale **somente enquanto alguma bateria está efetivamente preparando**, não enquanto o botão permanece segurado após o tiro. Soltar antes do tiro cancela a preparação e devolve gradualmente a capacidade normal de navegação. A direção e a marcha à ré continuam ativas. O vento, o clima, as colisões e os limites do mundo permanecem presentes.

**Cálculo:** o novo arrasto se soma ao arrasto habitual por quadro, a aceleração é multiplicada pelo fator de preparação e o módulo da velocidade é limitado ao valor máximo proporcional (60% ou 45%). Essas regras usam o mesmo `dt` limitado a 50 ms da física existente.

## Recuo físico + confirmação visual

A regra 3.8a.0 concedia aproximadamente **11 unidades de velocidade lateral** à embarcação inicial, imediatamente eliminadas pelo arrasto lateral; com a câmera perseguindo o casco, mal apareciam.

- Agora a salva inicial gera **~65 unidades de impulso lateral**, aumentando com **dano e quantidade de projéteis**.
- **Escoras do Abismo** amortecem o impulso exponencialmente como antes; maior massa o reduz.
- Depois do disparo, o arrasto lateral é reduzido **por 0,5 segundo** para que o navio realmente deslize para o lado oposto da salva.
- O casco apresenta inclinação/translação lateral curta, com recuperação dependente de `dt`, e há uma **sacudida discreta de câmera** de 145 ms.
- Dois bordos atirando ao mesmo tempo podem cancelar o impulso lateral de forma física — nesse caso o tremor da câmera ainda confirma a explosão, mas não criamos deslocamento arbitrário.
- O navio conserva suas hitboxes físicas; o efeito de inclinação é apenas visual.

**Fórmula:** `impulso = min(205, (16 + 0,38 × dano) × √(projéteis) × 3,2) × exp(-reforço/11) / √(max(0,7, massa))`. É uma regra de gameplay, não uma simulação naval historicamente calibrada. O impulso é aplicado em sentido contrário ao bordo que dispara, antes do cálculo do deslocamento.

## Arquivos

`SeaGunnery.js` reúne os fatores de preparação e a fórmula física, `Game.js` executa a restrição de movimento e o recuo, `PortUI.js` e instruções iniciais esclarecem o comando, e `sw.js` atualiza a PWA para **v58**.

Nenhum novo campo no save v4, nenhuma mudança nos níveis de estaleiro, contratos, monstros, IA da Corte, densidade de partículas ou número de projéteis.

## QA

- [x] Teste `tests/braced-gunnery-3-8a2.test.cjs`: usa o trecho **real** de física de `Game.js`; verifica redução de velocidade, dois bordos, recuperação após cancelamento, recuo lateral prolongado, efeito visual e proteção contra tiros automáticos.
- [x] `tests/mare-negra-hud-visual.test.cjs`: verifica barras de carga, 60% de limite para um bordo, deslocamento lateral e reação do casco com o Phaser real nas três resoluções.
- [x] Suítes anteriores de save v4, regressão de não-metralhadora, resgate, contrabando, Atlas, menu, PWA e dispositivos no CI.
- [ ] `port-smoke` e `port-visual` aprovados no PR e pós-merge na main.
- [ ] GitHub Pages publicado e documentado no roadmap.
- [ ] Testar no teclado, Xbox e celular reais com navio parado e em movimento: soltar em 1 s, atirar em 2 s e segurar por 10 s após disparar; verificar recuo com e sem Escoras do Abismo e desaceleração em marcha.

## Acompanhamento

Balancear a desaceleração e o recuo após feedback de jogadores, especialmente em monstros agressivos e expedições de escolta. Se o recuo ficar forte demais em navios com muitas baterias, ajustar constantes e ampliar testes antes de reduzir sua força silenciosamente.
