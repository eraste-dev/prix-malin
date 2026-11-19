import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ReactNode } from "react";
import { CALC, motionAllowed } from "../lib/motion";
import { useScene } from "../lib/useScene";

interface PriceTagProps {
  /** Le prix affiché : quand il change, l'étiquette rebondit. */
  readonly amount: number;
  readonly children: ReactNode;
}

/**
 * L'étiquette du prix (signature du produit) : fond teinté, œillet rond à gauche. Elle se balance une fois à
 * l'arrivée du prix, puis rebondit à chaque changement (la marge qu'on essaie). Rien sous « réduire les animations ».
 */
export function PriceTag({ amount, children }: PriceTagProps) {
  const ref = useScene<HTMLDivElement>((root, _part, timeline) => {
    timeline.from(root, {
      rotation: CALC.tagStartAngle,
      transformOrigin: "24px 0",
      duration: CALC.tagSwingDuration,
      ease: "elastic.out(1, 0.35)",
      clearProps: "transform",
    });
  });
  const mounted = useRef(false);

  useGSAP(
    () => {
      if (!mounted.current) {
        mounted.current = true;
        return;
      }
      if (!motionAllowed() || ref.current === null) return;
      gsap.fromTo(
        ref.current,
        { scale: CALC.bumpFrom },
        { scale: 1, duration: CALC.bumpDuration, ease: "back.out(2)", clearProps: "transform" },
      );
    },
    { dependencies: [amount], scope: ref },
  );

  return (
    <div ref={ref} data-testid="price-tag" className="relative grid gap-1 rounded-3xl bg-muted py-5 pr-5 pl-12">
      <span aria-hidden="true" className="absolute top-1/2 left-5 size-3 -translate-y-1/2 rounded-full bg-card" />
      {children}
    </div>
  );
}
