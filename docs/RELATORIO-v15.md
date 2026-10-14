# Produção v1.5 — Fechamento de art pipeline

## Artifacts
- Naval 3×2: 6 navios, com silhuetas próprias para as facções
- Naval 2×2: 3 estágios de evolução do navio e casco avariado
- Bestiário 3×2: Kraken, Dagon, tentáculo, afogados, enguia e horror de coral
- Efeitos 4×4: sequências de tiro, fumaça, água e impacto
- Crops feitos com transparência; fragmentos de sprites adjacentes removidos

## Integração
- Escalas v1.4 preservadas; física, controles touchscreen e gamepad Xbox mantidos
- 4 quadros por efeito com duração limitada; efeitos simultâneos limitados ao teto existente
- Perfil de níveis agora determina automaticamente a aparência do navio
- Novos assets usados pelos chefes; cores e estilo padronizados

## Validações executadas
- `node --check Game.js` e `node --check sw.js`: aprovados.
- Integridade: 92 texturas com arquivos correspondentes; 106 entradas no cache offline, sem referências ausentes.
- Teste isolado de lógica em Node: sprites intacto, intermediário, blindado, danificado e reparado, quadros do clarão de tiro e teto de efeitos; controles preservados no código.
- Captura real de batalha em Chromium foi gerada (`docs/qa_v15_game.png`), confirmando navios, efeitos e painel.
- Testes prolongados do Chromium headless ficaram sobrecarregados. A captura de `qa_v15_kraken.png` mostra a tela de derrota ao fim do ensaio, e **não** valida um combate completo contra o Kraken.
- Android físico, controle Xbox físico e duas viagens seguidas: pendentes.

## Critérios da próxima fase
- Comparar visual do personagem com tiers intermediários no celular.
- Investigar queda de quadros quando há muitos chefes e efeitos.
- Não confundir testes de lógica isolados com aprovação de campanha completa.
