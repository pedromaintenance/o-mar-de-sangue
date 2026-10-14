/* Piloto de fidelidade visual — isolado e desligado por padrão.
 * Ativar na branch de desenvolvimento com ?artPilot=1 SOMENTE após publicar os PNGs
 * do pacote de arte (rgba original, nenhuma quantização agressiva).
 * Nunca alterar física, save ou entrada no jogo.
 */
const SEA_ART_PILOT = {
    enabled: typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('artPilot') === '1',
    root: 'assets/art-v2',
    textures: {
        'art2-logo': 'ui/logo/main.png',
        'art2-dark-left': 'ui/buttons/dark_left.png',
        'art2-dark-middle': 'ui/buttons/dark_middle.png',
        'art2-dark-right': 'ui/buttons/dark_right.png',
        'art2-focus-left': 'ui/buttons/focus_left.png',
        'art2-focus-middle': 'ui/buttons/focus_middle.png',
        'art2-focus-right': 'ui/buttons/focus_right.png',
        'art2-reef': 'sea/hazards/reef_needles.png',
        'art2-wreck': 'sea/hazards/wreck_reef.png'
    },
    preload(scene) {
        if(!this.enabled)return;
        for(const [key,path] of Object.entries(this.textures)){
            scene.load.image(key,this.root+'/'+path);
        }
    },
    logo(scene) {
        if(!this.enabled || scene.page!=='menu' ||
            !scene.textures.exists('art2-logo'))return false;
        scene.add.image(240,111,'art2-logo')
            .setDisplaySize(427,153).setDepth(34);
        return true;
    },
    islandTexture(scene,kind,fallback){
        if(!this.enabled)return fallback;
        const key = kind==='reef'?'art2-reef':kind==='wreck'?'art2-wreck':null;
        return key&&scene.textures.exists(key)?key:fallback;
    },
    // UI preserva a zona de hitbox retangular do jogo; arte é puramente decorativa.
    button(scene,x,y,w,h,style){
        if(!this.enabled)return null;
        const state=style==='gold'?'focus':'dark';
        const keys=['left','middle','right'].map(which=>'art2-'+state+'-'+which);
        if(!keys.every(key=>scene.textures.exists(key)))return null;
        const srcL=scene.textures.get(keys[0]).getSourceImage();
        const srcR=scene.textures.get(keys[2]).getSourceImage();
        const srcM=scene.textures.get(keys[1]).getSourceImage();
        const l=srcL.width*h/srcL.height,r=srcR.width*h/srcR.height;
        const centerW=Math.max(1,w-l-r);
        const left=scene.add.image(x-w/2+l/2,y,keys[0])
            .setDisplaySize(l,h).setDepth(25.5);
        const right=scene.add.image(x+w/2-r/2,y,keys[2])
            .setDisplaySize(r,h).setDepth(25.5);
        const mid=scene.add.tileSprite(x+(l-r)/2,y,centerW,h,keys[1])
            .setDepth(25.5);
        const scale=h/srcM.height;
        mid.tileScaleX=scale;
        mid.tileScaleY=scale;
        return {left,right,mid,width:w,height:h};
    },
    focus(scene,pieces,selected,style){
        if(!pieces)return;
        const variant=selected || style==='gold'?'focus':'dark';
        for(const [obj,segment] of [[pieces.left,'left'],[pieces.mid,'middle'],[pieces.right,'right']]){
            const key='art2-'+variant+'-'+segment;
            if(scene.textures.exists(key))obj.setTexture(key);
        }
    }
};
