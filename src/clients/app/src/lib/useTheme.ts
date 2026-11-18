import { useCallback, useEffect, useState } from "react";
import {
  applyTheme,
  readStoredTheme,
  resolveTheme,
  storeTheme,
  type ResolvedTheme,
  type Theme,
} from "./theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function systemPrefersDark(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(DARK_QUERY).matches;
}

export interface ThemeState {
  /** Choix de l'utilisateur (système, clair, sombre). */
  readonly theme: Theme;
  /** Thème réellement affiché. */
  readonly effective: ResolvedTheme;
  readonly choose: (next: Theme) => void;
  /** Bascule directe clair ↔ sombre, à partir de ce qui est affiché. */
  readonly toggle: () => void;
}

/** État du thème, partagé par le bouton d'en-tête et l'onglet Réglages. */
export function useTheme(): ThemeState {
  const [theme, setTheme] = useState<Theme>(() => {
    const initial = readStoredTheme();
    applyTheme(initial);
    return initial;
  });
  const [prefersDark, setPrefersDark] = useState<boolean>(systemPrefersDark);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent) => setPrefersDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const choose = useCallback((next: Theme) => {
    setTheme(next);
    applyTheme(next);
    storeTheme(next);
  }, []);

  const effective = resolveTheme(theme, prefersDark);
  const toggle = useCallback(() => choose(effective === "dark" ? "light" : "dark"), [choose, effective]);

  return { theme, effective, choose, toggle };
}
