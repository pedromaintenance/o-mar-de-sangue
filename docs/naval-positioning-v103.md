# V103 — Posição naval: proa, costado e popa

## Problema
Na V102, o timing do ataque ganhou profundidade com a contrabateria, mas o ângulo de aproximação não alterava o dano dos projéteis. Era possível vencer disparando lateralmente sem buscar uma posição de vantagem.

## Regra implantada
- Um navio tem **proa** (frente), **costado** (laterais) e **popa** (traseira). A zona é calculada pela direção do projétil em relação ao rumo real do casco, sem depender do ângulo desenhado no sprite.
- Projetil alinhado ao rumo da proa (atacando por trás): **+20% de dano** na popa.
- Projetil oposto ao rumo da proa (atingindo de frente): **−10% de dano** na proa.
- Ângulos laterais e oblíquos: **dano anterior inalterado**.
- Limite angular: `dot >= 0.72` define popa, `dot <= -0.72` define proa. Essa regra é simétrica para jogador e navios NPCs.
- Navios-chefes: bônus de popa limitado a **+10%** e proteção da proa a **−5%**, para preservar duração dos encontros.
- Monstros não têm casco direcional; ataques mágicos do Olho de Dagon também não recebem esses bônus.
- **Abalroamento, rochas, rituais, recarga e contrabateria** continuam suas regras existentes. Nenhum novo asset ou campo de save.

## Feedback e legibilidade
Uma mensagem breve aparece ao acertar a popa inimiga ou sofrer uma salva pela própria popa, com limitação de uma mensagem a cada 2,5 segundos. Um verbete explica a regra no Diário do Capitão.

## Validação
`tests/naval-positioning-v103.test.cjs` exercita ângulos em dois rumos, velocidade e valores-limite, efeitos em projéteis reais do loop do jogo, proporções de chefes, imunidade de monstros, magia do Olho e pré-cache PWA. CI inclui testes de contrabateria e demais regressões de gameplay.

## Critérios de playtest físico
1. Navegue tentando ganhar a popa de uma patrulha e compare a duração do confronto contra ataque lateral.
2. Exponha a própria popa a uma fragata e observe risco e mensagem sem spam.
3. Verifique se mudança de rumo, escalada de upgrades, gamepad Xbox e controles de toque continuam confortáveis.
4. Compare FPS desktop e Android antes e depois (nenhum efeito gráfico contínuo novo).

**Estado de produto:** pré-alfa. Teste físico e balanceamento ainda necessários.
