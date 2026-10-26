/* O MAR DE SANGUE 3.6a — estado offline e atualização voluntária da PWA.
 * Purely interface state. Does not access SeaProfile, saves or game mechanics.
 */
const SEA_PWA = {
    ready:false,
    init() {
        if(this.ready || typeof document==='undefined')return;
        const offline=document.getElementById('pwa-offline');
        const update=document.getElementById('pwa-update');
        const banner=document.getElementById('pwa-status');
        const install=document.getElementById('install-btn');
        if(!offline||!update||!banner||!install)return;
        this.ready=true;
        const service=typeof navigator!=='undefined'?navigator.serviceWorker:null;
        // Fresh installations also emit controllerchange; that is NOT an update.
        let hadController=!!service?.controller;
        const repaint=()=>{
            offline.hidden=navigator.onLine!==false;
            banner.hidden=offline.hidden&&update.hidden;
        };
        repaint();
        window.addEventListener('offline',repaint);
        window.addEventListener('online',repaint);
        update.addEventListener('click',()=>window.location.reload());
        window.addEventListener('beforeinstallprompt',event=>{
            event.preventDefault();
            this.installPrompt=event;
            install.hidden=false;
        });
        install.addEventListener('click',async()=>{
            const prompt=this.installPrompt;
            if(!prompt)return;
            this.installPrompt=null;
            install.hidden=true;
            try{
                await prompt.prompt();
                await prompt.userChoice;
            }catch(_){/* Browser may reject installation; normal use continues. */}
        });
        window.addEventListener('appinstalled',()=>{
            this.installPrompt=null;
            install.hidden=true;
        });
        if(!service)return;
        service.addEventListener('controllerchange',()=>{
            if(hadController) {
                update.hidden=false; // Never reload during combat without consent.
                repaint();
            }
            hadController=true;
        });
        window.addEventListener('load',()=>{
            service.register('./sw.js').then(reg=>{
                // When returning to the game, ask for the latest worker.
                // No periodic timer or invasive prompt during a voyage.
                const check=()=>reg.update().catch(()=>{});
                check();
                window.addEventListener('focus',check);
                if(reg.waiting && hadController){
                    update.hidden=false;
                    repaint();
                }
            }).catch(()=>{/* Browser or private mode may disable offline caching. */});
        });
    }
};
if(typeof window!=='undefined')SEA_PWA.init();

/* Instalação não pode ser forçada pelo navegador. Após gesto do usuário,
 * solicita tela cheia e bloqueio horizontal quando as APIs permitirem. */
(function(){
 if(typeof window==='undefined')return;
 const isTouch=()=>/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent||'')||
     !!window.matchMedia?.('(pointer:coarse)').matches;
 const installed=()=>window.matchMedia?.('(display-mode:standalone)').matches||
     window.matchMedia?.('(display-mode:fullscreen)').matches||navigator.standalone===true;
 const tip=document.getElementById('landscape-tip');
 const full=document.getElementById('fullscreen-btn');
 const refresh=()=>{
     if(tip)tip.hidden=!isTouch()||window.innerWidth>window.innerHeight;
     if(full)full.hidden=!isTouch()||!!document.fullscreenElement||installed();
 };
 async function immersive(){
     if(!document.fullscreenElement&&document.documentElement.requestFullscreen)
         try{await document.documentElement.requestFullscreen({navigationUI:'hide'});}catch(_){}
     if(screen.orientation?.lock)
         try{await screen.orientation.lock('landscape');}catch(_){}
     refresh();
 }
 if(full)full.addEventListener('click',immersive);
 window.addEventListener('resize',refresh);
 window.addEventListener('orientationchange',refresh);
 document.addEventListener('fullscreenchange',refresh);
 window.addEventListener('appinstalled',refresh);
 // Apenas gestos reais: o navegador rejeita fullscreen/rotation automáticos.
 document.addEventListener('pointerdown',function once(e){
     if(!isTouch()||(!e.target.closest('#game-container')&&!e.target.closest('.port-ui')))return;
     document.removeEventListener('pointerdown',once);
     immersive();
 },{passive:true});
 refresh();
})();
