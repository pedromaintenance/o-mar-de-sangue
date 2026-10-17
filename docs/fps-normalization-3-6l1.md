# O Mar de Sangue — 3.6l.1: Comparação Justa de FPS

**Estado:** integrado à `main` em 17/10/2026 pelo [PR #49](https://github.com/pedromaintenance/o-mar-de-sangue/pull/49) (squash `4b5ca20`), com CI Node/Chromium verde no PR. Teste físico pendente; não há benchmark novo de FPS nem modificação de partículas.

## Problema material

O comparador 3.6i/3.6l exibe contagens **absolutas** de quadros com atualização maior que 33,3 ms e de atualizações em que o limite preexistente de efeitos FX foi atingido. Uma viagem de 120 segundos pode naturalmente registrar mais eventos que uma de 60 segundos, mesmo quando o desempenho **relativo** é melhor.

Não é possível decidir cortar partículas com base nessa comparação absoluta.

## Entrega

- A tabela **COMPARAR FPS .JSON** passa a incluir **LENTOS / 1.000**: `1000 × slowFrames / updateFrames`. Uma unidade equivale a um quadro lento em mil atualizações retidas.
- Quando **ambos** os relatórios incluem o orçamento FX da 3.6l, também aparece **FX NO LIMITE / 1.000**: `1000 × atLimitFrames / updateFrames`. Mede apenas saturação do contador preexistente `effectsActive/effectsLimit`, e não de todas as partículas.
- Mantemos os seis indicadores antigos e os três indicadores FX absolutos. As novas taxas aparecem como linhas adicionais, com diferença B − A.
- A normalização usa o total **realmente retido**: limite de 180 janelas, não o tempo nominal de viagem. O arquivo não é alterado.
- Os totais `summary.updateFrames` e `summary.slowFrames` devem agora bater exatamente com a soma das amostras retidas, impedindo importar totais adulterados como se fossem válidos.
- Arquivos FPS v1 antigos **sem** telemetria FX continuam aceitos; nesse caso só aparece a nova taxa de quadros lentos.
- Diário de Bordo e comparador explicam explicitamente a diferença entre contagem absoluta e taxa relativa.
- Serviço offline passa ao cache PWA **v53**; nenhum recurso/asset novo foi adicionado.

## Não muda

- `Game.js`, `SeaPerformance.js`, `SeaEffects.js`, Física, IA, inimigos, orçamento 48 FX, clima, oceano, animações, controles e saves `SeaProfile` v4 **intocados**.
- Dados de diagnóstico continuam locais e limitados; nenhum envio à rede, gravação nova ou coleta oculta.
- Uma taxa de saturação maior não prova que efeitos causam queda de FPS. Comparações ainda dependem de aparelho, modo de tela, cenas e durações aproximadamente equivalentes.

## QA

- [x] Novo `tests/fps-normalization-3-6l1.test.cjs`: sessões de diferentes durações, diferenças absolutas vs relativas, FX opcional, legados v1 e adulterações dos totais.
- [x] Atualização dos contratos anteriores: `tests/performance-compare-3-6i.test.cjs`, `tests/effect-budget-3-6l.test.cjs`, `tests/port-visual.test.cjs`.
- [x] `port-smoke` e `port-visual` no PR aprovados; squash merge `4b5ca20`.
- [x] CI pós-merge na `main` aprovado ([run 39039034306](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39039034306)).
- [x] GitHub Pages publicado ([run 39039056469](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39039056469)).
- [ ] Validação manual no navegador, PWA e celular físico.

## Como testar no Pages

1. Abra o Porto e selecione **COMPARAR FPS .JSON**.
2. Importe dois arquivos exportados pelo próprio jogo (3.6h em diante), mesmo que tenham durações diferentes.
3. Compare o valor absoluto **QUADROS >33 MS** com **LENTOS / 1.000**. O segundo é normalizado pelo total de atualizações retidas.
4. Se ambos os arquivos forem 3.6l ou posteriores, veja **FX NO LIMITE / 1.000**. Compare condições semelhantes no mesmo aparelho, evitando conclusões causais precipitadas.

**Próximo marco:** 3.6m segue condicionado a medições reais, repetidas e comparáveis antes de qualquer alteração de renderização.
