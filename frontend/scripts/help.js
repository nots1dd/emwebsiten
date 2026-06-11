// Keybind help overlay — built once from the shared BINDINGS table so it can
// never drift from the actual keymap. Glass panel + pixel keycaps.

const CAT_ORDER = ["Navigate", "Move", "History", "View", "Help"];

// Split a binding sequence into individual keycap labels ("gh" -> [g,h]).
function caps(seq) {
  return seq.length > 1 && /^[a-z]+$/.test(seq) ? seq.split("") : [seq];
}

function rowHtml(b) {
  const keys = caps(b.seq)
    .map((k) => `<kbd class="kbd">${k}</kbd>`)
    .join("");
  return `<div class="help-row">
    <span class="help-keys">${keys}</span>
    <span class="help-desc">${b.label}</span>
  </div>`;
}

function buildPanel(bindings) {
  const groups = CAT_ORDER.map((cat) => {
    const rows = bindings.filter((b) => b.cat === cat).map(rowHtml).join("");
    if (!rows) return "";
    return `<div class="help-group">
      <div class="help-cat">${cat}</div>
      ${rows}
    </div>`;
  }).join("");

  const overlay = document.createElement("div");
  overlay.id = "help-overlay";
  overlay.className = "help-overlay";
  overlay.innerHTML = `
    <div class="help-panel glass scanlines" role="dialog" aria-label="Keyboard shortcuts">
      <div class="help-head">
        <span class="help-title">KEYBINDS</span>
        <button class="help-close kbd" aria-label="Close">esc</button>
      </div>
      <div class="help-groups">${groups}</div>
    </div>`;
  return overlay;
}

let overlayEl = null;

export function isHelpOpen() {
  return overlayEl?.classList.contains("show") ?? false;
}

export function toggleHelp(force) {
  if (!overlayEl) return;
  const open = force ?? !isHelpOpen();
  overlayEl.classList.toggle("show", open);
}

export function initHelp(bindings) {
  if (overlayEl) return;
  overlayEl = buildPanel(bindings);
  document.body.appendChild(overlayEl);

  // Dismiss on backdrop click, close button, or Esc.
  overlayEl.addEventListener("click", (e) => {
    if (e.target === overlayEl || e.target.closest(".help-close")) toggleHelp(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isHelpOpen()) toggleHelp(false);
  });
}
