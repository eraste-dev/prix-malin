import { Calculator, Settings } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { BEAT } from "../lib/motion";
import { Reveal } from "./Reveal";

export type TabId = "calculate" | "settings";

const TABS: ReadonlyArray<{ id: TabId; label: string; Icon: ComponentType<{ className?: string }> }> = [
  { id: "calculate", label: "Calculer", Icon: Calculator },
  { id: "settings", label: "Réglages", Icon: Settings },
];

interface BottomNavProps {
  readonly current: TabId;
  readonly onChange: (tab: TabId) => void;
}

/** Barre flottante en pilule ; l'onglet actif est une pastille sombre (docs/ui-ux). */
export function BottomNav({ current, onChange }: BottomNavProps) {
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
        {TABS.map(({ id, label, Icon }, index) => {
          const active = id === current;
          return (
            <Reveal as="li" key={id} beat={BEAT.footer} sub={index + 1}>
              <button
                type="button"
                aria-label={label}
                aria-current={active ? "page" : undefined}
                onClick={() => onChange(id)}
                className={cn(
                  "flex h-14 min-w-14 items-center justify-center gap-2 rounded-full px-4 text-base transition-colors focus-visible:outline-3 focus-visible:outline-ring",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {active && <span>{label}</span>}
              </button>
            </Reveal>
          );
        })}
      </Reveal>
    </nav>
  );
}
