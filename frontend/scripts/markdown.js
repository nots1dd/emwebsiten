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
const esc = escapeHtml;
const span = (cls, text) => `<span class="${cls}">${esc(text)}</span>`;

// Language fences that mean the same highlighter.
const LANG_ALIASES = {
  "c++": "cpp", cc: "cpp", cxx: "cpp", hpp: "cpp", h: "c",
  javascript: "js", mjs: "js", jsx: "js", ts: "js", tsx: "js", typescript: "js",
  rs: "rust",
  sh: "bash", shell: "bash", zsh: "bash", fish: "bash",
  x86: "asm", nasm: "asm", x86asm: "asm", gas: "asm",
  ml: "ocaml", mli: "ocaml",
  htm: "html", xml: "html",
  scss: "css", less: "css",
  py: "python",
  yml: "yaml",
};

const normalizeLang = (lang) => {
  const l = (lang || "").toLowerCase();
  return LANG_ALIASES[l] || l;
};

// Keyword-based languages. Each: keywords, comment styles, string delimiters.
// Note: rust/ocaml deliberately omit ' as a string delimiter so lifetimes
// ('a) and type variables don't swallow the rest of the line.
const LANG_CONFIG = {
  js: {
    keywords: ["const", "let", "var", "function", "return", "if", "else", "for",
      "while", "do", "switch", "case", "break", "continue", "new", "class",
      "extends", "super", "this", "import", "export", "from", "default", "async",
      "await", "yield", "try", "catch", "finally", "throw", "typeof", "instanceof",
      "in", "of", "void", "delete", "null", "undefined", "true", "false"],
    singleComment: "//", multiComment: ["/*", "*/"], stringDelims: ['"', "'", "`"],
  },
  c: {
    keywords: ["auto", "break", "case", "char", "const", "continue", "default", "do",
      "double", "else", "enum", "extern", "float", "for", "goto", "if", "inline",
      "int", "long", "register", "return", "short", "signed", "sizeof", "static",
      "struct", "switch", "typedef", "union", "unsigned", "void", "volatile",
      "while", "bool", "true", "false", "NULL"],
    singleComment: "//", multiComment: ["/*", "*/"], stringDelims: ['"'],
  },
  cpp: {
    keywords: ["auto", "break", "case", "char", "const", "constexpr", "continue",
      "default", "delete", "do", "double", "else", "enum", "explicit", "extern",
      "float", "for", "friend", "goto", "if", "inline", "int", "long", "mutable",
      "namespace", "new", "noexcept", "nullptr", "operator", "override", "private",
      "protected", "public", "register", "return", "short", "signed", "sizeof",
      "static", "struct", "switch", "template", "this", "throw", "try", "typedef",
      "typename", "union", "unsigned", "using", "virtual", "void", "volatile",
      "while", "bool", "class", "final", "true", "false", "std"],
    singleComment: "//", multiComment: ["/*", "*/"], stringDelims: ['"'],
  },
  rust: {
    keywords: ["fn", "let", "mut", "const", "static", "struct", "enum", "impl",
      "trait", "pub", "use", "mod", "crate", "self", "Self", "super", "match", "if",
      "else", "loop", "while", "for", "in", "return", "break", "continue", "ref",
      "move", "as", "where", "dyn", "async", "await", "unsafe", "extern", "type",
      "true", "false", "Some", "None", "Ok", "Err", "Box", "Vec", "String",
      "Option", "Result"],
    singleComment: "//", multiComment: ["/*", "*/"], stringDelims: ['"'],
  },
  bash: {
    keywords: ["if", "then", "else", "elif", "fi", "for", "while", "until", "do",
      "done", "case", "esac", "in", "function", "return", "local", "export",
      "readonly", "declare", "unset", "source", "alias", "echo", "read", "exit",
      "set", "cd", "test", "and", "or", "not", "begin", "end", "switch", "string"],
    singleComment: "#", multiComment: null, stringDelims: ['"', "'"],
  },
  asm: {
    keywords: ["mov", "movzx", "movsx", "lea", "push", "pop", "add", "sub", "mul",
      "imul", "div", "idiv", "inc", "dec", "neg", "and", "or", "xor", "not", "shl",
      "shr", "sar", "sal", "rol", "ror", "cmp", "test", "jmp", "je", "jne", "jz",
      "jnz", "jg", "jge", "jl", "jle", "ja", "jae", "jb", "jbe", "call", "ret",
      "leave", "enter", "nop", "int", "syscall", "cdq", "cqo", "loop", "hlt",
      "rax", "rbx", "rcx", "rdx", "rsi", "rdi", "rbp", "rsp", "r8", "r9", "r10",
      "r11", "r12", "r13", "r14", "r15", "eax", "ebx", "ecx", "edx", "esi", "edi",
      "ebp", "esp", "ax", "bx", "cx", "dx", "al", "bl", "cl", "dl",
      "section", "global", "extern", "db", "dw", "dd", "dq", "resb", "resw",
      "resd", "resq", "equ", "times", "byte", "word", "dword", "qword", "ptr"],
    singleComment: ";", multiComment: null, stringDelims: ['"', "'"],
  },
  ocaml: {
    keywords: ["let", "rec", "in", "fun", "function", "match", "with", "if", "then",
      "else", "begin", "end", "type", "module", "struct", "sig", "val", "open",
      "include", "and", "or", "not", "of", "as", "when", "try", "raise", "exception",
      "mutable", "ref", "while", "for", "do", "done", "to", "downto", "true",
      "false", "unit", "int", "float", "string", "bool", "char", "list", "array",
      "option", "Some", "None", "failwith", "assert"],
    singleComment: null, multiComment: ["(*", "*)"], stringDelims: ['"'],
  },
  python: {
    keywords: ["def", "return", "if", "elif", "else", "for", "while", "in", "not",
      "and", "or", "is", "None", "True", "False", "class", "import", "from", "as",
      "with", "try", "except", "finally", "raise", "lambda", "yield", "pass",
      "break", "continue", "global", "nonlocal", "del", "assert", "async", "await",
      "print", "self"],
    singleComment: "#", multiComment: null, stringDelims: ['"', "'"],
  },
};

