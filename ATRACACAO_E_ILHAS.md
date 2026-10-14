# O Mar de Sangue v1.9.0 — O Arquipélago dos Condenados

## Atracação

As ilhas do mapa agora oferecem encontros interativos. Para atracar:

1. Navegue em direção a uma ilha ainda não explorada nesta viagem.
2. Aproxime-se da costa e reduza a velocidade para **67 unidades/s ou menos**.
3. Afaste os navios inimigos que estiverem perto — não é permitido atracar sob ameaça imediata.
4. Quando aparecer **⚓ ATRACAR**, toque no botão (celular), pressione **F** (teclado) ou **A** (controle).
5. Selecione uma das três ações da ilha, ou volte ao mar sem escolher.

Enquanto estiver no encontro, o combate e o avanço da missão/onda ficam congelados, e o jogador não sofre dano. Escolhas têm consequências reais para **ouro coletado na expedição, integridade do casco, maldição** e **atributos temporários do navio**. Cada ilha só concede uma recompensa por viagem; cancelar um encontro sem escolher não consome a oportunidade. O radar muda a cor das ilhas já exploradas. O relatório final exibe quantas ilhas você visitou.

## Tipos de locais

| Local | Exemplos |
|---|---|
| Recifes Tabaxi | Pérolas, atalho náutico e ajuda dos pescadores |
| Ruínas da Costa Sul | Tesouros antigos, cartas e madeira recuperada |
| Mosteiro Tortle | Treinamento, meditação e cartografia |
| Altar de Daegon | Pactos de sangue, pólvora amaldiçoada e rituais |
| Santuário de Deméter | Reparos, purificação e oferendas |
| Cemitério de Naus | Salvamento de cofres, materiais e ritos dos afogados |

## Controles

- **Celular:** toque no botão **⚓ ATRACAR** e depois na opção desejada.
- **PC:** tecla **F** para atracar; setas ↑/↓ para percorrer opções; Enter para escolher; Esc/P para cancelar o encontro.
- **Controle:** botão **A** para atracar/selecionar; direcional/analógico ↑/↓ para trocar a escolha; **B** ou Menu para voltar ao mar.

O botão **☰ PAUSA** continua independente da atracação. No momento de escolher um evento, é preciso encerrar a interação para abrir o Diário do Capitão.

## Escopo e compatibilidade

Este lançamento é o primeiro sistema de exploração (v1.9.0), não inclui ainda compra de tripulantes, NPCs recrutáveis ou comércio persistente (planejados para v1.9.1). Todas as artes, molduras e efeitos usam recursos existentes no projeto. Os saves `carcaca.mar-de-sangue.v4` continuam válidos.

Código do sistema: `SeaIslands.js`; cenas, controle e mundo: `Game.js`; resultados: `SeaMenus.js`.
