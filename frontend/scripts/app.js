import { loadComponent } from "./components.js";
import { initCanvas } from "./canvas.js";
import { initInput } from "./input.js";
import { initTheme } from "./theme.js";
import { initRouter, renderRoute } from "./router.js";
import { initKeys } from "./keys.js";

async function init() {
  await loadComponent("navbar", "/frontend/components/navbar.html");

  initCanvas();
  initInput();
  initKeys();
  initTheme();
  initRouter();

  await loadComponent("footer", "/frontend/components/footer.html");

  await renderRoute(location.pathname);
}

window.addEventListener("DOMContentLoaded", () => {
  init();
});
