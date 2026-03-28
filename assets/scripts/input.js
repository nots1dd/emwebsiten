import { canvas, lastX, lastY, setLast } from "./state.js";

export function initInput() {
  document.addEventListener("mousemove", (e) => {
    if (!canvas || !Module) return;

    const dpr = window.devicePixelRatio || 1;

    const x = e.clientX * dpr;
    const y = e.clientY * dpr;

    const nx = x / canvas.width;
    const ny = 1.0 - (y / canvas.height);

    Module._set_mouse?.(nx, ny);

    const dx = (e.movementX || (x - lastX)) * dpr;
    const dy = (e.movementY || (y - lastY)) * dpr;

    Module._accumulate_mouse_delta?.(dx, dy);

    setLast(x, y);
  }, { passive: true });
}
