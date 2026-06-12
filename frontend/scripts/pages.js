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

export function renderHome() {
  const { title, subtitle, paragraphs } = CONTENT.home;
  const paras = paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  return `
    ${hero(title, subtitle)}
    <section class="section">${paras}</section>`;
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
  const cards = CONTENT.projects.items.map(card).join("");
  return listPage(CONTENT.projects, cards);
}

export function renderBlog() {
  // Cards are derived from BLOG_POSTS so the list never drifts from the posts.
  const cards = Object.entries(BLOG_POSTS)
    .map(([route, post]) => card({ title: post.title, body: post.blurb ?? "", link: route }))
    .join("");
  return listPage(CONTENT.blog, cards);
}
