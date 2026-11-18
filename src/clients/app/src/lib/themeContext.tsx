import { createContext, useContext, type ReactNode } from "react";
import { useTheme } from "./useTheme";

type ThemeValue = ReturnType<typeof useTheme>;

const ThemeContext = createContext<ThemeValue | null>(null);

/** Un seul état de thème pour toute l'app : le bouton d'en-tête et les cartes de Réglages le partagent (L-26). */
export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  const value = useTheme();
  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useThemeContext(): ThemeValue {
  const value = useContext(ThemeContext);
  if (value === null) throw new Error("ThemeProvider manquant autour de l'application");
  return value;
}
