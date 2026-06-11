#!/usr/bin/env python3
# ============================================================
# gen_lava_texture.py
#
# Generates assets/textures/lava-noise.png — a seamless (tileable)
# 64x64 grayscale fbm noise used by the Projects lava shader as a
# molten detail / height map on iChannel0. Pure stdlib (zlib +
# struct), no PIL. Sampled NEAREST + REPEAT.
# ============================================================

import math
import os
import struct
import zlib

SIZE = 64
SEED = 1337


def rng(ix: int, iy: int) -> float:
    # deterministic hash -> [0,1)
    n = (ix * 374761393 + iy * 668265263 + SEED * 2147483647) & 0xFFFFFFFF
    n = (n ^ (n >> 13)) * 1274126177 & 0xFFFFFFFF
    return ((n ^ (n >> 16)) & 0xFFFFFFFF) / 4294967295.0


def smooth(t: float) -> float:
    return t * t * (3.0 - 2.0 * t)


def tileable_value_noise(x: float, y: float, period: int) -> float:
    # lattice wraps at `period` so the result tiles over [0, period)
    x0, y0 = int(math.floor(x)), int(math.floor(y))
    fx, fy = x - x0, y - y0
    x0 %= period; y0 %= period
    x1 = (x0 + 1) % period; y1 = (y0 + 1) % period
    a = rng(x0, y0); b = rng(x1, y0)
    c = rng(x0, y1); d = rng(x1, y1)
    ux, uy = smooth(fx), smooth(fy)
    return (a * (1 - ux) + b * ux) * (1 - uy) + (c * (1 - ux) + d * ux) * uy


def fbm(u: float, v: float) -> float:
    total = 0.0
    amp = 0.5
    norm = 0.0
    for period in (4, 8, 16, 32):  # all divide SIZE -> seamless tiling
        total += amp * tileable_value_noise(u * period, v * period, period)
        norm += amp
        amp *= 0.5
    return total / norm


def png_chunk(tag: bytes, data: bytes) -> bytes:
    chunk = tag + data
    return struct.pack(">I", len(data)) + chunk + struct.pack(">I", zlib.crc32(chunk) & 0xFFFFFFFF)


def main() -> None:
    here = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.join(here, "..", "assets", "textures")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.normpath(os.path.join(out_dir, "lava-noise.png"))

    raw = bytearray()
    for y in range(SIZE):
        raw.append(0)  # filter byte
        for x in range(SIZE):
            n = fbm(x / SIZE, y / SIZE)
            # mild contrast so cracks/veins read stronger
            n = max(0.0, min(1.0, (n - 0.5) * 1.4 + 0.5))
            v = int(n * 255.0 + 0.5)
            raw += bytes((v, v, v))

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", SIZE, SIZE, 8, 2, 0, 0, 0)  # RGB8
    idat = zlib.compress(bytes(raw), 9)
    png = sig + png_chunk(b"IHDR", ihdr) + png_chunk(b"IDAT", idat) + png_chunk(b"IEND", b"")

    with open(out_path, "wb") as f:
        f.write(png)
    print(f"wrote {out_path} ({SIZE}x{SIZE}, {len(png)} bytes)")


if __name__ == "__main__":
    main()
