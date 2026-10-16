# O Mar de Sangue 3.5b — Mesa de Som

**Estado:** integrado à `main` em 16/10/2026 via [PR #36](https://github.com/pedromaintenance/o-mar-de-sangue/pull/36); smoke e testes Chromium verdes. Teste auditivo em dispositivos reais e confirmação no Pages pendentes.

## Resultado jogável

O rodapé do **Porto / Estaleiro** oferece dois ajustes independentes:

| Controle | Intervalo | Passo | Inicial para jogadores existentes | Armazenamento |
| --- | --- | --- | --- | --- |
| ♫ MÚSICA | 0–80% | 5 pontos percentuais | Preferência musical que já estava configurada (25% por padrão) | `carcaca.mar.music.volume` (existente) |
| ✹ EFEITOS | 0–100% | 10 pontos percentuais | 100% do **ganho antigo** de efeitos (não significa volume físico máximo) | `carcaca.mar.sfx.volume` (nova preferência independente) |
| SILENCIAR TUDO | Ativado/desativado | Liga/desliga | Comportamento anterior | `carcaca.mar-de-sangue.audio.v1` (existente) |

Efeitos cobrem disparos, impactos, danos, naufrágios, ouro e feedback de interface sintetizados pela Web Audio API. Alterar esses efeitos **não** altera a música hospedada/importada. Ajustar a música **não** altera os efeitos. O botão geral continua atuando nos dois canais sem modificar suas porcentagens.

Os controles são botões HTML com rótulos de acessibilidade e agrupamento responsivo. Permanecem alcançáveis pelo fluxo de teclado, mouse, toque e navegação de controle do porto. O **Diário do Capitão em combate** conserva suas três opções e os respectivos hitboxes; o ajuste fino é realizado no porto.

## Preservação da experiência

- O Web Audio API já utilizava ganho principal de `0.4`: efeitos em 100% significam exatamente `0.4`, para manter o equilíbrio sonoro de jogadores antigos.
- A nova configuração de efeitos vai de 0 a 1, multiplica o ganho preexistente, é aplicada imediatamente e é carregada ao reiniciar o jogo. Valores inválidos, negativos e acima de 1 são normalizados.
- Em efeitos 0%, `SEA_AUDIO.play()` deixa de instanciar osciladores/ruído; a trilha musical pode continuar tocando normalmente.
- O volume antigo de música e seus arquivos FLAC/MP3 em IndexedDB **não são migrados nem substituídos**.
- `SeaProfile` v4, saldo, níveis, missão, recompensas, combate, clima, física e regras narrativas continuam inalterados. O armazenamento novo é **apenas uma preferência sonora isolada**, sem alteração do save do jogo.
- Sem trilhas ou imagens novas. `sw.js` versionado para atualização do código em PWA. Os arquivos de áudio continuam fora do precache pesado.

## QA

- [x] `tests/audio-mixer-3-5b.test.cjs`: compatibilidade retroativa, ganho Web Audio, zero efeitos, mute mestre, valores inválidos, persistência e reinício de contexto.
- [x] `tests/port-ui-rebuild.test.cjs`: ações independentes do porto, rótulos e preservação do estado de música quando efeitos mudam.
- [x] `tests/port-visual.test.cjs`: botões reais em 1600×900, 1280×720 e 390×844 Android emulado; controle das duas porcentagens, mute, save e recarregamento; screenshots adicionadas aos artefatos da Action.
- [x] CI Node e Chromium verdes; PR #36 integrado por squash merge `326225a`.
- [ ] Conferência pública no Pages e teste auditivo em dispositivos reais.
- [ ] Teste auditivo real no Chrome/Android, PWA offline e controle físico Xbox. Em dispositivos específicos, Web Audio/autoplay pode requerer interação inicial do usuário.

## Como testar no GitHub Pages

Abra o Porto e localize **MÚSICA** e **EFEITOS**. Reduza EFEITOS a 0%, inicie uma viagem e atire: disparos e impactos devem ficar mudos, enquanto a trilha segue tocando. Retorne ao porto; configure efeitos a 50% e música a 0% e repita. Use **SILENCIAR TUDO** e depois religue; as duas porcentagens devem continuar intactas. Recarregue a página e confirme os valores. No Android, verifique que não aparece barra horizontal.

## Próximos marcos

3.5c: trilhas adicionais por ocasião, dependentes de arquivos efetivamente autorizados. 3.6: desempenho, acessibilidade da PWA e testes em aparelhos físicos. **3.3b (reputação persistente)** continua dependente de decisão sobre as regras e da migração segura do save v4 para v5.
