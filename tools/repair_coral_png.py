#!/usr/bin/env python3
"""Non-destructive, stdlib-only repair for the misplaced atlas strip in
assets/v15/beast_coral.png. Crops 28 polluted top rows of RGBA8 PNG.

Decodes only the first retained scanline (PNG filters can reference the
previous removed scanline), then leaves the following filtered pixels intact.
Preserves metadata chunks and pixel data of every retained image row.
"""
from __future__ import annotations

import argparse
import binascii
import struct
import zlib
from pathlib import Path

EXPECTED = (323, 330)
TRIM_TOP = 28

def chunk(tag: bytes, data: bytes) -> bytes:
    payload = tag + data
    return struct.pack(">I", len(data)) + payload + struct.pack(">I", binascii.crc32(payload) & 0xFFFFFFFF)

def parse(png: bytes):
    if png[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("Not PNG")
    off, result = 8, []
    while off < len(png):
        if off + 12 > len(png):
            raise ValueError("Truncated PNG")
        n = struct.unpack_from(">I", png, off)[0]
        tag, value = png[off+4:off+8], png[off+8:off+8+n]
        crc = struct.unpack_from(">I", png, off+8+n)[0]
        if (binascii.crc32(tag + value) & 0xFFFFFFFF) != crc:
            raise ValueError(f"Bad CRC in {tag!r}")
        result.append((tag, value))
        off += n + 12
        if tag == b"IEND":
            break
    if result[-1][0] != b"IEND":
        raise ValueError("Missing IEND")
    return result

def unfilter_row(filtered: bytes, previous: bytes, mode: int) -> bytes:
    pixel = bytearray(len(filtered))
    for i, x in enumerate(filtered):
        a = pixel[i-4] if i >= 4 else 0
        b = previous[i]
        c = previous[i-4] if i >= 4 else 0
        if mode == 0:
            prediction = 0
        elif mode == 1:
            prediction = a
        elif mode == 2:
            prediction = b
        elif mode == 3:
            prediction = (a + b) // 2
        elif mode == 4:
            p = a + b - c
            da, db, dc = abs(p-a), abs(p-b), abs(p-c)
            prediction = a if da <= db and da <= dc else b if db <= dc else c
        else:
            raise ValueError(f"Unexpected PNG filter {mode}")
        pixel[i] = (x + prediction) & 255
    return bytes(pixel)

def repair(source: bytes) -> bytes:
    segments = parse(source)
    header = next(data for tag, data in segments if tag == b"IHDR")
    w, h, depth, kind, cm, fm, interlace = struct.unpack(">IIBBBBB", header)
    if (w, h) != EXPECTED or (depth, kind, cm, fm, interlace) != (8, 6, 0, 0, 0):
        raise ValueError(f"Refusing unexpected image format {w}x{h}, {depth}/{kind}/{interlace}")
    rowbytes = 1 + 4*w
    compressed = b"".join(data for tag, data in segments if tag == b"IDAT")
    raw = zlib.decompress(compressed)
    if len(raw) != h*rowbytes:
        raise ValueError("Unexpected PNG scanline length")
    prior = bytes(w*4)
    kept_first = None
    for y in range(TRIM_TOP+1):
        offset = y*rowbytes
        mode = raw[offset]
        prior = unfilter_row(raw[offset+1:offset+rowbytes], prior, mode)
        if y == TRIM_TOP:
            kept_first = prior
    # The first kept scanline must be reset to filter 0, since its prior
    # scanline is no longer part of the cropped PNG.
    cropped = b"\x00" + kept_first + raw[(TRIM_TOP+1)*rowbytes:]
    assert len(cropped) == (h-TRIM_TOP)*rowbytes
    result = bytearray(b"\x89PNG\r\n\x1a\n")
    written_idat = False
    for tag, data in segments:
        if tag == b"IHDR":
            data = struct.pack(">IIBBBBB", w, h-TRIM_TOP, depth, kind, cm, fm, interlace)
        elif tag == b"IDAT":
            if written_idat:
                continue
            data = zlib.compress(cropped, level=9)
            written_idat = True
        result += chunk(tag, data)
    parse(result)  # CRC/structure validation
    assert zlib.decompress(b"".join(d for t,d in parse(result) if t==b"IDAT")) == cropped
    return bytes(result)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("filename", type=Path)
    a = parser.parse_args()
    before = a.filename.read_bytes()
    p = parse(before)
    hdr = next(d for t,d in p if t==b"IHDR")
    w, h = struct.unpack_from(">II", hdr)
    if (w, h) == (323, 302):
        print("Coral sprite already repaired: 323x302")
        return
    after = repair(before)
    a.filename.write_bytes(after)
    print(f"Coral asset repaired: {w}x{h} → {w}x{h-TRIM_TOP}, {len(before)} → {len(after)} bytes")

if __name__ == "__main__":
    main()
