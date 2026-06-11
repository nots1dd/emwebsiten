#!/usr/bin/env python3
# ============================================================
# gen_cursors.py
#
# Generates retro pixel cursors into frontend/cursors/ (served
# over HTTP for CSS `cursor:` — NOT bundled into the wasm):
#   cursor-arrow.png   default arrow      (hotspot 0,0)
#   cursor-target.png  crosshair/target   (hotspot center)
# Pure stdlib (zlib + struct), RGBA, drawn at 16x16 then scaled
# x2 -> 32x32 chunky pixels (browser cursor cap is 32x32).
# ============================================================

import os
import struct
import zlib

SCALE = 2
N = 16

BLACK = (12, 12, 16, 255)
WHITE = (236, 238, 245, 255)
ACCENT = (107, 224, 208, 255)   # teal (#6be0d0)
CLEAR = (0, 0, 0, 0)

# Arrow: B = outline, W = fill, '.' = transparent. Rows padded to N.
ARROW = [
    "B",
    "BB",
    "BWB",
    "BWWB",
    "BWWWB",
    "BWWWWB",
    "BWWWWWB",
    "BWWWWWWB",
    "BWWWWWWWB",
    "BWWWWWWWWB",
    "BWWWWBBBBBB",
    "BWWBWB",
    "BWB.BWB",
    "BB..BWB",
    "B....BWB",
    "......BB",
]


def arrow_grid():
    g = [[CLEAR] * N for _ in range(N)]
    for y, row in enumerate(ARROW):
        for x in range(N):
            c = row[x] if x < len(row) else "."
            g[y][x] = BLACK if c == "B" else WHITE if c == "W" else CLEAR
    return g


def target_grid():
    # crosshair: teal arms with a center gap + dot, derived black outline
    teal = [[False] * N for _ in range(N)]
    for y in range(N):
        for x in range(N):
            vert = x in (7, 8) and abs(y - 7.5) > 2.0 and 1 <= y <= 14
            horiz = y in (7, 8) and abs(x - 7.5) > 2.0 and 1 <= x <= 14
            dot = x in (7, 8) and y in (7, 8)
            teal[y][x] = vert or horiz or dot

    g = [[CLEAR] * N for _ in range(N)]
    for y in range(N):
        for x in range(N):
            if teal[y][x]:
                g[y][x] = ACCENT
                continue
            # outline = transparent pixel touching a teal pixel (8-neighbour)
            edge = any(
                0 <= y + dy < N and 0 <= x + dx < N and teal[y + dy][x + dx]
                for dy in (-1, 0, 1) for dx in (-1, 0, 1)
            )
            if edge:
                g[y][x] = BLACK
    return g


def png_chunk(tag, data):
    chunk = tag + data
    return struct.pack(">I", len(data)) + chunk + struct.pack(">I", zlib.crc32(chunk) & 0xFFFFFFFF)


def write_png(path, grid):
    w = h = N * SCALE
    raw = bytearray()
    for y in range(N):
        for _ in range(SCALE):
            raw.append(0)  # filter byte
            for x in range(N):
                px = grid[y][x]
                for _ in range(SCALE):
                    raw += bytes(px)
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)  # RGBA8
    idat = zlib.compress(bytes(raw), 9)
    png = b"\x89PNG\r\n\x1a\n" + png_chunk(b"IHDR", ihdr) + png_chunk(b"IDAT", idat) + png_chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)
    print(f"wrote {path} ({w}x{h})")


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.normpath(os.path.join(here, "..", "frontend", "cursors"))
    os.makedirs(out_dir, exist_ok=True)
    write_png(os.path.join(out_dir, "cursor-arrow.png"), arrow_grid())
    write_png(os.path.join(out_dir, "cursor-target.png"), target_grid())


if __name__ == "__main__":
    main()
