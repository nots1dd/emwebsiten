import { normalizePath } from "./utils.js";
import { renderBlogPost } from "./components.js";

// Top-level pages: route -> view template.
const PAGES = {
  "/": "/frontend/pages/home.html",
  "/about": "/frontend/pages/about.html",
  "/blog": "/frontend/pages/blogs.html",
  "/projects": "/frontend/pages/projects.html",
};

// Every blog post renders through the same template.
const BLOG_POST_VIEW = "/frontend/pages/blog-post.html";

export const BLOG_POSTS = {
  "/blog/test1": {
    title: "world hello",
    file: "/public/blogs/test.md",
  },
  "/blog/test2": {
    title: "Hello world",
    file: "/public/blogs/test2.md",
  },
};

// Full route table: pages plus a view for each blog post.
export const ROUTES = {
  ...PAGES,
  ...Object.fromEntries(
    Object.keys(BLOG_POSTS).map((path) => [path, BLOG_POST_VIEW]),
  ),
};

// Routes that drive the WASM scene -> the exported function to call.
const WASM_NAV = {
  "/": "_navigate_home",
  "/about": "_navigate_about",
  "/projects": "_navigate_projects",
  "/blog": "_navigate_blog",
};

export function routeToWasm(path) {
  // Blog index and every post share the pixel background scene.
  const fn = path.startsWith("/blog/") ? "_navigate_blog" : WASM_NAV[path];
  if (fn) Module?.[fn]?.();
}

function attachCardHandlers() {
  document.querySelectorAll('.card').forEach(card => {
    card.onclick = () => {
      const route = card.dataset.route;
      if (route) navigate(route);
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
  const resolved = path in ROUTES ? path : "/";

  const main = document.querySelector("main");
  main.innerHTML = await fetch(ROUTES[resolved]).then(r => r.text());

  setActiveLink(resolved);
  routeToWasm(resolved);

  if (BLOG_POSTS[resolved]) {
    await renderBlogPost(resolved);
  }

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

