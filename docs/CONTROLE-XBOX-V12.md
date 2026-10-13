# O Mar de Sangue — Controle Xbox / Gamepad v1.2

## Como conectar e jogar

Conecte o controle Xbox ao PC por USB ou Bluetooth, abra o jogo no Chrome ou Edge e pressione um botão do controle caso o navegador exija ativação. Não é necessário instalar driver especial quando o sistema operacional já reconhece o controle. O jogo utiliza a API Gamepad nativa e mapeamento `standard`, sem serviços externos.

### Durante a navegação

| Botão Xbox | Função |
| --- | --- |
| Analógico esquerdo | Horizontal: virar o leme; vertical: acelerar ou dar ré. Intensidade gradual e zona morta de 16%. |
| LT ou LB | Disparo contínuo por bombordo (esquerda). |
| RT ou RB | Disparo contínuo por estibordo (direita). |
| LT + RT / LB + RB | Disparar ambos os bordos. |
| Menu / Start (☰) | Abrir e fechar o Diário de Bordo (pausa). |
| B | Abrir o Diário de Bordo ou fechá-lo. |

### Nos menus

| Entrada | Função |
| --- | --- |
| Analógico esquerdo ou direcional | Escolher uma opção. |
| A | Confirmar ou comprar a melhoria selecionada. |
| B / Menu | Voltar ao menu principal (nas páginas secundárias). |

No Diário de Bordo, direcional ↑/↓ troca entre **continuar** e **retornar ao porto**; A confirma, B fecha.

## Convivência com teclado e touchscreen

- Teclado anterior preservado: setas/WASD, Q/E, Espaço e Esc.
- Touchscreen v1.1 preservado: identificadores individuais de dedo, analógico arrastável e canhões simultâneos.
- No PC, o jogo detecta controles já conectados e desconectados durante a partida. Não é necessário selecionar um modo de entrada.
- O gamepad é lido em cada atualização de cena via `navigator.getGamepads()`. Triggers e teclas de canhão respeitam a recarga existente.
- Ao não detectar controle, o jogo retorna naturalmente aos outros métodos de entrada.

## QA técnico

**Passou em Chromium automatizado com gamepad padrão emulado:** navegação de menu, seleção do modo Sandbox, analógico gradual, dois gatilhos simultâneos durante a navegação, soltura de LT mantendo RT, Menu para pausa, direcional e A para retorno ao porto; sem `pageerror` e sem arquivos ausentes.

**Regressão de touch emulado:** dois dedos simultâneos, soltura independente do canhão, retorno do analógico ao centro, três dedos e pausar/despausar; sem `pageerror` nem 404.

`Game.js` e `sw.js` passam em `node --check`. SW utiliza cache `omar-mar-de-sangue-pwa-v12-xbox-gamepad`, mantendo os mesmos recursos offline (incluindo Phaser e PNGs).

**Ainda não verificado:** uso em um controle de Xbox físico; variações de mapeamento em controles genéricos ou navegadores fora do padrão; endurance de múltiplas viagens no navegador de QA, que antes apresentou sobrecarga. O merge não deve ser descrito como certificação de hardware.
