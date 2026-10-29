# Política Naval V101 — bandeira com consequências

As três bandeiras conquistadas no Conselho V100 agora afetam o mundo. Este ciclo **não cria novas classes nem modifica os upgrades permanentes**.

## Efeitos exclusivos

| Facção | Benefício | Custo político |
| --- | --- | --- |
| Sobreviventes | +10% de cura proveniente das opções positivas H dos encontros do laboratório | Patrulhas da Corte tornam-se mais frequentes na composição dos encontros |
| Corte Feérica | +10% de ouro ao recolher tesouros no mar; patrulhas comuns da Corte não atacam primeiro | Atirar ou abalroar uma patrulha neutralizada rompe o acordo com **aquele navio** |
| Culto de Dagon | +7% do dano básico de canhões durante a viagem | Rituais que adicionam pontos de maldição pelo laboratório adicionam +10% desses pontos |

O bônus do Culto é aplicado **uma única vez** ao carregar os atributos base da embarcação. O ouro da Corte é calculado apenas na coleta, não na banca do porto. A cura dos Sobreviventes respeita o limite de vida máxima e só afeta encontros do laboratório.

**Regras de neutralidade:** somente a patrulha `patrulha` comum da Corte fica neutra para juramentados. Chefes, monstros e navios da Corte destacados como perseguidores políticos, fiscais de contrabando e alvos da caça mantêm agressividade. Barcos neutros continuam físicos, podem colidir e respondem a agressões. Essa neutralidade não se estende ao restante do bestiário.

## Comissões exclusivas

O painel `CONTRATOS DA COSTA SUL` mostra uma quarta opção exclusiva, se o capitão já tiver jurado sua bandeira:

- Sobreviventes — **Corredor de Deméter** (`faction-rescue`): objetivo em duas ilhas, buscar náufragos e entregar no santuário.
- Corte Feérica — **Mandado contra um desertor** (`faction-hunt`): investigar a pista e interceptar uma fragata desertora antes da fuga.
- Culto de Dagon — **Pólvora para o Abismo** (`faction-smuggle`): levar carga clandestina às ruínas, evadindo o fiscal da Corte.

O motor reutiliza os três tipos de contrato **já jogáveis**, mas exige juridicamente o juramento apropriado no porto **e novamente na inicialização da cena**. Pagamento `round(base*(1.55+min(3,sqrt(sorties)*.15)))`, com a rota de suborno de Dagon pagando 61% da remuneração clandestina. Ao cumprir uma comissão e retornar em vitória, +8 de alinhamento da bandeira, no máximo 100. Nenhuma recompensa em caso de fracasso, fuga ou apreensão. A campanha normal continua independente.

## Deserção

A expedição imediatamente seguinte à renúncia pode receber, após 15 segundos, um cobrador enviado pelo antigo juramento, apenas uma vez. Esse encontro não altera automaticamente o waypoint de contratos nem substitui chefes e invasões roteirizadas.

## Arte / desempenho

Todos os quatro atlas V100 permanecem intactos. As alterações de IA usam a própria frota existente; nenhum novo sprite ou som precisa ser baixado. Carregamento PWA V101 inclui `SeaFactionPolitics.js`. Máximo de uma perseguição de deserção, e nenhum efeito visual periódico extra é criado.

## Limites conhecidos

A neutralidade não substitui ainda uma frota de aliados autônomos que atire em inimigos. Não há salvamento de navios da Corte atacados entre viagens. As comissões reutilizam o objetivo físico dos três contratos-base, não acrescentam três mapas novos. A penalidade de maldição do Culto aplica-se a rituais das ilhas; outros eventos que aumentam a maldição diretamente permanecem como antes.

## Testes

`node --test tests/faction-politics-v101.test.cjs`. Verificar em navegador as comissões, cores de patrulha e disparos contra a neutralidade.
