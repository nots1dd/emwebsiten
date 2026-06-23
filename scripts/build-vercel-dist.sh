#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="${ROOT_DIR}/dist"
BUILD_DIR="${ROOT_DIR}/build"

cd "${ROOT_DIR}"

if [[ ! -f "${BUILD_DIR}/site.js" || ! -f "${BUILD_DIR}/site.wasm" || ! -f "${BUILD_DIR}/site.data" ]]; then
  if ! command -v emcmake >/dev/null 2>&1 || ! command -v cmake >/dev/null 2>&1; then
    cat >&2 <<'MSG'
Missing build/site.js, build/site.wasm, or build/site.data, and emcmake/cmake is not available.

Build the WASM bundle first:
  source /path/to/emsdk/emsdk_env.sh
  make buildx

Or run this script in CI after installing Emscripten.
MSG
    exit 1
  fi

  EMCMAKE_BIN="$(command -v emcmake)"
  CMAKE_BIN="$(command -v cmake)"

  "${EMCMAKE_BIN}" "${CMAKE_BIN}" -S . -B "${BUILD_DIR}" \
    -D CMAKE_BUILD_TYPE=Release
  "${CMAKE_BIN}" --build "${BUILD_DIR}"
fi

rm -rf "${DIST_DIR}"
mkdir -p "${DIST_DIR}/build"

cp "${ROOT_DIR}/index.html" "${DIST_DIR}/"
cp -R "${ROOT_DIR}/frontend" "${DIST_DIR}/frontend"
cp -R "${ROOT_DIR}/public" "${DIST_DIR}/public"

# Bundle all CSS into a single file (11 requests -> 1).
# Order matters: base (vars) -> pixel (primitives) -> layout -> components -> pages.
CSS_BUNDLE="${DIST_DIR}/frontend/styles/bundle.css"
for f in \
  base.css pixel.css layout.css navbar.css footer.css \
  components.css vim-hints.css help.css transition.css \
  resume.css markdown.css; do
  cat "${ROOT_DIR}/frontend/styles/$f" >> "$CSS_BUNDLE"
  echo "" >> "$CSS_BUNDLE"
done

# Rewrite dist/index.html: replace first CSS <link> with bundle, drop the rest.
sed -i '0,/<link rel="stylesheet" href="\/frontend\/styles\/base\.css">/{
  s|<link rel="stylesheet" href="/frontend/styles/base.css">|<link rel="stylesheet" href="/frontend/styles/bundle.css">|
}' "${DIST_DIR}/index.html"

# Remove all other individual CSS <link> lines (pixel through markdown).
for sheet in pixel layout navbar footer components vim-hints help transition resume markdown; do
  sed -i '\|<link rel="stylesheet" href="/frontend/styles/'"$sheet"'\.css">|d' "${DIST_DIR}/index.html"
done
cp "${BUILD_DIR}/site.js" "${DIST_DIR}/build/site.js"
cp "${BUILD_DIR}/site.wasm" "${DIST_DIR}/build/site.wasm"
cp "${BUILD_DIR}/site.data" "${DIST_DIR}/build/site.data"

printf 'Vercel static bundle written to %s\n' "${DIST_DIR}"
