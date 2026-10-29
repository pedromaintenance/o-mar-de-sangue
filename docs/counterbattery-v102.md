# V102 — Contrabateria: interromper a salva inimiga

**Problema:** os canhões inimigos já exibiam o avanço de preparação (25–100%), mas o jogador não podia agir sobre esse temporizador. Desviar era a única resposta ativa além de afundar o adversário.

## Regra implementada

- Um **projétil do jogador que acerta um navio comum vivo** após **60% do preparo** interrompe a salva e reinicia a preparação daquele navio.
- O alvo recebe uma imunidade de **5 segundos** contra novas interrupções. O disparo recebido causa dano normalmente. Não há stun de movimento nem alteração da recarga do jogador.
- **Chefes, monstros e aríetes** não são afetados. Táticas de abalroamento, Kraken, Arauto, Senhor das Profundezas, Olhos e Fendas de Sangue continuam como antes.
- O texto **SALVA INTERROMPIDA** aparece brevemente sobre o inimigo, por 650 ms, sem partículas ou sprites novos. Depois a etiqueta retorna ao nome/percentual de preparo normal.
- Agressão a patrulhas neutras da Corte continua a quebrar sua neutralidade, mesmo quando o tiro também interrompe uma salva.

## Razão de design

Cria contrajogo ofensivo: atacar cedo demais ainda causa dano, mas não impede o disparo; acertar no final do preparo recompensa o timing e o alinhamento dos canhões. A imunidade por alvo evita bloqueios permanentes com múltiplas baterias e com melhorias de cadência. Não há bônus de recursos nem mudança de save.

## QA / limites

Teste determinístico exercita a função de regra, a colisão real de projéteis e a restauração da etiqueta. Regressões das baterias, chefes e facções estão no workflow V102. **Balanceamento e legibilidade em dispositivos físicos permanecem pendentes** até playtest. Especialmente testar nível 1, múltiplos inimigos, upgrades de cadência e tela móvel.
