import { loadComponent } from "./components.js";
import { initCanvas } from "./canvas.js";
import { initInput } from "./input.js";
import { initTheme } from "./theme.js";
import { initRouter, renderRoute } from "./router.js";
import { initKeys } from "./keys.js";
import { toggleHelp } from "./help.js";
import { initMinimalMode, toggleMinimalMode } from "./performance.js";
import { minimalMode } from "./state.js";
import { loadWasm } from "./wasm.js";
import { initLastfm } from "./lastfm.js";

// Navbar chrome buttons.
const CONTROLS = {
  back: () => history.back(),
  forward: () => history.forward(),
  help: () => toggleHelp(),
  minimal: () => toggleMinimalMode(),
};

function initControls() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    CONTROLS[btn.dataset.action]?.();
  });
}

async function init() {
  await loadComponent("navbar", "/frontend/components/navbar.html");

  initMinimalMode();
  initCanvas();
  initInput();
  initKeys();
  initTheme();
  initRouter();
  initControls();

  await loadComponent("footer", "/frontend/components/footer.html");
  initLastfm(document.getElementById("now-playing"));

  // Kick off the WASM download before the first render: blog posts need the
  // runtime's markdown renderer, so the earlier it starts the less they wait.
  if (!minimalMode) {
    loadWasm().catch((err) => console.error("[WASM]", err));
  }

  await renderRoute(location.pathname);
}

window.addEventListener("DOMContentLoaded", () => {
  init();
});
