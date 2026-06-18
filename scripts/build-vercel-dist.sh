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
cp "${BUILD_DIR}/site.js" "${DIST_DIR}/build/site.js"
cp "${BUILD_DIR}/site.wasm" "${DIST_DIR}/build/site.wasm"
cp "${BUILD_DIR}/site.data" "${DIST_DIR}/build/site.data"

printf 'Vercel static bundle written to %s\n' "${DIST_DIR}"
