# O Mar de Sangue — Trilha sonora FLAC (v1.8.1)

## Reprodução automática para qualquer jogador

As versões aprimoradas e sem perdas são públicas, na branch `main`:

- **Beneath The Crimson Tide** — `assets/audio/Beneath The Crimson Tide.flac` — exploração, porto e águas calmas.
- **Beneath The Black Tide** — `assets/audio/Beneath The Black Tide.flac` — tempestades, redemoinhos, chefes e maldição elevada.

O jogo usa esses **nomes exatos**, incluindo espaços e letras maiúsculas. Não são necessários MP3s nem importação manual. Depois de abrir o jogo, os FLACs são obtidos automaticamente do GitHub Pages e armazenados no IndexedDB para uso offline. Por política dos navegadores, a reprodução com som só começa após a primeira interação do jogador (toque, clique ou tecla).

No porto, **♫ TROCAR TRILHAS** permanece como opção avançada para substituir manualmente os arquivos ou importar MP3 caso o navegador não suporte FLAC. O volume é controlado por **−/+**, e o botão de som ou a tecla **M** silencia/reabilita os efeitos e a música.

## Atualização de versão e compatibilidade

A v1.8.1 **prioriza os FLACs hospedados** sobre MP3s importados anteriormente. As faixas FLAC ficam salvas sob chaves versionadas no IndexedDB, separadas das importações locais e dos saves de campanha.

Em navegadores sem FLAC nativo, a importação opcional de MP3 funciona como alternativa. Para cobertura universal nesse caso, publique também MP3s de fallback e ajuste o código em uma próxima versão.

O download inicial soma aproximadamente **15,3 MB**; o sistema guarda os arquivos localmente quando possível. Limpar os dados do navegador remove o áudio e os saves guardados naquele dispositivo.

## Arquivos e componentes

- `SeaWeather.js`: URL e seleção de faixas, cache local, crossfade, integração com clima.
- `SeaEffects.js`: sons gerados proceduralmente durante o combate.
- `sw.js`: cache da PWA, com versão renovada para atualizar o código do carregador de música.

**Licenciamento:** o repositório é público; mantenha apenas gravações que você possa distribuir.
