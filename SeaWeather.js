/* O MAR DE SANGUE v1.8.1 — Mar Vivo + FLAC lossless hospedado.
 * O navegador recebe automaticamente os FLACs publicados em assets/audio/.
 * Cópias locais antigas MP3 servem como alternativa, nunca substituem o FLAC.
 */
const SEA_MUSIC = {
    dbName: 'carcaca-mar-de-sangue-music', storeName: 'tracks',
    names: { crimson: 'Beneath The Crimson Tide', black: 'Beneath the Black Tide' },
    paths: { crimson: './assets/audio/Beneath%20The%20Crimson%20Tide.flac',
        black: './assets/audio/Beneath%20The%20Black%20Tide.flac' },
    hostedVersion: 'flac-20261014-v1', sources: {}, flacCapability: null,
    tracks: {}, players: {}, objectUrls: {}, ready: false, loading: null,
    wanted: 'crimson', started: false, gestureSeen: false,
    volume: (() => { try { return Math.max(0,Math.min(.6, Number(localStorage.getItem('carcaca.mar.music.volume') ?? '.25'))); }
        catch (_) { return .25; } })(),
    db() {
        if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB indisponível'));
        return new Promise((resolve,reject)=>{
            const req=indexedDB.open(this.dbName,1);
            req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(this.storeName))db.createObjectStore(this.storeName);};
            req.onsuccess=()=>resolve(req.result);
            req.onerror=()=>reject(req.error);
        });
    },
    supportsFlac() {
        if (this.flacCapability !== null) return this.flacCapability;
        try {
            const probe = new Audio();
            // Chrome, Firefox e Safari modernos suportam FLAC nativamente.
            // Browsers que não suportam ainda podem usar MP3 importado.
            this.flacCapability = !!(
                probe.canPlayType?.('audio/flac') ||
                probe.canPlayType?.('audio/x-flac')
            );
        } catch (_) { this.flacCapability = false; }
        return this.flacCapability;
    },
    async readStored(db, key) {
        return new Promise(resolve => {
            try {
                const request = db.transaction(this.storeName, 'readonly')
                    .objectStore(this.storeName).get(key);
                request.onsuccess = () => resolve(request.result instanceof Blob ? request.result : null);
                request.onerror = () => resolve(null);
            } catch (_) { resolve(null); }
        });
    },
    async writeStored(key, blob) {
        try {
            const db = await this.db();
            await new Promise(resolve => {
                try {
                    const tx = db.transaction(this.storeName, 'readwrite');
                    tx.objectStore(this.storeName).put(blob, key);
                    tx.oncomplete = () => resolve();
                    tx.onerror = () => resolve();
                    tx.onabort = () => resolve();
                } catch (_) { resolve(); }
            });
            db.close();
        } catch (_) { /* Falha no cache nunca impede reprodução. */ }
    },
    async load() {
        if (this.loading) return this.loading;
        this.loading = (async () => {
            const ids = ['crimson', 'black'];
            const supported = this.supportsFlac();
            // 1) Primeiro usa FLAC já salvo; se não houver, aceita MP3 antigo.
            try {
                const db = await this.db();
                await Promise.all(ids.map(async id => {
                    // Escolhas explícitas de agora em diante prevalecem; importações
                    // antigas (sem versão) são atualizadas automaticamente para FLAC.
                    const manual = await this.readStored(db, id + ':manual-v2');
                    if (manual) {
                        this.use(id, manual);
                        this.sources[id] = 'manual';
                        return;
                    }
                    const bestKey = id + ':' + this.hostedVersion;
                    const cachedFlac = supported ? await this.readStored(db, bestKey) : null;
                    if (cachedFlac) {
                        this.use(id, cachedFlac);
                        this.sources[id] = 'flac';
                    } else {
                        const legacy = await this.readStored(db, id);
                        if (legacy) {
                            this.use(id, legacy);
                            this.sources[id] = 'local';
                        }
                    }
                }));
                db.close();
            } catch (_) { /* Reprodução continua online sem IndexedDB. */ }

            // 2) Hospedagem GitHub Pages tem prioridade inclusive sobre
            //    MP3s anteriormente importados. Não exige ação do visitante.
            if (supported && typeof fetch === 'function') {
                await Promise.all(ids.filter(id => this.sources[id] !== 'flac' && this.sources[id] !== 'manual').map(async id => {
                    try {
                        const response = await fetch(this.paths[id]);
                        if (!response.ok) return;
                        const raw = await response.blob();
                        if (!raw.size) return;
                        // Evita aceitar páginas de erro HTML e servidores com MIME genérico.
                        const header = new Uint8Array(await raw.slice(0, 4).arrayBuffer());
                        if (header.length !== 4 || String.fromCharCode(...header) !== 'fLaC') return;
                        const audio = raw.type === 'audio/flac' ? raw :
                            new Blob([raw], { type: 'audio/flac' });
                        this.use(id, audio);
                        this.sources[id] = 'flac';
                        await this.writeStored(id + ':' + this.hostedVersion, audio);
                    } catch (_) { /* Mantém a versão local como alternativa. */ }
                }));
            }
            this.ready = true;
        })();
        return this.loading;
    },
    use(id, blob) {
        if (!(blob instanceof Blob) || !blob.size) return false;
        this.tracks[id]=blob;
        if (this.objectUrls[id])URL.revokeObjectURL(this.objectUrls[id]);
        this.objectUrls[id]=URL.createObjectURL(blob);
        if (!this.players[id]) {
            const audio=new Audio();
            audio.loop=true;audio.preload='metadata';audio.volume=0;
            audio.addEventListener('ended',()=>{audio.currentTime=0;});
            this.players[id]=audio;
        }
        this.players[id].pause();
        this.players[id].src=this.objectUrls[id];
        this.players[id].load();
        this.started=false;
        return true;
    },
    count() { return ['crimson','black'].filter(id=>this.tracks[id]).length; },
    setVolume(n) {
        this.volume=Math.max(0,Math.min(.8,Math.round(n*100)/100));
        try{localStorage.setItem('carcaca.mar.music.volume',String(this.volume));}catch(_){}
        return this.volume;
    },
    setMood(mood) { this.wanted=mood==='black'?'black':'crimson'; },
    status() {
        const quality = this.sources.crimson === 'flac' && this.sources.black === 'flac' ? 'FLAC' : 'TRILHAS';
        if (this.ready && !this.supportsFlac() && !this.count())
            return '♫ FLAC NÃO SUPORTADO · IMPORTE MP3';
        return '♫ '+this.count()+'/2 '+quality+'  ·  VOL '+Math.round(this.volume*100)+'%';
    },
    async importFiles(files) {
        const arr=Array.from(files||[]).filter(f=>f&&f.size&&
            (/\.(mp3|flac)$/i.test(f.name)||f.type.startsWith('audio/')));
        if (!arr.length) return 0;
        const chosen={};
        for (const file of arr) {
            const name=file.name.toLowerCase();
            const id=name.includes('crimson') ? 'crimson' : name.includes('black') ? 'black' :
                (!chosen.crimson&&!this.tracks.crimson ? 'crimson' :
                    !chosen.black&&!this.tracks.black ? 'black' : null);
            if(id)chosen[id]=file;
        }
        let db=null;try{db=await this.db();}catch(_){}
        for(const [id,file] of Object.entries(chosen)){
            this.use(id,file);
            this.sources[id]='local';
            if(db){
                try{await new Promise((resolve,reject)=>{
                    const tx=db.transaction(this.storeName,'readwrite');
                    tx.objectStore(this.storeName).put(file,id + ':manual-v2');
                    tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
                });}catch(_){}
            }
        }
        if(db)db.close();
        return Object.keys(chosen).length;
    },
    selectFiles(scene) {
        if (typeof document==='undefined')return;
        const file=document.createElement('input');
        file.type='file';file.accept='.flac,audio/flac,.mp3,audio/mpeg,audio/*';file.multiple=true;
        file.style.display='none';
        document.body.appendChild(file);
        const cleanup=()=>{setTimeout(()=>file.remove(),150);};
        file.addEventListener('change',async()=>{
            try{const count=await this.importFiles(file.files);
                scene.musicNote?.setText(count ? this.status()+'  ·  PRONTAS!' : this.status());
            }catch(_){scene.musicNote?.setText('ERRO AO IMPORTAR TRILHAS');}
            cleanup();
        },{once:true});
        file.click();
    },
    addPortControls(scene) {
        scene.button(318,'−',()=>{this.setVolume(this.volume-.05);scene.musicNote?.setText(this.status());},
            'dark',55,43,31,17);
        scene.button(318,'♫ TROCAR TRILHAS',()=>this.selectFiles(scene),
            'dark',241,310,32,12);
        scene.button(318,'+',()=>{this.setVolume(this.volume+.05);scene.musicNote?.setText(this.status());},
            'dark',425,43,31,17);
        scene.musicNote=scene.txt(240,341,this.status(),10,'#e9d1a7',{center:true});
        this.load().then(()=>{if(scene.musicNote?.active)scene.musicNote.setText(this.status());});
    },
    onGesture() {
        this.gestureSeen=true;
        if(this.count()) this.prime();
    },
    prime() {
        if (typeof document==='undefined' || !this.gestureSeen || !SEA_AUDIO.enabled)return;
        for(const id of ['crimson','black']){
            const p=this.players[id];if(!p||!p.paused)continue;
            const play=p.play();
            if(play?.catch)play.catch(()=>{});
        }
        this.started=true;
    },
    tick(dt, mood) {
        if(mood)this.setMood(mood);
        const audible=!!SEA_AUDIO.enabled && this.gestureSeen;
        if(audible && !this.started && this.count())this.prime();
        const step=Math.max(.001,Math.min(.045,dt*.22));
        for(const id of ['crimson','black']){
            const a=this.players[id];if(!a)continue;
            const goal=audible && id===this.wanted?this.volume:0;
            if (Math.abs(a.volume-goal)<step)a.volume=goal;
            else a.volume=Math.max(0,Math.min(1,a.volume+Math.sign(goal-a.volume)*step));
            // Quando o jogo está silenciado, interrompa a decodificação de áudio.
            if(!audible && a.volume<=.001 && !a.paused){a.pause();this.started=false;}
        }
    }
};
if(typeof window!=='undefined'){
    for(const event of ['pointerdown','touchstart','keydown']){
        window.addEventListener(event,()=>SEA_MUSIC.onGesture(),{capture:true,passive:true});
    }
}

