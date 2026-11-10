# CT-001 — CICLO 6: BENCHMARKS E OBSERVATÓRIO DE PLAYTESTS

**Data:** 10/11/2026  
**Versão:** CT-001 laboratório v0.6 · PWA v120  
**Estado:** **AINDA NÃO APROVADO**. Não aparece no quadro de ofertas, não concede prêmio ou efeitos persistentes e não altera a missão principal do save.

## Objetivo

A missão 2 é acessível relativamente cedo, mas comparar as missões 10 e 25 sem progressão artificial exige trocar o nível dos inimigos **e** o equipamento do navio somente durante a viagem de teste. O ciclo 6 resolve esse problema e entrega uma ferramenta local para agrupar os JSONs de playtest.

## Acessos para QA

- [Laboratório da missão 2](https://pedromaintenance.github.io/o-mar-de-sangue/?contractLab=ct001&ct001Stage=2&ct001Seed=20261110)
- [Laboratório da missão 10](https://pedromaintenance.github.io/o-mar-de-sangue/?contractLab=ct001&ct001Stage=10&ct001Seed=20261110)
- [Laboratório da missão 25](https://pedromaintenance.github.io/o-mar-de-sangue/?contractLab=ct001&ct001Stage=25&ct001Seed=20261110)
- [Observatório CT-001 — importar relatórios](https://pedromaintenance.github.io/o-mar-de-sangue/ct001-playtests.html)

Essas URLs são os **caminhos previstos** do GitHub Pages; a publicação efetiva e o comportamento visual ainda precisam ser confirmados em navegador. O parâmetro **contractLab** só opera no modo **Sandbox**, e o porto permite escolher entre os três cenários.

## Cenários de referência

| Missão simulada | Faixa | Casco | Canhões | Cadência | Bateria | Cofre |
|---|---|---:|---:|---:|---:|---:|
| M2 | Aprendizado | 1 | 1 | 1 | 0 | 0 |
| M10 | Intermediária | 5 | 4 | 4 | 3 | 0 |
| M25 | Avançada | 12 | 11 | 10 | 9 | 0 |

As demais melhorias são especificadas em [SeaContractLab.js](../../SeaContractLab.js). O cofre fica no nível **zero** em todos os presets para impedir que o multiplicador de acumulação de ouro atrapalhe a comparação do prêmio-base. Esses equipamentos são **hipóteses de benchmark, não builds canônicas, não um cálculo do equipamento efetivo dos jogadores**.

A escolha de M2, M10 ou M25 cria **uma cópia do perfil** com as melhorias de referência e facção neutra. O save v4 real não é reescrito. O modo Sandbox ainda pode ser gravado como preferência de modo pelo menu, uma ação preexistente que não altera progresso ou ouro. Sem `ct001Stage`, o CT-001 usa a missão e o equipamento reais do capitão em modo laboratório.

## Reprodutibilidade

`ct001Seed` recebe inteiro decimal entre 0 e 4.294.967.295; o padrão é `20261110`. A semente passa a alimentar as posições, rumos e recargas iniciais do transporte e das escoltas, bem como os reforços específicos do CT-001. A criação do mundo continua a usar o mapa fixo do jogo.

**Limite:** o laboratório reproduz **condições iniciais de spawn**, não a totalidade dos eventos. Física, clima, comportamento adversário, acertos e decisões humanas podem variar durante as partidas. Uma mesma seed não garante uma vitória idêntica.

## Telemetria JSON v2

O botão **EXPORTAR TESTE CT-001 (JSON)** agora inclui:

- Missão simulada, missão efetiva no save, uso ou não de preset e seed;
- Distância da rota, pontos de navegação, janela e tempo até capturar;
- Tempo total em jogo, casco máximo/restante, dano por projétil e número de bolas;
- Escolha final, sucesso/retirada, abates, ouro coletado e pagamento simulado;
- Eventual motivo da falha.

O JSON ainda **não contém dados reais de pagamento por contrato**. A estrutura é `format: mar-de-sangue-ct001-playtest`, `schema: 2`. As ferramentas aceitam também os arquivos antigos de `schema: 1`, mas esses não possuem duração total nem as estatísticas do navio.

## Observatório de playtests

[ct001-playtests.html](../../ct001-playtests.html) + [SeaContractAnalytics.js](../../SeaContractAnalytics.js) formam um painel local, sem backend, que:

1. Importa vários JSONs da mesma pasta ou de testes diferentes;
2. Rejeita formatos inválidos, dados negativos e arquivos acima de 256 KB;
3. Evita duplicações simples pela chave de exportação;
4. Agrupa resultados por **missão e decisão**;
5. Calcula taxa de conclusão, tempo mediano, tempo mediano de captura e ouro **simulado** por minuto;
6. Exibe o modelo de economia provisório **separadamente** dos dados importados;
7. Exporta uma síntese JSON para revisão editorial.

O observatório começa vazio. **Nenhuma partida fictícia foi pré-carregada.** Os arquivos são processados no navegador; a página não faz upload nem altera o save v4.

## Protocolo de campo — próxima decisão de balanceamento

1. Abrir **M2** com a seed padrão, terminar as três escolhas em sessões distintas e exportar cada JSON.
2. Repetir em **M10** e **M25**, mantendo a mesma seed, e registrar fracassos/retiradas.
3. Se necessário, variar a seed para não medir apenas um desenho de combate.
4. Importar todos os resultados no Observatório e conferir tempos e ouro/minuto.
5. Em paralelo, medir a renda líquida/tempo de missões principais **reais** das mesmas faixas. Essa informação **não está nos JSONs do CT-001** e não deve ser presumida.
6. Ajustar prêmios e o cronômetro a partir das duas séries, lembrando que o contrato deve oferecer múltiplas vezes a renda principal como compensação por riscos adicionais.

## Testes automatizados

| Suíte | Verificações |
|---|---:|
| Abordagem | 22 |
| Cenários e proteção do save | 63 |
| Navegação A* | 155 |
| Física do comboio | 106 |
| Três rotas do CT-001 | 64 |
| Captura/contrato integrados | 22 |
| Interface, Carta e telemetria | 16 |
| Persistência e backup v4 | 687 |
| Observatório de JSON v1/v2 | 29 |
| Spawns controlados por seed em M2/M10/M25 | 105 |
| **Total** | **1.269** |

As dez suítes passaram em execução de lógica simulada. O workflow [.github/workflows/contract-tests.yml](../../.github/workflows/contract-tests.yml) foi atualizado para incluí-las. **Não foi comprovada a execução remota do workflow ou a operação real no Pages/browser**.

## Portão editorial

`CT-001.enabled=false`, e o runtime mantém `approvedTemplates=[]`. O novo painel é uma ferramenta de QA, não uma ativação do quadro de contratos. O CT-002 só deve começar depois da revisão dos resultados e da aprovação do CT-001.
