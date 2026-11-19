import { Lock } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Message d'une étape pas encore disponible : encadré en tirets, avec un cadenas à droite. Annoncé comme un statut,
 * sauf quand `announce` est faux (un seul message annoncé à la fois, pas deux).
 */
export function LockedHint({ children, announce = true }: { readonly children: ReactNode; readonly announce?: boolean }) {
  return (
    <div
      role={announce ? "status" : undefined}
      data-testid="locked-hint"
      className="flex items-center justify-between gap-4 rounded-3xl border border-dashed border-border p-5 text-muted-foreground"
    >
      <p>{children}</p>
      <Lock className="size-5 shrink-0" aria-hidden="true" />
    </div>
  );
}
