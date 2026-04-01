import { normalizePath } from "./utils.js";

export const ROUTES = {
  "/": "/frontend/pages/home.html",
  "/about": "/frontend/pages/about.html",
  "/blog": "/frontend/pages/blogs.html",
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

function attachCardHandlers() {
  document.querySelectorAll('.card').forEach(card => {
    card.onclick = () => {
      const url = card.dataset.url;
      if (url) window.open(url, '_blank');
    };
  });
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

  setTimeout(() => {
    const first = document.querySelector(".card");
    if (first) first.focus();
  }, 0);

  attachCardHandlers();
}

function moveNavHighlight(activeEl) {
  const highlight = document.querySelector(".nav-highlight");
  if (!highlight || !activeEl) return;

  const rect = activeEl.getBoundingClientRect();
  const parentRect = activeEl.parentElement.getBoundingClientRect();

  highlight.style.width = `${rect.width}px`;
  highlight.style.height = `${rect.height}px`;
  highlight.style.transform = `translateX(${rect.left - parentRect.left}px)`;
}

export function setActiveLink(path) {
  const links = document.querySelectorAll(".nav-links a");
  let activeEl = null;

  links.forEach(a => {
    const isActive = a.dataset.route === path;
    a.classList.toggle("active", isActive);
    if (isActive) activeEl = a;
  });

  moveNavHighlight(activeEl);
}

