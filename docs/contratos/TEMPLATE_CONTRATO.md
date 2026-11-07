# TEMPLATE DE AUTORIA — CONTRATO CT-XXX

> **Uso:** duplicar este arquivo para CT-002, CT-003 etc. O template é um **documento de design**, não uma oferta pronta no jogo. Editar uma unidade por vez e só promover para o catálogo depois de testes.
>
> **Cânone:** [Constituição](./CONSTITUICAO.md). **Dados estruturados:** [TEMPLATE_CONTRATO.json](./TEMPLATE_CONTRATO.json).

## 0. Controle editorial

| Campo | Valor |
|---|---|
| Identificador imutável | CT-XXX |
| Título / subtítulo | PENDENTE |
| Estado | rascunho / revisão / aprovado / implementado / habilitado |
| Versão autoral / data | 0.1 / AAAA-MM-DD |
| Tipo principal | caça / escolta / resgate / contrabando / investigação / sabotagem / recuperação / sobrenatural |
| Objetivo dramático | PENDENTE |
| Estágio mínimo da missão principal ativa | PENDENTE |
| Dependências técnicas novas | PENDENTE |

## 1. Ficção e conflito material

**O que o jogador sabe ao receber a oferta:** [texto curto de dossiê, sem spoilers].

- **Contratante público:** [nome / facção / motivo].
- **Contratante real, se distinto:** [segredo ou nenhum].
- **Quem trabalha e corre risco:** [tripulantes, civis, perseguidores etc.].
- **Quem recebe os benefícios:** [beneficiários].
- **Quem paga o custo:** [lesados, comunidades, rivais].
- **Papel de Sobreviventes / Corte Feérica / Culto de Dagon:** [impactos, sem presumir juramento].
- **Conexão com a missão principal ativa:** [como o evento faz sentido agora].

## 2. Requisitos e elegibilidade para sorteio

- **Estágio mínimo / máximo:** [números ou sem máximo].
- **Peso de seleção:** [valor, sujeito a balanceamento].
- **Regiões e locais possíveis:** [tipos reais de ilha / destinos, nunca coordenadas arbitrárias].
- **Bloqueios:** [juramento, reputação, missão, acessibilidade, falta de local].
- **Garantias:** [ao menos um caminho executável com o navio e os recursos disponíveis].
- **Repetição:** [pode reaparecer apenas em outro quadro; nunca duplicar no mesmo quadro].
- **Semente:** [quais variáveis o sorteio congela na oferta].

## 3. Máquina de estados do contrato

| Fase | Onde | Ação do jogador | Transição | Falha |
|---|---|---|---|---|
| 0 — Oferta | Porto | Aceitar/ignorar | Preparação | Não se aplica |
| 1 — Pista | Local existente | Investigar / perseguir | Fase 2 | PENDENTE |
| 2 — Confronto | Mar navegável | Interceptar / proteger | Fase 3 | PENDENTE |
| 3 — Escolha | Alvo/local | Escolher rota A/B/C | Fase 4 | PENDENTE |
| 4 — Resolução | Porto/abrigo/outro | Cumprir resultado | Concluído | PENDENTE |

**Vitória:** [condição inequívoca]. **Derrota:** [condição inequívoca]. **Retirada:** [efeitos e retenção].  
**Objetivos alternativos:** [quais são mutuamente exclusivos].  
**Se o jogador afundar o objeto que deveria proteger:** [consequência].  
**Relatório final:** [fatos registrados sem pressupor sucesso].

## 4. Variáveis aleatórias e de escala

Separar os três níveis de dados:

1. **Autoria imutável do template:** história central, tipos de decisão, condições de vitória/falha.
2. **Instância sorteada para o quadro:** semente, região alcançável, alvo, composição, clima, temporizador, recompensa exibida, instância única.
3. **Resultado da execução:** rota escolhida, inimigos vencidos, danos, consequência, pagamento liquidado.

| Variável | Base autoral | Faixa / fórmula por missão ativa | Validação |
|---|---|---|---|
| Quantidade de inimigos | PENDENTE | PENDENTE | Não impedir vitória matemática |
| Tipos de inimigos | PENDENTE | PENDENTE | Tipos disponíveis em Game.js |
| HP/dano/velocidade | PENDENTE | PENDENTE | Comparar à missão contemporânea |
| Tempo de interceptação | PENDENTE | PENDENTE | Distância real / velocidade navegável |
| Condição meteorológica | PENDENTE | PENDENTE | Compatível com SeaWeather |
| Distância e rota | PENDENTE | PENDENTE | Ilhas físicas + mapa + atlas |
| Grau de suspeita/alarme | PENDENTE | PENDENTE | Indicador compreensível |
| Recompensa contratual | PENDENTE | Referência principal × fator de risco de 4 a 8 | Auditar economia líquida |
| Modificador de cada escolha | PENDENTE | PENDENTE | Mostrar custo/risco antes da decisão |
| Evento extraordinário | PENDENTE | PENDENTE | Não surpreender sem prenúncio |

