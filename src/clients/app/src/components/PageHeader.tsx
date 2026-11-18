import type { ReactNode } from "react";
import { formatToday } from "../lib/dateLabel";
import { BEAT } from "../lib/motion";
import { useThemeContext } from "../lib/themeContext";
import { Reveal } from "./Reveal";
import { ThemeButton } from "./ThemeButton";

interface PageHeaderProps {
  /** Le titre de la page (h1). */
  readonly children: ReactNode;
}

/** En-tête commun : date discrète, gros titre léger, bouton de thème toujours visible (docs/ui-ux, L-26). */
export function PageHeader({ children }: PageHeaderProps) {
  const { effective, toggle } = useThemeContext();
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="grid gap-1">
        <Reveal
          as="p"
          beat={BEAT.top}
          data-testid="today"
          className="text-sm text-muted-foreground first-letter:uppercase"
        >
          {formatToday(new Date())}
        </Reveal>
        <Reveal as="h1" beat={BEAT.title} className="text-4xl leading-tight font-light">
          {children}
        </Reveal>
      </div>
      <Reveal beat={BEAT.top} sub={1} className="shrink-0">
        <ThemeButton effective={effective} onToggle={toggle} />
      </Reveal>
    </header>
  );
}
