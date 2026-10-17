# O Mar de Sangue — 3.6g: Diagnóstico Optativo de Desempenho

**Estado:** integrado à `main` em 17/10/2026 pelo [PR #43](https://github.com/pedromaintenance/o-mar-de-sangue/pull/43) (squash `ee2396e`), com smoke e Chromium aprovados. Verificação física no Pages/PWA pendente.

## Como usar

No rodapé do Porto, clique ou toque **MOSTRAR FPS**. A preferência persiste somente neste navegador. Ao iniciar uma viagem, um pequeno indicador não interativo aparece próximo da parte inferior do canvas. O botão passa a **OCULTAR FPS** e pode desativar a função antes da próxima expedição. Durante a viagem, **F3** também liga ou desliga o diagnóstico em teclados físicos.

O indicador mostra, aproximadamente uma vez por segundo:

- **FPS ~**: quadros do ciclo do jogo por segundo, calculado a partir dos intervalos `delta` fornecidos por `Game.update`;
- **MÉDIA (ms)**: intervalo médio por atualização durante a janela de amostragem;
- **PICO (ms)**: maior intervalo observado nessa mesma janela;
- **>33 ms**: contagem de atualizações acima de 33,3 ms, referência para travamentos perceptíveis em metas de 30 FPS.

**São estimativas do ciclo de atualização do Phaser**, não medições diretas de GPU, CPU, tempo de composição ou consumo de bateria. O Phaser pode suavizar os intervalos. O FPS relatado não substitui um perfilador real do dispositivo e não garante consistência em todos os browsers. O indicador não mede a velocidade da rede nem gera recomendações automáticas de qualidade.

## Proteção do jogo

- O módulo novo `SeaPerformance.js` é isolado; com a opção desligada, `sample(delta)` retorna imediatamente e não cria objeto de texto Phaser.
- Uma amostra só é computada ao acumular aproximadamente 1 segundo de intervalos válidos; intervalos inválidos ou maiores que 1.000 ms são ignorados.
- O texto é não interativo, com coordenadas diferentes para desktop e telefone; não muda nenhum hitbox ou zona do joystick/canhões.
- Um `Scene.SHUTDOWN` destrói o indicador da expedição anterior. A preferência pode reaparecer na viagem seguinte sem conservar dados de desempenho antigos.
- Apenas `localStorage['carcaca.mar.performance.visible.v1']` armazena `1` ou `0`; a funcionalidade não toca em `SeaProfile`, save v4, rollback, músicas, política, física, IA ou economia.
- O cache da PWA sobe para **v47**, incluindo o novo arquivo no precache para funcionamento offline.

## QA automatizada

- [x] Teste Node isolado `tests/performance-3-6g.test.cjs`: opção desligada, métricas, intervalos inválidos, detecção de quadro lento, alternância, persistência e destruição da cena.
- [x] Contrato do Porto `tests/port-ui-rebuild.test.cjs`: botão e `aria-pressed`, save imutável.
- [x] Chromium `tests/port-visual.test.cjs`: botão, reload/persistência e save preservado em 1600×900, 1280×720 e Android emulado 390×844.
- [x] Chromium `tests/mare-negra-hud-visual.test.cjs`: F3 durante a viagem, métricas na tela, posicionamento seguro perto dos controles e hitboxes originais intactos.
- [x] CI `port-smoke` e `port-visual` aprovados; PR #43 integrado.
- [ ] Teste em celular real: FPS em navegação calma, ilha, combate pesado e retorno ao Porto. Testar também com modo desligado para comparar consumo/fluidez.

## Próximo passo — 3.6h

Com medições em aparelhos reais, propor orçamento de efeitos e otimização adaptativa **somente após identificar gargalos**, separando nitidamente desempenho gráfico de física, IA e regras. Nenhuma redução automática de qualidade entra na 3.6g.
