# O MAR DE SANGUE — OFICINA DE CONTRATOS

Este diretório é o **registro de design** dos contratos opcionais de alto risco do jogo. **Não é o código executável** do sorteio. As alterações aqui são autorais e intencionalmente não modificam a campanha nem as três expedições legadas em funcionamento.

## Arquivos de referência

- [CONSTITUICAO.md](./CONSTITUICAO.md) — leis para gerar 3–6 ofertas depois de cada nova vitória principal, atreladas à missão que se torna ativa; risco, economia, escolhas e saves.
- [TEMPLATE_CONTRATO.md](./TEMPLATE_CONTRATO.md) — ficha editorial para desenhar **um** novo contrato por iteração.
- [TEMPLATE_CONTRATO.json](./TEMPLATE_CONTRATO.json) — formato base estruturado para programar as variáveis e efeitos quando o executor de contratos estiver pronto.
- [catalogo.json](./catalogo.json) — índice e estado editorial das entradas autorais, atualmente **desconectado do runtime**.
- [CT-001 — O Dízimo dos Afogados](./CT-001-DIZIMO-DOS-AFOGADOS.md) / [dados JSON](./CT-001.json) — primeira proposta, **rascunho inativo**.
- [CAPTURA_NAVIOS_v0.1.md](./CAPTURA_NAVIOS_v0.1.md) — laboratório opt-in de incapacitação e abordagem (`?boardingLab=1`), com testes e pendências.
- [CT-001-CICLO-3.md](./CT-001-CICLO-3.md) — primeiro ciclo **jogável em laboratório**, com interceptação, abordagem, três decisões, pagamentos simulados e QA.

## Estado do jogo atual

As três expedições existentes estão implementadas em **SeaContracts.js**: Resgate dos Afogados, Pólvora sem Bandeira e A Caçada dos Condenados. **SeaFactionPolitics.js** oferece comissões específicas vinculadas à bandeira. **PortUI.js** ainda apresenta cartões fixos e **Game.js** trata contratos como expedições independentes do modo sandbox.

O save atual é **v4** e não possui o novo quadro persistente de ofertas. Nenhum arquivo deste diretório ativa sorteio, concede ouro ou altera a lógica de facções.

**Ciclo 2:** um motor de abordagens foi adicionado a `SeaBoarding.js`, carregado antes de `Game.js`, com integração em `Game.js` e `SeaIslands.js`. Só inimigos explicitamente marcados com `capturable:true` são afetados; um alvo-teste pode ser gerado em sandbox com `?boardingLab=1`. O contrato CT-001 continua inativo.

**Ciclo 3:** `SeaContractCT001.js` implementa um primeiro percurso jogável **somente** com `?contractLab=ct001` e modo Sandbox. Apreende o comboio, abre a decisão no convés e conclui uma das três rotas. A recompensa e as alterações políticas são simuladas e **não são gravadas no save**. O contrato ainda não aparece como oferta; o quadro 3–6 ofertas permanece por construir.

## Processo unitário

1. Duplicar TEMPLATE_CONTRATO.md e TEMPLATE_CONTRATO.json para um novo CT-XXX.
2. Fixar identidade, conflito social, facções, loop jogável e condições de vitória, derrota e retirada.
3. Definir todas as variáveis dependentes da **missão principal ativa** e os elementos sorteáveis por semente.
4. Projetar escolhas que transformem objetivos, pressão e consequências, com duração explícita para cada efeito especial.
5. Calibrar referência monetária real da missão principal, aplicar multiplicador de risco e impedir prêmio duplicado.
6. Verificar a exequibilidade com mapa, classes de inimigo, habilidades, salvamento e controles existentes.
7. Revisar em estágios 2, 10, 25 (ou estágios compatíveis) e aprovar individualmente.
8. **Somente depois** promover de rascunho para aprovado, implementar no executor e marcar enabled=true. Criar CT-002 apenas após revisão do CT-001.

## Primeiro pacote: CT-001

O Dízimo dos Afogados apresenta um comboio com tributos e prisioneiros. O capitão intercepta a embarcação e escolhe entre:

- **Abrir os porões:** enfrentar perseguição, entregar prisioneiros a Deméter e receber menos ouro com favor temporário.
- **Tomar o cofre:** lucro maior e contraemboscada, com possibilidade de perseguição na próxima viagem.
- **Vender o manifesto:** entregar provas por dinheiro e influência, assumindo o custo da cumplicidade.

**Pendência central:** decidir como o jogador **imobiliza/aborda** o transporte sem afundá-lo. Essa mecânica é inédita e precisa ser desenhada antes de qualquer implementação.

## Critério de não regressão

A constituição exige que contratos antigos continuem jogáveis, saves sejam migrados sem apagar progresso e a progressão principal não dependa de aceitar contratos. A futura geração de 3–6 ofertas requer catálogo suficiente; o sistema não pode duplicar ofertas para esconder a falta de templates.
