# Proposta 3.3b — Reputação das Facções (não implementada)

**Estado:** especificação de design, aguardando aprovação de regras/balanceamento. Nenhuma alteração no save nesta versão.

## Contexto existente

O perfil do jogador é `SeaProfile` no `Game.js`, com `defaults()`, `load()`, `store()` e `settle()` na **versão 4**. O carregador aceita o save v4 e um save legado v3. A decisão do encontro **Três Bandeiras na Maré** existe somente na cena (`politicalLedger`, `politicalChoice`) e não é passada para `settle()`.

A proposta abaixo deve preservar esse contrato até a etapa de migração.

## Proposta de reputação (não canônica, sujeita a balanceamento)

Três relações independentes:

| Chave futura | Representa | Exemplo de consequência a desenhar |
| --- | --- | --- |
| `sobreviventes` | Núcleos humanos da Costa Sul/Portomonte | Ofertas de reparos, abrigo e informações |
| `corte` | Agentes da Corte Feérica Sombria | Informações privilegiadas, cobrança de tributos, vigilância |
| `culto` | Devotos kuo-toa de Daegon | Pactos perigosos, acesso a armamentos amaldiçoados |

Sugestão inicial de intervalo: **−100 a +100**, começando em **0**. Positivo não significa bondade nem aliança obrigatória: indica afinidade, acesso ou dívida política conforme a facção.

Proposta para a primeira escolha, **ainda não aplicada**: ajudar náufragos aumenta `sobreviventes`, vender nomes aumenta `corte`, aceitar pólvora aumenta `culto`. A escala exata e as consequências devem ser avaliadas em playtests antes de codificar. Evitar alinhamento moral simplista.

## Save/migração — requisitos

1. Não reutilizar cegamente campos temporários `politicalLedger` ou `politicalChoice` como reputação permanente.
2. Ao implementar, criar um esquema **v5 explicitamente validado** em `SeaProfile.defaults()/load()/store()`, mantendo leitura dos saves v3/v4.
3. Nunca zerar ouro, níveis, missão, estatísticas nem melhor pontuação durante a migração. Nos arquivos com dados válidos, reputações ausentes começam em 0.
4. Valores inválidos (texto, NaN, infinidade, objeto, arrays) devem ser normalizados/clampados, sem descartar as demais propriedades válidas.
5. Fazer a migração com backup/teste de rollback; respeitar bloqueio de armazenamento no navegador e o fallback de sessão.
6. Gravar reputações apenas ao **encerrar a expedição** (vitória, derrota ou retirada), sob regras explícitas de retenção — decisão de design ainda não tomada.
7. Não contar decisões duas vezes em recargas, desistências e reentradas na ilha.
8. Na UI, diferenciar **ganho de reputação**, **ouro**, **maldição** e **risco** antes de adicionar consequências automáticas.
9. Antes de qualquer lançamento público, testar upgrades, saves legados, reset, PWA offline, morte/retirada e sincronização visual da reputação.

## Marcos propostos

- **3.3b.1:** fechar regras de reputação, categorias e efeitos; aprovação de lore.
- **3.3b.2:** definir e testar migração v4→v5 com backups, sem gameplay.
- **3.3b.3:** UI de facções no Diário do Capitão e eventos que alimentam os valores.
- **3.3b.4:** consequências sistêmicas e balanceamento.

**Nada desta especificação altera os valores jogáveis da versão 3.3a.**
