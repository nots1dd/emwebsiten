// Render functions: turn the plain data in content.js into page markup.
// Structure lives here; the editable strings live in ../content.js.

import { CONTENT, BLOG_POSTS } from "../content.js";
import { escapeHtml } from "./utils.js";

const hero = (title, subtitle) => `
  <section class="hero">
    <h1 class="title">${escapeHtml(title)}</h1>
    <p class="subtitle">${escapeHtml(subtitle)}</p>
  </section>`;

const card = ({ title, body, link }) => `
  <div class="card" tabindex="0"${link ? ` data-route="${escapeHtml(link)}"` : ""}>
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(body)}</p>
  </div>`;

// Make image URLs render as real images. A GitHub "blob" link
// (github.com/u/r/blob/path) serves an HTML page, not the file — rewrite it to
// the raw host so <img> can display it. Other URLs/paths pass through unchanged.
function resolveImg(src) {
  const m = src.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/i);
  if (m) {
    const path = m[3].replace(/[?#].*$/, "");
    return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${path}`;
  }
  return src;
}

// Expandable project card with a glass dropdown preview.
const projectCard = ({ title, body, link, status, lang, date, about, tags, images }) => {
  const slug = (status || "").toLowerCase().replace(/\s+/g, "-");
  const statusPill = status
    ? `<span class="project-status s-${escapeHtml(slug)}">${escapeHtml(status)}</span>`
    : "";
  const langPill = lang ? `<span class="project-lang">${escapeHtml(lang)}</span>` : "";
  const dateEl = date ? `<span class="project-date">${escapeHtml(date)}</span>` : "";

  const tagsEl = (tags && tags.length)
    ? `<div class="project-tags">${tags
        .map((t) => `<span class="project-tag">${escapeHtml(t)}</span>`)
        .join("")}</div>`
    : "";

  const shots = (images && images.length)
    ? `<div class="project-shots">${images
        .map((src) => `<img class="project-shot" loading="lazy" src="${escapeHtml(resolveImg(src))}" alt="${escapeHtml(title)} preview" onerror="this.style.display='none'">`)
        .join("")}</div>`
    : "";

  const aboutP = about ? `<p class="project-about">${escapeHtml(about)}</p>` : "";
  const linkA = link
    ? `<a class="project-link" href="${escapeHtml(link)}" target="_blank" rel="noopener">view on github →</a>`
    : "";

  return `
  <div class="project glass scanlines" data-expanded="false">
    <button class="project-head" type="button" aria-expanded="false">
      <span class="project-title-row">
        <h3>${escapeHtml(title)}</h3>
        ${statusPill}
        ${langPill}
        ${dateEl}
      </span>
      <p class="project-blurb">${escapeHtml(body)}</p>
      <span class="project-chevron" aria-hidden="true">▾</span>
    </button>
    <div class="project-preview">
      <div class="project-preview-inner">
        ${aboutP}
        ${tagsEl}
        ${shots}
        ${linkA}
      </div>
    </div>
  </div>`;
};

export function renderHome() {
  const { title, subtitle, paragraphs } = CONTENT.home;
  const paras = paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  return `
    ${hero(title, subtitle)}
    <section class="section">
      <div class="intro-card glass scanlines">
        ${paras}
      </div>
    </section>`;
}

export function renderAbout() {
  const { title, subtitle, intro, work, currently } = CONTENT.about;
  const cards = work.items.map(card).join("");
  return `
    ${hero(title, subtitle)}
    <section class="section">
      <h2>${escapeHtml(intro.heading)}</h2>
      <p>${escapeHtml(intro.body)}</p>
    </section>
    <section class="section">
      <h2>${escapeHtml(work.heading)}</h2>
      ${cards}
    </section>
    <section class="section">
      <h2>${escapeHtml(currently.heading)}</h2>
      <p>${escapeHtml(currently.body)}</p>
    </section>`;
}

function listPage({ heading, sub }, cards) {
  return `
    <section class="section">
      <h2>${escapeHtml(heading)}</h2>
      <p class="section-sub">${escapeHtml(sub)}</p>
    </section>
    <section class="section">${cards}</section>`;
}

export function renderProjects() {
  const cards = CONTENT.projects.items.map(projectCard).join("");
  return listPage(CONTENT.projects, cards);
}

export function renderBlog() {
  // Cards are derived from BLOG_POSTS so the list never drifts from the posts.
  const cards = Object.entries(BLOG_POSTS)
    .map(([route, post]) => card({ title: post.title, body: post.blurb ?? "", link: route }))
    .join("");
  return listPage(CONTENT.blog, cards);
}
