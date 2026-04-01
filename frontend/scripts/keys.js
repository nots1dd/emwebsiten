import { navigate } from "./router.js";
import { toggleTheme } from "./theme.js";
import { toggleCanvasMode } from "./canvas.js";

/* =========================
   MODE SYSTEM (future-proof)
========================= */
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
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });

    const cards = getCards();
    if (cards.length) focusCard(cards.length - 1);
  },

  "j": () => focusCard(focusedIndex + 1),
  "k": () => focusCard(focusedIndex - 1),
  "ct": () => toggleTheme(),
  "xx": () => toggleCanvasMode(),

  "Enter": () => activateFocusedCard(),

  "H": () => history.back(),     // go back
  "L": () => history.forward(),  // go forward
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
  " "
];

let currentMode = Mode.NORMAL;

/* =========================
   STATE
========================= */
let buffer = "";          // for multi-key combos (gg)
let bufferTimer = null;

let focusedIndex = 0;

/* =========================
   INIT
========================= */
export function initKeys() {
  document.addEventListener("keydown", (e) => {
    if (isTypingContext(e)) return;

    handleKey(e);
  });
}

/* =========================
   HELPERS
========================= */
function isTypingContext(e) {
  const tag = e.target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    e.target.isContentEditable
  );
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

  el.scrollIntoView({
    block: "center",
    behavior: "smooth",
  });
}

function activateFocusedCard() {
  const cards = getCards();
  const el = cards[focusedIndex];
  if (!el) return;

  const route = el.dataset.route;
  if (route) {
    navigate(route);
  }
}

function isPrefix(str) {
  if (str === "g") return true;
  return Object.keys(KEYMAP).some(cmd => cmd.startsWith(str));
}

/* =========================
   KEY HANDLER
========================= */
function handleKey(e) {
  const key = e.key;

  if (NAV_KEYS.includes(key)) {
    // reset buffer on any navigation key
    buffer = "";
    updateHints("");
    return;
  }

  if (e.ctrlKey || e.metaKey || e.altKey) return;

  // prevent default scrolling
  if (["j", "k", "g", "G"].includes(key)) {
    e.preventDefault();
  }

  if (key === "j") return focusCard(focusedIndex + 1);
  if (key === "k") return focusCard(focusedIndex - 1);
  if (key === "Enter") {
    e.preventDefault();
    buffer = "";
    updateHints("");
    activateFocusedCard();
    return;
  }
  if (key === "G") {
    KEYMAP["G"]();
    return;
  }

  /* =========================
     BUFFERED KEYS
  ========================= */
  if (key.length > 1) return;
  buffer += key;
  resetBufferSoon();

  updateHints(buffer);

  if (KEYMAP[buffer]) {
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

function updateHints(prefix) {
  const el = document.getElementById("vim-hints");
  if (!el) return;

  // ===== RESET =====
  if (!prefix) {
    el.classList.remove("show");
    el.innerHTML = "";
    return;
  }

  // ===== MATCH COMMANDS =====
  const matches = Object.keys(KEYMAP)
    .filter(cmd => cmd.startsWith(prefix) && cmd !== prefix);

  if (!matches.length) {
    el.classList.remove("show");
    el.innerHTML = "";
    return;
  }

  // ===== BUILD UI =====
  el.innerHTML = matches.map(cmd => {
    const nextKey = cmd[prefix.length];

    const label = {
      h: "home",
      a: "about",
      b: "blog",
      p: "projects",
    }[nextKey] || "";

    return `<span class="vim-hint">${nextKey}${label ? " " + label : ""}</span>`;
  }).join("");

  const cards = document.querySelectorAll(".card");
  let x = window.innerWidth / 2;
  let y = window.innerHeight * 0.75; // default position

  if (cards.length) {
    const index = Math.min(focusedIndex, cards.length - 1);
    const rect = cards[index].getBoundingClientRect();

    // position above focused card
    x = rect.left + rect.width / 2;
    y = rect.top - 12;

    // if too close to top → place below instead
    if (y < 60) {
      y = rect.bottom + 12;
      el.style.transform = "translate(-50%, 0)";
    } else {
      el.style.transform = "translate(-50%, -100%)";
    }
  } else {
    // center floating (no cards)
    el.style.transform = "translate(-50%, 0)";
  }

  // ===== CLAMP TO VIEWPORT =====
  const padding = 16;
  x = Math.max(padding, Math.min(window.innerWidth - padding, x));
  y = Math.max(padding, Math.min(window.innerHeight - padding, y));

  // ===== APPLY POSITION =====
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;

  // ===== SHOW =====
  el.classList.add("show");
}
