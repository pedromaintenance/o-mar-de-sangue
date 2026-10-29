# O Arquipélago dos Condenados — laboratório permanente de gameplay

**GitHub Pages:** https://pedromaintenance.github.io/o-mar-de-sangue/laboratorio-ilhas/

A partir da V99, as cinco decisões de cada um dos 19 cenários (95 decisões) **estão em jogo**. O laboratório e o Phaser compartilham a única fonte de regras:

- `catalog.json`: 19 eventos, 95 escolhas e fórmulas porcentuais; o Phaser carrega via `SeaBoot.preload()`, na chave `mar-ilhas-v2`.
- `../SeaIslandRules.js`: intérprete das fórmulas, preços, benefícios, custos e alinhamentos em tempo de execução.
- `index.html`: simulador de balanceamento; não contém cópia dos dados de eventos.
- `../SeaPoliticalEvents.js` e `../SeaIslands.js`: gerenciamento de encontros, ecos, navegação, contratações e efeitos.

**Para alterar uma decisão:** editar `catalog.json`, publicar na `main`, recarregar a mesma página e iniciar uma nova viagem no jogo. Não gerar HTML novo. As modificações feitas somente dentro da oficina do navegador **não** escrevem no GitHub nem no save. Exporte o JSON e publique a mudança desejada por commit.

O jogador vê apenas o preço (em moedas/casco), não os percentuais dos benefícios. Custos de ouro dependem do ouro a bordo e sacrifícios não podem afundar o navio dentro do modal.

Alinhamento com Sobreviventes, Corte e Culto persiste no save após o fim da viagem, sem adesão automática. Backups antigos v4 continuam aceitos. Os três arcos políticos continuam com seus ecos; contratos especiais têm opções próprias para preservar o objetivo.

**Destruição:** a arte com fumaça é ativada pelas escolhas `demeter_4`, `daegon_4` e `reef_4`; a marca de devastação persiste na viagem, não entre mapas regenerados.

**Regressão:** `tests/island-gameplay-v99.test.cjs` e `tests/save-restore-3-6c.test.cjs`. A versão do PWA é V99.
