#!/usr/bin/env python3
# ============================================================
# spa_server.py
#
# Static file server with single-page-app fallback.
#
# Real files (e.g. /build/site.wasm, /frontend/scripts/app.js,
# /public/blogs/test.md) are served as-is. Any other path that
# does not exist on disk and is not an asset request falls back
# to index.html, so client-side routes such as /about or
# /blog/test1 load correctly on direct navigation or refresh.
# ============================================================

import argparse
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit


class SPARequestHandler(SimpleHTTPRequestHandler):
    # Ensure correct MIME types for the emscripten artifacts.
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".wasm": "application/wasm",
        ".data": "application/octet-stream",
    }

    def do_GET(self):  # noqa: N802 (stdlib naming)
        url_path = urlsplit(self.path).path
        fs_path = self.translate_path(self.path)

        # Serve directories and existing files normally.
        if os.path.isdir(fs_path) or os.path.exists(fs_path):
            return super().do_GET()

        # A missing path that looks like a file (has an extension in its
        # last segment) is a genuine 404 — let the parent emit it.
        last_segment = url_path.rsplit("/", 1)[-1]
        if "." in last_segment:
            return super().do_GET()

        # Otherwise this is a client-side route: serve the SPA shell.
        self.path = "/index.html"
        return super().do_GET()

    def end_headers(self):
        # Dev server: never cache, so rebuilt WASM/JS is always picked up.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main():
    parser = argparse.ArgumentParser(description="SPA-aware static file server")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument("--directory", default=os.getcwd())
    args = parser.parse_args()

    os.chdir(args.directory)

    server = ThreadingHTTPServer((args.host, args.port), SPARequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
