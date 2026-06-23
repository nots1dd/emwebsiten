import { setWasmLoading, setWasmReady, wasmLoading, wasmReady } from "./state.js";
import { resize } from "./canvas.js";
import { normalizePath } from "./utils.js";
import { routeToWasm, themeFnFor } from "./router.js";

let wasmPromise = null;

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
      reject(new Error("Failed to load /build/site.js"));
    };
    document.head.appendChild(script);
  });

  return wasmPromise;
}

export function pauseWasmRendering(paused) {
  if (!wasmReady && !wasmLoading) return;
  window.Module?._set_render_paused?.(paused ? 1 : 0);
}
