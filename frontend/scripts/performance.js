import { minimalMode, setMinimalModeState } from "./state.js";
import { loadWasm, pauseWasmRendering } from "./wasm.js";

const STORAGE_KEY = "minimal-mode";
const MOBILE_QUERY = "(max-width: 760px), (pointer: coarse)";

function prefersMinimal() {
  const mobile = window.matchMedia?.(MOBILE_QUERY).matches ?? false;
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const saveData = navigator.connection?.saveData ?? false;
  return mobile || reducedMotion || saveData;
}

function updateToggle() {
  const btn = document.getElementById("minimal-toggle");
  if (!btn) return;
  btn.classList.toggle("active", minimalMode);
  btn.setAttribute("aria-pressed", minimalMode ? "true" : "false");
  btn.title = minimalMode ? "Disable minimal mode" : "Enable minimal mode";
}

export function setMinimalMode(enabled, { persist = true, loadWhenDisabled = true } = {}) {
  setMinimalModeState(Boolean(enabled));
  document.body.classList.toggle("minimal-mode", minimalMode);
  updateToggle();

  if (persist) localStorage.setItem(STORAGE_KEY, minimalMode ? "1" : "0");

  pauseWasmRendering(minimalMode);

  if (!minimalMode && loadWhenDisabled) {
    loadWasm().catch((err) => console.error("[WASM]", err));
  }
}

export function toggleMinimalMode() {
  setMinimalMode(!minimalMode);
}

export function initMinimalMode() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const enabled = saved == null ? prefersMinimal() : saved === "1";

  setMinimalMode(enabled, { persist: false, loadWhenDisabled: false });

  const mq = window.matchMedia?.(MOBILE_QUERY);
  mq?.addEventListener?.("change", () => {
    if (localStorage.getItem(STORAGE_KEY) == null) {
      setMinimalMode(prefersMinimal(), { persist: false, loadWhenDisabled: false });
    }
  });
}
