# O MAR DE SANGUE — CONSTITUIÇÃO DE GAME DESIGN DOS CONTRATOS

**Versão:** 1.0 — 07/11/2026  
**Estado:** cânone de design; **infraestrutura de persistência e efeitos implementada**, mas **quadro público não habilitado** (menos de 3 contratos aprovados; CT-001 em laboratório).  
**Escopo:** oferta, geração, dificuldade, recompensa, consequências e processo de criação de contratos.  
**Integração-alvo:** `pedromaintenance/o-mar-de-sangue`
**Histórico de implementação:** [ciclo 3 — CT-001 jogável no laboratório](./CT-001-CICLO-3.md) · [ciclo 4 — quadro/efeitos/save v4](./CT-001-CICLO-4.md), sem alterar a campanha principal nem substituir contratos existentes sem migração.

## 0. Premissa

A missão principal faz a campanha avançar; o contrato é uma operação opcional de alto risco dentro do mesmo mundo navegável. Terminar uma missão principal gera **3 a 6 novas ofertas aleatórias**, contextualizadas pela **missão principal que se torna ativa após a vitória**. Contratos devem ser mais difíceis e mais lucrativos do que a missão do mesmo estágio. Suas escolhas podem produzir efeitos mecânicos e políticos persistentes ou temporários.

## 1. Artigos constitucionais (regras obrigatórias)

1. **Geração por conclusão:** cada vitória inédita em missão principal que efetivamente avança o estágio provoca exatamente uma nova geração de **3 a 6** ofertas. Derrota, retirada, repetição de etapa concluída e conclusão de contrato não renovam o quadro.
2. **Escala pelo presente:** cada oferta guarda o número e o título da **missão principal ativa** quando foi gerada; dificuldade, objetivos, inimigos e prêmios são calculados com esse estágio. Não dependem de uma escala abstrata dissociada da campanha.
3. **Maior desafio:** um contrato exige mais competência do que uma missão principal contemporânea, combinando pressão de combate com ao menos um fator adicional (perseguição, temporizador, escolta, inspeção, tempestade, limitação de rota ou objetivo protegido). Não equivale apenas a inflar pontos de vida.
4. **Remuneração elevada:** o prêmio contratual completo deve valer **aproximadamente 4 a 8 vezes a referência econômica de uma missão principal** no estágio, antes dos bônus condicionais. Essa é uma faixa inicial de balanceamento, não um número já testado.
5. **Escolhas jogáveis:** cada contrato oferece ao menos uma decisão que modifica efetivamente o percurso, condições de sucesso, perseguição, objetivo ou risco — e não apenas um texto diferente.
6. **Consequências legíveis:** alternativas devem expor consequências previsíveis em linguagem narrativa, sem revelar todos os segredos, e registrar o resultado no relatório final.
7. **Relações materiais:** toda operação define quem a financia, quem trabalha, quem ganha e quem suporta o custo. Culto de Dagon, Corte Feérica e Sobreviventes são interesses distintos; seus personagens não são meras cores de menu.
8. **Variedade e autoria:** geração é **aleatória na seleção e parametrização de contratos autorais**; não deve concatenar textos incoerentes aleatoriamente. Ofertas do mesmo quadro não podem ser duplicatas da mesma instância ou do mesmo template.
9. **Integração com o mundo:** usar geografia física alcançável, atlas, combate naval, clima, perigos, melhorias, status políticos, ouro e sistemas existentes. Os contratos não compõem uma modalidade desconectada da navegação.
10. **Persistência e integridade:** quadro, sementes, ofertas aceitas, conclusões, escolhas e efeitos devem ser serializados e migrados de forma aditiva, preservando saves existentes. Liquidação e recompensas são idempotentes: **um mesmo contrato não paga duas vezes**.
11. **Autonomia da campanha:** cumprir, recusar ou perder contratos não deve impedir avançar na missão principal, salvo uma conexão narrativa aprovada explicitamente como exceção.
12. **Criação unitária:** todo novo contrato é criado, revisado e validado **um por vez**, usando o mesmo contrato de dados, antes de entrar no catálogo elegível para sorteio.

