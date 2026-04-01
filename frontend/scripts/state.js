export let wasmReady = false;
export let canvasReady = false;

export let canvas = null;
export let lastX = 0;
export let lastY = 0;

export function setCanvas(c) {
  canvas = c;
  canvasReady = true;
}

export function setLast(x, y) {
  lastX = x;
  lastY = y;
}
