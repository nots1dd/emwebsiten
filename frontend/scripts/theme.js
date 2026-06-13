import { normalizePath } from "./utils.js";
import { themeFnFor } from "./router.js";

const THEME_ANIM_MS = 550;
let themeAnimTimer = null;

// Smoothly recolor the DOM: ease themed properties for one switch window and
// bloom a radial ripple out of the toggle button (origin works for click and
// keyboard since it reads the button's position, not a pointer event).
function runThemeTransition(toLight) {
  const body = document.body;

  body.classList.add("theme-transition");
  clearTimeout(themeAnimTimer);
  themeAnimTimer = setTimeout(() => body.classList.remove("theme-transition"), THEME_ANIM_MS);

  const sweep = document.getElementById("theme-sweep");
  const btn = document.getElementById("theme-toggle");
  if (!sweep || !btn) return;

  const r = btn.getBoundingClientRect();
  const ox = r.left + r.width / 2;
  const oy = r.top + r.height / 2;
  // radius that reaches the farthest screen corner from the origin
  const radius = Math.hypot(Math.max(ox, innerWidth - ox), Math.max(oy, innerHeight - oy));

  sweep.style.left = `${ox}px`;
  sweep.style.top = `${oy}px`;
  sweep.style.width = sweep.style.height = `${radius * 2}px`;
  // tint of the incoming theme
  sweep.style.setProperty("--sweep-color", toLight ? "rgba(245,245,245,0.5)" : "rgba(10,10,10,0.55)");

  sweep.classList.remove("run");
  void sweep.offsetWidth;            // reflow so the animation restarts
  sweep.classList.add("run");
}

export function toggleTheme() {
  const toggle = document.getElementById("theme-toggle");

  document.body.classList.toggle("light");

  const nowLight = document.body.classList.contains("light");

  // Smooth DOM-side light <-> dark transition (mirrors the canvas recolor).
  runThemeTransition(nowLight);

  if (toggle) {
    toggle.innerHTML = nowLight ? ICON_SUN : ICON_MOON;
  }

  localStorage.setItem("theme", nowLight ? "light" : "dark");

  // Recolor the WebGL scene for the current route.
  const fn = themeFnFor(normalizePath(location.pathname));
  if (window.Module && fn) Module[fn]?.(nowLight ? 1 : 0);

  console.log("[THEME] toggled →", nowLight ? "light" : "dark");
}

export function initTheme() {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  const saved = localStorage.getItem("theme");
  const isLight = saved === "light";

  if (isLight) document.body.classList.add("light");
  toggle.innerHTML = isLight ? ICON_SUN : ICON_MOON;

  toggle.addEventListener("click", toggleTheme);
}

const ICON_MOON = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
     viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 12.79A9 9 0 1 1 11.21 3 
           7 7 0 0 0 21 12.79z"/>
</svg>`;
const ICON_SUN = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
     viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="5"/>
  <line x1="12" y1="1"  x2="12" y2="3"/>
  <line x1="12" y1="21" x2="12" y2="23"/>
  <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"/>
  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
  <line x1="1"  y1="12" x2="3"  y2="12"/>
  <line x1="21" y1="12" x2="23" y2="12"/>
  <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
  <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
</svg>`;