const isWord = (c) => /[a-zA-Z0-9_]/.test(c);
const isWordStart = (c) => /[a-zA-Z_]/.test(c);

function highlightGeneric(code, cfg) {
  let i = 0, out = "";

  while (i < code.length) {
    const ch = code[i];

    // multi-line comment
    if (cfg.multiComment && code.startsWith(cfg.multiComment[0], i)) {
      const open = cfg.multiComment[0].length;
      const end = code.indexOf(cfg.multiComment[1], i + open);
      const slice = code.slice(i, end === -1 ? code.length : end + cfg.multiComment[1].length);
      out += span("com", slice); i += slice.length; continue;
    }

    // single-line comment
    if (cfg.singleComment && code.startsWith(cfg.singleComment, i)) {
      const end = code.indexOf("\n", i);
      const slice = code.slice(i, end === -1 ? code.length : end);
      out += span("com", slice); i += slice.length; continue;
    }

    // string
    if (cfg.stringDelims.includes(ch)) {
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === "\\" && j + 1 < code.length) { j += 2; continue; }
        if (code[j] === ch) break;
        j++;
      }
      out += span("str", code.slice(i, Math.min(j + 1, code.length)));
      i = j + 1; continue;
    }

    // number (decimal / float / 0x-hex)
    if (/[0-9]/.test(ch) && !(i > 0 && isWord(code[i - 1]))) {
      let j = i;
      if (ch === "0" && (code[i + 1] === "x" || code[i + 1] === "X")) {
        j = i + 2; while (j < code.length && /[0-9a-fA-F]/.test(code[j])) j++;
      } else {
        while (j < code.length && /[0-9._]/.test(code[j])) j++;
      }
      out += span("num", code.slice(i, j)); i = j; continue;
    }

    // identifier -> keyword / function call / plain
    if (isWordStart(ch)) {
      let j = i; while (j < code.length && isWord(code[j])) j++;
      const word = code.slice(i, j);
      if (cfg.keywords.includes(word)) {
        out += span("kw", word);
      } else {
        let k = j; while (k < code.length && code[k] === " ") k++;
        out += code[k] === "(" ? span("fn", word) : esc(word);
      }
      i = j; continue;
    }

    out += esc(ch); i++;
  }

  return out;
}

