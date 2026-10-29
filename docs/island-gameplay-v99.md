# Laboratório das Ilhas → Gameplay V99

O jogo e o laboratório usam **o mesmo arquivo** `laboratorio-ilhas/catalog.json` (v2.1-live). Atualizações publicadas nesse arquivo afetam a simulação e as regras das próximas viagens após o recarregamento do PWA.

## O que mudou

- 19 cenários, cinco escolhas por cenário: seis ilhas comuns, encontro Três Bandeiras, três encontros políticos e nove ecos.
- `SeaIslandRules.js` interpreta as fórmulas G/H/C/D/S/R/T/FS/FC/FD e é carregado antes de `SeaIslands.js`. O Phaser carrega o JSON no Boot antes de construir o mundo.
- Custos G negativos: `ceil(ouro_da_viagem * porcentagem)`, mínimo uma moeda, proibido ouro zero. Ganhos G: `floor(ouro_atual * porcentagem)`. Não há saque grátis com tesouro vazio.
- Casco H: percentual **do casco máximo**, e nunca permite sacrifício fatal. Cura nunca excede casco máximo.
- Maldição C: pontos na escala 0 a 100, `zero` remove toda a maldição. Multiplicadores D/S/R/T são percentuais sobre estatísticas atuais na expedição.
- FS/FC/FD: alinhamentos independentes 0–100, adicionados ao save v4 de forma compatível. **Alinhamento não equivale à filiação permanente** nem troca a aparência do navio. Resultados persistem ao concluir/encerrar a viagem via `SeaProfile.settle`.
- O menu apresenta somente o **preço calculado** e textos narrativos, não percentuais de recompensa. Não há compra ou sacrifício quando faltam recursos. Resultado registrado uma única vez por local.
- `demeter_4`, `daegon_4` e `reef_4` marcam a ilha como devastada: arte escurecida e fumaça existente. Os colisores e a geometria do mapa não mudam. A destruição é registrada para a duração da viagem, não persiste entre mapas regenerados.
- Eventos políticos mantêm os locais e os contratos protegidos. As cinco escolhas de cada primeiro ato encaminham a um dos três ecos existentes por arco. Cada eco agora oferece cinco escolhas. Cronologia, perseguições e marcas de navegação continuam funcionando.
- Contratos de resgate, contrabando e caça **mantêm suas opções próprias** nos locais designados; não são sobrescritos pelas cinco escolhas de visita livre.

## Fonte de verdade e manutenção

Edite `laboratorio-ilhas/catalog.json` para alterar valores e narrativas; não duplique percentuais nos módulos JS. Para adicionar novos tipos de fórmula, altere conscientemente `SeaIslandRules.js` e os testes.

`laboratorio-ilhas/` permanece na mesma URL do GitHub Pages. Aba "Jogo atual" acompanha a fonte compilada. A antiga tabela `SEA_ISLANDS.choices` permanece como fallback e para compatibilidade de testes de eventos antigos, não é mais a origem operacional quando o catálogo carrega.

**Verificação:** `node --test tests/island-gameplay-v99.test.cjs`; manter regressões da Sprint 01, contratos, PWA e scripts de cena. Testar manualmente menus desktop/mobile, equilíbrio de encontros, restauração de PWA offline e evento especial de resgate.
