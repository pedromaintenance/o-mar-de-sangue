# CT-001 — CICLO 5: PERSEGUIÇÃO NAVEGÁVEL E TELEMETRIA

**Data:** 09/11/2026  
**Versão autoral:** 0.5 — **laboratório apenas**, não elegível para o quadro de ofertas.  
**PWA:** v119 — inclui `SeaConvoyNavigation.js`.  
**Entrada:** `https://pedromaintenance.github.io/o-mar-de-sangue/?contractLab=ct001` e selecionar **Sandbox**.  
**Estado editorial:** `enabled:false`, sem ouro nem efeitos persistentes reais.

## 1. Falhas detectadas e corrigidas

**Navegação cega:** antes, o transporte fazia uma linha reta até o limite do mundo, mesmo através de rochedos. Foi introduzido [SeaConvoyNavigation.js](../../SeaConvoyNavigation.js), que planeja uma rota contornando colisores circulares. O método usa A* em grade de aproximadamente 220 unidades, margens de segurança e suavização de segmentos por visada. É executado apenas na criação do comboio, não a cada quadro. Se nenhuma rota segura for calculada, o lançamento é abortado sem perder a opção de tentar novamente.

**Encalhe dinâmico:** a rota geométrica não era suficiente, porque um navio com inércia e rumo inicial aleatório podia acelerar em direção a uma ilha durante a curva. Uma simulação física encontrou **24 de 25** comboios chegando dentro do tempo. A correção reduz a propulsão e o limite de velocidade quando o rumo desejado exige guinada acentuada. Depois dela, o mesmo ensaio chegou a **25 de 25** percursos concluídos dentro da janela.

**Pouca orientação:** durante perseguição ou abordagem, a Carta agora mostra o transporte identificado, sua posição corrente e a contagem regressiva; o radar oferece orientação em direção ao alvo. Nenhuma ilha não descoberta é revelada. A interface de objetivo também informa a distância até o transporte.

**Abordagem sem prazo:** após perder 76% do casco, o comboio deixa de fugir e passa a admitir abordagem por uma janela própria: **55 segundos menos 0,6 segundo por estágio**, limitada a pelo menos **38 segundos**. Se o capitão não abordar antes do fim, a escolta recupera o transporte e o contrato fracassa. O timer de fuga continua valendo somente enquanto o alvo navega.

**Rótulo substituído:** o sistema de contrabateria não deve sobrescrever a etiqueta de navio avariado; o código agora protege esse estado.

**Revisita ao santuário:** a rotina comum de atracação **já permitia** revisitar o local de entrega quando a fase é `deliver`. Confirmamos a condição e adicionamos teste, sem manter uma exceção específica redundante.

## 2. Janela de interceptação baseada na situação concreta

A duração do comboio não é mais um número arbitrário: o cálculo usa a extensão da rota, a velocidade da embarcação, os PV necessários para incapacitá-la, o dano e a cadência do jogador, e o estágio da campanha. A estimativa admite perdas de tiro e posicionamento; a janela fica entre 95 e 320 segundos.

```
tempo ≈ distância da rota / velocidade estimada
      + max(40 s, disparos necessários × carga × 1,7 + 22 s)
      + pressão de estágio (máx. 22 s)

janela final = limitar(tempo, 95 s, 320 s)
```

Isso ainda é **um modelo de balanceamento**, não uma garantia de vitória nem substituto de playtests. O inimigo mantém a escolta própria de cada faixa de dificuldade, e a habilidade do jogador interfere no resultado.

## 3. Economia — auditoria de referência

O prêmio de CT-001 ainda usa o proxy de renda principal da etapa ativa, sem telemetria de vitórias reais. Para evitar confundir comissão, saque bruto e pagamento líquido, a comparação abaixo mostra o **modelo usado** e não uma medição da campanha.

| Missão ativa | Proxy de renda líquida principal* | Prêmio base CT-001 | Libertar (80%) | Cofre (125%) | Manifesto (100%) |
|---|---:|---:|---:|---:|---:|
| 2 | 41,75 | 251 | 201 | 314 | 251 |
| 10 | 109,5 | 657 | 526 | 821 | 657 |
| 25 | 234,25 | 1.406 | 1.125 | 1.758 | 1.406 |

\* Proxy: 25% × (comissão da etapa + objetivo padrão de carga). A etapa 25 real não é necessariamente uma missão de carga, e o valor não mede tesouros, custos de combate nem o bônus do cofre. **Os 4–8× desejados ainda exigem validação por ouro líquido por minuto em partidas reais**, não apenas múltiplo da fórmula.

O pagamento segue **simulado** no laboratório e não altera o saldo do usuário.

## 4. Exportar playtests reais

A página de resultado do CT-001 oferece agora **EXPORTAR TESTE CT-001 (JSON)**. O arquivo `mar-de-sangue-ct001-teste-AAAA-MM-DD.json` registra apenas informações necessárias à avaliação:

- Missão principal ativa, comprimento da rota e número de pontos de navegação;
- Janela de interceptação, tempo até a captura e motivo de falha quando houver;
- Escolha final, sucesso/retirada, navios destruídos, abarroamentos;
- Ouro coletado, prêmio contratual e recompensa simulada.

A exportação é **local**, não envia informação a servidores e **não altera o save**. Não inclui conta, dados de dispositivo, progresso detalhado ou outras chaves arbitrárias do relatório. Este JSON permitirá comparar partidas nas missões 2, 10 e 25 para calibrar risco, duração e compensação com evidência empírica.

## 5. Testes do ciclo

| Teste | Verificações |
|---|---:|
| Abordagem genérica | 22 |
| Planejador geométrico de rotas | 155 |
| Perseguição física + prazo de abordagem | 106 |
| CT-001 — estados e três decisões | 64 |
| Integração do contrato e captura | 22 |
| Interface, Carta, Deméter e exportação | 14 |
| Persistência e backup v4 | 687 |
| **Total** | **1.070** |

Arquivos em `tests/` são executáveis com Node e estão registrados em [.github/workflows/contract-tests.yml](../../.github/workflows/contract-tests.yml). As **1.070 verificações passaram em execução de lógica simulada**. A execução remota do GitHub Actions e testes reais de interface no navegador, mobile e controle **não foram confirmados**.

## 6. QA ainda necessária antes de aprovar CT-001

- [ ] Abrir o Pages/PWA com cache v119 e realizar a perseguição no mapa completo.
- [ ] Conferir fluidez de 25+ perseguições no dispositivo, sem travamentos no cálculo A*.
- [ ] Jogar as três escolhas no PC e no mobile, incluindo abordagens em alta velocidade.
- [ ] Enviar três exportações de playtest nas missões 2, 10 e 25 com melhorias adequadas.
- [ ] Verificar derrotas e retiradas sem alterações do save v4.
- [ ] Confrontar lucro **real** das missões principais com o retorno **real por minuto** do contrato.
- [ ] Revisar se o combate é mais difícil que a missão principal em pelo menos dois eixos não cosméticos.
- [ ] Só então decidir aprovação, integrar instância aceita e liberar liquidação real.

**Próximo passo:** usar os JSONs produzidos pelo laboratório para revisar o cronômetro, os reforços e os prêmios, sem habilitar um CT-001 não testado. Depois vem o CT-002, um contrato autoral separado.
