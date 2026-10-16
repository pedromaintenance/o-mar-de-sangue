# Evento 3.3 — Três Bandeiras na Maré

## Intenção narrativa

Este é o **primeiro encontro político jogável** de *O Mar de Sangue*, localizado em uma embarcação arruinada ao largo da Costa Sul.

**Base canônica utilizada:** `Ambientação - A Carcaça - Visão Geral.txt` (material do projeto): Portomonte é um refúgio humano protegido pela bênção de Deméter; a ocupação da Carcaça pelos *shadow fey* da Rainha da Noite gera submissão e resistência; os kuo-toa devotos de Daegon capturam pessoas em rituais e atuam junto dos abissais. O encontro específico, as falas e os contratos são **ficção nova para o jogo**, não acontecimentos históricos estabelecidos pelo documento.

## A cena

> Ao largo de Portomonte, náufragos pedem passagem. Um emissário da Corte oferece ouro pelos seus nomes; devotos kuo-toa de Daegon oferecem pólvora por sangue.

A escolha é feita na tela padrão de atracação, com três opções e o botão de retorno. Nenhum diálogo de terceiros exige tecnologia nova: o jogador vê proposta, custo, consequência e retorno à navegação.

| Decisão | Interlocutores | Consequência jogável desta viagem | Consequência narrada |
| --- | --- | --- | --- |
| Abrigar os sobreviventes | Sobreviventes da Costa Sul | +22 casco (até o máximo), -8 maldição (até zero) | Os náufragos se aproximam de Portomonte protegidos |
| Vender os nomes à Corte | Agente da Corte Feérica Sombria | +60 ouro, +15 maldição (até 100) | A Corte recebe as rotas e os nomes dos náufragos |
| Aceitar a pólvora de Daegon | Devotos kuo-toa | -12 casco, +6 dano dos canhões, +18 maldição | O pacto paga pela força com sangue e corrupção |

**Salvaguarda:** não permitir o sacrifício se ele deixar o navio com zero casco. O jogador pode sair sem aceitar nenhuma opção, e uma decisão só pode ser efetivada uma vez por naufrágio.

## Escopo técnico e persistência

- `Game.buildWorld()`: converte **somente o primeiro naufrágio** do mapa fixo em `kind='parley'`; preserva posição, quantidade de ilhas, física e sorteio. Reutiliza `island-wreck`, sem novos assets.
- `SeaIslands.js`: adiciona título, descrição, três decisões e as consequências; usa os mesmos `cost`, `gold`, `hp`, `heal`, `curse` e `cannon` do sistema existente.
- `s.politicalLedger` / `s.politicalChoice` são **campos transitórios na cena Game**, redefinidos em cada expedição. Existem como contexto narrativo e base de testes; não são armazenados no save e não geram bônus ocultos.
- O `SeaProfile` continua **versão 4** e não passa por migração. Ouro levado à próxima viagem segue somente as regras preexistentes de término da expedição.
- `sw.js`: atualiza o nome do cache da PWA para que os scripts modificados cheguem à instalação.
- O controle continua com A/Enter para escolher, setas para navegar e B/Escape para voltar (mantido pelo fluxo já existente).

## Decisões futuras ainda não implementadas

**3.3b — Reputação persistente:** elaborar primeiro o comportamento das facções, valor inicial, limites, formas de ganho/perda, exibição no Diário e a migração dos saves existentes. Não confundir a variável de viagem com reputação permanente.

**3.3c — Consequências sistêmicas:** missões da Corte, bloqueios de acesso, ajuda da Costa Sul e respostas do culto. Exigir decisões narrativas e testes de balanceamento antes de aplicar consequências ao mundo.

**3.3d — Mais encontros:** elaborar catálogo de eventos com probabilidades e frequência; evitar que a navegação se torne um fluxo de janelas sem combate.

## Definição de pronto do protótipo

- [x] Localização única e determinística por expedição, sem mudar geração física da ilha.
- [x] Três decisões distintas e recurso/risco explícito.
- [x] Consequência narrativa visível, com um único retorno após a decisão.
- [x] Proteção contra aplicação duplicada e contra morte por sacrifício.
- [x] Estado temporário, sem edição de Save/SeaProfile.
- [x] Testes automatizados Node e Chromium aprovados, incluindo desktop e Android emulado, em GitHub Actions.
- [ ] Merge da entrega e verificação no site publicado.
