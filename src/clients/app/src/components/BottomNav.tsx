import { BookOpen, Calculator, House, Settings, Tag } from "lucide-react";
import type { ComponentType } from "react";
import { NavLink } from "react-router";
import { cn } from "@/lib/utils";
import { BEAT } from "../lib/motion";
import { Reveal } from "./Reveal";

interface Tab {
  readonly to: string;
  readonly label: string;
  readonly Icon: ComponentType<{ className?: string }>;
  /** Pour « / » : ne reste pas actif sur les autres pages. */
  readonly end: boolean;
}

const TABS: readonly Tab[] = [
  { to: "/", label: "Accueil", Icon: House, end: true },
  { to: "/calculer", label: "Calculer", Icon: Calculator, end: false },
  { to: "/prix", label: "Mes prix", Icon: Tag, end: false },
  { to: "/comprendre", label: "Comprendre", Icon: BookOpen, end: false },
  { to: "/reglages", label: "Réglages", Icon: Settings, end: false },
];

/** Barre flottante en pilule ; la page active montre son nom, les autres seulement leur icône (docs/ui-ux). */
export function BottomNav() {
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <Reveal
        as="ul"
        variant="fade"
        beat={BEAT.footer}
        className="flex gap-1 rounded-full bg-card p-1.5 shadow-lg ring-1 ring-border"
      >
        {TABS.map(({ to, label, Icon, end }, index) => (
          <Reveal as="li" key={to} beat={BEAT.footer} sub={index + 1}>
            <NavLink
              to={to}
              end={end}
              aria-label={label}
              className={({ isActive }) =>
                cn(
                  "flex h-12 min-w-12 items-center justify-center gap-2 rounded-full px-3 text-base transition-colors focus-visible:outline-3 focus-visible:outline-ring",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="size-5" aria-hidden="true" />
                  {isActive && <span>{label}</span>}
                </>
              )}
            </NavLink>
          </Reveal>
        ))}
      </Reveal>
    </nav>
  );
}
