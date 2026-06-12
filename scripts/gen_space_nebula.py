#!/usr/bin/env python3
# ============================================================
# gen_space_nebula.py
#
# Generates assets/textures/space-nebula.png — a seamless
# (tileable) 128x128 grayscale domain-warped fbm used by the
# Home black-hole scene (iChannel0) for nebula clouds, accretion
# turbulence and planet banding. Pure stdlib (zlib + struct).
# Sampled NEAREST + REPEAT.
# ============================================================

import math
import os
import struct
import zlib

SIZE = 128
SEED = 7

PERIODS = (4, 8, 16, 32, 64)  # all divide SIZE -> seamless tiling


def rng(ix, iy, s):
    n = (ix * 374761393 + iy * 668265263 + s * 2147483647) & 0xFFFFFFFF
    n = (n ^ (n >> 13)) * 1274126177 & 0xFFFFFFFF
    return ((n ^ (n >> 16)) & 0xFFFFFFFF) / 4294967295.0


def smooth(t):
    return t * t * (3.0 - 2.0 * t)


def tnoise(x, y, period, s):
    x0, y0 = math.floor(x), math.floor(y)
    fx, fy = x - x0, y - y0
    x0 %= period; y0 %= period
    x1 = (x0 + 1) % period; y1 = (y0 + 1) % period
    a = rng(x0, y0, s); b = rng(x1, y0, s)
    c = rng(x0, y1, s); d = rng(x1, y1, s)
    ux, uy = smooth(fx), smooth(fy)
    return (a * (1 - ux) + b * ux) * (1 - uy) + (c * (1 - ux) + d * ux) * uy


def fbm(u, v, s):
    total = amp = 0.0
    a = 0.5
    for period in PERIODS:
        total += a * tnoise(u * period, v * period, period, s)
        amp += a
        a *= 0.5
    return total / amp


def warped(u, v):
    # domain warp for wispy nebula filaments (offsets are integers -> still tiles)
    qx = fbm(u, v, SEED)
    qy = fbm(u + 0.31, v + 0.17, SEED + 11)
    return fbm(u + 0.6 * qx, v + 0.6 * qy, SEED + 23)


def png_chunk(tag, data):
    chunk = tag + data
    return struct.pack(">I", len(data)) + chunk + struct.pack(">I", zlib.crc32(chunk) & 0xFFFFFFFF)


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.join(here, "..", "assets", "textures")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.normpath(os.path.join(out_dir, "space-nebula.png"))

    raw = bytearray()
    for y in range(SIZE):
        raw.append(0)
        for x in range(SIZE):
            n = warped(x / SIZE, y / SIZE)
            n = max(0.0, min(1.0, (n - 0.45) * 1.5 + 0.45))  # contrast for filaments
            v = int(n * 255.0 + 0.5)
            raw += bytes((v, v, v))

    ihdr = struct.pack(">IIBBBBB", SIZE, SIZE, 8, 2, 0, 0, 0)  # RGB8
    idat = zlib.compress(bytes(raw), 9)
    png = b"\x89PNG\r\n\x1a\n" + png_chunk(b"IHDR", ihdr) + png_chunk(b"IDAT", idat) + png_chunk(b"IEND", b"")
    with open(out_path, "wb") as f:
        f.write(png)
    print(f"wrote {out_path} ({SIZE}x{SIZE}, {len(png)} bytes)")


if __name__ == "__main__":
    main()
