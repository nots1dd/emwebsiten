import { canvas, setCanvas } from "./state.js";
import { canvasReady } from "./state.js";

function tryResize() {
  if (!canvasReady) return;

  resize();
}

export function initCanvas() {
  const c = document.getElementById("canvas");
  if (!c) return;

  setCanvas(c);
  Module.canvas = c;

  tryResize();

  window.addEventListener("resize", () => {
    requestAnimationFrame(resize);
  });
}

export function resize() {
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;

  canvas.width  = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);

  canvas.style.width  = w + "px";
  canvas.style.height = h + "px";

  if (Module && Module._set_resolution) {
    Module._set_resolution(canvas.width, canvas.height);
  }

  console.log("[resize]", {
    window: `${w}x${h}`,
    canvas: `${canvas.width}x${canvas.height}`,
  });
}
