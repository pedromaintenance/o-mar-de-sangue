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
