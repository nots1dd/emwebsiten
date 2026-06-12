#!/usr/bin/env python3
# ============================================================
# gen_creeper.py
#
# Generates assets/textures/creeper.png — a 24x14 RGBA pixel
# Minecraft "creeper" lying down on the grass (blocky body,
# mottled green camo, classic creeper face) for the About forest
# scene (iChannel1). Pure stdlib. Sampled NEAREST + CLAMP.
# ============================================================

import os
import struct
import zlib

W, H = 24, 14

GREEN_A = (96, 176, 86, 255)
GREEN_B = (60, 136, 62, 255)
FACE    = (24, 28, 24, 255)
OUTLINE = (14, 18, 14, 255)
CLEAR   = (0, 0, 0, 0)

# classic creeper face, 8x8 (X = dark)
CREEPER = [
    "........",
    ".XX..XX.",
    ".XX..XX.",
    "...XX...",
    "..XXXX..",
    "..X..X..",
    "..X..X..",
    "........",
]


def camo(x, y):
    n = (x * 374761393 + y * 668265263) & 0xFFFFFFFF
    n = (n ^ (n >> 13)) * 1274126177 & 0xFFFFFFFF
    return "A" if (n >> 16) & 1 else "B"


def material(x, y):
    body = 2 <= x <= 21 and 2 <= y <= 10
    leg  = (11 <= y <= 12) and x in (4, 5, 9, 10, 14, 15, 19, 20)
    if not (body or leg):
        return " "
    # creeper face, centred on the body
    if 8 <= x <= 15 and 3 <= y <= 10 and CREEPER[y - 3][x - 8] == "X":
        return "F"
    return camo(x, y)


COLOR = {"A": GREEN_A, "B": GREEN_B, "F": FACE, "O": OUTLINE, " ": CLEAR}


def build():
    mat = [[material(x, y) for x in range(W)] for y in range(H)]
    out = [row[:] for row in mat]
    for y in range(H):
        for x in range(W):
            if mat[y][x] != " ":
                continue
            if any(0 <= y + dy < H and 0 <= x + dx < W and mat[y + dy][x + dx] != " "
                   for dy in (-1, 0, 1) for dx in (-1, 0, 1)):
                out[y][x] = "O"
    return out


def png_chunk(tag, data):
    chunk = tag + data
    return struct.pack(">I", len(data)) + chunk + struct.pack(">I", zlib.crc32(chunk) & 0xFFFFFFFF)


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.join(here, "..", "assets", "textures")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.normpath(os.path.join(out_dir, "creeper.png"))

    grid = build()
    raw = bytearray()
    for y in range(H):
        raw.append(0)
        for x in range(W):
            raw += bytes(COLOR[grid[y][x]])

    ihdr = struct.pack(">IIBBBBB", W, H, 8, 6, 0, 0, 0)
    idat = zlib.compress(bytes(raw), 9)
    png = b"\x89PNG\r\n\x1a\n" + png_chunk(b"IHDR", ihdr) + png_chunk(b"IDAT", idat) + png_chunk(b"IEND", b"")
    with open(out_path, "wb") as f:
        f.write(png)
    print(f"wrote {out_path} ({W}x{H}, {len(png)} bytes)")


if __name__ == "__main__":
    main()
