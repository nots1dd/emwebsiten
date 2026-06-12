import { escapeHtml } from "./utils.js";

/* =========================
   ICONS
========================= */
export const ICONS = {
  warning: "<!>",
  info: "<@>",
  caution: "<!!>",
  important: "<+_+>",
  note: "<*>",
};

/* =========================
   SYNTAX HIGHLIGHTERS
========================= */
const LANG_CONFIG = {
  js: {
    keywords: ["const", "let", "var", "function", "return"],
    singleComment: "//",
    multiComment: ["/*", "*/"],
    stringDelims: ['"', "'"]
  },

  cpp: {
    keywords: ["int", "float", "return", "if", "else"],
    singleComment: "//",
    multiComment: ["/*", "*/"],
    stringDelims: ['"']
  },

  c: {
    keywords: ["int", "float", "return", "if", "else"],
    singleComment: "//",
    multiComment: ["/*", "*/"],
    stringDelims: ['"']
  },

  bash: {
    keywords: ["if", "then", "else", "fi", "for", "do", "done"],
    singleComment: "#",
    multiComment: null,
    stringDelims: ['"', "'"]
  },

  python: {
    keywords: ["def", "return", "if", "else"],
    singleComment: "#",
    multiComment: null,
    stringDelims: ['"', "'"]
  }
};

function highlight(code, lang) {
  const cfg = LANG_CONFIG[lang];
  if (!cfg) return escapeHtml(code);

  let i = 0;
  let out = "";

  const isWordChar = c => /[a-zA-Z0-9_]/.test(c);

  while (i < code.length) {
    const ch = code[i];

    /* =========================
       MULTI-LINE COMMENT
    ========================= */
    if (cfg.multiComment &&
        code.startsWith(cfg.multiComment[0], i)) {

      const end = code.indexOf(cfg.multiComment[1], i + 2);
      const slice = code.slice(
        i,
        end === -1 ? code.length : end + 2
      );

      out += `<span class="com">${escapeHtml(slice)}</span>`;
      i += slice.length;
      continue;
    }

    /* =========================
       SINGLE-LINE COMMENT
    ========================= */
    if (cfg.singleComment &&
        code.startsWith(cfg.singleComment, i)) {

      const end = code.indexOf("\n", i);
      const slice = code.slice(
        i,
        end === -1 ? code.length : end
      );

      out += `<span class="com">${escapeHtml(slice)}</span>`;
      i += slice.length;
      continue;
    }

    /* =========================
       STRING
    ========================= */
    if (cfg.stringDelims.includes(ch)) {
      let j = i + 1;

      while (j < code.length) {
        if (code[j] === "\\" && j + 1 < code.length) {
          j += 2;
          continue;
        }
        if (code[j] === ch) break;
        j++;
      }

      const slice = code.slice(i, j + 1);
      out += `<span class="str">${escapeHtml(slice)}</span>`;
      i = j + 1;
      continue;
    }

    /* =========================
       KEYWORD / IDENTIFIER
    ========================= */
    if (isWordChar(ch)) {
      let j = i;
      while (j < code.length && isWordChar(code[j])) j++;

      const word = code.slice(i, j);

      if (cfg.keywords.includes(word)) {
        out += `<span class="kw">${word}</span>`;
      } else {
        out += word;
      }

      i = j;
      continue;
    }

    /* =========================
       DEFAULT
    ========================= */
    out += escapeHtml(ch);
    i++;
  }

  return out;
}

/* =========================
   MARKDOWN → HTML (WASM)
========================= */
export function mdToHtml(md) {
  return Module.ccall(
    "md_to_html",
    "string",
    ["string"],
    [md]
  );
}

/* =========================
   CALLOUTS (GitHub style)
========================= */
export function enhanceMarkdown(container) {
  const nodes = Array.from(container.querySelectorAll("p"));

  nodes.forEach(p => {
    const text = p.textContent.trim();
    const match = text.match(/^\[!(\w+)\]\s*(.*)/);
    if (!match) return;

    const type = match[1].toLowerCase();
    const inline = match[2];

    const box = document.createElement("div");
    box.className = `md-callout md-${type}`;

    const title = document.createElement("div");
    title.className = "md-callout-title";
    title.textContent = `${ICONS[type] || ""} ${type}`;

    const content = document.createElement("div");
    content.className = "md-callout-content";

    if (inline) {
      const para = document.createElement("p");
      para.textContent = inline;
      content.appendChild(para);
    }

    let next = p.nextElementSibling;

    while (next && next.tagName === "P") {
      const tmp = next.nextElementSibling;
      content.appendChild(next);
      next = tmp;
    }

    box.appendChild(title);
    box.appendChild(content);

    p.replaceWith(box);
  });
}

export function enhanceTables(container) {
  const paragraphs = Array.from(container.querySelectorAll("p"));

  paragraphs.forEach(p => {
    const text = p.textContent.trim();

    if (!text.includes("|")) return;
    if (!text.includes("---")) return;

    const lines = text.split("\n").map(l => l.trim());
    if (lines.length < 2) return;

    const headers = lines[0].split("|").map(s => s.trim()).filter(Boolean);
    const rows = lines.slice(2).map(line =>
      line.split("|").map(s => s.trim()).filter(Boolean)
    );

    const table = document.createElement("table");

    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");

    headers.forEach(h => {
      const th = document.createElement("th");
      th.textContent = h;
      trHead.appendChild(th);
    });

    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    rows.forEach(r => {
      const tr = document.createElement("tr");
      r.forEach(cell => {
        const td = document.createElement("td");
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    p.replaceWith(table);
  });
}

/* =========================
   CODE BLOCKS
========================= */
export function enhanceCodeBlocks(container) {
  container.querySelectorAll("pre code").forEach(block => {
    const rawCode = block.textContent;

    // detect language
    const match = block.className.match(/language-(\w+)/);
    const lang = match ? match[1] : "plain";

    const wrapper = document.createElement("div");
    wrapper.className = "md-codeblock";

    const highlighted = highlight(rawCode, lang);

    wrapper.innerHTML = `
      <div class="md-code-header">
        <span class="md-code-lang">${lang}</span>
        <button class="md-copy-btn">copy</button>
      </div>
      <pre><code class="language-${lang}">${highlighted}</code></pre>
    `;

    block.parentElement.replaceWith(wrapper);

    // copy button
    wrapper.querySelector(".md-copy-btn").onclick = () => {
      navigator.clipboard.writeText(rawCode);

      const btn = wrapper.querySelector(".md-copy-btn");
      btn.textContent = "copied";
      setTimeout(() => (btn.textContent = "copy"), 1000);
    };
  });
}
