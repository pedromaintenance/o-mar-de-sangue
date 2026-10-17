# O Mar de Sangue — 3.6i: Comparador Local de Relatórios FPS

**Estado:** implementação concluída na branch; publicação depende dos dois jobs obrigatórios no GitHub Actions.

## Objetivo

A 3.6h trouxe exportação de diagnósticos JSON. Antes de otimizar partículas e o mar, precisamos distinguir os problemas reais dos diferentes testes. A 3.6i permite **comparar dois relatórios de FPS no próprio Porto**; não há envio para servidor nem gravação do conteúdo importado.

## Instruções

1. Faça duas viagens com **MOSTRAR FPS** ativado e guarde os respectivos arquivos usando **BAIXAR RELATÓRIO FPS**.
2. No Porto, escolha **COMPARAR FPS .JSON** e selecione exatamente os dois arquivos.
3. Veja lado a lado os relatórios A e B, com diferença **B − A** para FPS médio, mediano e mínimo, pior intervalo em ms, quadros acima de 33,3 ms e total de atualizações.
4. Use **VOLTAR AO PORTO**, **Escape** ou **B** para sair sem alterar nada. Pode repetir quantas vezes desejar.

Os relatórios precisam ser JSON da versão 3.6h (`format: mar-de-sangue-performance-report`, `schema: 1`). Cada arquivo pode ter no máximo 256 KB e 180 amostras. O comparador rejeita arquivos vazios, versões desconhecidas, números inválidos e séries temporais fora de ordem. Apenas os números necessários ao comparador permanecem na memória da aba enquanto ela estiver aberta.

## Cuidados na interpretação

O comparador sinaliza quando:
- são usados formatos compactos/desktop distintos;
- uma captura tem menos de 20 janelas amostradas;
- as durações têm proporção acima de 1,5:1;
- um arquivo descartou amostras antigas pelo limite de 180 janelas;
- uma das capturas foi interrompida ou exportada em andamento.

**Não interpretar um FPS maior ou menor como causa identificada de gargalo.** A comparação é descritiva, e os tempos são do ciclo de atualização Phaser, suavizados pelo motor, não da GPU. Quadros lentos e total de atualizações são contagens absolutas e ficam especialmente sujeitos à diferença de duração. Compare sessões semelhantes no mesmo aparelho, navegador e condições.

## Segurança e compatibilidade

- `SeaPerformanceCompare.js` não lê `SeaProfile`, `localStorage`, áudio nem a rede; recebe os textos locais, devolve dados numéricos validados, sem repassar strings livres de arquivos à interface.
- `PortUI.js` recebe os arquivos pela API File do navegador, cria uma tabela acessível (`role=table`) com seis métricas e permite fechar/cancelar normalmente. O comparativo não possui botões de escrita.
- Nenhuma mudança em Game.js, SeaProfile v4, economia, inimigos, IA, física, texturas, controles ou métrica original 3.6h.
- A PWA passa a usar precache **v49** com o comparador disponível offline.

## QA

- [x] `tests/performance-compare-3-6i.test.cjs`: dois relatórios válidos, diferenças, avisos, arquivo fora do formato, limite de 180 janelas, números incorretos, isolamento de strings e ausência de acesso a saves/rede.
- [x] `tests/port-ui-rebuild.test.cjs`: tabela de comparação, saída segura e progresso inalterado.
- [x] `tests/port-visual.test.cjs`: seleção real de dois arquivos em Chromium 1600×900, 1280×720 e Android 390×844, tabela acessível, avisos, cancelamento, rejeição de JSON corrompido, sem overflow global nem mudança no save.
- [ ] CI `port-smoke` e `port-visual` verdes; squash merge e deploy no Pages.
- [ ] Confirmação manual no Pages, Android e PWA física com relatórios reais.

## Próxima etapa — 3.6j

Comparar medições reais de mar calmo, combate e tempestade, priorizar os componentes visualmente custosos e **só então** introduzir opções de qualidade ou orçamentos de partículas com testes de regressão. A reputação persistente 3.3b continua exigindo regras e migração v4→v5 aprovadas antes de modificar saves.
