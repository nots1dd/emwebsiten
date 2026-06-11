#!/usr/bin/env python3
# ============================================================
# gen_pixel_palette.py
#
# Generates assets/textures/pixel-palette.png — a small 8-color
# retro palette ramp used by the blog page's pixel shader as a
# dither lookup (iChannel0). Pure stdlib (zlib + struct), no PIL.
#
# Layout: 8 columns (one per dither level), a few rows tall so it
# is also visible as a texture. Sampled with NEAREST + CLAMP.
# ============================================================

import os
import struct
import zlib

# Deep indigo -> violet -> magenta -> warm -> cyan -> near-white.
# Reads well as a dark-themed gradient; the *-inv shader flips the lookup.
PALETTE = [
    (0x0d, 0x0b, 0x2b),
    (0x24, 0x16, 0x5a),
    (0x4b, 0x1d, 0x8f),
    (0x8a, 0x1f, 0x9e),
    (0xc4, 0x2d, 0x8a),
    (0xf0, 0x6b, 0x6b),
    (0x6b, 0xe0, 0xd0),
    (0xe8, 0xf2, 0xff),
]

WIDTH = len(PALETTE)
HEIGHT = 8


def png_chunk(tag: bytes, data: bytes) -> bytes:
    chunk = tag + data
    return struct.pack(">I", len(data)) + chunk + struct.pack(">I", zlib.crc32(chunk) & 0xFFFFFFFF)


def main() -> None:
    here = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.join(here, "..", "assets", "textures")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.normpath(os.path.join(out_dir, "pixel-palette.png"))

    # Raw image: each scanline prefixed with filter byte 0, RGB8.
    raw = bytearray()
    for _ in range(HEIGHT):
        raw.append(0)
        for (r, g, b) in PALETTE:
            raw += bytes((r, g, b))

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", WIDTH, HEIGHT, 8, 2, 0, 0, 0)  # 8-bit, color type 2 (RGB)
    idat = zlib.compress(bytes(raw), 9)

    png = sig + png_chunk(b"IHDR", ihdr) + png_chunk(b"IDAT", idat) + png_chunk(b"IEND", b"")

    with open(out_path, "wb") as f:
        f.write(png)

    print(f"wrote {out_path} ({WIDTH}x{HEIGHT}, {len(png)} bytes)")


if __name__ == "__main__":
    main()
