import { normalizePath } from "./utils.js";
import { renderBlogPost } from "./components.js";
import { pageTransition } from "./transition.js";
import { renderHome, renderAbout, renderProjects, renderBlog } from "./pages.js";
import { BLOG_POSTS } from "../content.js";

// Re-exported so existing importers (components.js) keep working unchanged.
export { BLOG_POSTS };

// Data-driven pages: route -> render function returning an HTML string.
// Edit their text in frontend/content.js, not here.
const RENDERERS = {
  "/": renderHome,
  "/about": renderAbout,
  "/projects": renderProjects,
  "/blog": renderBlog,
};

// Static template pages: route -> HTML file to fetch.
const TEMPLATES = {
  "/resume": "/frontend/pages/resume.html",
};

// Every blog post renders through the same template.
const BLOG_POST_VIEW = "/frontend/pages/blog-post.html";

// Full route table: rendered pages, template pages, plus a view per blog post.
export const ROUTES = {
  ...RENDERERS,
  ...TEMPLATES,
  ...Object.fromEntries(
    Object.keys(BLOG_POSTS).map((path) => [path, BLOG_POST_VIEW]),
  ),
};

// Each route's WASM entry points: scene navigation + theme recolor.
const WASM_ROUTES = {
  "/":         { nav: "_navigate_home",     theme: "_set_theme_home" },
  "/about":    { nav: "_navigate_about",    theme: "_set_theme_about" },
  "/projects": { nav: "_navigate_projects", theme: "_set_theme_projects" },
  "/blog":     { nav: "_navigate_blog",     theme: "_set_theme_blog" },
};

// Resolve a path to its WASM entry (blog posts share the blog scene).
function wasmRoute(path) {
  return path.startsWith("/blog/") ? WASM_ROUTES["/blog"] : WASM_ROUTES[path];
}

export function routeToWasm(path) {
  const fn = wasmRoute(path)?.nav;
  if (fn) Module?.[fn]?.();
}

export function themeFnFor(path) {
  return wasmRoute(path)?.theme ?? null;
}

function attachCardHandlers() {
  document.querySelectorAll('.card').forEach(card => {
    const route = card.dataset.route;
    if (!route) return;
    card.onclick = () => {
      // External links open in a new tab; internal routes navigate the SPA.
      if (/^https?:\/\//.test(route)) window.open(route, "_blank", "noopener");
      else navigate(route);
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

let firstRender = true;

export async function renderRoute(path) {
  path = normalizePath(path);
  const resolved = path in ROUTES ? path : "/";

  const main = document.querySelector("main");

  // Render (data pages) or fetch (template pages) the view, then post-process.
  const swap = async () => {
    const renderer = RENDERERS[resolved];
    main.innerHTML = renderer
      ? renderer()
      : await fetch(ROUTES[resolved]).then(r => r.text());

    setActiveLink(resolved);
    routeToWasm(resolved);

    if (BLOG_POSTS[resolved]) {
      await renderBlogPost(resolved);
    }

    attachCardHandlers();
  };

  // skip transition on first paint.
  if (firstRender) {
    firstRender = false;
    await swap();
  } else {
    await pageTransition(swap);
  }
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

