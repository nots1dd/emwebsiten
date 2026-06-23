export let wasmReady = false;
export let wasmLoading = false;
export let canvasReady = false;
export let minimalMode = false;

export let canvas = null;
export let lastX = 0;
export let lastY = 0;

export function setCanvas(c) {
  canvas = c;
  canvasReady = true;
}

export function setWasmReady(ready) {
  wasmReady = ready;
}

export function setWasmLoading(loading) {
  wasmLoading = loading;
}

export function setMinimalModeState(enabled) {
  minimalMode = enabled;
}

export function setLast(x, y) {
  lastX = x;
  lastY = y;
}
