# O Mar de Sangue — 3.6h: Relatório Exportável de FPS

**Estado:** integrada à `main` em 17/10/2026 pelo [PR #44](https://github.com/pedromaintenance/o-mar-de-sangue/pull/44) (squash `fa2ccf6`), com CI smoke/Chromium aprovados. Testes físicos no Pages/PWA ainda pendentes.

## Para que serve

A 3.6g já mostra FPS estimado e intervalo entre atualizações no HUD. A 3.6h permite **levar medições do próprio celular** para análise, antes de decidir onde otimizar.

1. No Porto, ative **MOSTRAR FPS** e inicie uma viagem.
2. Navegue em mar calmo e/ou participe de combates. Cada aproximadamente 1 segundo é consolidado em uma janela de amostras.
3. Retorne ao Porto. O botão **BAIXAR RELATÓRIO FPS** é habilitado quando houver amostras.
4. Baixe `mar-de-sangue-fps-AAAA-MM-DD.json`. Compare relatórios obtidos no mesmo aparelho sob cenários diferentes e compartilhe para análise, se desejar.

O relatório contém `format: mar-de-sangue-performance-report`, `schema: 1`, datas da captura, versão compacta/desktop do canvas, duração, informação sobre perda de amostras antigas, resumo e série amostrada.

## Métricas e limitações

- Cada janela contém segundo aproximado, FPS aproximado, duração média e pico de intervalo do `Game.update(delta)`, quantidade de quadros acima de 33,3 ms e número de atualizações.
- Resumo: FPS mínimo, mediano e médio **entre as janelas retidas**, pior intervalo, total de quadros lentos e total de atualizações **na janela retida**.
- Limite de **180 janelas recentes**, aproximadamente três minutos. Após isso, as janelas antigas são descartadas; `truncated: true` indica retenção parcial, e `seconds` preserva duração total aproximada da sessão medida.
- Os números são estimativas de atualização do Phaser e podem sofrer suavização pelo motor. **Não medem diretamente GPU, CPU, compositor, consumo de bateria nem a latência visual do usuário.**
- A amostragem inclui os estados da cena enquanto `Game.update` estiver ativo, inclusive sobreposições. Para comparações úteis, capture sessões separadas de duração semelhante.
- O arquivo JSON não contém ouro, missão, equipamentos, identificadores de conta, user-agent, coordenadas reais ou outros dados do save.

## Persistência e segurança

O histórico existe **somente na memória da aba**. O jogo guarda até 180 amostras; ao concluir a viagem, mantém a última captura até uma nova viagem medida ou até recarregar/fechar a página. Não é enviado a servidor nem salvo no `localStorage`; apenas a preferência `carcaca.mar.performance.visible.v1` permanece como na 3.6g.

O botão de download fica desabilitado quando não existe relatório. A exportação usa `Blob` e URL temporária local. Não altera `SeaProfile` v4, o sistema de backup de progresso, combate, física, IA, economia, controles de toque, áudio ou o serviço de instalação PWA.

A interface atualizada passa pelo cache PWA **v48**.

## QA

- [x] `tests/performance-report-3-6h.test.cjs`: janela limitada, resumo, relatório imutável, isolamento de armazenamento, substituição ao iniciar outra viagem e captura após saída.
- [x] `tests/port-ui-rebuild.test.cjs`: botão inicialmente desabilitado, download JSON, nome de arquivo e independência do save.
- [x] `tests/mare-negra-hud-visual.test.cjs`: viagem real no Chrome 1600×900, 1280×720 e Android emulado 390×844; retornar ao Porto, baixar arquivo, analisar conteúdo e conferir save intacto.
- [x] CI `port-smoke` e `port-visual` aprovados; squash merge `fa2ccf6`.
- [ ] Teste físico: coletar amostras em celular modesto em navegação calma, tempestade e batalha intensa, em sessões comparáveis. Anotar percepção de travamentos.

## Próximo passo

**3.6i — ajustes gráficos baseados em evidências:** avaliar limites de partículas, desenho do mar e efeitos visuais após conhecer os gargalos reais. Nenhuma redução automática de qualidade ou mudança na física/IA entra na 3.6h. A reputação persistente continua sendo projeto separado, dependente de migração v4→v5 aprovada.
