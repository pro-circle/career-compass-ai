// Browser-only mock-data overlay. Persists a flag in localStorage.
// When active, UI components should return canned data from `mock-fixtures.ts`
// instead of live backend results. AI streaming endpoints are unaffected.
const KEY = "ats-engine-mock";

export function isMockActive(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}

export function enableMock() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, "1");
  window.dispatchEvent(new CustomEvent("ats-mock-change", { detail: true }));
}

export function disableMock() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("ats-mock-change", { detail: false }));
}

// React hook lives in `src/hooks/use-mock-active.ts`.
