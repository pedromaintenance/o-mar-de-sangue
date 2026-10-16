# O Mar de Sangue 3.6a — Atualização segura e navegação offline

**Situação:** implementação na branch, CI pendente. Sem mudança de saves.

## Problema observado
O jogo já oferecia instalação PWA e precache de scripts, sprites e UI, porém a interface não explicava quando a conexão caía nem quando um novo service worker estava pronto. Como o worker atual usa `skipWaiting()` e `clients.claim()`, a atualização da camada de cache pode acontecer enquanto o jogador está navegando; **não é seguro reiniciar a página automaticamente em plena expedição**.

## Entrega
- **Aviso discreto offline:** `SEM CONEXÃO · MODO OFFLINE` aparece quando o navegador indica `navigator.onLine=false`. Desaparece ao reconectar. Isso **não garante** que todos os recursos estejam em cache; o teste automatizado verifica a operação real.
- **Atualização voluntária:** quando uma página já controlada recebe um novo service worker, aparece `ATUALIZAÇÃO DISPONÍVEL · RECARREGAR`. O jogo só recarrega **por clique/tap consciente**, não no evento `controllerchange`. A primeira instalação não é confundida com uma atualização.
- **Instalação original mantida:** o botão de instalar continua ligado a `beforeinstallprompt`, e desaparece após `appinstalled`. Plataformas que não expõem `beforeinstallprompt` dependem das opções do próprio navegador.
- **Checagem de versão ao retomar o foco:** `registration.update()` é chamado ao registrar/voltar à aba; sem polling constante nem timers.
- O shell é HTML/CSS independente do canvas Phaser, com `role=status`, `aria-live=polite`, botões com foco de teclado e largura responsiva; só aparece quando necessário.
- O novo `PwaStatus.js` entra na lista de precache. O cache é versionado para **v40**, enquanto áudio FLAC grande continua fora do precache, como nas versões anteriores.

## Proteções
- **Não altera** `SeaProfile` v4, moedas, upgrades, vitórias, missões, `politicalLedger`, eventos, controles, navegação ou efeitos.
- **Não apaga** `localStorage` nem `IndexedDB`; a política de limpeza de caches antigos do worker continua limitada aos nomes `omar-mar-de-sangue*`.
- **Nenhum refresh automático** em cena de combate ou em qualquer outro estado. O jogador decide quando perder a situação transitória da expedição ao atualizar.
- `navigator.onLine` reflete a condição reportada pelo navegador, não um teste contínuo do servidor remoto. Conexão ruim ainda pode aparentar online.
- Atualização de worker não promete que uma aba aberta em versão antiga já mostre o novo botão. Uma primeira recarga pode ser necessária para receber o próprio mecanismo de atualização.

## Testes
- [x] `tests/pwa-status-3-6.test.cjs`: eventos online/offline, primeira instalação vs. atualização, botão de recarga opt-in, fluxo de instalação e ausência de acesso ao save.
- [x] `tests/pwa-offline-visual.test.cjs`: instala SW em loopback seguro; espera controle, verifica precache v40, escreve um save v4 de teste, interrompe rede, recarrega offline, abre o porto e inicia a viagem, confere save intacto, reconecta, simula notificação de atualização e comprova que a viagem não reinicia.
- [x] Workflow passa a executar ambos os testes, com Chrome desktop 1280×720 e Android emulado 390×844 na checagem offline.
- [ ] CI Node/Chromium verde e merge na `main`.
- [ ] Teste manual no GitHub Pages em PWA instalada, Android real e Xbox.

## Como testar no Pages
Abra o jogo online e aguarde o carregamento. No Chrome DevTools, aba **Network**, selecione **Offline** e recarregue: o Porto deverá abrir e apresentar `SEM CONEXÃO`. Inicie uma partida para testar sprites e ações. Volte a Online: a faixa deve desaparecer. Em publicação posterior à versão que está aberta, a nova atualização poderá exibir um botão para recarregar quando você achar apropriado.

**Observação:** conteúdos importados via IndexedDB (músicas próprias) continuam fora do cache padrão de imagens e scripts; o jogo pode ser jogável offline sem conseguir buscar pela rede faixas FLAC ainda não importadas.

## Horizonte
Depois da 3.6a, validar instalação física/reconexão e ampliar a 3.6b com diagnóstico e recuperação de caches incompletos. A migração de reputação 3.3b depende de regras e testes específicos e não faz parte desta entrega.
