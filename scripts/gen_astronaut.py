#!/usr/bin/env python3
# ============================================================
# gen_astronaut.py
#
# Generates assets/textures/astronaut.png — a 16x24 RGBA pixel
# astronaut (white suit, navy visor + cyan glint, orange chest
# light, derived black outline) for the Home black-hole scene
# (iChannel1, floating sprite). Pure stdlib (zlib + struct).
# Sampled NEAREST + CLAMP.
# ============================================================

import os
import struct
import zlib

W, H = 16, 24

SUIT    = (230, 232, 240, 255)
VISOR   = (22, 38, 60, 255)
GLASS   = (120, 220, 235, 255)
ACCENT  = (240, 140, 60, 255)
BOOT    = (60, 70, 92, 255)
OUTLINE = (10, 10, 14, 255)
CLEAR   = (0, 0, 0, 0)


def material(x, y):
    fx, fy = x + 0.5, y + 0.5

    helmet = (fx - 8) ** 2 + (fy - 5.5) ** 2 <= 4.3 ** 2
    visor  = (fx - 8) ** 2 + (fy - 5.8) ** 2 <= 2.9 ** 2
    glass  = (fx - 6.9) ** 2 + (fy - 4.7) ** 2 <= 1.0 ** 2

    body = 5.0 <= fx <= 11.0 and 9.0 <= fy <= 15.0
    armL = 2.8 <= fx <= 4.8 and 10.0 <= fy <= 15.0
    armR = 11.2 <= fx <= 13.2 and 10.0 <= fy <= 15.0
    accent = 7.0 <= fx <= 9.0 and 10.5 <= fy <= 12.0

    legL = 5.0 <= fx <= 6.8 and 15.0 <= fy <= 23.0
    legR = 9.2 <= fx <= 11.0 and 15.0 <= fy <= 23.0
    leg = legL or legR

    if glass:
        return "L"
    if visor:
        return "V"
    if accent and body:
        return "A"
    if leg and fy >= 21.0:   # boots
        return "B"
    if helmet or body or armL or armR or leg:
        return "S"
    return " "


COLOR = {"S": SUIT, "V": VISOR, "L": GLASS, "A": ACCENT, "B": BOOT,
         "O": OUTLINE, " ": CLEAR}


def build():
    mat = [[material(x, y) for x in range(W)] for y in range(H)]
    # 1px black outline around the silhouette
    out = [row[:] for row in mat]
    for y in range(H):
        for x in range(W):
            if mat[y][x] != " ":
                continue
            touches = any(
                0 <= y + dy < H and 0 <= x + dx < W and mat[y + dy][x + dx] != " "
                for dy in (-1, 0, 1) for dx in (-1, 0, 1)
            )
            if touches:
                out[y][x] = "O"
    return out


def png_chunk(tag, data):
    chunk = tag + data
    return struct.pack(">I", len(data)) + chunk + struct.pack(">I", zlib.crc32(chunk) & 0xFFFFFFFF)


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.join(here, "..", "assets", "textures")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.normpath(os.path.join(out_dir, "astronaut.png"))

    grid = build()
    raw = bytearray()
    for y in range(H):
        raw.append(0)
        for x in range(W):
            raw += bytes(COLOR[grid[y][x]])

    ihdr = struct.pack(">IIBBBBB", W, H, 8, 6, 0, 0, 0)  # RGBA8
    idat = zlib.compress(bytes(raw), 9)
    png = b"\x89PNG\r\n\x1a\n" + png_chunk(b"IHDR", ihdr) + png_chunk(b"IDAT", idat) + png_chunk(b"IEND", b"")
    with open(out_path, "wb") as f:
        f.write(png)
    print(f"wrote {out_path} ({W}x{H}, {len(png)} bytes)")


if __name__ == "__main__":
    main()
