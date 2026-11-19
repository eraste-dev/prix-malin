import type { ReactNode } from "react";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings, useStores } from "../lib/storeContext";

interface TipProps {
  /** Clé de l'aide : une fois fermée, elle ne revient plus (réinitialisable dans Réglages). */
  readonly tipKey: string;
  readonly children: ReactNode;
}

/** Aide contextuelle à usage unique (docs/14) : au moment pertinent, pas de visite guidée en cascade. */
export function Tip({ tipKey, children }: TipProps) {
  const stores = useStores();
  const seen = useSettings((state) => state.tipsSeen.includes(tipKey));
  if (seen) return null;
  return (
    <div role="note" aria-label="Conseil" className="flex items-start gap-3 rounded-2xl bg-muted p-4">
      <Lightbulb className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <p className="flex-1">{children}</p>
      <Button
        type="button"
        variant="ghost"
        onClick={() => stores.settings.getState().markTip(tipKey)}
        className="h-11 shrink-0 rounded-full px-4 text-base"
      >
        Compris
      </Button>
    </div>
  );
}
