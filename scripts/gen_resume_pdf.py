#!/usr/bin/env python3
# ============================================================
# gen_resume_pdf.py
#
# Writes a minimal, valid one-page placeholder resume.pdf to the
# project root (served at /resume.pdf). Pure stdlib — no PDF
# library. Replace the generated file with your real resume.
# ============================================================

import os


def esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


# (text, font size, y) lines, top-down on a US-Letter page (612x792)
LINES = [
    ("Sid K", 28, 720),
    ("placeholder resume", 13, 692),
    ("", 12, 676),
    ("This is a generated placeholder.", 12, 660),
    ("Replace  resume.pdf  at the project root with your real resume,", 12, 642),
    ("then it will show in the /resume viewer and download at /resume.pdf.", 12, 624),
    ("", 12, 600),
    ("- built-in PDF viewer (no extra dependencies)", 12, 582),
    ("- matches the site's glass + pixel theme", 12, 564),
]


def content_stream() -> bytes:
    parts = []
    for text, size, y in LINES:
        if not text:
            continue
        parts.append(f"BT /F1 {size} Tf 64 {y} Td ({esc(text)}) Tj ET")
    return ("\n".join(parts) + "\n").encode("latin-1")


def build_pdf() -> bytes:
    content = content_stream()

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(content)).encode() + b" >>\nstream\n" + content + b"endstream",
    ]

    out = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = []
    for i, body in enumerate(objects, start=1):
        offsets.append(len(out))
        out += f"{i} 0 obj\n".encode() + body + b"\nendobj\n"

    xref_pos = len(out)
    n = len(objects) + 1
    out += f"xref\n0 {n}\n".encode()
    out += b"0000000000 65535 f \n"
    for off in offsets:
        out += f"{off:010d} 00000 n \n".encode()
    out += (
        f"trailer\n<< /Size {n} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode()
    )
    return bytes(out)


def main() -> None:
    here = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.normpath(os.path.join(here, "..", "resume.pdf"))
    with open(out_path, "wb") as f:
        f.write(build_pdf())
    print(f"wrote {out_path} ({os.path.getsize(out_path)} bytes)")


if __name__ == "__main__":
    main()
