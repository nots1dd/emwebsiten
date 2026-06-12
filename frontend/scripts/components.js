import { BLOG_POSTS } from "./router.js";
import { mdToHtml, enhanceMarkdown, enhanceTables, enhanceCodeBlocks } from "./markdown.js";

export async function loadComponent(id, path) {
  const res = await fetch(path);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}

export async function renderBlogPost(path) {
  const post = BLOG_POSTS[path];
  if (!post) return;

  const md = await fetch(post.file).then(r => r.text());

  const html = mdToHtml(md);

  document.getElementById("post-title").textContent = post.title;
  document.getElementById("post-sub").textContent = post.blurb ?? "";
  document.getElementById("post-content").innerHTML = html;

  enhanceTables(document.getElementById("post-content"));
  enhanceMarkdown(document.getElementById("post-content"));
  enhanceCodeBlocks(document.getElementById("post-content"));
}
