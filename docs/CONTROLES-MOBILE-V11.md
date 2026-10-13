# Controles para celular v1.1 — analógico e multitoque

## Alterações implementadas

- Console pixel art novo, com centros das zonas de toque desenhados nas mesmas coordenadas usadas pelo código: analógico em (106, 702), bombordo (342, 702), estibordo (432, 702), na resolução virtual 480×800.
- Analógico cinza móvel: inclinação vertical controla aceleração/ré, horizontal controla rotação; a magnitude do deslocamento modula a resposta; zona morta de 12%.
- Duas baterias separadas à direita, cada qual com disparo imediato e repetição enquanto pressionada, limitada pela recarga dos canhões.
- Suporte a pelo menos dois dedos simultâneos; terceiro dedo pode manter bombordo e estibordo acionados juntos.
- Eventos Touch API do navegador rastreados por `Touch.identifier`, não por um único ponteiro da cena Phaser. O `touchend` libera apenas o dedo removido. `touchcancel`, `blur`, fechamento do diário de bordo e desligamento da cena limpam os controles.
- `touch-action:none` e `overscroll-behavior:none` no canvas e continentes próximos impedem que zoom/scroll do navegador interrompam os gestos.
- Teclado do PC preservado: WASD/setas, Q/E e Espaço.
- Cache PWA versionado para rebaixar a nova arte do console em instalações antigas.

## Teste automatizado real do navegador (Chromium em modo touch)

Procedimento com o protocolo `Input.dispatchTouchEvent` e dois dedos independentes (tela 390×844; jogo interno 480×800):

1. Dedo 11 inicia no centro do analógico e arrasta para cima e direita: velocidade e rotação aumentam; manípulo acompanha o dedo — **passou**.
2. Dedo 22 toca o canhão estibordo mantendo 11 no analógico: projéteis gerados e o analógico continua ativo — **passou**.
3. Dedo 22 é solto: o disparo para; o dedo 11 mantém o navio em movimento sem recaptura — **passou**.
4. Dedo 11 inverte seu deslocamento: eixo de rotação muda de sinal — **passou**.
5. Dedo 11 é solto: analógico retorna ao centro e os eixos zeram — **passou**.
6. Dedo 11 no analógico, 22 em bombordo e 33 em estibordo: ambos botões ativos ao mesmo tempo — **passou**.
7. Página sem erros de JS e sem imagens ausentes no preload — **passou**.

Capturas: `docs/test_joystick_mobile.png`, `docs/test_dual_touch.png` (prova visual de teste com dispositivo emulado, **não foto de telefone físico**).

## Limitações e próximos testes de aceitação

O comportamento foi testado via toque real do navegador emulação/CDP, mas não em um telefone Android físico. Após atualizar o PWA instalado, fechar e reabrir para ativar o novo Service Worker. Verificar a transição de viagens longas se houver travamentos, pois os testes completos de várias cenas em Chromium headless apresentaram sobrecarga anteriormente.
