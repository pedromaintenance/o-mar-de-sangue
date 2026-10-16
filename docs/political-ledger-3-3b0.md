# 3.3b.0 — Registro das Três Bandeiras no Diário do Capitão

**Estado da implementação:** protótipo de registro **por expedição**, sem migração de save ou reputação persistente.

## Por que existe

O encontro `Três Bandeiras na Maré` já permite uma escolha entre sobreviventes da Costa Sul, um emissário da Corte Feérica Sombria e os devotos kuo-toa de Daegon. A decisão estava registrada em `s.politicalChoice` e `s.politicalLedger`, mas não podia ser consultada depois de deixar a ilha. Esta entrega transforma essa informação já existente numa nota legível no **Diário do Capitão**, junto de casco, ouro, maldição e afundados.

O registro não atribui moralidade automática à escolha. São **interesses e custos concretos**: proteção a pessoas ameaçadas, colaboração com poder ocupante ou aliança ritual perigosa. Ganho de ouro, custo de casco e maldição continuam sendo variáveis distintas de poder político.

## O que aparece

| Escolha efetivada | Registro político no Diário | Termos mostrados |
| --- | --- | --- |
| Nenhuma | Registro político · Nenhum acordo | Nenhum compromisso nesta viagem |
| Abrigar sobreviventes | Náufragos protegidos · Sobreviventes | +22 casco (limitado ao máximo), −8 maldição |
| Vender nomes | Nomes entregues · Corte Feérica | +60 ouro, +15 maldição |
| Pólvora de Daegon | Pólvora ritual · Culto de Daegon | −12 casco, +6 canhões, +18 maldição |

Os termos exibidos são **os valores contratuais da decisão**, não necessariamente a variação efetiva quando casco/maldição chegam ao limite, nem reputação numérica. Nenhuma vantagem oculta foi adicionada.

O Diário não revela o nome ou a existência do encontro antes de o jogador tomar a decisão; apresenta apenas uma nota genérica de ausência de acordos. No encontro, as três alternativas passam a identificar explicitamente seu interlocutor, para que a informação esteja disponível antes de escolher.

## Proteções técnicas

- `SeaIslands.js`: `politicalRecord(scene)` transforma `politicalChoice` em rótulo/termos, sem modificar `politicalLedger`, regras das escolhas ou consequências; novos prefixos de facção nas três propostas.
- `SeaMenus.js`: duas linhas **não interativas** na área vazia do Diário, acima da opção Continuar. Mantém os três botões existentes com posições, tamanhos e callbacks inalterados.
- Não modifica `Game.js`, `SeaProfile`, `settle()`, os níveis, ouro, missões ou modo de retirada. Ao iniciar outra expedição o registro retorna ao estado vazio, conforme `SEA_ISLANDS.init()` já fazia.
- Atlas, radar, posições de toque, teclas, gamepad e pausas não mudam.
- A PWA atualiza o cache dos scripts, sem assets novos.

## Verificação

- [x] Teste Node de overlay preserva 3 botões, hitboxes, callbacks e retorno a 75% do ouro; verifica registro vazio e as três variantes.
- [x] Teste Chromium de negociação ampliado para capturar Diário após o acordo em 1600×900, 1280×720 e Android 390×844; verifica save v4 inalterado, 3 opções de pausa e proteção contra spoiler.
- [ ] CI deve aprovar todas as suites antes do merge.
- [ ] Revisão do Pages e PWA instalada por dispositivo real permanece pendente.

## Próximo passo: 3.3b persistente (ainda NÃO implementado)

Definir com teste de mesa os limiares e efeitos de **reputação independente** entre sobreviventes, Corte e culto. Só depois implementar migração validada de `SeaProfile` v4→v5, leitura de saves legados, reset e proteção contra duplicação. `politicalChoice` e `politicalLedger` continuam temporários e **não são reputação acumulada**.
