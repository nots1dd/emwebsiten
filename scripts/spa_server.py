#!/usr/bin/env python3
# ============================================================
# spa_server.py
#
# Static file server with single-page-app fallback and Last.fm
# API proxy for the now-playing widget.
#
# Real files (e.g. /build/site.wasm, /frontend/scripts/app.js,
# /public/blogs/test.md) are served as-is. Any other path that
# does not exist on disk and is not an asset request falls back
# to index.html, so client-side routes such as /about or
# /blog/test1 load correctly on direct navigation or refresh.
#
# The /api/now-playing endpoint is proxied to Last.fm's API so
# the footer widget works in local dev without exposing the API
# key to client-side code. Set LASTFM_API_KEY and LASTFM_USER
# in the environment to activate.
# ============================================================

import argparse
import json
import os
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit


API_KEY = os.environ.get("LASTFM_API_KEY", "")
API_USER = os.environ.get("LASTFM_USER", "nots1dd")


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

        # Proxy /api/now-playing to Last.fm (keeps API key server-side).
        if url_path == "/api/now-playing":
            return self._proxy_lastfm()

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

    def _proxy_lastfm(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()

        if not API_KEY:
            self.wfile.write(json.dumps({"error": "not configured"}).encode())
            return

        url = (
            f"https://ws.audioscrobbler.com/2.0/"
            f"?method=user.getrecenttracks"
            f"&user={API_USER}&api_key={API_KEY}&format=json&limit=1"
        )
        try:
            with urllib.request.urlopen(url, timeout=5) as resp:
                data = json.loads(resp.read())
            track = (data or {}).get("recenttracks", {}).get("track", [None])[0]
            if not track:
                self.wfile.write(json.dumps({"error": "no tracks"}).encode())
                return
            result = {
                "nowplaying": bool(track.get("@attr", {}).get("nowplaying")),
                "artist": track.get("artist", {}).get("#text", ""),
                "name": track.get("name", ""),
                "album": track.get("album", {}).get("#text", ""),
                "image": next(
                    (i["#text"] for i in track.get("image", []) if i.get("size") == "small"),
                    "",
                ),
            }
            self.wfile.write(json.dumps(result).encode())
        except Exception:
            self.wfile.write(json.dumps({"error": "fetch failed"}).encode())

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
