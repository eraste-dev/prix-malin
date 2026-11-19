import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TextActionProps {
  readonly onClick: () => void;
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * Action secondaire discrète : un bouton qui a l'allure d'un lien (texte atténué, souligné), à cible de 44 px.
 * Remplace les contrôles segmentés qui surchargeaient le formulaire (DESIGN.md « Formulaire »).
 */
export function TextAction({ onClick, children, className }: TextActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 w-fit cursor-pointer items-center rounded-md text-base text-muted-foreground underline underline-offset-4 outline-offset-4 transition-colors hover:text-foreground focus-visible:outline-3 focus-visible:outline-ring",
        className,
      )}
    >
      {children}
    </button>
  );
}
