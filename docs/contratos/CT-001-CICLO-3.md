# CT-001 — RELATÓRIO DE INTEGRAÇÃO DO CICLO 3

**Data:** 07/11/2026  
**Estado:** vertical slice **jogável somente em laboratório**; contrato **não publicado no quadro de ofertas**  
**URL do ensaio:** `https://pedromaintenance.github.io/o-mar-de-sangue/?contractLab=ct001` (abrir o modo Sandbox no porto).  
**Novo módulo:** [SeaContractCT001.js](../../SeaContractCT001.js)  
**Testes:** [SeaContractCT001.test.cjs](../../tests/SeaContractCT001.test.cjs), [SeaContractCT001.integration.test.cjs](../../tests/SeaContractCT001.integration.test.cjs) e [SeaBoarding.test.cjs](../../tests/SeaBoarding.test.cjs).

## O que esta versão faz

1. Ao começar o modo Sandbox com `?contractLab=ct001`, substitui a expedição infinita por **uma operação isolada**.
2. Marca um naufrágio existente na Carta. Atracar e selecionar **SEGUIR A ROTA DO COMBOIO** cria o transporte capturável e sua escolta.
3. O comboio avança rumo à borda oposta do mar; há prazo de interceptação calculado pela distância, com ajuste pela missão principal ativa.
4. O alvo só é capturado quando incapacitado abaixo de 24% do casco e abordado em baixa velocidade. Afundar inimigos comuns ainda vale como combate normal; **capturar o transporte não conta como afundamento**.
5. A abordagem abre uma decisão in-game usando a interface de escolhas que já existia nas ilhas, inclusive controles de teclado, toque e gamepad.
6. O jogador escolhe uma das três consequências e deve **cumprir um objetivo distinto** para concluir.

| Escolha | Objetivo após a captura | Pagamento simulado | Efeito imediato |
|---|---|---:|---|
| Abrir os porões | Levar os prisioneiros a um santuário de Deméter | 0,8 × base | Corsário perseguidor; confiança Sobreviventes +10, Corte −7, Culto −2 ao entregar |
| Tomar o cofre | Destruir os navios da contraemboscada | 1,25 × base | Patrulha + corsário; confiança Sobreviventes −6, Corte −3 ao vencer |
| Vender o manifesto | Entregar as provas a uma ruína existente | 1,0 × base | Fiscal hostil; confiança Corte +5, Sobreviventes −8, Culto −4 ao concluir |

**Ouro:** a base é calculada provisoriamente por `max(240, round(6 × (0,25 × comissão_da_missão + 0,25 × alvo_de_carga)))`, usando a missão principal **ativa no perfil** e não o estágio visual do navio. Isto é um **proxy editorial**, não o loot observado em playtests. Valores só viram cânone após calibragem. Não são feitas gravações durante o ensaio.

**Progressão:** a composição das escoltas sobe pelos intervalos 2–5, 6–10, 11–15, 16–25 e 26+ (última faixa limitada para evitar escalonamento infinito). A dificuldade de inimigos do sandbox experimental também utiliza a missão ativa, limitada a 25. O jogador consegue visualizar a recompensa antes da decisão e as consequências políticas após concluir.

## Proteção do progresso real

**Nenhuma recompensa ou consequência do CT-001 experimental é gravada em SeaProfile.settle.** O encerramento gera um relatório de pagamento **simulado** e mostra o banco original; o dinheiro, níveis de melhoria, etapas, reputação e estatísticas reais permanecem inalterados pela liquidação desse ensaio. Entrar em Sandbox ainda pode alterar apenas a preferência de modo já existente.

A missão principal e os contratos legados continuam sem acesso ao CT-001. Não existe botão público para aceitá-lo; a URL precisa trazer explicitamente `contractLab=ct001` e o usuário precisa iniciar **Sandbox**. O parâmetro antigo `boardingLab=1` permanece independente e gera apenas uma fragata capturável sem narrativa.

## Fluxos testados

- [x] `SeaContracts.init` delega corretamente ao módulo CT-001.
- [x] Naufrágio, santuário e ruína são escolhidos a partir de ilhas existentes.
- [x] Aparecimento do transporte capturável e das escoltas.
- [x] Incapacitação e abordagem preservam a diferença entre captura e afundamento.
- [x] A captura dispara `onCapture` e abre a decisão modal.
- [x] Ensaio de integração automatizado: `SeaContracts` → `SeaBoarding` → modal → Deméter.
- [x] **Abrir os porões:** destino e pagamento final corretos.
- [x] **Tomar o cofre:** cobrar a destruição dos reforços antes de pagar.
- [x] **Vender o manifesto:** destino e pagamento final corretos.
- [x] Fuga do transporte antes de ser incapacitado encerra com prêmio zero.
- [x] Seleção de banda por missão principal e limite da última banda.
- [x] Sintaxe dos scripts e ordem de carregamento dos módulos verificadas.
- [x] Cache PWA atualizado para v117 incluindo `SeaContractCT001.js`.

## QA manual ainda pendente

- [ ] Confirmar GitHub Pages com PWA atualizado e recarregar a versão 117.
- [ ] Seguir o marcador do naufrágio na Carta; testar acessibilidade da ilha na prática.
- [ ] Confirmar o comboio em movimento, sem ficar preso em ilhas nem no limite do mundo.
- [ ] Verificar se o tempo de fuga é justo com navio nível 1 e com navio avançado.
- [ ] Atacar sem matar o transporte; validar 24% e disponibilidade de **ABORDAR**.
- [ ] Verificar HUD e overlay de decisão com teclado, mouse/toque e controle.
- [ ] Completar as três rotas em sessões separadas e conferir o relatório.
- [ ] Testar derrota, retirada, save real e versões existentes em PWA offline.
- [ ] Testar colisões, congelamento de IA do alvo avariado, clima e demais eventos.

## Pendências do CT-001 para ser jogável na campanha

- Quadro persistente de **3 a 6 ofertas** entre missões, com semente e identificação única por instância.
- Avaliar a viabilidade do comboio por distância, ilhas, clima e tempo em múltiplas seeds; o laboratório atual seleciona locais determinísticos, não implementa ainda a geração aleatória.
- Recompensa com dados de vitórias principais reais e economia em ouro/hora (não apenas comissão + objetivo de carga).
- **Efeitos na próxima expedição** (abrigo de Deméter, cobradores da Corte, salvo-conduto) com duração, consumo e persistência, todos **ainda não implementados**.
- Revisar o caso de vitória humanitária em que o transporte fica para trás: prisioneiros atualmente são tratados como a bordo do jogador durante a travessia, não como NPCs escoltados.
- Revisar posição e quantidade de reforços; conferir efeitos de facções e reputação condicional.
- Testes de acessibilidade e apresentação no desktop e mobile.

**Próximo ciclo recomendado:** QA da caça + refinamento do temporizador e reforços; depois efeitos de próxima expedição e quadro persistente, sempre sem habilitar uma entrada inacabada.
