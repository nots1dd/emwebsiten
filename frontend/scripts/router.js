import { normalizePath } from "./utils.js";

export const ROUTES = {
  "/": "/frontend/pages/home.html",
  "/about": "/frontend/pages/about.html",
  "/blog": "/frontend/pages/blog.html",
  "/projects": "/frontend/pages/projects.html",
};

export function routeToWasm(path) {
  if (!Module) return;

  switch (path) {
    case "/":
      Module._navigate_home?.();
      break;
    case "/about":
      Module._navigate_about?.();
      break;
  }
}

export function initRouter() {
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

export async function navigate(path) {
  if (!(path in ROUTES)) path = "/";

  history.pushState({}, "", path);
  await renderRoute(path);
}

export async function renderRoute(path) {
  path = normalizePath(path);
  const main = document.querySelector("main");

  const view = ROUTES[path] || ROUTES["/"];
  const html = await fetch(view).then(r => r.text());

  main.innerHTML = html;

  const finalPath = path in ROUTES ? path : "/";
  setActiveLink(finalPath);

  routeToWasm(finalPath);
}

export function setActiveLink(path) {
  document.querySelectorAll(".nav-links a").forEach(a => {
    a.classList.toggle("active", a.dataset.route === path);
  });
}