**Eixos de pressão obrigatórios:** [pelo menos dois, além de inflar PV].  
**Estágios de teste:** missão ativa 2, missão ativa 10, missão ativa 25 e pós-25 quando elegível.

## 5. Decisões jogáveis

### Rota A — [título]
- Gatilho e interface:
- Requisito de escolha:
- O que muda *imediatamente* no gameplay:
- Condição de vitória exclusiva:
- Ouro e custo:
- Reputação / maldição / outros recursos:
- Efeito especial, duração e expiração:
- Informação antecipada ao jogador:

### Rota B — [título]
- Gatilho e interface:
- Requisito de escolha:
- O que muda *imediatamente* no gameplay:
- Condição de vitória exclusiva:
- Ouro e custo:
- Reputação / maldição / outros recursos:
- Efeito especial, duração e expiração:
- Informação antecipada ao jogador:

### Rota C — [título, opcional]
- Gatilho e interface:
- Requisito de escolha:
- O que muda *imediatamente* no gameplay:
- Condição de vitória exclusiva:
- Ouro e custo:
- Reputação / maldição / outros recursos:
- Efeito especial, duração e expiração:
- Informação antecipada ao jogador:

## 6. Efeitos especiais e persistência

Para cada efeito: **ID estável, trigger, alvo, magnitude, duração, condição de consumo, acúmulo, expiração e localização no save**. Sem efeitos invisíveis permanentes. Distinguir promessa narrativa de regra já programada.

| ID | Origem | Efeito | Duração / pilha | Aplicação / persistência |
|---|---|---|---|---|
| fx-ctxxx-a | Rota A | PENDENTE | PENDENTE | PENDENTE |

## 7. Economia e proteção contra exploits

- **Referência da missão principal contemporânea:** [fórmula / amostragem; incluir loot típico, não apenas comissão].
- **Fator de risco do contrato:** [entre 4 e 8, calibrável].
- **Valor base anunciado / bônus máximo / desconto máximo:** [hipóteses].
- **Falha / retirada / destruição de objetivo:** [regras].
- **Idempotência:** guardar ID da instância, status final e marca de recompensa já liquidada.
- **Cofre e multiplicadores existentes:** pagar pela rotina SeaProfile.settle uma vez, sem crédito adicional paralelo.
- **Compras após receber oferta:** parâmetros congelados; melhorias ajudam o jogador, mas não geram reroll.

## 8. Integração com sistemas existentes

| Sistema | Reutilização | Alteração necessária |
|---|---|---|
| SeaContracts.js | Fases, alvos, opções de ilha | PENDENTE |
| Game.js | Inimigos, combate, missão ativa, liquidação | PENDENTE |
| PortUI.js | Dossiês / menu de contratos | Quadro dinâmico |
| SeaFactionPolitics.js | Comissões e bônus de bandeira | PENDENTE |
| SeaFactions.js | Confiança / juramento / provas | PENDENTE |
| SeaAtlas.js / SeaIslands.js | Destinos físicos / rotas | PENDENTE |
| SeaProfile / save v4 | Progressão e dinheiro | Migração aditiva quando necessário |

## 9. Testes de aceite

- [ ] Vencedor e perdedor alcançáveis em todos os estágios elegíveis.
- [ ] Duas dimensões de desafio acima da missão contemporânea.
- [ ] Escolhas alteram gameplay de fato, não somente texto.
- [ ] Sorteio por seed é reproduzível e não duplica template no quadro.
- [ ] Objetivos aparecem em locais existentes e navegáveis.
- [ ] Recompensa é superior à missão principal comparável, sem exploração infinita.
- [ ] Efeitos expiram e não acumulam sem limite.
- [ ] Derrota/retirada não pagam integralmente; prêmio é idempotente.
- [ ] Saves antigos abrem, saves novos preservam oferta e consequências.
- [ ] Mobile, desktop e gamepad permitem efetuar as decisões.
- [ ] Comissões de facção existentes permanecem válidas.

## 10. Decisão editorial

**Estado:** rascunho. **Mudanças aprovadas:** [data e razão].  
**Condições para implementar:** [pendências].  
**Próximo contrato:** só iniciar após esta ficha receber revisão individual.
