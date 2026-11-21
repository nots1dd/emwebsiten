import { BLOG_POSTS } from "./router.js";
import { mdToHtml, mdToHtmlFallback, enhanceMarkdown, enhanceTables, enhanceCodeBlocks, enhanceImages } from "./markdown.js";
import { whenWasmReady } from "./wasm.js";
import { minimalMode } from "./state.js";

export async function loadComponent(id, path) {
  const res = await fetch(path);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}

// The markdown renderer lives in the WASM module, which finishes loading
// after the first paint (and never loads in minimal mode). Give it a bounded
// wait, then render with the JS fallback so a post never comes up empty.
const WASM_MD_TIMEOUT_MS = 15000;

async function markdownToHtml(md) {
  if (!minimalMode) {
    try {
      await Promise.race([
        whenWasmReady(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timed out waiting for the WASM runtime")), WASM_MD_TIMEOUT_MS)
        ),
      ]);
      return mdToHtml(md);
    } catch (err) {
      console.warn("[blog] WASM markdown renderer unavailable, using JS fallback:", err);
    }
  }
  return mdToHtmlFallback(md);
}

export async function renderBlogPost(path) {
  const post = BLOG_POSTS[path];
  if (!post) return;

  document.getElementById("post-title").textContent = post.title;
  document.getElementById("post-sub").textContent = post.blurb ?? "";

  const res = await fetch(post.file);
  if (!res.ok) throw new Error(`Failed to fetch ${post.file}: ${res.status}`);
  const md = await res.text();

  const html = await markdownToHtml(md);

  const content = document.getElementById("post-content");
  content.innerHTML = html;

  const baseDir = post.file.slice(0, post.file.lastIndexOf("/") + 1);  // e.g. /public/blogs/

  enhanceTables(content);
  enhanceMarkdown(content);
  enhanceCodeBlocks(content);
  enhanceImages(content, baseDir);
}
