// ============================================================
// GLOBAL STATE
// ============================================================

let wasmReady = false;
let canvasReady = false;
let canvas = null;
let lastX = 0;
let lastY = 0;

const ROUTES = {
  "/": "/assets/pages/home.html",
  "/about": "/assets/pages/about.html",
  "/blog": "/assets/pages/blog.html",
  "/projects": "/assets/pages/projects.html",
};

function normalizePath(path) {
  return path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
}

function initRouter() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-link]");
    if (!link) return;

    e.preventDefault();

    const route = link.dataset.route;
    if (!route) return;

    navigate(route);
  });

  window.addEventListener("popstate", () => {
    renderRoute(location.pathname);
  });
}

async function navigate(path) {
  if (!(path in ROUTES)) path = "/"; // prevent bad routes

  history.pushState({}, "", path);
  await renderRoute(path);
}

async function renderRoute(path) {
  path = normalizePath(path);
  const main = document.querySelector("main");

  // fallback to "/" if unknown route
  const view = ROUTES[path] || ROUTES["/"];

  const html = await fetch(view).then(r => r.text());
  main.innerHTML = html;

  setActiveLink(path in ROUTES ? path : "/");
}

function setActiveLink(path) {
  document.querySelectorAll(".nav-links a").forEach(a => {
    a.classList.toggle("active", a.dataset.route === path);
  });
}

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

const ICON_MOON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
const ICON_SUN  = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

function initTheme() {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  const saved = localStorage.getItem("theme");
  const isLight = saved === "light";
  if (isLight) document.body.classList.add("light");
  toggle.innerHTML = isLight ? ICON_SUN : ICON_MOON;

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const nowLight = document.body.classList.contains("light");
    toggle.innerHTML = nowLight ? ICON_SUN : ICON_MOON;
    localStorage.setItem("theme", nowLight ? "light" : "dark");
  });
}

// ============================================================
// CANVAS + RENDER SETUP
// ============================================================

function tryResize() {
  if (!canvasReady) return;

  resize();
}

function initCanvas() {
  canvas = document.getElementById("canvas");
  if (!canvas) return;

  Module.canvas = canvas;
  canvasReady = true;

  // initial resize (DOM ready)
  tryResize();

  window.addEventListener("resize", () => {
    requestAnimationFrame(resize);
  });
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

  if (wasmReady && Module && Module._set_resolution) {
    Module._set_resolution(canvas.width, canvas.height);
  }

  console.log("[resize]", {
    window: `${w}x${h}`,
    canvas: `${canvas.width}x${canvas.height}`,
    wasmReady
  });
}

// ============================================================
// INPUT SYSTEM (MOUSE)
// ============================================================

function initInput() {
  document.addEventListener("mousemove", (e) => {
    if (!canvas || !Module) return;
    if (canvas.width === 0 || canvas.height === 0) return;

    const dpr  = window.devicePixelRatio || 1;

    // -----------------------------
    // Canvas space (for shader)
    // -----------------------------
    const x = (e.clientX) * dpr;
    const y = (e.clientY) * dpr;

    const nx = x / canvas.width;
    const ny = 1.0 - (y / canvas.height);

    if (Module._set_mouse)
      Module._set_mouse(nx, ny);

    const dx = (e.movementX || (x - lastX)) * dpr;
    const dy = (e.movementY || (y - lastY)) * dpr;

    if (Module._accumulate_mouse_delta)
      Module._accumulate_mouse_delta(dx, dy);

    lastX = x;
    lastY = y;
  }, { passive: true });
}

// ============================================================
// APP INIT (ORDER MATTERS)
// ============================================================

async function init() {
  // 1. Load UI components first
  await loadComponent("navbar", "/assets/components/navbar.html");

  // 2. Initialize systems AFTER DOM is ready
  initCanvas();
  initInput();
  initTheme();
  initRouter();
  renderRoute(location.pathname);

  await loadComponent("footer", "/assets/components/footer.html");
}

// ============================================================
// ENTRY POINT
// ============================================================

window.addEventListener("DOMContentLoaded", () => {
  if (location.pathname.startsWith("/assets/")) {
    history.replaceState({}, "", "/");
  }

  init();
});
