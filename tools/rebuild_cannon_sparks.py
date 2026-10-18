#!/usr/bin/env python3
"""Build five clean, transparent cannon spark frames.

The supplied original artwork defines the small, progressively hotter spark
look. Previous 480x96 optimized PNG could not be decoded (bad IDAT stream),
so this deterministic replacement does not depend on reading that file.
Pillow is needed only to rebuild this asset, not by the game.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import math,random,sys

FRAME=96
FRAMES=5

def build(destination):
    atlas=Image.new("RGBA",(FRAME*FRAMES,FRAME),(0,0,0,0))
    for i in range(FRAMES):
        frame=Image.new("RGBA",(FRAME,FRAME),(0,0,0,0))
        draw=ImageDraw.Draw(frame,"RGBA")
        rng=random.Random(84110+i)
        cx,cy=48,49
        radius=(6,8,10,12,15)[i]
        # Warm transparent light, no black/dark cloud in the texture.
        draw.ellipse((cx-8-i*2,cy-8-i*2,cx+8+i*2,cy+8+i*2),
                     fill=(255,91,25,24+i*4))
        draw.ellipse((cx-4-i//2,cy-4-i//2,cx+4+i//2,cy+4+i//2),
                     fill=(255,155,33,75+i*9))
        n=4+i
        for j in range(n):
            theta=2*math.pi*j/n+rng.uniform(-.26,.26)
            length=radius*rng.uniform(.68,1.05)
            x=round(cx+length*math.cos(theta))
            y=round(cy+length*math.sin(theta))
            draw.line((cx,cy,x,y),fill=(255,148+i*11,47,200),width=1)
            if j%2==0:draw.point((x,y),fill=(255,220,109,245))
            if j%3==1:
                bx=round(cx+(length+3)*math.cos(theta))
                by=round(cy+(length+3)*math.sin(theta))
                draw.point((bx,by),fill=(255,173,51,190))
        for _ in range(1+i//2):
            x=cx+rng.randint(-radius-5,radius+5)
            y=cy+rng.randint(-radius-5,radius+5)
            draw.point((x,y),fill=(255,175,56,180))
        draw.ellipse((cx-2,cy-2,cx+2,cy+2),fill=(255,222,130,255))
        draw.point((cx,cy),fill=(255,255,239,255))
        atlas.paste(frame,(i*FRAME,0))
    atlas.save(destination,optimize=True)
    with Image.open(destination) as check:
        check.load()  # Decode *all* IDAT pixels; header-only checks missed the bug.
        assert check.mode=="RGBA" and check.size==(480,96)
        assert all(check.crop((i*96,0,(i+1)*96,96)).getbbox() for i in range(5))
    print(f"Generated and decoded {destination}: {Path(destination).stat().st_size} bytes")

if __name__=="__main__":
    build(Path(sys.argv[1]))
