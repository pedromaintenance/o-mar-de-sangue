# Registro de QA — Pixel Art Edition

- [x] Phaser 4.1 iniciou, menu renderizou; sem erros JS.
- [x] Estaleiro exibido; compra de casco e canhões; custo da próxima melhoria maior.
- [x] Modo Missões iniciou; 7 inimigos, 51 ilhas, 45 tesouros.
- [x] Canhões dos dois lados: vetores X opostos em teste.
- [x] Oito classes de inimigos instanciadas e as texturas encontradas.
- [x] Sandbox iniciou; onda 1 e chefão instanciado.
- [x] Quadros dos efeitos de canhão e impacto carregados no Phaser.
- [x] Manifesto e precache verificados estaticamente.
- [ ] Instalação PWA real e ensaio em celular (não disponível no ambiente de teste).

O navegador embutido de QA bloqueia navegação para localhost e `file://`; foi usado `set_content` com Phaser e imagens incorporados como data URIs, preservando o código real e verificando os estados internos. Isso valida renderização/controle em runtime, **não** substitui teste HTTPS + Service Worker e instalação Android.
