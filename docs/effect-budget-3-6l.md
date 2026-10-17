# O Mar de Sangue — 3.6l: Telemetria de Orçamento dos Efeitos

**Estado:** implementação proposta em 17/10/2026, com publicação condicionada ao CI. Validação de FPS em dispositivo físico ainda pendente.

## Diagnóstico observado no código

O jogo já possui `effectsActive` e `effectsLimit = 48` na cena `Game`. `burst` e `v15Burst` consomem esse orçamento e o liberam ao encerrar suas animações. O limite preexistente **não é alterado**. Outros efeitos (anéis de splash, destroços, textos, rastros, algumas animações) não usam necessariamente esse contador. Portanto, **FX não equivale ao total de objetos renderizados**.

Os relatórios 3.6h/3.6i antes mediam apenas intervalos de atualização. Sem correlacionar carga visual por janela, reduzir partículas seria um palpite, não uma otimização orientada por dados.

## Entrega

- Com **MOSTRAR FPS** ativo, a 3.6l lê passivamente `effectsActive` e `effectsLimit` uma vez por chamada já existente a `SEA_PERFORMANCE.sample(delta)`.
- Em telas compactas, o indicador é elevado de y=596 para y=580 para manter a terceira linha fora dos controles de toque.
- O indicador FPS em viagem ganha a linha `FX pico/limite · NO LIMITE N`, atualizada junto com a janela de FPS, aproximadamente uma vez por segundo.
- Cada amostra exportada ganha **opcionalmente** `effectBudget`: média e pico de efeitos ativos, orçamento observado e quantidade de quadros da janela no limite.
- O resumo do relatório mostra média ponderada pelo número de atualizações, pico global, limite observado e total de quadros no limite.
- Os relatórios continuam com `schema: 1`: arquivos antigos **sem** `effectBudget` continuam aceitos pelo comparador.
- Quando ambos os relatórios incluem telemetria FX, **COMPARAR FPS .JSON** mostra três linhas adicionais: FX média, FX pico e quadros no limite. Com apenas um relatório novo, avisa que a comparação de FX não é possível.
- Validação numérica de arquivos importados (incluindo consistência do pico e quadros no limite), sem incorporar strings arbitrárias.
- Memória limitada às mesmas 180 janelas; nenhum novo dado no `localStorage`, `SeaProfile`, save, rede ou analytics externo.
- Cache PWA **v52** para disponibilizar a nova telemetria.

## Invariantes

- Nenhum efeito é criado, reduzido ou bloqueado pela telemetria.
- **Sem mudanças** em `Game.js`, `SeaEffects.js`, combate, IA, física, spawn, dificuldade, hitboxes, controles e salvamento.
- Se uma cena não expuser contadores válidos, coleta apenas FPS; não inventa valor zero para métricas FX ausentes.
- Dados são estimativas de atualizações Phaser, **não** medição direta da GPU. A leitura passiva também tem custo não nulo.
- Contador em 48/48 mostra saturação do orçamento pré-existente; não prova sozinho que isso causou queda de FPS.

## QA obrigatório

- [x] Testes Node `tests/effect-budget-3-6l.test.cjs`: opt-out, médias, picos, quadros no limite, deep copy, relatório anterior v1, arquivo adulterado e ausência de escrita no save.
- [x] Assert de integração no `tests/mare-negra-hud-visual.test.cjs`, usando uma expedição Phaser real nos três viewports oficiais; confere contador, texto e JSON exportado.
- [ ] CI `port-smoke` e `port-visual` verdes no PR e no merge.
- [ ] Navegação no GitHub Pages, PWA e dispositivo físico real.

## Procedimento de medição recomendado

1. No **mesmo aparelho e navegador**, ligue MOSTRAR FPS no Porto.
2. Faça uma expedição de 60–120 segundos em mar calmo; retorne e exporte um JSON.
3. Faça outra captura de duração semelhante sob efeitos intensos de combate/temporal, no mesmo formato de tela; exporte outro JSON.
4. Selecione os dois arquivos em COMPARAR FPS .JSON. Observe FPS, quadros lentos, FX média, FX pico e quadros no limite.
5. Repita cenários para reduzir o efeito de variações aleatórias do jogo. Registre, por fora do arquivo, a percepção de travamento e as condições da expedição.

**Próximo passo (3.6m):** só propor alteração em densidade/cronograma de partículas **se** relatórios comparáveis sustentarem a hipótese e regressões visuais garantirem o caráter soturno da arte.