// HTML/XML: tag names, attributes, attribute strings, <!-- comments -->.
function highlightHtml(code) {
  let i = 0, out = "";

  while (i < code.length) {
    if (code.startsWith("<!--", i)) {
      const end = code.indexOf("-->", i + 4);
      const slice = code.slice(i, end === -1 ? code.length : end + 3);
      out += span("com", slice); i += slice.length; continue;
    }

    if (code[i] === "<") {
      out += "&lt;"; i++;
      if (code[i] === "/" || code[i] === "!") { out += code[i]; i++; }
      let s = i; while (i < code.length && /[a-zA-Z0-9-]/.test(code[i])) i++;
      if (i > s) out += span("kw", code.slice(s, i));

      while (i < code.length && code[i] !== ">") {
        const ch = code[i];
        if (ch === '"' || ch === "'") {
          let k = i + 1; while (k < code.length && code[k] !== ch) k++;
          out += span("str", code.slice(i, Math.min(k + 1, code.length)));
          i = k + 1; continue;
        }
        if (/[a-zA-Z-]/.test(ch)) {
          let a = i; while (i < code.length && /[a-zA-Z0-9-]/.test(code[i])) i++;
          out += span("fn", code.slice(a, i)); continue;
        }
        out += esc(ch); i++;
      }
      if (code[i] === ">") { out += "&gt;"; i++; }
      continue;
    }

    out += esc(code[i]); i++;
  }

  return out;
}

// CSS/SCSS: comments, strings, @-rules, hex colors, numbers+units, properties.
function highlightCss(code) {
  let i = 0, out = "";

  while (i < code.length) {
    const ch = code[i];

    if (code.startsWith("/*", i)) {
      const end = code.indexOf("*/", i + 2);
      const slice = code.slice(i, end === -1 ? code.length : end + 2);
      out += span("com", slice); i += slice.length; continue;
    }
    if (ch === '"' || ch === "'") {
      let j = i + 1; while (j < code.length && code[j] !== ch) j++;
      out += span("str", code.slice(i, Math.min(j + 1, code.length)));
      i = j + 1; continue;
    }
    if (ch === "@") {
      let j = i + 1; while (j < code.length && /[a-zA-Z-]/.test(code[j])) j++;
      out += span("kw", code.slice(i, j)); i = j; continue;
    }
    if (ch === "#") {  // hex color / id selector
      let j = i + 1; while (j < code.length && /[a-zA-Z0-9-]/.test(code[j])) j++;
      out += span("num", code.slice(i, j)); i = j; continue;
    }
    if (/[0-9]/.test(ch) && !(i > 0 && isWord(code[i - 1]))) {
      let j = i; while (j < code.length && /[0-9.]/.test(code[j])) j++;
      while (j < code.length && /[a-z%]/.test(code[j])) j++;  // unit
      out += span("num", code.slice(i, j)); i = j; continue;
    }
    if (/[a-zA-Z-]/.test(ch)) {
      let j = i; while (j < code.length && /[a-zA-Z0-9-]/.test(code[j])) j++;
      const word = code.slice(i, j);
      let k = j; while (k < code.length && /\s/.test(code[k])) k++;
      out += code[k] === ":" ? span("kw", word) : esc(word);  // property name
      i = j; continue;
    }
    out += esc(ch); i++;
  }

  return out;
}

