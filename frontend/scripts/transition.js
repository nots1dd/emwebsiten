// Page transition — glass wipe that masks the route swap, then reveals it.

let fx = null;

function ensureFx() {
  if (fx) return fx;
  const content = document.querySelector(".content");
  if (!content) return null;
  fx = document.createElement("div");
  fx.className = "page-fx scanlines";
  fx.setAttribute("aria-hidden", "true");
  content.appendChild(fx);
  return fx;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* Cover the content, run `swap` (the DOM update) while masked, then reveal. */
export async function pageTransition(swap) {
  const el = ensureFx();
  if (!el) { await swap(); return; }

  el.classList.add("show");
  await wait(170);   // cover-in
  await swap();      // swap behind the mask
  await wait(40);    // let layout settle
  el.classList.remove("show");
  await wait(220);   // reveal-out
}
