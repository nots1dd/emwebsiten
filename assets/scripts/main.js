// ============================================================
// GLOBAL STATE
// ============================================================

let canvas = null;
let lastX = 0;
let lastY = 0;

// ============================================================
// COMPONENT LOADER
// ============================================================

async function loadComponent(id, path) {
  const res = await fetch(path);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}

// ============================================================
// THEME SYSTEM
// ============================================================

function initTheme() {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  // apply saved theme
  const saved = localStorage.getItem("theme");
  if (saved === "light") {
    document.body.classList.add("light");
    toggle.textContent = "☀️";
  }

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("light");

    const isLight = document.body.classList.contains("light");
    toggle.textContent = isLight ? "☀️" : "🌙";
    toggle.innerHTML = isLight ? "☀️" : "🌙";

    localStorage.setItem("theme", isLight ? "light" : "dark");
  });
}

// ============================================================
// CANVAS + RENDER SETUP
// ============================================================

function initCanvas() {
  canvas = document.getElementById("canvas");
  if (!canvas) return;

  Module.canvas = canvas;

  resize();
  window.addEventListener("resize", resize);
}

// ============================================================
// RESIZE (DPR CORRECT)
// ============================================================

function resize() {
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;

  const w = window.innerWidth;
  const h = window.innerHeight;

  canvas.width  = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);

  canvas.style.width  = w + "px";
  canvas.style.height = h + "px";

  // notify WASM
  if (Module && Module._set_resolution) {
    Module._set_resolution(canvas.width, canvas.height);
  }
}

// ============================================================
// INPUT SYSTEM (MOUSE)
// ============================================================

function initMouse() {
  document.addEventListener("mousemove", (e) => {
    if (!canvas || !Module) return;

    const rect = canvas.getBoundingClientRect();
    const dpr  = window.devicePixelRatio || 1;

    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;

    const nx = x / canvas.width;
    const ny = 1.0 - (y / canvas.height);

    if (Module._set_mouse)
      Module._set_mouse(nx, ny);

    const dx = e.movementX || (x - lastX);
    const dy = e.movementY || (y - lastY);

    if (Module._accumulate_mouse_delta)
      Module._accumulate_mouse_delta(dx, dy);

    lastX = x;
    lastY = y;
  });
}

// ============================================================
// APP INIT (ORDER MATTERS)
// ============================================================

async function init() {
  // 1. Load UI components first
  await loadComponent("navbar", "/assets/components/navbar.html");

  // 2. Initialize systems AFTER DOM is ready
  initTheme();
  initCanvas();
  initMouse();
}

// ============================================================
// ENTRY POINT
// ============================================================

window.addEventListener("DOMContentLoaded", init);
