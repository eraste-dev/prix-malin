import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { DISCLOSURE, motionAllowed } from "../lib/motion";

gsap.registerPlugin(useGSAP);

/** Chevron qui montre l'état (bas = replié, haut = déplié) ; il pivote d'un demi-tour à chaque changement. */
export function DisclosureChevron({ open }: { readonly open: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const mounted = useRef(false);
  const Icon = open ? ChevronUp : ChevronDown;

  useGSAP(
    () => {
      // Pas de tour à l'affichage initial : seulement quand l'état change.
      if (!mounted.current) {
        mounted.current = true;
        return;
      }
      if (!motionAllowed() || ref.current === null) return;
      gsap.from(ref.current, {
        rotation: open ? -180 : 180,
        duration: DISCLOSURE.chevronDuration,
        ease: "power2.out",
        clearProps: "transform",
      });
    },
    { dependencies: [open], scope: ref },
  );

  return <Icon ref={ref} data-open={open} className="size-5 shrink-0" aria-hidden="true" />;
}

interface DisclosureToggleProps {
  readonly expanded: boolean;
  readonly onToggle: () => void;
  readonly collapsedLabel: string;
  readonly expandedLabel: string;
}

/**
 * Barre qui plie et déplie un détail : fond teinté pleine largeur, texte à gauche, chevron à droite, et
 * `aria-expanded` pour les lecteurs d'écran. On voit que c'est un élément qui s'ouvre (DESIGN.md « Formulaire »).
 */
export function DisclosureToggle({ expanded, onToggle, collapsedLabel, expandedLabel }: DisclosureToggleProps) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={onToggle}
      className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 rounded-2xl bg-muted px-4 text-left text-base font-semibold transition-colors hover:bg-muted/70 focus-visible:outline-3 focus-visible:outline-ring"
    >
      <span>{expanded ? expandedLabel : collapsedLabel}</span>
      <DisclosureChevron open={expanded} />
    </button>
  );
}

/** Contenu qui se déploie en hauteur à son apparition (rien sous « réduire les animations »). */
export function Expand({ children, className }: { readonly children: ReactNode; readonly className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!motionAllowed() || ref.current === null) return;
      gsap.from(ref.current, {
        height: 0,
        opacity: 0,
        overflow: "hidden",
        duration: DISCLOSURE.openDuration,
        ease: "power2.out",
        clearProps: "height,opacity,overflow",
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** En-tête d'un champ détaillé : le titre à gauche, l'icône d'aide à droite (comme dans `AmountField`). */
export function FieldHeader({ title, help }: { readonly title: string; readonly help: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-base font-semibold">{title}</p>
      {help}
    </div>
  );
}
