import { canvas, setCanvas } from "./state.js";
import { canvasReady } from "./state.js";

function tryResize() {
  if (!canvasReady) return;

  resize();
}

export let canvasMode = false;

export function toggleCanvasMode() {
  canvasMode = !canvasMode;

  document.body.classList.toggle("canvas-mode", canvasMode);
}

export function initCanvas() {
  const c = document.getElementById("canvas");
  if (!c) return;

  setCanvas(c);
  window.Module = window.Module || {};
  window.Module.canvas = c;

  tryResize();

  window.addEventListener("resize", () => {
    requestAnimationFrame(resize);
  });
}

// The shaders are pixel-art: everything is quantised to PIXEL-sized blocks and
// scanlines are computed in device pixels. Rendering the WebGL backing store at
// a phone's full devicePixelRatio (often 2.5-3.5) both shrinks the pixel-art
// blocks below visibility (look breaks) and multiplies the per-fragment cost
// (frame drops / heat). Cap it — extra device resolution is wasted by design.
const MAX_DPR = 2;

export function resize() {
  if (!canvas) return;

  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  const w = window.innerWidth;
  const h = window.innerHeight;

  canvas.width  = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);

  canvas.style.width  = w + "px";
  canvas.style.height = h + "px";

  if (window.Module?._set_resolution) {
    window.Module._set_resolution(canvas.width, canvas.height);
  }
}
