# Recife Devorador — segundo monstro de coral (27/10/2026)

## Problema de origem
O jogo carregava `assets/abyss/coral_horror.png` em `foe-coral`, mas no mapeamento de inimigos o tipo `coral` era sempre sobreposto por `coral-animated` (`assets/v15/beast_coral.png`), portanto o asset antigo nunca aparecia. **Não foi substituído o Horror de Coral.**

## Nova criatura
- ID do inimigo: **`recife`**; nome: **Recife Devorador**.
- Asset canônico: `assets/abyss/coral_horror.png`, substituído pelo PNG corrigido enviado em 27/10/2026 **sem qualquer modificação**, RGBA 2048×682, quatro quadros 512×682 a 4 FPS.
- SHA-256 do original: `9e66dc99d52f52893f5dcf2f9ed090781db795508d02b3c0d544127091ba12e5`.
- Textura Phaser independente `reef-devourer-animated`, com orientação de boca na parte inferior do sprite: correção visual +PI sem mudar o heading físico.
- HP 198; velocidade 72; ataque 27; recompensa base 90; raio 89; massa 2,45; cooldown de ataque 3100 ms. Monstro robusto de perseguição e investida corpo a corpo.
- O Horror de Coral V15 (`coral`) continua com seus próprios atributos e `coral-animated`, sem mudanças.

## Encontros
- **Campanha:** estreia garantida na **missão 7** (sobrevivência); desde a dificuldade 7 entra também no conjunto de inimigos aleatórios.
- **Sandbox:** aparição garantida na **onda 3**; retorna ao conjunto aleatório das ondas 7 em diante.
- Os chefes, as missões do Kraken e o tentáculo sentinela não são alterados.

## Verificações
Teste de integridade do arquivo, registro independente, quadros, loop visual, aparição nas modalidades, preservação do Coral V15 e cache PWA **v81**.