// TOML: # comments, [tables]/[[arrays]], keys before =, strings, numbers, bools.
function highlightToml(code) {
  let i = 0, out = "";
  const bools = ["true", "false"];

  while (i < code.length) {
    const ch = code[i];

    if (ch === "#") {
      const end = code.indexOf("\n", i);
      const slice = code.slice(i, end === -1 ? code.length : end);
      out += span("com", slice); i += slice.length; continue;
    }
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < code.length) {
        if (ch === '"' && code[j] === "\\" && j + 1 < code.length) { j += 2; continue; }
        if (code[j] === ch) break;
        j++;
      }
      out += span("str", code.slice(i, Math.min(j + 1, code.length)));
      i = j + 1; continue;
    }
    if (ch === "[") {  // [table] / [[array-of-tables]]
      const end = code.indexOf("\n", i);
      const slice = code.slice(i, end === -1 ? code.length : end);
      out += span("kw", slice); i += slice.length; continue;
    }
    if (/[0-9]/.test(ch) && !(i > 0 && isWord(code[i - 1]))) {
      let j = i; while (j < code.length && /[0-9a-fA-FxX:.+_T-]/.test(code[j])) j++;
      out += span("num", code.slice(i, j)); i = j; continue;
    }
    if (isWordStart(ch)) {
      let j = i; while (j < code.length && /[a-zA-Z0-9_-]/.test(code[j])) j++;
      const word = code.slice(i, j);
      let k = j; while (k < code.length && code[k] === " ") k++;
      if (code[k] === "=") out += span("kw", word);        // key
      else if (bools.includes(word)) out += span("num", word);
      else out += esc(word);
      i = j; continue;
    }
    out += esc(ch); i++;
  }
  return out;
}

// YAML: # comments, keys before :, - list markers, strings, numbers, bool/null.
function highlightYaml(code) {
  let i = 0, out = "", atLineStart = true;
  const consts = ["true", "false", "null", "yes", "no", "on", "off",
    "True", "False", "Null", "~"];

  while (i < code.length) {
    const ch = code[i];

    if (ch === "\n") { out += "\n"; i++; atLineStart = true; continue; }
    if (ch === " " || ch === "\t") { out += ch; i++; continue; }

    if (ch === "#") {
      const end = code.indexOf("\n", i);
      const slice = code.slice(i, end === -1 ? code.length : end);
      out += span("com", slice); i += slice.length; continue;
    }
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < code.length) {
        if (ch === '"' && code[j] === "\\" && j + 1 < code.length) { j += 2; continue; }
        if (code[j] === ch) break;
        j++;
      }
      out += span("str", code.slice(i, Math.min(j + 1, code.length)));
      i = j + 1; atLineStart = false; continue;
    }
    if (ch === "-" && (code[i + 1] === " " || code[i + 1] === "\n")) {
      out += span("kw", "-"); i++; continue;     // list item marker
    }
    if (/[0-9]/.test(ch) && !(i > 0 && isWord(code[i - 1]))) {
      let j = i; while (j < code.length && /[0-9a-fA-FxX:.+eE_-]/.test(code[j])) j++;
      out += span("num", code.slice(i, j)); i = j; atLineStart = false; continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let j = i; while (j < code.length && /[a-zA-Z0-9_.-]/.test(code[j])) j++;
      const word = code.slice(i, j);
      let k = j; while (k < code.length && code[k] === " ") k++;
      if (atLineStart && code[k] === ":") out += span("kw", word);   // key
      else if (consts.includes(word)) out += span("num", word);
      else out += esc(word);
      i = j; atLineStart = false; continue;
    }
    out += esc(ch); i++; atLineStart = false;
  }
  return out;
}

function highlight(code, lang) {
  const norm = normalizeLang(lang);
  if (norm === "html") return highlightHtml(code);
  if (norm === "css") return highlightCss(code);
  if (norm === "toml") return highlightToml(code);
  if (norm === "yaml") return highlightYaml(code);
  const cfg = LANG_CONFIG[norm];
  return cfg ? highlightGeneric(code, cfg) : esc(code);
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
   IMAGES
========================= */
// Markdown images use paths relative to the .md file (e.g. ./pic1.png), but the
// browser resolves them against the SPA route. Rewrite relative srcs against the
// post's own directory so they actually load.
export function enhanceImages(container, baseDir) {
  container.querySelectorAll("img").forEach(img => {
    const src = img.getAttribute("src") || "";
    if (/^(https?:|data:|\/)/.test(src)) return;   // already absolute / external
    img.setAttribute("src", baseDir + src.replace(/^\.\//, ""));
    img.loading = "lazy";
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
