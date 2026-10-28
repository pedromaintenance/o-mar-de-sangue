#!/usr/bin/env python3
"""Gera 20 sprites do Culto de Dagon a partir do PNG ORIGINAL sem reamostragem."""
from pathlib import Path
from PIL import Image
import hashlib, json
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'assets/player/culto_dagon'
SRC=BASE/'Evolucao_de_Navios_Eldritch_Culto_de_Dagon_original.png'
SHEET=BASE/'mar_de_sangue_navio_culto_dagon_20_evolucoes.png'
X=((22,185),(265,438),(513,694),(761,949),(1002,1201))
Y=((17,289),(334,607),(635,919),(935,1279))
HASH=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()

def main():
    if not SRC.exists():
        raise SystemExit('Adicione o PNG original em '+str(SRC))
    source=Image.open(SRC).convert('RGBA')
    if source.size != (1213,1296):
        raise SystemExit('Imagem inesperada: esperado 1213x1296 RGBA')
    (BASE/'evolucoes').mkdir(parents=True,exist_ok=True)
    atlas=Image.new('RGBA',(1460,1560),(0,0,0,0))
    cells=[]
    for row in range(4):
        for col in range(5):
            level=row*5+col+1
            x0,x1=X[col]
            y0,y1=Y[row]
            region=source.crop((x0,y0,x1,y1))
            bounds=region.getchannel('A').getbbox()
            if not bounds:
                raise ValueError(f'Quadro {level} vazio')
            art=region.crop(bounds)
            w,h=art.size
            if w>260 or h>352:
                raise ValueError(f'Quadro {level} maior que 260x352: {w}x{h}')
            left=(260-w)//2
            top=352-h
            frame=Image.new('RGBA',(260,360),(0,0,0,0))
            frame.alpha_composite(art,(left,top))
            filename=f'navio_culto_dagon_nivel_{level:02d}.png'
            filepath=BASE/'evolucoes'/filename
            frame.save(filepath,optimize=True)
            ax=col*300
            ay=row*400
            atlas.alpha_composite(frame,(ax,ay))
            cells.append({'level':level,'file':filename,'row':row,'column':col,
                'source_rect':{'x':x0+bounds[0],'y':y0+bounds[1],'width':w,'height':h},
                'atlas_rect':{'x':ax,'y':ay,'width':260,'height':360},
                'content_rect':{'x':left,'y':top,'width':w,'height':h},
                'anchor':{'x':130,'y':352},'sha256':HASH(filepath)})
    atlas.save(SHEET,optimize=True)
    manifest={
        'name':'O Mar de Sangue — Culto de Dagon — Evolução Eldritch (20 navios)',
        'faction':'culto','status':'staged_art_only','source_file':SRC.name,
        'source_size':{'width':1213,'height':1296},'source_sha256':HASH(SRC),
        'atlas_file':SHEET.name,'atlas_size':{'width':1460,'height':1560},
        'atlas_sha256':HASH(SHEET),
        'grid':{'columns':5,'rows':4,'frame_width':260,'frame_height':360,
                'horizontal_gap':40,'vertical_gap':40},
        'order':'row-major left-to-right top-to-bottom',
        'orientation':{'bow':'down','stern':'up','view':'top-down'},
        'processing':'Pixel-exact crops + transparent padding; no resizing or recoloring',
        'faction_note':'Appearance unlocks after explicit persistent Cult allegiance; political choices do not grant allegiance.',
        'sprites':cells
    }
    (BASE/'mar_de_sangue_navio_culto_dagon_manifest.json').write_text(
        json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'OK: 20 sprites RGBA + atlas 1460x1560, SHA {HASH(SHEET)}')

if __name__=='__main__':
    main()
