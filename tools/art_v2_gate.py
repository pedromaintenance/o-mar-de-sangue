#!/usr/bin/env python3
"""Recusa PNGs RGBA ausentes, minúsculos ou quantizados.
Rodar DEPOIS de publicar os PNGs na branch, antes de integrar à main.
"""
import json
from pathlib import Path
from PIL import Image
import hashlib

ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'assets/art-v2/manifest.json').read_text(encoding='utf8'))
for sprite in manifest['resources']:
    path=ROOT/manifest['root']/sprite['path']
    if not path.exists():
        raise SystemExit(f'ASSET AUSENTE (não publicar): {path}')
    with Image.open(path) as im:
        assert im.mode=='RGBA',(path,im.mode)
        assert im.format=='PNG',path
        assert im.size==(sprite['width'],sprite['height']),path
        assert im.getchannel('A').getextrema()[1]>200,path
        assert len(im.getcolors(maxcolors=10_000_000) or [])>50,('cores insuficientes',path)
print(f'PASS: {len(manifest["resources"])} PNGs RGBA prontos para QA visual')