## 2. Ciclo de jogo recomendado

```text
Vitória inédita na missão principal N
    → campanha avança para N+1
    → gerar quadro determinístico por semente com 3–6 ofertas
    → salvar quadro vinculado à missão principal ativa N+1
    → jogador consulta, aceita ou ignora as ofertas no porto
    → contrato inicia uma expedição própria e não avança a campanha
    → sucesso, retirada ou fracasso produz relatório e consequências
    → oferta realizada é marcada como consumida; não pode ser repetida pelo mesmo quadro
    → contratos ainda disponíveis podem ser feitos ou ignorados
    → próxima vitória inédita na missão principal renova as ofertas não aceitas
```

**Regra transitória:** o quadro inicial anterior à primeira missão concluída pode conservar as três ofertas legadas. O novo sorteio começa após a primeira vitória principal. Uma expedição já aceita nunca deve ser apagada pela renovação: ou a interface impede iniciar uma missão principal durante um contrato ativo, ou conserva o contrato ativo fora do quadro até resolução.

**Regra contra reroll:** abrir e fechar o porto, recarregar o jogo, reiniciar uma expedição ou abandonar um contrato não sorteia novas ofertas. Sorteio vinculado ao evento de avanço da campanha e a uma semente persistida. A mesma combinação estágio/geração produz o mesmo quadro.

## 3. Geração e elegibilidade

**Contagem:** `2 + inteiro_aleatorio(1, 4)`, produzindo 3, 4, 5 ou 6 ofertas; a distribuição poderá ser ponderada em testes de UX. 

Para formar o quadro:

1. Registrar `missionCleared=N`, `activeMission=N+1`, título de missão, semente, versão de regras e perfil corrente.
2. Filtrar templates por requisitos explícitos: estágio mínimo, regiões acessíveis, ilhas/locais existentes, facção, juramento, status político, capacidade física de concluir objetivos.
3. Selecionar templates **sem reposição**, diversificando tipos de operação e interesses. Priorizar ao menos uma oferta independente de juramento em qualquer quadro.
4. Instanciar localizações, adversários, clima, rotas, condições e parâmetros de combate; validar que todos os objetivos são alcançáveis. Se um template falhar na validação, sortear outro; nunca publicar um contrato impossível.
5. Congelar no save os dados da instância (recompensa anunciada, dificuldade, seed, destino, decisões disponíveis). Melhoria posterior do navio **não recalcula retroativamente** a oferta aceita.
6. Se houver poucos templates elegíveis, usar menos variedade de tipo e variações parametrizadas genuínas, sem duplicar o mesmo template no quadro; antes de o catálogo atingir 6 templates elegíveis, manter transitoriamente ofertas legadas ou usar versões explicitamente distintas do catálogo. A impossibilidade de gerar 3 ofertas válidas é uma falha detectável, jamais mascarada.

**Diversidade orientativa:** tipos de caçada, resgate, contrabando, sabotagem, escolta, recuperação, investigação, emboscada e exorcismo marítimo. Esses são tipos de design, não declarações de mecânicas já implementadas.

## 4. Escalonamento e dificuldade

**Referência autoritativa:** `SeaProfile.mission` (próxima missão principal ativa), e não o índice de um menu ou o nível visual do navio. Os títulos atuais da primeira passagem são 25, mas o estágio numérico do jogo continua além deles; contratos devem funcionar em ciclos posteriores.

**Faixas editoriais sugeridas:**

