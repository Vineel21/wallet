export const STORAGE = {
  users: "wallax.users",
  session: "wallax.session",
  wallets: "wallax.wallets",
  events: "wallax.securityEvents",
  draftPhrase: "wallax.draftPhrase",
  pendingTransfer: "wallax.pendingTransfer",
  lastTransfer: "wallax.lastTransfer",
  activeWalletId: "wallax.activeWalletId",
  pendingResetEmail: "wallax.pendingResetEmail",
  pendingResetCode: "wallax.pendingResetCode"
} as const;

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readText(key: string, fallback = "") {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

export function writeText(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
}

export function removeStorage(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}
