# O Mar de Sangue — Trilha sonora (v1.8)

## Músicas
- **Beneath The Crimson Tide** (`Beneath_The_Crimson_Tide.mp3`) — porto, navegação tranquila e exploração.
- **Beneath the Black Tide** (`Beneath_the_Black_Tide.mp3`) — tempestades, redemoinhos, chefes e corrupção elevada.

Ambas têm cerca de três minutos e são reproduzidas em loop, com *crossfade* para evitar cortes bruscos.

## Usando as músicas agora
1. Abra a PWA, entre no **Porto**.
2. Clique em **♫ IMPORTAR TRILHAS** e escolha os dois arquivos MP3 originais.
3. Confira **2/2 TRILHAS** no menu.
4. Use **− / +** para ajustar o volume. O botão de som original (ou a tecla **M**) controla a música e os efeitos sonoros.
5. Entre em uma missão ou no sandbox. As trilhas são alternadas conforme o estado do oceano.

Os áudios são guardados no IndexedDB local do navegador e funcionam offline. Cada navegador/dispositivo tem armazenamento próprio; limpar os dados do site apaga as músicas importadas e os saves locais.

## Para distribuir as músicas automaticamente a todos os jogadores
Coloque os arquivos originais, com estes nomes **exatos**, nos caminhos:

```text
assets/audio/Beneath_The_Crimson_Tide.mp3
assets/audio/Beneath_the_Black_Tide.mp3
```

A versão 1.8 detecta automaticamente esses arquivos quando online, armazena-os no IndexedDB e os reproduz também offline. O código funciona mesmo sem esses caminhos: o botão de importar arquivos locais permanece disponível.

**Importante:** confirme as licenças/direitos antes de publicar os MP3s em um repositório público.

## Notas técnicas
- Música usa HTMLAudioElement, com transição gradual de volume e preferência salva.
- Os efeitos de combate continuam no módulo `SeaEffects.js`.
- Chaves do save de campanha não foram alteradas.
- Código da trilha e do clima: `SeaWeather.js`.
