# Trilha sonora pública — O Mar de Sangue

A v1.8 já consegue obter e reproduzir estas músicas automaticamente para qualquer visitante do GitHub Pages, sem importação individual, quando os dois MP3 originais forem publicados neste diretório.

Coloque os **arquivos binários**, com estes nomes exatos, aqui:

- `Beneath_The_Crimson_Tide.mp3` (4,27 MB; navegação)
- `Beneath_the_Black_Tide.mp3` (4,34 MB; tempestades, chefes e perigo)

## Como publicar de uma só vez
1. Abra esta pasta `assets/audio/` na branch `main` do GitHub.
2. Escolha **Add file → Upload files**.
3. Arraste os dois arquivos MP3 para a área de upload.
4. Clique em **Commit changes**.
5. Aguarde a publicação do GitHub Pages e teste o jogo em uma janela anônima. Música começa após o primeiro toque/clique (regra dos navegadores).

O código `SeaWeather.js` usa esses caminhos, faz crossfade das faixas e as guarda para o jogo offline. Não coloque apenas um ZIP no repositório: o navegador precisa dos MP3s separados.

Se os arquivos ainda não estiverem presentes, o botão **♫ IMPORTAR TRILHAS** permanece como opção local.

**Licenças:** publique somente se você tiver autorização para distribuir as gravações.
