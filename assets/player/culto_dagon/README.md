# Culto de Dagon — pacote de 20 evoluções de navio

**Estado: arte preparada, aguardando a importação do PNG original e o futuro sistema de alianças.**

Este pacote obedece ao mesmo contrato gráfico das evoluções da Corte Feérica e dos Sobreviventes: cinco colunas, quatro linhas, atlas RGBA 1460 × 1560, 20 quadros 260 × 360 px, separação transparente de 40 px, proa para baixo.

## Importação

O arquivo fonte fornecido pelo criador se chama `Evolucao_de_Navios_Eldritch_Culto_de_Dagon_original.png` e tem 1213 × 1296 px. Ao adicioná-lo **nesta pasta**, o workflow `dagon-ships.yml` executa `tools/preparar_evolucao_culto_dagon.py`, extrai os 20 sprites sem redimensionamento, gera o atlas e um manifesto com hashes e envia os produtos ao repositório.

Também é possível rodar `python tools/preparar_evolucao_culto_dagon.py` localmente (requer Pillow).

A imagem original permanece intacta. As 20 embarcações são lidas da esquerda para a direita, de cima para baixo. O quadro 20 apresenta a nau corrompida por Dagon, com anatomia tentacular evidente.

## Uso futuro

A arte **não deve ser vinculada automaticamente** a um evento político com `faction:'culto'`: essa marca identifica a consequência narrativa de uma decisão, não uma aliança persistente. Somente quando existir aliança explícita, o jogo deverá selecionar `player-ship-culto-dagon`. O nível visual continua sendo `SEA_PLAYER_SHIP.stage(profile.levels)-1` (mínimo das 15 melhorias). Manter a rotação local de π do sprite do jogador e o movimento, colisões e upgrades sem modificações.

Após importar o PNG e implementar as alianças, adicionar o atlas ao precache PWA e ao preview dos menus. Não ativar loaders que apontem para arquivos ausentes. Leia também `docs/faction-ship-art-status.md`.