const SEA_WEATHER = {
    names:{calm:'MAR SERENO',fog:'NÉVOA DOS AFOGADOS',storm:'TEMPESTADE RUBRA',
        current:'CORRENTE ANCESTRAL',maelstrom:'REDEMOINHO DE SANGUE'},
    init(s){
        s.seaEvent='calm';s.seaEventTime=20;s.seaEventTotal=20;
        s.curse=0;s.lastCurseTier=0;s.seaWeatherFrame=0;
        s.seaCurrent={x:0,y:0};s.seaPool=null;s.seaLastBite=-9000;
        s.seaOverlay=s.add.rectangle(SEA_VIEW.width/2,SEA_VIEW.height/2,
            SEA_VIEW.width,SEA_VIEW.height,0x283649,0).setScrollFactor(0).setDepth(68);
        s.seaLightning=s.add.rectangle(SEA_VIEW.width/2,SEA_VIEW.height/2,
            SEA_VIEW.width,SEA_VIEW.height,0xffe8cb,0).setScrollFactor(0).setDepth(69);
        s.seaSky=s.add.graphics().setScrollFactor(0).setDepth(70);
        s.seaPoolArt=s.add.graphics().setDepth(8);
        s.seaWeatherLabel=s.add.text(15,115,'MAR SERENO  ·  MALDIÇÃO 0%',{
            fontFamily:'monospace',fontSize:'11px',color:'#ffe2b5',
            stroke:'#100e19',strokeThickness:3
        }).setScrollFactor(0).setDepth(112);
        s.seaCurseBar=s.add.graphics().setScrollFactor(0).setDepth(112);
        s.seaMist.setAlpha(.57);
    },
    onSink(s,e,ramming=false) {
        if(s.ended||s.sinking)return;
        const delta=e.isMonster?7:e.boss?10:4;
        s.curse=SEA_MATH.clamp(s.curse+delta+(ramming?3:0),0,100);
        this.announceTier(s);
    },
    announceTier(s){
        const tier=s.curse>=75?3:s.curse>=50?2:s.curse>=25?1:0;
        if(tier>s.lastCurseTier){
            s.lastCurseTier=tier;
            s.announce(['','O MAR SENTIU O SANGUE','AS ÁGUAS ESTÃO FAMINTAS',
                'DAEGON ESCUTA SOB AS ONDAS'][tier]);
        }
    },
    choose(s){
        const curse=s.curse;
        const roll=Math.random();
        const stormOdds=curse>=75?.37:curse>=45?.29:.20;
        const whirlOdds=curse>=75?.28:curse>=45?.19:.10;
        let next;
        if(roll<whirlOdds)next='maelstrom';
        else if(roll<whirlOdds+stormOdds)next='storm';
        else if(roll<whirlOdds+stormOdds+.19)next='fog';
        else if(roll<whirlOdds+stormOdds+.40)next='current';
        else next='calm';
        this.transition(s,next);
    },
    transition(s,next){
        s.seaEvent=next;
        s.seaEventTime=next==='maelstrom'?19:next==='storm'?34:next==='fog'?30:
            next==='current'?38:27;
        s.seaEventTotal=s.seaEventTime;
        const a=Math.random()*Math.PI*2;
        const power=next==='storm'?62:next==='current'?87:0;
        s.seaCurrent={x:Math.cos(a)*power,y:Math.sin(a)*power};
        if(next==='maelstrom'){
            let x=SEA_MATH.clamp(s.player.x+450,220,s.W-220);
            let y=SEA_MATH.clamp(s.player.y+450,220,s.H-220);
            for(let i=0;i<24;i++){
                const theta=Math.random()*Math.PI*2;
                const r=440+Math.random()*110;
                const tx=SEA_MATH.clamp(s.player.x+Math.cos(theta)*r,220,s.W-220);
                const ty=SEA_MATH.clamp(s.player.y+Math.sin(theta)*r,220,s.H-220);
                if(!s.islands.some(o=>Math.hypot(o.x-tx,o.y-ty)<o.radius+180)){
                    x=tx;y=ty;break;
                }
            }
            s.seaPool={x,y,age:0,life:19};
        }else s.seaPool=null;
        s.seaPoolArt.clear();
        s.announce('O MAR VIVO · '+this.names[next]);
    },
    update(s,dt){
        if(s.ended||s.sinking)return;
        s.seaEventTime-=dt;
        s.seaWeatherFrame+=dt;
        if(s.seaEventTime<=0)this.choose(s);
        let nearDemeter=false;
        for(const o of s.islands){
            if(o.kind==='demeter'&&Math.hypot(s.player.x-o.x,s.player.y-o.y)<o.radius+190){
                nearDemeter=true;break;
            }
        }
        if(nearDemeter)s.curse=Math.max(0,s.curse-2.0*dt);
        else if(s.seaEvent==='calm')s.curse=Math.max(0,s.curse-.12*dt);
        if(s.seaEvent==='storm'&&Math.random()<dt*.12) {
            s.seaLightning.setAlpha(.19);
        }
        s.seaLightning.setAlpha(Math.max(0,s.seaLightning.alpha-dt*1.5));
        this.applyForces(s,dt);
        this.render(s,dt);
    },
    applyForces(s,dt){
        const ev=s.seaEvent;
        if(ev==='storm'||ev==='current'){
            s.playerVelocity.x+=s.seaCurrent.x*dt;
            s.playerVelocity.y+=s.seaCurrent.y*dt;
        }
        const pool=s.seaPool;
        if(!pool||ev!=='maelstrom')return;
        pool.age+=dt;
        const vector=(x,y)=>{
            const dx=pool.x-x,dy=pool.y-y,d=Math.hypot(dx,dy);
            if(d>430||d<.001)return null;
            const effect=(1-d/430);
            return {x:dx/d,y:dy/d,d,
                pull:(56+195*effect*effect)*(Math.min(1,pool.age/2))};
        };
        const p=vector(s.player.x,s.player.y);
        if(p){
            s.playerVelocity.x+=p.x*p.pull*dt;
            s.playerVelocity.y+=p.y*p.pull*dt;
            if(p.d<85&&s.time.now-s.seaLastBite>1300){
                s.seaLastBite=s.time.now;
                s.damageShip(7,pool.x,pool.y,'ram');
            }
        }
        for(const e of s.enemies){
            if(e.dead)continue;
            const v=vector(e.x,e.y);
            if(!v)continue;
            e.vx+=v.x*v.pull*dt*.70;
            e.vy+=v.y*v.pull*dt*.70;
            if(v.d<52){
                e.hp=Math.max(0,e.hp-11*dt);
                if(e.hp<=0)s.sinkEnemy(e,false);
            }
        }
    },
    enemyCurrent(s,e,dt){
        if(s.seaEvent!=='storm'&&s.seaEvent!=='current')return;
        e.vx+=s.seaCurrent.x*dt*.63;
        e.vy+=s.seaCurrent.y*dt*.63;
    },
    render(s,dt){
        const ev=s.seaEvent;
        const fog=ev==='fog',storm=ev==='storm';
        s.seaMist.setAlpha(fog?.92:storm?.74:.57);
        if(fog)s.seaOverlay.setFillStyle(0x68747d,.13);
        else if(storm)s.seaOverlay.setFillStyle(0x111522,.18);
        else if(ev==='maelstrom')s.seaOverlay.setFillStyle(0x4c1629,.08);
        else s.seaOverlay.setFillStyle(0x182633,0);
        const g=s.seaSky;
        if(s.seaWeatherFrame>.12){
            s.seaWeatherFrame=0;g.clear();
            if(storm){
                g.lineStyle(2,0xbdd2de,.28);
                const lines=SEA_DESKTOP?86:38;
                for(let i=0;i<lines;i++){
                    const x=Math.random()*SEA_VIEW.width,y=Math.random()*SEA_VIEW.height;
                    g.lineBetween(x,y,x-10,y+22+Math.random()*15);
                }
            }else if(fog){
                g.fillStyle(0xc6c1bf,.028);
                for(let i=0;i<13;i++){
                    const x=(i*139+s.elapsed*12)%SEA_VIEW.width;
                    const y=(i*97+s.elapsed*4)%SEA_VIEW.height;
                    g.fillEllipse(x,y,120+20*(i%3),38);
                }
            }
        }
        const pool=s.seaPool,wp=s.seaPoolArt;wp.clear();
        if(pool&&ev==='maelstrom'){
            const radius=Math.min(1,pool.age/1.8)*150;
            for(let i=0;i<7;i++){
                wp.lineStyle(i%2?3:4,i%2?0xe3a0ab:0x8b294b,.38);
                const r=radius*(.23+i*.115);
                wp.strokeCircle(pool.x,pool.y,r);
            }
            wp.fillStyle(0x1c0819,.62);wp.fillCircle(pool.x,pool.y,23);
            const t=s.elapsed*2.9;
            for(let k=0;k<7;k++){
                const a=t+k*Math.PI*2/7,rr=radius*(.2+k*.09);
                wp.fillStyle(0xedb5b2,.45);
                wp.fillCircle(pool.x+Math.cos(a)*rr,pool.y+Math.sin(a)*rr,3.5);
            }
        }
        const text=this.names[ev]+(ev==='current'?
            (Math.abs(s.seaCurrent.x)>Math.abs(s.seaCurrent.y)?
                (s.seaCurrent.x>0?' →':' ←'):(s.seaCurrent.y>0?' ↓':' ↑')):'');
        s.seaWeatherLabel.setText(text+'  ·  MALDIÇÃO '+Math.round(s.curse)+'%');
        const bar=s.seaCurseBar;bar.clear();
        bar.fillStyle(0x17212c,.83).fillRect(16,133,154,5);
        bar.fillStyle(s.curse>=75?0xe66c73:s.curse>=40?0xc7945d:0xb27c83,.90)
            .fillRect(16,133,154*s.curse/100,5);
    }
};
