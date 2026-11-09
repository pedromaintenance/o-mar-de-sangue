# CT-001 / CONTRATOS — CICLO 4: QUADRO E CONSEQUÊNCIAS

**Data:** 08/11/2026  
**Estado:** infraestrutura implementada e integrada, mas **CT-001 não habilitado em produção**.  
**Teste do contrato:** `?contractLab=ct001` + Sandbox. Esse modo continua sem premiação persistente.  
**Cache PWA:** v118.  
**Arquivos de runtime:** [SeaContractState.js](../../SeaContractState.js), [SeaContractEffects.js](../../SeaContractEffects.js), [Game.js](../../Game.js), [SeaSaveTransfer.js](../../SeaSaveTransfer.js), [PortUI.js](../../PortUI.js).

## 1. Persistência aditiva no save v4

O save continua em **versão 4**, com um novo objeto opcional `contractProgress`:

```json
{
  "version": 1,
  "board": null,
  "pendingEffects": [],
  "settledInstances": []
}
```

- **board:** quando elegível, identifica a missão principal ativa, a missão recém-concluída, uma única semente e 3–6 ofertas sem templates repetidos.
- **pendingEffects:** efeito do contrato, ID da instância que o concedeu e número exato da próxima expedição em que expira.
- **settledInstances:** proteção contra duplo pagamento da mesma instância, limitada às 48 liquidações recentes.

Saves antigos, sem `contractProgress`, carregam com o estado vazio. A importação/exportação de backup v4 aceita tanto o objeto novo quanto os formatos v4 antigos; rejeita campos arbitrários e estados contratuais inválidos. A restauração com rollback preserva o novo objeto quando presente.

### Segurança de progresso

**O laboratório do CT-001 não gera saldo nem grava efeitos**: o relatório apresenta pagamento e efeito **simulados**. A experiência em laboratório não consome efeitos reais pendentes. Apenas liquidações autorizadas de futuras instâncias podem criar efeitos permanentes.

`SeaProfile.settle` mantém a mesma rotina econômica de ouro, cofres, comissão e retenção, mas agora atualiza o ledger contratual na mesma gravação de perfil. O contrato só pode ser liquidado uma vez quando a oferta estiver **aceita**, pertencer ao quadro atual e o template estiver aprovado na lista explícita do runtime.

## 2. Preparação do quadro aleatório

Após uma **nova vitória na missão principal**, o motor tenta criar um quadro para a próxima missão ativa. O sorteio:

1. Exige **pelo menos 3 templates aprovados** no runtime.
2. Gera uma única semente de 32 bits.
3. Embaralha os IDs elegíveis sem substituição.
4. Seleciona **3–6 contratos**, respeitando o número de templates aprovados.
5. Persiste IDs de instância e parâmetros-base no save; recarregar não sorteia novamente.
6. Recusa aceitar uma oferta se outro contrato do mesmo quadro já estiver marcado como aceito.

**Estado atual:** `approvedTemplates=[]` de propósito. CT-001 permanece `enabled:false` e ainda não há CT-002/CT-003 aprovados. Por isso o quadro é **nulo** e não aparece no porto. Não transformar dossiês legados em novos templates de forma fictícia apenas para cumprir o mínimo.

**Pendência para um quadro plenamente executável:** os templates aprovados ainda precisarão fornecer geradores de instância reais (região/tempo/compensação), cards e callbacks de início de viagem; o arquivo de catálogo de design é editorial, não carregado automaticamente pelo jogo.

## 3. Três efeitos da próxima expedição

| ID | Origem | Regra já implementada no motor | Consumo |
|---|---|---|---|
| `fx-ct001-demeter-abrigo` | Libertar prisioneiros | Reparar até 15% do casco máximo após 5,5 s sem dano, a partir dos 8 s de viagem, sem hostis próximos | Uma cura, uma expedição |
| `fx-ct001-cacadores-tributo` | Saquear | Depois de 15 s, convoca um corsário hostil extraordinário; se o spawn falhar, tenta novamente | Um encontro, uma expedição |
| `fx-ct001-salvo-conduto` | Vender manifesto | A primeira patrulha comum elegível é neutra; patrulhas forçadas, fiscais e inimigos roteirizados não recebem proteção | Uma patrulha, uma expedição |

Efeitos do mesmo ID não acumulam. O motor do porto pode listar os efeitos marcados para a **próxima** expedição; o relatório informa quais foram usados e quais expiraram sem uso. Uma viagem concluída expira todos os efeitos que venciam naquela expedição, independentemente de vitória, derrota ou retirada.

**Importante:** esses comportamentos estão implementados, mas o CT-001 atual **não é autorizado a concedê-los**; são testados usando estados simulados no teste automatizado.

## 4. Testes executados

Arquivo: [SeaContractPersistence.test.cjs](../../tests/SeaContractPersistence.test.cjs).

- [x] 128 sementes reproduzíveis, quadro com 3–6 entradas e sem repetição.
- [x] Com 1 ou 2 templates, o sorteio não é criado.
- [x] Aceite único de instância e bloqueio de segunda liquidação.
- [x] Favor de Deméter aplicado uma vez, sem cura durante perseguição.
- [x] Cobrador extraordinário único e explicitamente hostil.
- [x] Salvo-conduto respeita hostilidade obrigatória e só afeta uma patrulha.
- [x] Laboratório ignora efeitos do save.
- [x] Expiração ao concluir a próxima expedição.
- [x] Validação rígida de ledger e rejeição de IDs repetidos.
- [x] Backup novo e antigo; migração aditiva; rollback após importação.
- [x] Missão principal continua avançando sem um catálogo aprovado.
- [x] Scripts sintaticamente íntegros, módulos em ordem e cache PWA v118.

O workflow [contract-tests.yml](../../.github/workflows/contract-tests.yml) executa os testes de abordagem, CT-001, integração e persistência em pushes/PRs relevantes. **A execução remota do workflow não substitui QA visual no navegador.**

## 5. Riscos conhecidos e limites deliberados

- A economia de CT-001 ainda usa uma referência provisória, não dados observados.
- O comboio ainda exige teste físico no mapa e em mobile/gamepad.
- Não existe neste ciclo quadro público de ofertas, tela de contrato novo ou autorização de payout real.
- As consequências da rota são propostas, sujeitas à revisão política e econômica.
- A neutralidade do salvo-conduto se aplica à primeira patrulha comum que nasce no mundo; versão futura pode mudar a condição para um encontro efetivo caso o comportamento pareça desperdiçar o documento.
- A bênção de Deméter é uma cura fora de perigo, não um segundo casco nem recuperação após naufrágio.
- As histórias e efeitos persistentes não devem ser estendidos automaticamente aos contratos antigos sem decisão editorial.

## 6. Próximo ciclo recomendado

1. Validar CT-001 no navegador: fluxo de navegação, tempo do comboio, todos os inputs e recompensas simuladas.
2. Revisar se o salvo-conduto deve ser consumido no **spawn** da primeira patrulha ou em sua **primeira aproximação efetiva**.
3. Auditar ouro/hora nas missões 2, 10 e 25; fixar um equilíbrio para os três desfechos.
4. Finalizar o CT-001 e passar ao CT-002 (um por vez), sem liberar ainda um quadro incompleto.
5. Quando houver 3 templates aprovados, conectar cards, aceite de instância e partida real; validar liquidação única e reversão de save em teste de integração.