| Missão ativa | Vocabulário de desafios predominante | Condições de seleção |
| --- | --- | --- |
| 1–5 | Perseguição, escolta simples, patrulhas reforçadas, obstáculos de navegação | Regras ensináveis, sem exigir equipamento específico não garantido |
| 6–10 | Interceptações, múltiplos objetivos, ameaças de monstro e tempo | Composição hostil e pressão de rota mais intensas |
| 11–15 | Fraudes de facção, emboscadas, travessias malditas, proteção de alvo | Mais risco político e fases encadeadas |
| 16–20 | Guerra de comboios, navios de elite, eventos de clima hostil | Pressões simultâneas e escolhas de alto impacto |
| 21–25 e ciclos posteriores | Expedições extremas com múltiplos gatilhos e poderes anômalos | Escala progressiva; evitar combinações matematicamente impossíveis |

**Regra de dificuldade:** cada contrato precisa superar a missão principal contemporânea em pelo menos **dois eixos de pressão** (combate, tempo, sobrevivência, navegação, escolta, recursos, informação). Não usar somente bônus linear de dano/vida. Avaliar métricas de balanceamento: taxa de êxito, tempo médio, perdas de casco, uso de melhorias e ouro líquido/hora, por estágio de campanha.

**Garantia de exequibilidade:** não exigir habilidades ainda indisponíveis, inimigos indestrutíveis, coordenadas fora do mapa ou destinos inexistentes. Recalibrar tempo de perseguição por distâncias efetivas no mapa de 8.800 × 6.800; validar colisões e caminhos.

## 5. Economia e pagamento

Situação verificada no código (07/11/2026):

- `SEA_ECONOMY.missionCommission(stage)` calcula comissão principal; missões passam pelo fator de liquidação `missionPayoutMultiplier = 0.25`.
- Contratos vigentes: **Resgate dos Afogados 125**, **Pólvora sem Bandeira 190** e **A Caçada dos Condenados 240** de prêmio base, antes de condições específicas e comissões faccionais.
- As comissões de bandeira são variantes dos três templates atuais com recompensa modificada por expedições anteriores.

**Proposta de referência monetária:** `referenciaMissao(stage)` = maior valor entre a comissão principal líquida prevista do estágio e uma mediana robusta das recompensas líquidas de até cinco vitórias principais recentes em estágio comparável. Usar histórico somente se houver quantidade suficiente e não incluir contratos ou tesouros excepcionais como referência. Na ausência de histórico, usar a fórmula prevista pela economia atual, mais um piso de remuneração configurável.

**Proposta inicial:** `premioBase = arredondar(referenciaMissao × fatorDeRisco)`, com `fatorDeRisco` entre 4 e 8. Adicionar piso explícito, calibrado conforme progressão real, sem prometer razão exata após loot extra, cofre e outras bonificações. A **recompensa exibida antes da partida** é a recompensa fixa da instância: não flutua por compras feitas entre a oferta e a execução.

Bônus de decisão sugeridos: de −30% a +35% sobre o prêmio contratual, conforme custo e risco adicional. Alguns resultados devem pagar menos ouro e oferecer vantagem tática, influência política ou benefício comunitário em troca. **Falha não concede prêmio integral.** Conclusão pode ocorrer por rotas distintas, desde que previstas pelo contrato.

**Cuidado técnico:** o sistema atual soma prêmio ao ouro de cena e transfere a quantia pelo `SeaProfile.settle`. Ao implementar a constituição, não acrescentar novo crédito bancário além desse fluxo; recalcular e auditar exatamente uma vez a bonificação, o cofre e a retenção.

## 6. Efeitos especiais e consequências

| Classe | Exemplos de efeitos possíveis | Política de balanceamento |
| --- | --- | --- |
| Imediatos | ouro, casco, carga, perseguidor, rota, maldição da expedição | Aplicar durante o contrato, com feedback claro |
| Próxima expedição | proteção de Deméter, salvo-conduto feérico, vento favorável, visões abissais | Benefícios temporários, com prazo de validade |
| Políticos | confiança em Sobreviventes, Corte ou Culto; prova de facção, hostilidade ou favor | Respeitar juramentos e consequências já existentes |
| Estratégicos | informação no atlas, rota revelada, acesso a opção especial de outro contrato | Desbloqueios condicionais, não upgrades gratuitos sem limite |
| Sobrenaturais | pacto que amplifica poder sob determinada condição e produz custo/risco | Identidade lovecraftiana e preço concreto |

