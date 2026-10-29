# Economia V107 — Missões e Mar Sem Fim

A campanha avança o enredo; o Mar Sem Fim financia a evolução.

| Regra | Antes | Agora |
|---|---|---|
| Ouro levado ao banco após missão | 100% do montante recuperável | **25%**; o restante é informado como **CUSTO DA CAMPANHA** |
| Comissão por vitória | `round(42 × 1,25^fase)` | `round(24 + 4,5×fase + 6×√fase)`, fase de cálculo limitada a 100 |
| Mar Sem Fim e contratos independentes | Saque integral | **Inalterado**; saque integral |
| Estaleiro | Preço base normal | **Preço ×3** para os 15 upgrades; progressão por nível preservada |
| Retirada / derrota | Recuperação de 75% / 40% | Mantida antes da parcela de campanha |
| Cofre do Capitão | Bônus de 15% por nível | Mantido, antes da parcela de campanha |
| Objetivo de carga | Ouro encontrado durante missão | **Inalterado** |
| Saves v4 | Saldo, itens e níveis existentes | **Inalterados** |

**Exemplo com 400 de saque bruto e nenhum bônus de Cofre:** vitória em Missões deposita 100; vitória no Mar Sem Fim deposita 400. Ao retirar, os valores são 75 e 300; ao perder, 40 e 160. O Leme Ancestral inicial custa 75 em vez de 25; as Baterias Geminadas, 360 em vez de 120.

A campanha deixa de gerar riqueza de forma exponencial por fase. O saque continua existindo na cena da missão para cumprir objetivos e mostrar relatórios. Esta mudança não altera dano, IA, física, objetivos, loot do mar aberto, nem schema dos saves.

Teste `node tests/economia-v107.test.cjs`; validações adicionais no GitHub Actions. É recomendável playtest manual de progressão a partir de um save novo e de um save avançado.
