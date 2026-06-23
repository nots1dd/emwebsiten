const ENDPOINT = "/api/now-playing";
const POLL_MS = 30_000;

let trackEl = null;

function render(data) {
  if (!trackEl) return;

  if (data?.error || !data?.name) {
    trackEl.innerHTML = `<span class="np-offline">offline</span>`;
    return;
  }

  const img = data.image
    ? `<img class="np-art" src="${data.image}" alt="" width="24" height="24" loading="lazy">`
    : `<span class="np-art np-art-fallback"></span>`;

  const dot = data.nowplaying
    ? `<span class="np-dot" aria-label="Now playing"></span>`
    : "";

  trackEl.innerHTML = `${img}<span class="np-body">${dot}<span class="np-track">${esc(data.name)}</span><span class="np-sep">–</span><span class="np-artist">${esc(data.artist)}</span></span>`;
}

function esc(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

async function poll(container) {
  trackEl = container.querySelector(".np-track-wrap");
  if (!trackEl) return;
  try {
    const r = await fetch(ENDPOINT);
    const data = await r.json();
    render(data);
  } catch {
    render({ error: true });
  }
}

export function initLastfm(container) {
  if (!container) return;
  poll(container);
  setInterval(() => poll(container), POLL_MS);
}
