# V115 — Contratos da Costa Sul: economia, lealdade e consequências

## Diagnóstico
A página anterior era uma única caixa textual. Resgate tinha apenas recolher/entregar, Caçada só iniciava uma perseguição, e Contrabando só tinha sigilo ou suborno ao destino. As mesmas viagens eram jogáveis, mas não exigiam decisões interessantes.

## Entrega
### Porto
- Dossiês separados e responsivos, com identidade para Resgate, Contrabando, Caçada e Comissão da Bandeira.
- Cada cartão expõe o risco, a remuneração, quem ganha com o serviço e o dilema que o capitão encontrará.
- Duas colunas no desktop, uma no celular (320px, 390px); sem overflow horizontal.
- Dossiês são briefing sem spoilers de localização. A Carta revela apenas o objetivo autorizado.

### Resgate
- **Evacuação prioritária:** fluxo original, 125 ouro; embarca os feridos prioritários e leva-os a Deméter.
- **Todos a bordo:** +80 ouro, mas exige criar **um corsário hostil** de perseguição antes de registrar a escolha. Se o jogo não conseguir criar o inimigo, a escolha falha com explicação e não gera bônus gratuito.
- A entrega segue no santuário, e o bônus é pago uma única vez no sucesso. Uma derrota ou retirada não concede o bônus.

### Caçada
- **Perseguição imediata:** fluxo original, 105s, fragata com 125% da vida base e 240 ouro.
- **Provas e informantes:** janela de 160s, fragata com 105% da vida base, recompensa reduzida a 72% (173 ouro na oferta comum).
- A contagem começa depois de investigar o naufrágio. Nenhum progresso ou prêmio é concedido somente por encontrar o diário.

### Contrabando
- **Entrega clandestina:** 190 ouro (+12 de maldição; suspeita menor que 60%).
- **Propina:** 115 ouro, sem maldição adicional.
- **Denúncia dos compradores:** 85 ouro, +8 confiança da Corte e −5 confiança do Culto (limitadas entre 0 e 100). Comissões têm escala proporcional própria: 45% do prêmio.
- Denunciar compradores não concede o bônus de +8 de lealdade prometido por uma comissão do Culto. A apreensão a 100% de suspeita continua interrompendo a missão.

## Isolamento e compatibilidade
- Contratos continuam com estado transitório na cena. A reputação usa o campo `alignment` já existente; não há migração do save v4.
- A campanha não avança ao cumprir contratos. Mecânicas de ondas, ilhas, HUD, clima, AI comum e alinhamento das facções preservadas.
- A decisão aparece no relatório final com prêmio, permitindo que o jogador reconheça consequências.
- Contratos de bandeira continuam exclusivos da facção jurada.
- Cache PWA V115 invalida HTML/CSS/JS antigos.

## QA
- Teste Node novo cobre caminhos originais e ramificações, pagamento único, travas de ação, comissão leal vs traição, bônus, penalidade e isolamento de save.
- Browser Chromium verifica dossiês e toque em desktop, 390×844 e 320×640; o jogo efetivamente inicia o contrato da tela.
- Suites anteriores de resgate, caça, contrabando, facções e Atlas seguem como regressões.
- Playtest manual recomendado para balancear o novo perseguidor e os valores de ouro em níveis altos.

Rollback: reverter o PR sem alteração de saves.