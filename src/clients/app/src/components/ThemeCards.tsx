import { cn } from "@/lib/utils";
import { THEME_OPTIONS, type Theme } from "../lib/theme";
import { Reveal } from "./Reveal";
import { THEME_ICONS } from "./themeIcons";

interface ThemeCardsProps {
  readonly theme: Theme;
  readonly onChange: (theme: Theme) => void;
}

/** Trois cartes à icône (onglet Réglages). Boutons radio natifs : clavier et lecteurs d'écran gratuits. */
export function ThemeCards({ theme, onChange }: ThemeCardsProps) {
  return (
    <div role="radiogroup" aria-label="Thème" className="grid grid-cols-3 gap-3">
      {THEME_OPTIONS.map(({ value, label }, index) => {
        const Icon = THEME_ICONS[value];
        const selected = theme === value;
        return (
          <Reveal
            as="label"
            key={value}
            beat={1}
            sub={index}
            className={cn(
              "relative flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl bg-card p-3 text-base ring-1 ring-border transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ring",
              selected && "bg-primary text-primary-foreground ring-primary",
            )}
          >
            <input
              type="radio"
              name="theme"
              value={value}
              checked={selected}
              onChange={() => onChange(value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <Icon className="size-6" aria-hidden="true" />
            <span>{label}</span>
          </Reveal>
        );
      })}
    </div>
  );
}
