import { navigate } from "./router.js";
import { toggleTheme } from "./theme.js";
import { toggleCanvasMode } from "./canvas.js";

export const Mode = {
  NORMAL: "normal",
  INSERT: "insert",
};

const KEYMAP = {
  "gh": () => navigate("/"),
  "ga": () => navigate("/about"),
  "gb": () => navigate("/blog"),
  "gp": () => navigate("/projects"),

  "gg": () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    focusCard(0);
  },

  "G": () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    const cards = getCards();
    if (cards.length) focusCard(cards.length - 1);
  },

  "j": () => focusCard(focusedIndex + 1),
  "k": () => focusCard(focusedIndex - 1),
  "ct": () => toggleTheme(),
  "xx": () => toggleCanvasMode(),

  "Enter": () => activateFocusedCard(),

  "H": () => history.back(),
  "L": () => history.forward(),
};

const NAV_KEYS = [
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
];

let currentMode = Mode.NORMAL;
let buffer = "";
let bufferTimer = null;
let focusedIndex = 0;

// Arrow keys are passive until vim nav is first engaged
let vimEngaged = false;

export function initKeys() {
  document.addEventListener("keydown", (e) => {
    if (isTypingContext(e)) return;
    handleKey(e);
  });
}

function isTypingContext(e) {
  const tag = e.target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable;
}

function resetBufferSoon() {
  clearTimeout(bufferTimer);
  bufferTimer = setTimeout(() => {
    buffer = "";
    updateHints("");
  }, 600);
}

function getCards() {
  return Array.from(document.querySelectorAll(".card"));
}

function focusCard(index) {
  const cards = getCards();
  if (!cards.length) return;

  focusedIndex = (index + cards.length) % cards.length;

  const el = cards[focusedIndex];
  el.focus({ preventScroll: true });
  el.scrollIntoView({ block: "center", behavior: "smooth" });
}

function activateFocusedCard() {
  const cards = getCards();
  const el = cards[focusedIndex];
  if (!el) return;
  const route = el.dataset.route;
  if (route) navigate(route);
}

function isPrefix(str) {
  if (str === "g") return true;
  return Object.keys(KEYMAP).some((cmd) => cmd.startsWith(str));
}

function engage() {
  vimEngaged = true;
}

function handleKey(e) {
  const key = e.key;

  if (NAV_KEYS.includes(key)) {
    // Only intercept arrow keys after vim nav has been engaged
    if (!vimEngaged) return;

    if (document.activeElement) document.activeElement.blur();
    buffer = "";
    updateHints("");
    return;
  }

  if (e.ctrlKey || e.metaKey || e.altKey) return;

  if (["j", "k", "g", "G"].includes(key)) e.preventDefault();

  if (key === "j") {
    engage();
    focusCard(focusedIndex + 1);
    return;
  }
  if (key === "k") {
    engage();
    focusCard(focusedIndex - 1);
    return;
  }
  if (key === "Enter") {
    e.preventDefault();
    buffer = "";
    updateHints("");
    activateFocusedCard();
    return;
  }
  if (key === "G") {
    engage();
    KEYMAP["G"]();
    return;
  }

  if (key.length > 1) return;

  buffer += key;
  resetBufferSoon();
  updateHints(buffer);

  if (KEYMAP[buffer]) {
    if (buffer === "gg") engage();
    KEYMAP[buffer]();
    buffer = "";
    updateHints("");
    return;
  }

  if (!isPrefix(buffer)) {
    buffer = "";
    updateHints("");
  }
}

/* =========================
   TOOLTIP — bottom-center pill
========================= */

const HINT_LABELS = {
  h: "home",
  a: "about",
  b: "blog",
  p: "projects",
  g: "top",
  t: "theme",
  x: "canvas",
};

function updateHints(prefix) {
  let el = document.getElementById("vim-hints");
  if (!el) return;

  if (!prefix) {
    el.classList.remove("show");
    el.innerHTML = "";
    return;
  }

  const matches = Object.keys(KEYMAP).filter(
    (cmd) => cmd.startsWith(prefix) && cmd !== prefix
  );

  if (!matches.length) {
    el.classList.remove("show");
    el.innerHTML = "";
    return;
  }

  const chips = matches
    .map((cmd) => {
      const nextKey = cmd[prefix.length];
      const label = HINT_LABELS[nextKey] || "";
      return `<span class="vim-hint-chip">
        <span class="vim-hint-key">${nextKey}</span>
        ${label ? `<span class="vim-hint-label">${label}</span>` : ""}
      </span>`;
    })
    .join('<span class="vim-hint-sep">·</span>');

  el.innerHTML = `
    <span class="vim-hint-prefix">${prefix}</span>
    <span class="vim-hint-divider"></span>
    ${chips}
  `;

  el.classList.add("show");
}
