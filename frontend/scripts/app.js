import { loadComponent } from "./components.js";
import { initCanvas } from "./canvas.js";
import { initInput } from "./input.js";
import { initTheme } from "./theme.js";
import { initRouter, renderRoute } from "./router.js";

async function init() {
  await loadComponent("navbar", "/frontend/components/navbar.html");

  initCanvas();
  initInput();
  initTheme();
  initRouter();

  renderRoute(location.pathname);

  await loadComponent("footer", "/frontend/components/footer.html");
}

window.addEventListener("DOMContentLoaded", () => {
  if (location.pathname.startsWith("/frontend/")) {
    history.replaceState({}, "", "/");
  }

  init();
});
