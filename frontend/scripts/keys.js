import { navigate } from "./router.js";
import { toggleTheme } from "./theme.js";
import { toggleCanvasMode } from "./canvas.js";
import { initHelp, toggleHelp } from "./help.js";

/* =========================================================
   Single source of truth for every keybinding.
   `seq` — keys to press. `cat` — help-panel group.
   `move` — engages vim mode (lets arrow keys disengage focus).
========================================================= */
const BINDINGS = [
  { seq: "gh", label: "home",     cat: "Navigate", run: () => navigate("/") },
  { seq: "ga", label: "about",    cat: "Navigate", run: () => navigate("/about") },
  { seq: "gb", label: "blog",     cat: "Navigate", run: () => navigate("/blog") },
  { seq: "gp", label: "projects", cat: "Navigate", run: () => navigate("/projects") },
  { seq: "gr", label: "resume",   cat: "Navigate", run: () => navigate("/resume") },

  { seq: "j",  label: "down",   cat: "Move", move: true, run: () => moveDown() },
  { seq: "k",  label: "up",     cat: "Move", move: true, run: () => moveUp() },
  { seq: "gg", label: "top",    cat: "Move", move: true, run: () => { scrollPageTo(0); focusCard(0, false); } },
  { seq: "G",  label: "bottom", cat: "Move", move: true, run: () => { scrollPageTo(pageBottom()); focusCard(cardCount() - 1, false); } },
  { seq: "Enter", label: "open focused card", cat: "Move", run: () => activateFocusedCard() },

  { seq: "H", label: "back",    cat: "History", run: () => history.back() },
  { seq: "L", label: "forward", cat: "History", run: () => history.forward() },

  { seq: "ct", label: "toggle theme",  cat: "View", run: () => toggleTheme() },
  { seq: "xx", label: "canvas mode",   cat: "View", run: () => toggleCanvasMode() },

  { seq: "?",  label: "this help", cat: "Help", run: () => toggleHelp() },
];

const BY_SEQ = new Map(BINDINGS.map((b) => [b.seq, b]));

const NAV_KEYS = [
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
  "PageUp", "PageDown", "Home", "End", " ",
];

// Printable keys that begin (or are) a binding.
const OWNED_KEYS = new Set(BINDINGS.flatMap((b) => (b.seq.length === 1 ? [b.seq] : [b.seq[0]])));

let buffer = "";
let bufferTimer = null;
let focusedIndex = 0;
let vimEngaged = false; // arrow keys stay passive until vim nav is used

export function initKeys() {
  initHelp(BINDINGS);
  document.addEventListener("keydown", (e) => {
    if (isTypingContext(e)) return;
    handleKey(e);
  });
}

/* ---------- helpers ---------- */
function isTypingContext(e) {
  const tag = e.target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable;
}

/* ---- page scrolling ----
   body is the scroll container here; pick whichever element actually scrolls. */
function scrollerEl() {
  const b = document.body, d = document.documentElement;
  return b.scrollHeight > b.clientHeight ? b : d;
}
function pageBottom() {
  return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
}
function scrollPageTo(top) {
  scrollerEl().scrollTo({ top, behavior: "smooth" });
}
function scrollPageBy(dy) {
  scrollerEl().scrollBy({ top: dy, behavior: "smooth" });
}

function getCards() {
  return Array.from(document.querySelectorAll(".card"));
}
function cardCount() {
  return getCards().length;
}

function focusCard(index, scroll = true) {
  const cards = getCards();
  if (!cards.length) return;
  focusedIndex = (index + cards.length) % cards.length;
  const el = cards[focusedIndex];
  el.focus({ preventScroll: true });
  if (scroll) el.scrollIntoView({ block: "center", behavior: "smooth" });
}

// j/k: step through cards when present, otherwise scroll the page.
function moveDown() {
  if (cardCount()) focusCard(focusedIndex + 1);
  else scrollPageBy(Math.round(window.innerHeight * 0.15));
}
function moveUp() {
  if (cardCount()) focusCard(focusedIndex - 1);
  else scrollPageBy(-Math.round(window.innerHeight * 0.15));
}

function activateFocusedCard() {
  const route = getCards()[focusedIndex]?.dataset.route;
  if (route) navigate(route);
}

function isPrefix(str) {
  return BINDINGS.some((b) => b.seq.length > 1 && b.seq.startsWith(str) && b.seq !== str);
}

function resetBuffer() {
  buffer = "";
  updateHints("");
}

function resetBufferSoon() {
  clearTimeout(bufferTimer);
  bufferTimer = setTimeout(resetBuffer, 600);
}

function fire(binding) {
  if (binding.move) vimEngaged = true;
  binding.run();
  resetBuffer();
}

/* ---------- dispatcher ---------- */
function handleKey(e) {
  const key = e.key;

  if (NAV_KEYS.includes(key)) {
    if (!vimEngaged) return; // passive until vim nav engaged
    document.activeElement?.blur();
    resetBuffer();
    return;
  }

  if (e.ctrlKey || e.metaKey || e.altKey) return;

  // Named (non-printable) keys map directly by sequence, e.g. Enter.
  if (key.length > 1) {
    const b = BY_SEQ.get(key);
    if (b) { e.preventDefault(); fire(b); }
    return;
  }

  if (OWNED_KEYS.has(key)) e.preventDefault();

  buffer += key;
  resetBufferSoon();
  updateHints(buffer);

  const exact = BY_SEQ.get(buffer);
  if (exact) { fire(exact); return; }

  if (!isPrefix(buffer)) resetBuffer();
}

/* =========================================================
   Hint pill — shows the keys that continue the current prefix.
========================================================= */
function updateHints(prefix) {
  const el = document.getElementById("vim-hints");
  if (!el) return;

  const matches = prefix
    ? BINDINGS.filter((b) => b.seq.startsWith(prefix) && b.seq !== prefix)
    : [];

  if (!matches.length) {
    el.classList.remove("show");
    el.innerHTML = "";
    return;
  }

  const chips = matches
    .map((b) => `<span class="vim-hint-chip">
        <kbd class="kbd">${b.seq[prefix.length]}</kbd>
        <span class="vim-hint-label">${b.label}</span>
      </span>`)
    .join('<span class="vim-hint-sep">·</span>');

  el.innerHTML = `<kbd class="kbd vim-hint-prefix">${prefix}</kbd>
    <span class="vim-hint-divider"></span>${chips}`;
  el.classList.add("show");
}
