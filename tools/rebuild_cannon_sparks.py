#!/usr/bin/env python3
"""Repair the existing five-frame cannon spark atlas (Pillow required).

This is a one-time build tool, not a runtime dependency. The original atlas is
derived from the user-approved 1536x1024 2x3 artwork; source here is the five
96x96 cells used in the game. Remove dark smoke and preserve warm ignition.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import math,random,sys

def rebuild(path):
    im=Image.open(path).convert("RGBA")
    if im.size!=(480,96):
        raise ValueError(f"Expected five 96x96 cells; got {im.size}")
    out=Image.new("RGBA",im.size,(0,0,0,0))
    for index in range(5):
        source=im.crop((index*96,0,(index+1)*96,96)).load()
        frame=Image.new("RGBA",(96,96),(0,0,0,0));dest=frame.load()
        hot=[]
        for y in range(96):
            for x in range(96):
                r,g,b,alpha=source[x,y]
                brightness=max(0,min(1,(r-150)/90))
                heat=max(0,min(1,(g-42)/78))
                warmth=max(0,min(1,(r-b-15)/65))
                a=round(alpha*brightness*heat*warmth)
                if a<18:continue
                dest[x,y]=(max(215,r),max(95,g),min(175,max(24,b)),a)
                if r>220 and g>95 and a>48:
                    hot.append((x,y,a*(g+70)))
        if hot:
            hot.sort(key=lambda z:z[2],reverse=True)
            points=hot[:70]
            total=sum(w for _,_,w in points)
            cx=round(sum(x*w for x,y,w in points)/total)
            cy=round(sum(y*w for x,y,w in points)/total)
        else:cx,cy=48,48
        cx=max(25,min(71,cx));cy=max(25,min(71,cy))
        rng=random.Random(20261018+index)
        pencil=ImageDraw.Draw(frame,"RGBA")
        rays=(3,4,5,6,7)[index]
        radius=(5,6,8,10,12)[index]
        for ray in range(rays):
            angle=(2*math.pi*ray/rays)+rng.uniform(-.17,.17)
            length=radius*rng.uniform(.7,1.0)
            x2=round(cx+length*math.cos(angle))
            y2=round(cy+length*math.sin(angle))
            pencil.line((cx,cy,x2,y2),fill=(255,148+index*10,44,200),width=1)
            if ray%2==0:pencil.point((x2,y2),fill=(255,221,118,245))
        pencil.ellipse((cx-2,cy-2,cx+2,cy+2),fill=(255,226,145,255))
        pencil.point((cx,cy),fill=(255,255,239,255))
        for j in range(1+index//2):
            x=max(1,min(94,cx+rng.randint(-radius-3,radius+3)))
            y=max(1,min(94,cy+rng.randint(-radius-3,radius+3)))
            pencil.point((x,y),fill=(255,180,57,220))
        out.paste(frame,(index*96,0))
    out.save(path,optimize=True)
    print(f"Bright cannon spark atlas: {path}, {path.stat().st_size} bytes")

if __name__=="__main__":
    rebuild(Path(sys.argv[1]))
