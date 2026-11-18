import { SWAP_CLASS } from "../lib/motion";
import type { ResolvedTheme } from "../lib/theme";
import { THEME_ICONS } from "./themeIcons";

interface ThemeButtonProps {
  readonly effective: ResolvedTheme;
  readonly onToggle: () => void;
}

/** Bouton rond d'en-tête, toujours visible : un clic bascule clair ↔ sombre. */
export function ThemeButton({ effective, onToggle }: ThemeButtonProps) {
  const Icon = THEME_ICONS[effective];
  const label = effective === "dark" ? "Passer en mode clair" : "Passer en mode sombre";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onToggle}
      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-card text-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-muted focus-visible:outline-3 focus-visible:outline-ring"
    >
      {/* key : l'icône est recréée à chaque bascule, ce qui rejoue sa petite rotation */}
      <Icon key={effective} className={`size-5 ${SWAP_CLASS}`} aria-hidden="true" />
    </button>
  );
}
