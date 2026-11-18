/**
 * Stockage local derrière une interface (ADR-0012) : le reste de l'app ne sait pas où vivent les données.
 * Aujourd'hui `localStorage` ; sous Capacitor, un adaptateur natif remplacera `browserStorage` sans toucher aux stores.
 */
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const STORAGE_KEYS = {
  draft: "pm:draft",
  prices: "pm:prices",
  settings: "pm:settings",
} as const;

/** Stockage en mémoire : tests, et repli quand le navigateur refuse tout stockage. */
export function memoryStorage(initial: Readonly<Record<string, string>> = {}): StorageAdapter {
  const data = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

function attempt<T>(run: () => T, fallback: T): T {
  try {
    return run();
  } catch {
    return fallback;
  }
}

/** `localStorage`, sans jamais lever d'erreur (navigation privée, quota, stockage bloqué). */
export function browserStorage(): StorageAdapter {
  const store = attempt(() => globalThis.localStorage ?? null, null);
  if (store === null) return memoryStorage();
  return {
    getItem: (key) => attempt(() => store.getItem(key), null),
    setItem: (key, value) => attempt(() => store.setItem(key, value), undefined),
    removeItem: (key) => attempt(() => store.removeItem(key), undefined),
  };
}
