# Sprint 01b — A Ressaca das Escolhas

**Fase:** pré-alfa · continuação incremental do Sprint 01, não o início da reputação persistente.  
**Hipótese de jogo:** uma escolha política é mais interessante quando produz uma situação posterior que o jogador pode reconhecer e enfrentar, não somente alterações imediatas de ouro, casco ou maldição.

## Experiência entregue

Cada uma das três histórias existentes pode gerar um segundo ato, definido pela decisão realmente tomada. Há **nove desdobramentos narrativos** (três por história), cada um com **duas respostas**. O ponto de retorno aparece em um marco físico do arquipélago: Santuário de Deméter após refugiados, naufrágio após contrabando, mosteiro tortle após ritual kuo-toa.

| Origem | Escolha inicial | Eco posterior |
| --- | --- | --- |
| Refugiados | Proteger os refugiados | Testemunhas acolhidas por Deméter: abrigo ou depoimento |
| Refugiados | Vender os nomes à Corte | Lista de procurados no templo: destruir provas ou vender novamente |
| Refugiados | Pedir orientação | Cartas da navegadora: explorar atalho ou devolver à família |
| Contrabando | Esconder a carga | Segunda remessa no naufrágio: entregar ou destruir provas |
| Contrabando | Denunciar o comboio | Restos da fiscalização: resgatar provas ou apagar rastros |
| Contrabando | Comprar cartas | Naufrágio ligado aos mapas: decifrar passagem ou revendê-la |
| Ritual | Libertar prisioneiros | Refúgio tortle: proteger os cativos ou ouvir suas visões |
| Ritual | Roubar pólvora | Sussurros da munição: acalmar ou intensificar |
| Ritual | Firmar pacto | O vínculo detectado pelos monges: aliviar ou aprofundar |

## Contrato de gameplay

- A origem continua sendo um evento **único** da expedição. Somente após a primeira escolha surge seu segundo ato.
- A continuação escolhe uma ilha preexistente do tipo certo, ainda não visitada e que não seja outra origem política ou destino de contrato.
- Apenas o local da pista fica conhecido na Carta; todas as demais ilhas permanecem sujeitas à exploração normal.
- Quando **não** há contrato nem waypoint marcado, a nova pista vira destino da Carta. Um waypoint preexistente ou de contrato **nunca** é substituído.
- A Carta distingue um **ECO POLÍTICO** conhecido e pendente; ao resolver a situação, a marca especial desaparece.
- São permitidas até três continuações na viagem (uma por origem). **Não** existe geração recursiva de eventos.
- A solução de um eco registra uma nova decisão na crônica, aplica consequências com os atributos já existentes e pode criar uma perseguição hostil da Corte ou do culto conforme a escolha.
- Uma continuação não é repetível: uma única visita, uma única consequência, nenhuma forma de duplicar ouro, dano, radar ou perseguição.
- Se todas as ilhas adequadas já foram visitadas ou estão reservadas para contratos, o eco **não** é criado, sem travar a expedição.
- Nada disso persiste como reputação entre expedições: a reputação duradoura permanece escopo reservado ao Sprint 03.

## Arquitetura

`SeaPoliticalEvents.js` contém conteúdo narrativo, derivações condicionais e alocação das pistas; `SeaIslands.js` utiliza o modal já existente para escolher e registrar efeitos; `SeaAtlas.js` distingue as pistas reveladas. A interface do porto, combate, IA principal, física, contratos e progresso de jogador não precisam de novos schemas.

## Testes e critérios

- `tests/political-echoes-sprint01b.test.cjs`: as nove derivações, escolha secundária, anti-replay, validação contra escolhas falsas, exclusão de destinos contratuais, waypoint protegido e crônica.
- `tests/political-echoes-visual-sprint01b.test.cjs`: Phaser real em 1600×900, 1280×720 e mobile paisagem, incluindo renderização das escolhas e Diário.
- Reexecutar toda a suíte `port-smoke` e `port-visual`.
- Testes físicos de celular e Xbox continuam pendentes. Não declarar o jogo lançado, nem oferecer garantias de balanceamento antes de playtesting.

## Critérios de produto para revisão

Durante o teste manual: observar se o jogador percebe claramente que aquela nova situação decorreu de uma escolha anterior; se o desvio até a ilha é convidativo em vez de distrativo; se os benefícios materiais não tornam a progressão fácil demais; e se três encadeamentos possíveis não transformam a navegação em excesso de interrupções. Ajustar os valores e o texto conforme o playtest.
