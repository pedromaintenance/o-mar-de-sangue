# Mar de Sangue 3.5a — Paisagem Sonora Reativa

**Estado:** integrada à `main` pelo PR #34 em 16/10/2026; CI smoke/Chromium verde. Testes auditivos e PWA física pendentes.

## Problema resolvido

O módulo de efeitos de áudio tinha um atalho `M` para silenciar, enquanto o Atlas 3.4 usa o mesmo `M` para abrir a Carta dos Náufragos. Como os dois registravam um listener, **abrir o mapa podia silenciar o jogo**. O som agora usa **N** no teclado, preservando o botão de áudio no jogo, no porto e no Diário do Capitão. **M** continua exclusivo da carta. Documentação de comandos atualizada.

## Dinâmica da trilha — sem arquivos novos

O motor mantém as duas trilhas existentes, **Beneath The Crimson Tide** (`crimson`) e **Beneath the Black Tide** (`black`). Os volumes são relativos ao valor que o jogador já configurou e continuam passando pelo fade gradual existente de `SEA_MUSIC.tick`.

| Contexto | Gatilho | Trilha | Intensidade relativa |
| --- | --- | --- | ---: |
| Porto | Menu/estaleiro | Crimson | 55% |
| Navegação | Viagem em mar tranquilo, maldição baixa | Crimson | 100% |
| Ilha | Encontro costeiro comum | Crimson | 62% |
| Negociação | Modal Três Bandeiras na Maré | Black | 72% |
| Perigo | Tempestade, redemoinho ou maldição ≥65% | Black | 90% |
| Chefe | Missão com chefe / alerta de chefe | Black | 100% |

**Prioridade:** encontro político ou ilha prevalece temporariamente sobre tempestade e chefe enquanto o jogador toma uma decisão; depois a música volta ao contexto de navegação. Os apelidos `crimson`/`black` continuam aceitos por retrocompatibilidade. Não há trilha específica nova de boss, apenas uma variação de volume e contexto das duas faixas já existentes.

## Segurança e compatibilidade

- **Não altera:** `SeaProfile` v4, o método `settle()`, economia, física, IA, dano, hitboxes ou inventário.
- **Não altera:** download de FLAC hospedado, importação de MP3/FLAC, IndexedDB com chaves `manual-v2`, preferências salvas de volume e botão geral de som.
- O áudio continua sujeito às permissões/autoplay do navegador, e permanecerá mudo até haver gesto do usuário quando exigido.
- O cache do Service Worker foi versionado; os arquivos de script já estavam incluídos no precache. Os FLAC grandes continuam fora do precache para não tornar a instalação da PWA pesada.
- Falta verificar sonoridade em fones/alto-falantes reais e o comportamento da PWA offline em dispositivos físicos.

## QA

- [x] Novo teste `tests/soundscape-3-5.test.cjs`: seis estados, prioridade narrativa, proporção de volume, fade, mute, compatibilidade de importação, atalhos `M`/`N` e encerramento de listeners.
- [x] Teste de navegador do Atlas ampliado para verificar que `M` abre a carta sem alternar o áudio, e `N` silencia/restaura sem abrir carta.
- [x] CI `port-ui.yml` agora observa `SeaEffects.js`, `SeaWeather.js` e o novo teste.
- [x] Smoke e Chromium completos verdes no [PR #34](https://github.com/pedromaintenance/o-mar-de-sangue/pull/34); merge squash `20e85a0`.
- [ ] Revisão manual no GitHub Pages com música ativada: porto → navegar → tormenta → ilha → negociação → chefe.
- [ ] Xbox físico, Android real e PWA offline.

## Próximas propostas

**3.5b:** controles separados de volume para trilha e efeitos, mantendo o botão de mute mestre. **3.5c:** trilhas adicionais somente mediante arquivos autorizados e compatíveis com o tamanho da PWA. Essas etapas ainda não foram implementadas.
