export type Theme = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "prix-malin:theme";

export const THEME_OPTIONS: ReadonlyArray<{ value: Theme; label: string }> = [
  { value: "system", label: "Système" },
  { value: "light", label: "Clair" },
  { value: "dark", label: "Sombre" },
];

/** Valeur inconnue ou absente : on suit le système. */
export function parseTheme(raw: string | null): Theme {
  return raw === "light" || raw === "dark" ? raw : "system";
}

/** Le stockage peut être indisponible (mode privé) : le thème reste alors volatil. */
export function readStoredTheme(): Theme {
  try {
    return parseTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

export function storeTheme(theme: Theme): void {
  try {
    if (theme === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* préférence non mémorisée : sans conséquence pour le calcul */
  }
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

export type ResolvedTheme = "light" | "dark";

/** Thème réellement affiché : « système » suit la préférence de l'appareil. */
export function resolveTheme(theme: Theme, systemPrefersDark: boolean): ResolvedTheme {
  if (theme === "system") return systemPrefersDark ? "dark" : "light";
  return theme;
}
