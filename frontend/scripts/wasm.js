import { setWasmLoading, setWasmReady, wasmLoading, wasmReady } from "./state.js";
import { resize } from "./canvas.js";
import { normalizePath } from "./utils.js";
import { routeToWasm, themeFnFor } from "./router.js";

let wasmPromise = null;

// Resolves once the emscripten runtime is initialized — i.e. exported
// functions like md_to_html are actually callable. The script's onload fires
// earlier (the wasm compile is still pending), so callers that need a ready
// runtime must wait on this, not on loadWasm()'s return value.
let resolveReady, rejectReady;
const readyPromise = new Promise((resolve, reject) => {
  resolveReady = resolve;
  rejectReady = reject;
});
// Avoid unhandled-rejection noise on pages that never wait on the runtime.
readyPromise.catch(() => {});

export function whenWasmReady() {
  return readyPromise;
}

export function loadWasm() {
  if (wasmReady) return Promise.resolve();
  if (wasmPromise) return wasmPromise;

  setWasmLoading(true);

  window.Module = {
    ...(window.Module || {}),
    locateFile(path) {
      if (path.endsWith(".data") || path.endsWith(".wasm")) {
        return `/build/${path}`;
      }
      return path;
    },
    onRuntimeInitialized() {
      setWasmReady(true);
      setWasmLoading(false);
      resolveReady();
      resize();

      const path = normalizePath(location.pathname);
      routeToWasm(path);

      const fn = themeFnFor(path);
      if (fn) Module[fn]?.(document.body.classList.contains("light") ? 1 : 0);
    },
  };

  wasmPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/build/site.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      setWasmLoading(false);
      const err = new Error("Failed to load /build/site.js");
      rejectReady(err);
      reject(err);
    };
    document.head.appendChild(script);
  });

  return wasmPromise;
}

export function pauseWasmRendering(paused) {
  if (!wasmReady && !wasmLoading) return;
  window.Module?._set_render_paused?.(paused ? 1 : 0);
}
