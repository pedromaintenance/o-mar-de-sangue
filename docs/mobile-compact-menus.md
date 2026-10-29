# Layout compacto mobile — O Mar de Sangue

**Escopo:** somente menus HTML do Porto; nenhum sprite, HUD Phaser, física de navio ou estatística de save foi alterada.

Um novo `PortMobileCompact.css`, carregado **depois** de `PortUI.css` e `PortThemeAbyss.css`, corrige a cascata do tema principal que reintroduzia fontes e cartões grandes em telas menores.

Em celulares retrato/paisagem, compacta o banner do menu inicial, ações, informações da frota, Estaleiro, Diário de Bordo, Contratos, Conselho das Três Bandeiras, avisos, restauração/backup, resultados, cronologia e controles de áudio. Em especial os previews do Conselho saem de 170–190px para 104px, e o banner cai para 100–154px conforme orientação. Os botões importantes preservam **pelo menos 44px de altura clicável**.

O modo opcional `AMPLIAR TEXTO` continua disponível, com tipografia proporcional que não destrói a composição móvel. A regra também cobre celulares em paisagem até 1024px com ponteiro de toque, não apenas `max-width:780px`. `text-size-adjust:100%` limita a ampliação automática de fonte em WebKit sem desabilitar zoom do usuário.

A versão desktop permanece com as medidas anteriores. Teste Playwright separado valida 390×844, 844×390 (touch) e 1280×720, seis páginas de menu, scroll horizontal, tamanho das fontes e área clicável; as imagens são anexadas ao CI. O jogo permanece em pré-alfa e testes físicos em Android/iPhone são recomendados.
