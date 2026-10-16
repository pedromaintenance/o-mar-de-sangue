/* O MAR DE SANGUE — Porto 2.1
 * O menu é uma interface HTML responsiva INDEPENDENTE do canvas Phaser.
 * Mantém as funções canônicas de SeaProfile, SEA_UPGRADES, SEA_MUSIC e cenas.
 * Não desenha, redimensiona nem quantiza sprites existentes.
 */
const SEA_PORT_UI = {
  root:null, scene:null, lastPadAt:0, lastPadDir:'', lastYardFocus:null,
  // A ordem das abas é uma regra de navegação, não depende da posição no DOM.
  yardTabs:['casco','motor','armas','apoio'],
  text(value) {
    return String(value??'').replace(/[&<>"']/g,
      ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  },
  num(v) { return SEA_MATH.nice(Number(v)||0); },
  img(name) { return './assets/v15/'+name+'.png'; },
  button(action,title,description='',icon='✦',kind='') {
    return '<button class="port-choice '+kind+'" data-action="'+this.text(action)+'" type="button">'+
      '<span class="port-choice__icon" aria-hidden="true">'+icon+'</span>'+
      '<span class="port-choice__copy"><strong>'+this.text(title)+'</strong>'+
      (description?'<small>'+this.text(description)+'</small>':'')+'</span>'+
      '<span class="port-choice__arrow" aria-hidden="true">↗</span></button>';
  },
  mount(scene) {
    if(typeof document==='undefined')return false;
    this.unmount();
    const shell=document.getElementById('app-shell');
    if(!shell)return false;
    this.scene=scene;
    this.pendingRestore=null;this.restoreArmed=false;
    const root=document.createElement('div');
    root.id='sea-port-ui';
    root.className='port-ui';
    root.setAttribute('aria-label','Porto de O Mar de Sangue');
    shell.append(root);this.root=root;
    document.body.classList.add('port-ui-open');
    this.onClick=e=>{
      const target=e.target.closest('[data-action]');
      if(!target||!root.contains(target)||target.disabled)return;
      e.preventDefault();
      if(target.dataset.nav==='pointer'){
        // Mouse/touch may change tabs, but tabs never enter keyboard/gamepad focus.
        this.paintFocus(null);
        target.blur?.();
      }else this.focusTarget(target);
      this.action(target.dataset.action);
    };
    this.onFocusIn=e=>{
      const button=e.target?.closest?.('button[data-action]:not(:disabled)');
      if(button&&root.contains(button)){
        if(button.dataset.nav==='pointer'){
          this.paintFocus(null);
          return;
        }
        this.paintFocus(button);
      }
    };
    root.addEventListener('focusin',this.onFocusIn);
    this.onKey=e=>{
      if(!this.root||!this.scene)return;
      if(e.key==='Escape'||e.key==='Backspace'){
        if(this.scene.page!=='menu'){e.preventDefault();this.goto('menu');}
        return;
      }
      // At the port only: Q/E mirror LB/RB. A held key must not spin tabs.
      if(this.scene.page==='yard'&&!e.repeat&&!e.altKey&&!e.ctrlKey&&!e.metaKey){
        const key=e.key.toLowerCase();
        if(key==='q'||key==='e'){
          e.preventDefault();
          this.switchYardTab(key==='q'?-1:1);
          return;
        }
      }
      const directions={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};
      if(directions[e.key]){
        e.preventDefault();
        this.moveFocus(directions[e.key]);
        return;
      }
      // Atalho equivalente aos bumpers quando o usuário está no teclado.
      if(this.scene.page==='yard'&&(e.key==='PageUp'||e.key==='PageDown')){
        e.preventDefault();
        this.switchYardTab(e.key==='PageDown'?1:-1);
      }
    };
    this.onChange=async e=>{
      const input=e.target;
      if(input.id==='sea-port-backup'){
        const file=input.files?.[0];
        if(!file)return;
        try{
          if(file.size>SEA_SAVE_TRANSFER.maxSize)throw Error('Arquivo maior que 256 KB.');
          const data=SEA_SAVE_TRANSFER.parse(await file.text());
          if(!this.scene||!this.root)return;
          this.pendingRestore={...data,source:'file'};
          this.restoreArmed=false;
          this.scene.page='restore';
          this.render('restore-cancel');
        }catch(err){
          if(this.root)this.notify(err.message||'Backup inválido.');
        }
        input.value='';return;
      }
      if(input.id!=='sea-port-tracks'||!input.files?.length)return;
      try{
        const count=await SEA_MUSIC.importFiles(input.files);
        if(this.scene&&this.root)this.notify(count?'Trilhas importadas.':'Nenhuma trilha reconhecida.');
      }catch(err){this.notify('Não foi possível importar as trilhas.');}
      input.value='';
    };
    root.addEventListener('click',this.onClick);
    root.addEventListener('change',this.onChange);
    window.addEventListener('keydown',this.onKey);
    this.render();
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>this.unmount(scene));
    this.lastPadAt=0;this.lastPadDir='';
    this.lastYardFocus=null;
    this.focusByAction(scene.page==='menu'?'mission':null);
    SEA_MUSIC.load().then(()=>{
      if(this.root&&this.scene===scene){
        const status=this.root.querySelector('[data-music-status]');
        if(status)status.textContent=SEA_MUSIC.status();
      }
    }).catch(()=>{});
    return true;
  },
  unmount(scene=null) {
    if(scene&&this.scene!==scene)return;
    if(this.root){
      this.root.removeEventListener('click',this.onClick);
      this.root.removeEventListener('change',this.onChange);
      this.root.removeEventListener('focusin',this.onFocusIn);
      this.root.remove();
    }
    if(this.onKey&&typeof window!=='undefined')window.removeEventListener('keydown',this.onKey);
    if(typeof document!=='undefined')document.body.classList.remove('port-ui-open');
    this.root=null;this.scene=null;
    this.pendingRestore=null;this.restoreArmed=false;
    this.lastYardFocus=null;
  },
  goto(page,group) {
    const scene=this.scene;if(!scene)return;
    if(page!=='restore'){this.pendingRestore=null;this.restoreArmed=false;}
    scene.scene.start('SeaPort',{page,group:group||scene.yardGroup});
  },
  start(mode) {
    const scene=this.scene;if(!scene)return;
    SeaProfile.selectMode(mode);
    const profile=SeaProfile.load();
    scene.scene.start('Game',mode==='mission'?
      {mode:'mission',stage:profile.mission}:{mode:'sandbox'});
  },
  notify(message) {
    if(!this.root)return;
    const n=this.root.querySelector('.port-toast');
    if(n){n.textContent=message;n.hidden=false;}
  },
  exportBackup() {
    // A portable copy of the normalized v4 profile. Never touch game saves.
    let objectUrl=null,anchor=null;
    try {
      const now=new Date();
      const profile=SeaProfile.load();
      const backup={format:'mar-de-sangue-captain-backup',schema:4,
        exportedAt:now.toISOString(),profile};
      const blob=new Blob([JSON.stringify(backup,null,2)+'\n'],
        {type:'application/json;charset=utf-8'});
      objectUrl=URL.createObjectURL(blob);
      anchor=document.createElement('a');
      anchor.href=objectUrl;
      anchor.download='mar-de-sangue-save-v4-'+now.toISOString().slice(0,10)+'.json';
      anchor.style.display='none';
      document.body.append(anchor);
      anchor.click();
      this.notify('Cópia do progresso preparada. Guarde o arquivo JSON em local seguro.');
      return true;
    } catch(_) {
      this.notify('Não foi possível exportar o progresso neste navegador.');
      return false;
    } finally {
      anchor?.remove();
      if(objectUrl)setTimeout(()=>URL.revokeObjectURL(objectUrl),3000);
    }
  },
  action(value) {
    const scene=this.scene;if(!scene)return;
    const [name,id]=value.split(':');
    if(name==='mission'||name==='sandbox'){this.start(name);return;}
    if(name==='menu'){this.goto('menu');return;}
    if(name==='yard'){
      if(scene.page==='yard'){
        if(!this.changeYardTab(id||'armas'))
          this.focusByAction(this.lastYardFocus);
      }else this.goto('yard',id||'armas');
      return;
    }
    if(name==='help'||name==='reset'){this.goto(name);return;}
    if(name==='buy'){
      const result=SeaProfile.buy(id);
      if(result.ok){this.render('buy:'+id);this.notify('Melhoria adquirida. O estaleiro foi atualizado.');}
      else this.notify(result.error||'Não foi possível concluir a compra.');
      return;
    }
    if(name==='export-backup'){this.exportBackup();return;}
    if(name==='restore-file'){
      this.root.querySelector('#sea-port-backup')?.click();return;
    }
    if(name==='restore-rollback'){
      const snapshot=SEA_SAVE_TRANSFER.lastRollback();
      if(!snapshot){this.notify('Cópia anterior indisponível.');return;}
      this.pendingRestore=snapshot;this.restoreArmed=false;
      scene.page='restore';this.render('restore-cancel');return;
    }
    if(name==='restore-cancel'){
      this.pendingRestore=null;this.restoreArmed=false;
      this.goto('menu');return;
    }
    if(name==='restore-arm'){
      if(!this.pendingRestore||scene.page!=='restore')return;
      this.restoreArmed=true;this.render('restore-cancel');return;
    }
    if(name==='restore-confirm'){
      if(!this.pendingRestore||!this.restoreArmed||scene.page!=='restore')return;
      try{
        SEA_SAVE_TRANSFER.apply(this.pendingRestore.profile);
        this.pendingRestore=null;this.restoreArmed=false;
        scene.page='menu';this.render('mission');
        this.notify('Progresso restaurado. Save anterior guardado neste navegador.');
      }catch(err){
        this.restoreArmed=false;this.render('restore-cancel');
        this.notify(err.message||'Não foi possível restaurar o save.');
      }
      return;
    }
    if(name==='reset-confirm'){SeaProfile.reset();this.goto('menu');return;}
    if(name==='next'){
      const report=scene.report;
      const mode=report?.mode==='sandbox'?'sandbox':'mission';this.start(mode);
      return;
    }
    if(name==='mute'){SEA_AUDIO.toggle();this.render('mute');return;}
    if(name==='volume'){
      SEA_MUSIC.setVolume(SEA_MUSIC.volume+(id==='up'?.05:-.05));
      this.render('volume:'+id);return;
    }
    if(name==='fx-volume'){
      SEA_AUDIO.setEffectsVolume(SEA_AUDIO.effectsVolume+(id==='up'?.1:-.1));
      this.render('fx-volume:'+id);return;
    }
    if(name==='import'){
      this.root.querySelector('#sea-port-tracks')?.click();return;
    }
  },
  navigableButtons() {
    return Array.from(this.root?.querySelectorAll('button[data-action]:not(:disabled)')||[])
      .filter(b=>{
        // Tabs are mouse/touch targets only. LB/RB and Q/E switch tabs.
        if(b.dataset.nav==='pointer')return false;
        const r=b.getBoundingClientRect?.();
        if(!r||r.width<=1||r.height<=1)return false;
        // Avoid buttons hidden by responsive layouts or any ancestor.
        return typeof b.getClientRects!=='function'||b.getClientRects().length>0;
      });
  },
  navigationZone(button) {
    // Keep primary screen controls together; audio and header controls are
    // intentionally secondary, accessible when navigating beyond the page.
    if(button.closest?.('#port-main'))return 'main';
    if(button.closest?.('.port-footer'))return 'footer';
    if(button.closest?.('.port-top'))return 'header';
    return 'other';
  },
  paintFocus(target) {
    if(!this.root)return;
    for(const previous of this.root.querySelectorAll('.is-controller-focused'))
      previous.classList.remove('is-controller-focused');
    target?.classList.add('is-controller-focused');
    if(this.scene?.page==='yard'&&target&&this.navigationZone(target)==='main'){
      this.lastYardFocus=target.dataset.action||null;
    }
  },
  focusTarget(target) {
    if(!target||!this.root)return false;
    this.paintFocus(target);
    target.focus({preventScroll:true});
    target.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
    return true;
  },
  focusByAction(action) {
    const buttons=this.navigableButtons();
    const target=(action&&buttons.find(b=>b.dataset.action===action&&this.navigationZone(b)==='main'))||
      (action&&buttons.find(b=>b.dataset.action===action))||
      (this.scene?.page==='yard'&&buttons.find(b=>b.dataset.action?.startsWith('buy:')))||
      buttons.find(b=>b.dataset.action==='mission')||
      buttons.find(b=>this.navigationZone(b)==='main')||buttons[0];
    if(target)this.focusTarget(target);
  },
  moveFocus(direction) {
    const buttons=this.navigableButtons();
    if(!buttons.length)return false;
    const current=document.activeElement;
    if(!buttons.includes(current)){
      this.focusByAction(this.scene?.page==='menu'?'mission':
        this.scene?.page==='yard'?'yard:'+this.scene.yardGroup:null);
      return true;
    }
    const a=current.getBoundingClientRect();
    const ax=a.left+a.width/2,ay=a.top+a.height/2;
    const horizontal=direction==='left'||direction==='right';
    const sign=direction==='left'||direction==='up'?-1:1;
    const zone=this.navigationZone(current);
    const choices=[];
    for(const candidate of buttons){
      if(candidate===current)continue;
      const b=candidate.getBoundingClientRect();
      const bx=b.left+b.width/2,by=b.top+b.height/2;
      const along=sign*(horizontal?bx-ax:by-ay);
      if(along<=5)continue;
      const across=horizontal?by-ay:bx-ax;
      const overlap=horizontal?
        Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)):
        Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left));
      const crossGap=horizontal?
        Math.max(0,b.top-a.bottom,a.top-b.bottom):
        Math.max(0,b.left-a.right,a.left-b.right);
      // Respect cardinal intent. Large diagonals, e.g. a faraway footer
      // button off to the right, should not hijack ↓ from the main grid.
      const purchaseNav=this.scene?.page==='yard'&&!horizontal&&
        candidate.dataset?.action?.startsWith('buy:')&&
        (current.dataset?.action?.startsWith('buy:')||current.dataset?.action==='menu');
      const returnNav=this.scene?.page==='yard'&&direction==='down'&&
        current.dataset?.action?.startsWith('buy:')&&candidate.dataset?.action==='menu'&&
        this.navigationZone(candidate)==='main';
      if(!purchaseNav&&!returnNav&&!overlap&&Math.abs(across)>Math.max(55,along*1.12))continue;
      const mainGap=horizontal?
        sign>0?Math.max(0,b.left-a.right):Math.max(0,a.left-b.right):
        sign>0?Math.max(0,b.top-a.bottom):Math.max(0,a.top-b.bottom);
      const category=this.navigationZone(candidate);
      const same=category===zone;
      // A straight line wins, then distance. Page controls take priority
      // over header/footer even when DOM positions happen to be closer.
      const score=mainGap+crossGap*3+Math.abs(across)*.12+
        (overlap?0:25);
      choices.push({candidate,same,score,along});
    }
    if(!choices.length)return false;
    const sameZone=choices.filter(c=>c.same);
    // In the yard, moving vertically among upgrade cards must not jump
    // straight to "VOLTAR" while another affordable purchase lies below.
    const buyCandidates=this.scene?.page==='yard'&&!horizontal&&
      (current.dataset?.action?.startsWith('buy:')||current.dataset?.action==='menu')?
      sameZone.filter(c=>c.candidate.dataset?.action?.startsWith('buy:')):[];
    const candidates=buyCandidates.length?buyCandidates:sameZone.length?sameZone:
      // Leaving the main page horizontally is usually an accidental
      // diagonal; use vertical movement to reach secondary controls.
      (horizontal&&zone==='main'?[]:choices);
    if(!candidates.length)return false;
    candidates.sort(buyCandidates.length?
      ((a,b)=>a.along-b.along||a.score-b.score):
      ((a,b)=>a.score-b.score||a.along-b.along));
    return this.focusTarget(candidates[0].candidate);
  },
  changeYardTab(target) {
    if(!this.scene||this.scene.page!=='yard'||!this.yardTabs.includes(target))return false;
    if(target===this.scene.yardGroup)return false;
    // Remember the gameplay selection even after a mouse click focused a
    // pointer-only tab. Never store a tab itself as a focus destination.
    const active=document.activeElement;
    const current=active?.dataset?.nav==='pointer'?
      this.lastYardFocus:(active?.dataset?.action||this.lastYardFocus||'');
    const source=SEA_UPGRADES.filter(u=>u.group===this.scene.yardGroup);
    const dest=SEA_UPGRADES.filter(u=>u.group===target);
    let nextFocus=null;
    if(current.startsWith('buy:')){
      const index=source.findIndex(u=>'buy:'+u.id===current);
      if(index>=0&&dest.length){
        const p=SeaProfile.load();
        const indexes=[Math.min(index,dest.length-1),...dest.map((_,i)=>i)];
        for(const i of indexes){
          const u=dest[i];
          if(p.gold>=SeaProfile.price(u,p.levels[u.id]||0)){
            nextFocus='buy:'+u.id;break;
          }
        }
      }
    }else if(current==='menu')nextFocus='menu';
    this.scene.yardGroup=target;
    // Default picks the first affordable purchase or the in-page return,
    // never a tab. Avoid scene.start() and preserve scroll/focus.
    this.render(nextFocus);
    this.lastPadAt=0;this.lastPadDir='';
    return true;
  },
  switchYardTab(step) {
    if(!this.scene||this.scene.page!=='yard'||!step)return false;
    const tabs=this.yardTabs,index=tabs.indexOf(this.scene.yardGroup);
    return this.changeYardTab(tabs[((index<0?2:index)+step+tabs.length)%tabs.length]);
  },
  update(time) {
    const pad=SEA_GAMEPAD.poll();
    if(!pad.connected||!this.root)return;
    if(pad.just?.[1]||pad.just?.[9]){
      if(this.scene?.page!=='menu')this.goto('menu');
      return;
    }
    if(this.scene?.page==='yard'){
      if(pad.just?.[4]&&!pad.just?.[5]){this.switchYardTab(-1);return;}
      if(pad.just?.[5]&&!pad.just?.[4]){this.switchYardTab(1);return;}
    }
    if(pad.just?.[0]){
      let current=document.activeElement;
      if(!this.navigableButtons().includes(current)){
        this.focusByAction(this.scene?.page==='menu'?'mission':
          this.scene?.page==='yard'?'yard:'+this.scene.yardGroup:null);
        current=document.activeElement;
      }
      if(current&&this.root.contains(current)&&!current.disabled)current.click();
      return;
    }
    let direction='';
    if((pad.left||pad.right)&&(pad.up||pad.down)){
      direction=Math.abs(pad.x||0)>Math.abs(pad.y||0)?
        (pad.left?'left':'right'):(pad.up?'up':'down');
    }else if(pad.left)direction='left';
    else if(pad.right)direction='right';
    else if(pad.up)direction='up';
    else if(pad.down)direction='down';
    if(!direction){this.lastPadDir='';return;}
    if(direction!==this.lastPadDir||time>=this.lastPadAt){
      this.moveFocus(direction);
      this.lastPadAt=time+(direction===this.lastPadDir?165:300);
      this.lastPadDir=direction;
    }
  },
  header(page,p) {
    const titles={menu:'O MAR DE SANGUE',yard:'ESTALEIRO',help:'DIÁRIO DE BORDO',
      reset:'O ESQUECIMENTO',result:'FIM DA EXPEDIÇÃO'};
    return '<header class="port-top">'+
      '<div class="port-top__brand"><span class="port-top__sigil" aria-hidden="true">✥</span>'+
      '<div><span class="port-eyebrow">CRÔNICAS DA CARCAÇA</span>'+
      '<span class="port-top__title">'+(titles[page]||titles.menu)+'</span></div></div>'+
      '<div class="port-top__right"><span class="port-top__tag">A COSTA NÃO PERDOA</span>'+
      '<span class="port-top__coins"><span aria-hidden="true">◈</span> '+this.num(p.gold)+' OURO</span>'+
      (page!=='menu'?'<button type="button" class="port-mini" data-action="menu">← VOLTAR AO PORTO</button>':'')+
      '</div></header>';
  },
  music() {
    const musicPercent=Math.round(SEA_MUSIC.volume*100);
    const effectsPercent=Math.round(SEA_AUDIO.effectsVolume*100);
    return '<div class="port-sound" aria-label="Controles de áudio">'+
      '<div class="port-sound__group" aria-label="Volume da música">'+
        '<span class="port-sound__label">♫ MÚSICA</span>'+
        '<button data-action="volume:down" type="button" aria-label="Diminuir volume da música">−</button>'+
        '<span class="port-sound__volume" aria-label="Volume da música: '+musicPercent+'%">'+musicPercent+'%</span>'+
        '<button data-action="volume:up" type="button" aria-label="Aumentar volume da música">+</button>'+
      '</div>'+
      '<div class="port-sound__group" aria-label="Volume dos efeitos">'+
        '<span class="port-sound__label">✹ EFEITOS</span>'+
        '<button data-action="fx-volume:down" type="button" aria-label="Diminuir volume dos efeitos">−</button>'+
        '<span class="port-sound__volume" aria-label="Volume dos efeitos: '+effectsPercent+'%">'+effectsPercent+'%</span>'+
        '<button data-action="fx-volume:up" type="button" aria-label="Aumentar volume dos efeitos">+</button>'+
      '</div>'+
      '<button data-action="mute" type="button" aria-label="Ligar ou desligar todo o áudio">'+
        (SEA_AUDIO.enabled?'SILENCIAR TUDO':'ATIVAR SOM')+'</button>'+
      '<button data-action="import" type="button">TROCAR TRILHAS</button>'+
      '<small data-music-status>'+this.text(SEA_MUSIC.status())+'</small>'+
      '</div>';
  },
  home(p) {
    const stats=SeaProfile.stats(p);
    return '<div class="port-layout port-layout--home">'+
      '<aside class="port-aside port-aside--l">'+
        '<div class="port-aside__frame"><span class="port-eyebrow">ÁGUAS PROIBIDAS</span>'+
          '<h2>A costa dos condenados</h2>'+
          '<img loading="lazy" alt="" class="port-aside__ship" src="'+this.img('ship_spectral')+'">'+
          '<p>Além da última luz, pactos, naufrágios e cidades submersas disputam o mesmo horizonte.</p>'+
          '<span class="port-aside__line">✦ O mar sempre cobra seu preço</span>'+
        '</div></aside>'+
      '<main class="port-center" id="port-main">'+
        '<section class="port-hero" aria-labelledby="port-title">'+
          '<div class="port-hero__haze" aria-hidden="true"></div>'+
          '<div class="port-hero__copy"><span class="port-eyebrow">UM ROGUELITE NAVAL EM CARCAÇA</span>'+
            '<h1 id="port-title">O MAR<br><em>DE SANGUE</em></h1>'+
            '<p>O ouro compra aço.<br>O oceano cobra cada erro.</p>'+
          '</div>'+
          '<img class="port-hero__ship" src="'+this.img('ship_flagship')+'" alt="Navio de guerra navegando pelas águas malditas">'+
          '<span class="port-hero__seal" aria-hidden="true">✦</span>'+
        '</section>'+
        '<div class="port-section-label"><span>ESCOLHA O TEU DESTINO</span><span>✣</span></div>'+
        '<div class="port-actions">'+
          this.button('mission','MISSÕES','Continue na etapa '+this.num(p.mission),'⚔','port-choice--primary')+
          this.button('sandbox','MAR SEM FIM','Recorde: onda '+this.num(p.bestWave),'∞','')+
          this.button('yard:armas','ESTALEIRO','Reforce seu navio e sua tripulação','⚒','')+
          this.button('help','DIÁRIO DE BORDO','Comandos, regras e navegação','☷','')+
        '</div>'+
        '<div class="port-statbar" aria-label="Estado da embarcação">'+
          '<div><span>CASCO</span><strong>'+this.num(stats.maxHP)+'</strong></div>'+
          '<div><span>CANHÕES</span><strong>'+this.num(stats.cannonDamage)+'</strong></div>'+
          '<div><span>VELAS</span><strong>'+this.num(stats.maxSpeed)+'</strong></div>'+
          '<div><span>EXPEDIÇÕES</span><strong>'+this.num(p.sorties)+'</strong></div>'+
        '</div>'+
        '<div class="port-bottom"><span>O PODER TEM UM PREÇO. O MAR, OUTRO.</span>'+
          '<div class="port-bottom__actions">'+
            '<button class="port-text-button" data-action="export-backup" type="button">↓ GUARDAR SAVE .JSON</button>'+
            '<button class="port-text-button" data-action="restore-file" type="button">↑ RESTAURAR SAVE .JSON</button>'+
            (SEA_SAVE_TRANSFER.lastRollback()?
              '<button class="port-text-button" data-action="restore-rollback" type="button">↶ DESFAZER RESTAURAÇÃO</button>':'')+
            '<button class="port-text-button" data-action="reset" type="button">REINICIAR PROGRESSO ↗</button>'+
          '</div>'+
        '</div>'+
      '</main>'+
      '<aside class="port-aside port-aside--r">'+
        '<div class="port-aside__frame"><span class="port-eyebrow">DIÁRIO DA FROTA</span>'+
          '<h2>Sobreviventes do mar rubro</h2>'+
          '<img loading="lazy" alt="" class="port-aside__ship port-aside__ship--right" src="'+this.img('ship_royal')+'">'+
          '<div class="port-tally"><div><span>VITÓRIAS</span><strong>'+this.num(p.wins)+'</strong></div>'+
            '<div><span>NAVIOS AFUNDADOS</span><strong>'+this.num(p.kills)+'</strong></div>'+
            '<div><span>ABALROAMENTOS</span><strong>'+this.num(p.rammings)+'</strong></div>'+
          '</div>'+
          '<p>O ouro está seguro no cofre. A próxima viagem não tem essa garantia.</p>'+
        '</div></aside></div>';
  },
  yard(p) {
    const group=this.scene?.yardGroup||'armas';
    const tabs=[['casco','CASCO'],['motor','NAVEGAÇÃO'],['armas','ARMAMENTO'],['apoio','APOIO']];
    const list=SEA_UPGRADES.filter(u=>u.group===group);
    return '<main class="port-page" id="port-main">'+
      '<div class="port-page__header"><span class="port-eyebrow">FERRARIA, MADEIRA E RUNAS</span>'+
        '<h1>O ESTALEIRO</h1><p>Não existe teto para a ambição. Apenas um preço crescente.</p>'+
        '<div class="port-page__balance">◈ COFRE DO CAPITÃO <strong>'+this.num(p.gold)+'</strong></div></div>'+
      '<nav class="port-tabs" aria-label="Grupos de melhorias">'+
        '<span class="port-tabs__hint" aria-hidden="true">LB / Q ◀ TROCAR ABA ▶ RB / E</span>'+
        tabs.map(([id,label])=>'<button type="button" tabindex="-1" data-nav="pointer" data-action="yard:'+id+'" '+
          'class="'+(id===group?'is-active':'')+'">'+label+'</button>').join('')+'</nav>'+
      '<section class="port-upgrades">'+
        list.map(u=>{
          const level=p.levels[u.id]||0,cost=SeaProfile.price(u,level),can=p.gold>=cost;
          return '<article class="port-upgrade">'+
            '<span class="port-upgrade__symbol">'+this.text(u.icon)+'</span>'+
            '<div class="port-upgrade__head"><span>NÍVEL '+this.num(level)+'</span><h2>'+this.text(u.name)+'</h2></div>'+
            '<p>'+this.text(u.desc)+'</p>'+
            '<div class="port-upgrade__foot"><span>PRÓXIMA MELHORIA<br><strong>◈ '+this.num(cost)+' OURO</strong></span>'+
            '<button type="button" data-action="buy:'+this.text(u.id)+'" '+(!can?'disabled ':'')+'>'+
            (can?'ADQUIRIR ↗':'OURO INSUFICIENTE')+'</button></div>'+
          '</article>';
        }).join('')+
      '</section><div class="port-page__foot">'+this.button('menu','VOLTAR AO PORTO','','←','port-choice--return')+
      '</div></main>';
  },
  help() {
    const entries=[
      ['NAVEGAÇÃO','W / ↑ acelerar · S / ↓ frear / ré · A/D ou ←/→ virar'],
      ['CANHÕES','Q bombordo · E estibordo · ESPAÇO dispara os dois bordos'],
      ['CONTROLE XBOX','Analógico esquerdo · LT/LB bombordo · RT/RB estibordo · A confirma · B retorna'],
      ['ABALROAMENTO','Velocidade e ângulo da proa determinam o impacto. Rochas danificam o casco.'],
      ['MISSÕES','Escolta, caçada, sobrevivência e chefes. A campanha avança após vitórias.'],
      ['SANDBOX','Ondas sucessivas, frota hostil crescente e recompensas acumuladas.'],
      ['ATRACAÇÃO','Aproxime-se devagar e afaste inimigos. F, botão A ou toque para atracar.'],
      ['ESTALEIRO','Catorze melhorias sem limite artificial; cada nível aumenta o preço. LB/RB ou Q/E trocam as abas.'],
      ['ÁUDIO E PROGRESSO','ESC/P pausa. M abre a carta. N silencia. FLAC automático. O ouro só é consolidado ao retornar ao porto.']
    ];
    return '<main class="port-page" id="port-main"><div class="port-page__header">'+
      '<span class="port-eyebrow">DOUTRINA DO CAPITÃO</span><h1>DIÁRIO DE BORDO</h1>'+
      '<p>As regras que nenhum náufrago viveu para ensinar.</p></div>'+
      '<section class="port-help-grid">'+entries.map(([name,desc],i)=>
        '<article class="port-help"><span class="port-help__number">'+String(i+1).padStart(2,'0')+'</span>'+
        '<div><h2>'+name+'</h2><p>'+this.text(desc)+'</p></div></article>').join('')+
      '</section><div class="port-page__foot">'+this.button('menu','VOLTAR AO PORTO','','←','port-choice--return')+
      '</div></main>';
  },
  restore() {
    const incoming=this.pendingRestore?.profile;
    if(!incoming)return this.home(SeaProfile.load());
    const present=SeaProfile.load();
    const oldUpgrades=Object.values(present.levels||{}).reduce((n,v)=>n+(Number(v)||0),0);
    const newUpgrades=Object.values(incoming.levels).reduce((n,v)=>n+v,0);
    const rows=[
      ['OURO',present.gold,incoming.gold],
      ['MISSÃO ATUAL',present.mission,incoming.mission],
      ['EXPEDIÇÕES',present.sorties,incoming.sorties],
      ['VITÓRIAS',present.wins,incoming.wins],
      ['MELHOR ONDA',present.bestWave,incoming.bestWave],
      ['NÍVEIS DE MELHORIAS',oldUpgrades,newUpgrades]
    ];
    return '<main class="port-page port-page--narrow" id="port-main">'+
      '<section class="port-warning port-restore">'+
        '<span class="port-warning__sigil" aria-hidden="true">⚓</span>'+
        '<span class="port-eyebrow">ARQUIVOS DO CAPITÃO · SAVE V4</span>'+
        '<h1>RECUPERAR O PASSADO?</h1>'+
        '<p>Compare antes de substituir. A última versão deste navegador ficará guardada localmente para permitir desfazer.</p>'+
        '<div class="port-restore__grid" role="table" aria-label="Comparação de progresso">'+
          '<div class="port-restore__row port-restore__row--head" role="row">'+
            '<span>REGISTRO</span><span>ATUAL</span><span>IMPORTADO</span></div>'+
          rows.map(([key,oldValue,newValue])=>
            '<div class="port-restore__row" role="row"><span>'+this.text(key)+'</span>'+
            '<strong>'+this.num(oldValue)+'</strong><strong>'+this.num(newValue)+'</strong></div>').join('')+
        '</div>'+
        '<p class="port-restore__notice">A substituição muda o progresso consolidado, não as músicas importadas nem as opções de som. Apenas backup v4 é aceito.</p>'+
        (this.restoreArmed?
          '<strong>CONFIRMAÇÃO FINAL: o progresso atual será substituído.</strong>'+
          '<div class="port-restore__actions">'+
            this.button('restore-cancel','CANCELAR','Manter o save atual','←','port-choice--primary')+
            this.button('restore-confirm','SIM, RESTAURAR SAVE','Salvar cópia local do atual e usar o backup','⚠','port-choice--danger')+
          '</div>'
          :'<div class="port-restore__actions">'+
            this.button('restore-cancel','CANCELAR','Não alterar o progresso','←','port-choice--primary')+
            this.button('restore-arm','CONTINUAR RESTAURAÇÃO','Ver confirmação final','⚓','')+
          '</div>')+
      '</section></main>';
  },
  reset() {
    return '<main class="port-page port-page--narrow" id="port-main">'+
      '<section class="port-warning"><span class="port-warning__sigil" aria-hidden="true">☠</span>'+
      '<span class="port-eyebrow">O PACTO É IRREVERSÍVEL</span><h1>ESQUECER O MAR?</h1>'+
      '<p>O capitão abandonará o ouro, os navios aperfeiçoados, as missões, os recordes e o histórico de expedições deste dispositivo.</p>'+
      '<strong>ESTA ESCOLHA NÃO PODE SER DESFEITA.</strong>'+
      '<p>Antes de apagar, baixe uma cópia local. O arquivo JSON não modifica nem restaura automaticamente o jogo.</p>'+
      '<div class="port-warning__actions">'+this.button('export-backup','GUARDAR CÓPIA DO SAVE','Baixar o progresso v4 sem modificar a campanha','↓','')+
        this.button('menu','NÃO. VOLTAR AO PORTO','','←','port-choice--primary')+
        this.button('reset-confirm','SIM. APAGAR TUDO','','☠','port-choice--danger')+
      '</div></section></main>';
  },
  result(r) {
    if(!r)return this.home(SeaProfile.load());
    const won=!!r.won,withdrawn=!!r.withdrawn;
    const state=won?'MISSÃO CUMPRIDA':withdrawn?'DE VOLTA AO PORTO':'O MAR TE RECLAMOU';
    const desc=won?'As velas ainda conhecem o caminho.':
      withdrawn?'Quem retorna ainda pode contar a história.':'O oceano nunca esquece os seus.';
    const data=[
      ['OURO ENCONTRADO',r.collected],['OURO RECUPERADO',r.reward],
      ['INIMIGOS AFUNDADOS',r.kills],['ABALROAMENTOS',r.rammings],
      ['COFRE DO CAPITÃO',r.bank],
      [r.mode==='mission'?'ETAPA':'ONDA',r.mode==='mission'?r.stage:r.wave],
      ['ILHAS EXPLORADAS',r.islands]
    ];
    return '<main class="port-page port-page--result" id="port-main">'+
      '<div class="port-page__header"><span class="port-eyebrow">CRÔNICAS DOS QUE REGRESSARAM</span>'+
      '<h1>'+this.text(state)+'</h1><p>'+this.text(desc)+'</p></div>'+
      '<div class="port-result-grid">'+data.map(([title,value])=>
        '<div><span>'+this.text(title)+'</span><strong>'+this.num(value)+'</strong></div>').join('')+
      '</div><div class="port-result-actions">'+
        this.button('yard:armas','MELHORAR O NAVIO','Abrir estaleiro','⚒','')+
        this.button('next',r.mode==='mission'?'PRÓXIMA MISSÃO':'NOVA JORNADA','Voltar ao Mar de Sangue','⚔','port-choice--primary')+
        this.button('menu','MENU PRINCIPAL','','←','')+
      '</div></main>';
  },
  render(preferred=null) {
    if(!this.root||!this.scene)return;
    const ui=this.root;
    const scroll=ui.scrollTop;
    const active=preferred||document.activeElement?.dataset?.action||null;
    const p=SeaProfile.load(),page=this.scene.page;
    const body=page==='yard'?this.yard(p):page==='help'?this.help():
      page==='reset'?this.reset():page==='restore'?this.restore():
       page==='result'?this.result(this.scene.report):this.home(p);
    ui.innerHTML='<div class="port-background" aria-hidden="true">'+
      '<span class="port-background__moon"></span><span class="port-background__sea"></span>'+
      '<span class="port-background__vignette"></span></div>'+
      '<div class="port-container">'+this.header(page,p)+body+
      '<footer class="port-footer"><span>O MAR DE SANGUE · CARCAÇA</span>'+
      '<span class="port-pad-hint">✥ DIRECIONAL: NAVEGAR · A: CONFIRMAR · B: VOLTAR</span>'+
      this.music()+'<span class="port-footer__version">PORTO RECONSTRUÍDO</span></footer>'+
      '</div><div class="port-toast" hidden role="status"></div>'+
      '<input id="sea-port-tracks" hidden type="file" multiple accept=".flac,.mp3,audio/*">'+
       '<input id="sea-port-backup" hidden type="file" accept=".json,application/json">';
    ui.scrollTop=scroll;
    if(active)this.focusByAction(active);
  }
};