**Leis dos efeitos:** um efeito tem ID estável, gatilho, duração, intensidade, regra de acumulação, forma de expirar e descrição visível. Não se sobrepõe silenciosamente ao estaleiro nem cria progressão infinita. Efeitos realmente persistentes exigem campo de save e migração; efeitos temporários atuais de cena não devem ser apresentados como permanentes.

## 7. Ficha obrigatória de um contrato (uma unidade por iteração)

**Identidade e ficção:** `templateId`, título, premissa, contratante, beneficiários reais, lesados, facções envolvidas, região e tema.  
**Acesso e geração:** estágio mínimo/máximo, pesos, requisitos, regiões elegíveis, tabelas aleatórias, restrições de repetição.  
**Vínculo com missão:** número/título da missão principal ativa, eventos e inimigos coerentes com esse momento da campanha.  
**Operação:** objetivo primário, etapas, locais físicos, inimigos, condições de vitória, falha e retirada, temporizadores e gatilhos.  
**Dificuldade:** quais dois ou mais eixos de pressão, fórmulas e limites, estratégias possíveis.  
**Escolhas:** opções identificadas, momento, mudança mecânica real e consequência de cada rota.  
**Economia:** fórmula de prêmio base, multiplicadores, bônus e penalidades.  
**Efeitos:** IDs, durações, compatibilidade, facção, feedback e persistência.  
**Implementação:** recursos existentes reutilizados, dependências novas, estado persistente, relatório.  
**Teste de aprovação:** caso inicial, intermediário e tardio; compatibilidade de save; exploit; acessibilidade; vitória possível.

### Esquema de instância sugerido

```json
{
  "instanceId": "CT-000001-N0002-ABC123",
  "templateId": "CT-001",
  "generationVersion": 1,
  "generationSeed": "ABC123",
  "generatedAfterMission": 1,
  "activeMainMission": 2,
  "activeMainMissionTitle": "Carga nas Águas Rubras",
  "status": "offered",
  "riskTier": 2,
  "faction": null,
  "locationIds": [],
  "enemyProfile": {},
  "timers": {},
  "baseBounty": null,
  "choices": [],
  "effects": [],
  "rewardSettled": false
}
```

`null` significa **não calibrado**, não quantidade zero. O identificador de instância não deve ser inferido somente do título; repetir o mesmo template em gerações futuras precisa produzir uma instância nova.

## 8. Primeira proposta para o catálogo — CT-001: O Dízimo dos Afogados

**Estado:** proposta narrativa e mecânica **não implementada**. **Referência de estreia:** quadro produzido ao vencer **Missão 1 — O Ouro de Portomonte**, com **Missão 2 — Carga nas Águas Rubras** ativa.

**Premissa:** navios arrecadam um “dízimo” em riqueza e em pessoas nas rotas da Costa Sul. Um comboio da Corte leva prisioneiros e tributos sob lacres aristocráticos, enquanto informantes do Culto afirmam que parte dessa carga será oferecida às águas. O capitão recebe coordenadas para interceptar o carregamento; a identidade e os interesses do informante variam por geração.

**Núcleo jogável:** encontrar pista/manifesto num naufrágio ou ruína → localizar comboio em deslocamento → vencer escolta superior à da missão principal ou imobilizar o navio-alvo → chegar ao porão/convés e decidir o destino da carga → levar sobreviventes/documentos/tributos ao porto exigido pela rota.

**Pressões:** combate contra escolta e navio prioritário + janela de interceptação + deslocamento até entrega (quando aplicável). Falhar na interceptação ou perder o navio configura derrota contratual; retirar-se é permitido, sem prêmio integral. A configuração exata dos inimigos e o tempo dependem do estágio e do mapa validado.

