# Sprint 01 — Ecos da Maré Sangrenta

**Fase:** pré-alfa (GitHub Pages é ambiente de teste, não lançamento do produto).  
**Escopo:** três encontros políticos por expedição, progressão narrativa por decisões e consequências táticas.  
**Persistência:** nenhum novo campo de reputação. Saves experimentais antigos não precisam ser preservados quando futuras alterações de design o exigirem.

## Experiência jogável

Um ponto de cada tipo de encontro é escolhido dentre ilhas físicas existentes a cada viagem, sem modificar coordenadas, tipos canônicos ou geração do mundo. Destinos vinculados a contratos são excluídos. Os encontros continuam ocultos até a atracação. Cada local só pode conceder uma escolha, uma vez por expedição.

| Encontro | Cenário | Escolhas | Efeitos existentes utilizados |
| --- | --- | --- | --- |
| Refugiados sob as Velas | Náufragos perseguidos pela Corte Feérica Sombria | Proteger / vender nomes / consultar navegadora | Casco, maldição, ouro, radar; proteção pode atrair patrulha |
| Carga sem Bandeira | Entreposto de mercadores clandestinos | Esconder carga / denunciar / comprar cartas | Ouro, maldição, radar; colaboração pode atrair patrulha |
| Liturgia Interrompida | Ritual de devotos kuo-toa de Daegon | Libertar prisioneiros / roubar pólvora / aceitar pacto | Casco, maldição, dano de canhão, velocidade; libertação pode atrair cultistas |

Uma perseguição anunciada é agendada para 12 segundos **de tempo navegável após o momento da escolha**. Ela não ocorre durante atracação, abertura do Atlas ou pausa; cria apenas um navio hostil já suportado pelo motor, sem ampliar a geração procedural de inimigos. A tentativa é limitada e não duplica a consequência.

## Crônica política

O Diário do Capitão mostra até três registros recentes, com a escolha e os efeitos aplicados. O encontro Três Bandeiras também é registrado; campos antigos de `politicalLedger` e `politicalChoice` continuam disponíveis para evitar regressões. A crônica é temporária, pois reputações políticas persistentes pertencem a sprint posterior.

## Contratos e regras preservadas

- Resgate, Contrabando e Caçada continuam usando suas localizações e suas opções especiais.
- O sistema de escolhas se integra ao modal de atracação: até três decisões, retorno, navegação por teclado/controle e toque.
- O jogador não ganha ouro nem bônus em uma segunda seleção no mesmo local.
- Não há alteração em física, sprites, HUD de combate, preço de upgrades, geração de ilhas, progresso de missão ou lógica de salvamento.
- O cache da PWA inclui `SeaPoliticalEvents.js` e sua versão é incrementada ao publicar novos scripts.

## Testes e aceite

- `node tests/political-events-sprint01.test.cjs`: posicionamento com exclusão de objetivos contratados, três eventos, efeitos, perseguição adiada, anti-replay e invalidade de uma escolha fora do evento.
- `node tests/political-events-visual-sprint01.test.cjs`: Phaser real em 1600×900, 1280×720 e Android emulado 390×844, incluindo capturas dos encontros e do Diário.
- `port-smoke` e `port-visual`: mantêm regressões históricas do porto, contratos, atlas, HUD, áudio e PWA.
- QA físico em Android e Xbox permanece **pendente**. Aprovação em Chromium emulado não equivale a teste em hardware físico.

## Riscos de balanceamento

Recompensas e riscos foram estabelecidos como valores iniciais para playtesting. Avaliar principalmente se ouro, radar e poder de fogo em uma única expedição são suficientemente atrativos sem trivializar a navegação; confirmar se a perseguição de 12 segundos cria tensão sem interromper demais os contratos existentes.

O Sprint 02 (abordagem/especializações) e o Sprint 03 (reputação persistente) não estão autorizados por esta implementação e permanecem para avaliação separada.
