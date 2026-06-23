import { canvas, lastX, lastY, setLast } from "./state.js";

export function initInput() {
  document.addEventListener("mousemove", (e) => {
    if (!canvas || !window.Module) return;

    // Match the capped dpr used to size the canvas (see canvas.js MAX_DPR),
    // so clientX/Y normalise against canvas.width/height consistently.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const x = e.clientX * dpr;
    const y = e.clientY * dpr;

    const nx = x / canvas.width;
    const ny = 1.0 - (y / canvas.height);

    window.Module._set_mouse?.(nx, ny);

    const dx = (e.movementX || (x - lastX)) * dpr;
    const dy = (e.movementY || (y - lastY)) * dpr;

    window.Module._accumulate_mouse_delta?.(dx, dy);

    setLast(x, y);
  }, { passive: true });
}