**Escolha A — Abrir os porões:** libertar prisioneiros e escoltá-los a um abrigo ligado a Deméter. Maior risco de perseguição, pagamento menor; confiança dos Sobreviventes e um efeito temporário de reparo/acolhimento na próxima expedição.

**Escolha B — Tomar o cofre:** priorizar os tributos, abandonar a travessia de resgate e enfrentar uma contraemboscada pelo saque. Maior ouro (+25% como hipótese), sem benefício comunitário; os Sobreviventes podem perder confiança se o abandono for descoberto.

**Escolha C — Vender o manifesto:** preservar provas do esquema e negociar com quem puder comprá-las. Pagamento intermediário e acesso temporário a salvo-conduto/informações, mas aumento de confiança da Corte e risco de hostilidade entre sobreviventes e agentes do Culto. Não deve conceder favor da Corte a quem a traiu descaradamente.

**Variações por estágio:** quantidade e composição de navios, urgência da interceptação, condição marítima, localização validada, presença de inspetor, carga, informação disponível, prêmio e persistência dos efeitos. A escolha do jogador não pode ser sorteada por ele: as **oportunidades de escolha** são autorais; o jogador escolhe a consequência.

**Critérios para entrar no jogo:** confirmar disponibilidade dos recursos atuais de comboio, escolta, timers, entrega, interações de ilha, condições de facção; depois ajustar parâmetros reais em cenários de missão ativa 2, 10 e 25. Não anunciar valores como definitivos antes dos testes.

## 9. Integração técnica sugerida (não executada)

O repositório já possui `SeaContracts.js` com três dossiês estáticos, `PortUI.js` com quatro cards fixos (três dossiês + uma comissão de bandeira), `SeaFactionPolitics.js` com comissões de facção, `Game.js` com `SeaProfile.mission` e `SeaProfile.settle`, e save local **v4**. Hoje contratos só iniciam em **sandbox**, seu estado é de cena e o quadro não é salvo. Portanto a nova constituição **exige desenvolvimento**, e não apenas editar descrições de ofertas.

Fases de implementação recomendadas:

1. Criar catálogo declarativo e seletor puro `SeaContractBoard.generate(profile, missionAdvancedEvent)` com seed e filtros.
2. Adicionar estado de ofertas, consumos e efeitos à versão de save por **migração aditiva**; usar evento único de vitória que avançou a missão e gravar o quadro na mesma transação lógica.
3. Tornar `PortUI.contracts()` dinâmico e preservar comissão da bandeira como modalidade especial, sem confundi-la com nova oferta sorteada; resolver requisito de 3–6 de maneira explícita.
4. Adaptar o executor em `SeaContracts.js` para template/instância, mantendo os três contratos legados operacionais.
5. Unificar relatório, efeitos, concessão de prêmio e encerramento idempotente; garantir que voltar ao porto não reabra contrato consumido.
6. Testar várias sementes, estágios (2, 10, 25, 26+), saves migrados, falta de ilhas elegíveis, derrota/retirada, facções e economia.

## 10. Critério de aprovação de cada novo contrato

O contrato é aprovado para o catálogo apenas se:

- o estágio ativo altera pelo menos duas variáveis de gameplay de forma perceptível;
- apresenta 1+ escolha com efeito mecânico real;
- tem regra de sucesso, derrota e retirada;
- todos os destinos existem e são navegáveis;
- oferece risco comparavelmente maior que a missão principal correspondente;
- paga significativamente melhor que a missão principal no sucesso, sem repetição explorável;
- exibe e registra seus efeitos com duração e custo;
- convive com a lógica política existente e não quebra save v4;
- foi validado manualmente e por testes de regressão.

---

**Próxima unidade de trabalho:** finalizar **CT-001 — O Dízimo dos Afogados** (combate, rotas, números, escolhas e efeitos), validar em 3 estágios, e só então iniciar CT-002. A constituição é o contrato de design; cada CT é um módulo de conteúdo próprio.