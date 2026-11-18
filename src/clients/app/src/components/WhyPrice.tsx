import { useGSAP } from "@gsap/react";
import type { PriceBreakdown } from "@prix-malin/domain";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";
import { useRef, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatAmount, formatMoney, formatPercent } from "../lib/amount";
import { DISCLOSURE, RESULT_BEAT, motionAllowed } from "../lib/motion";
import { Reveal } from "./Reveal";

interface WhyPriceProps {
  readonly data: PriceBreakdown;
  readonly volume: number;
  readonly marginPct: number;
  readonly feePct: number;
  readonly roundingStep: number;
}

/** « Pourquoi ce prix ? » (docs/15 E06, 5) : lignes chiffrées, formule en clair et effet de l'arrondi (RG-04, RG-05, RG-06). */
export function WhyPrice({ data, volume, marginPct, feePct, roundingStep }: WhyPriceProps) {
  const [open, setOpen] = useState(false);
  const chevronRef = useRef<SVGSVGElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const rounded = data.priceExclVat > data.rawPrice;

  // Le chevron pivote (GSAP) ; sans mouvement, il prend sa position d'emblée.
  useGSAP(
    () => {
      if (chevronRef.current === null) return;
      const rotation = open ? 180 : 0;
      if (motionAllowed()) {
        gsap.to(chevronRef.current, { rotation, duration: DISCLOSURE.chevronDuration, ease: "power2.out" });
      } else {
        chevronRef.current.style.transform = `rotate(${rotation}deg)`;
      }
    },
    { dependencies: [open], scope: chevronRef },
  );

  // Le détail se déploie en hauteur à son montage (Radix le retire du DOM une fois replié).
  useGSAP(
    () => {
      if (!open || !motionAllowed() || detailsRef.current === null) return;
      gsap.from(detailsRef.current, {
        height: 0,
        opacity: 0,
        overflow: "hidden",
        duration: DISCLOSURE.openDuration,
        ease: "power2.out",
        clearProps: "height,opacity,overflow",
      });
    },
    { dependencies: [open], scope: detailsRef },
  );

  return (
    <Reveal beat={RESULT_BEAT.composition} sub={1}>
      <Collapsible open={open} onOpenChange={setOpen} className="grid gap-4">
        <CollapsibleTrigger className="flex min-h-11 w-full items-center justify-between gap-4 rounded-xl text-left font-semibold outline-offset-2 focus-visible:outline-3 focus-visible:outline-ring">
          Pourquoi ce prix ?
          <ChevronDown ref={chevronRef} data-open={open} className="size-5 shrink-0" aria-hidden="true" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div ref={detailsRef} data-testid="why" className="grid gap-3">
            <p>
              Coût direct par vente : <strong className="tabular-nums">{formatMoney(data.directCost)} F</strong>
            </p>
            <p>
              Part des charges par vente :{" "}
              <strong className="tabular-nums">{formatMoney(data.fixedPerUnit)} F</strong>
              <span className="text-muted-foreground">
                {" "}
                ({formatAmount(data.fixedTotal)} F ÷ {formatAmount(volume)} ventes)
              </span>
            </p>
            <p>
              Coût de revient : <strong className="tabular-nums">{formatMoney(data.fullCost)} F</strong>
            </p>
            <p>
              Frais de paiement ({formatPercent(feePct)} %) :{" "}
              <strong className="tabular-nums">{formatMoney(data.fee)} F</strong>
            </p>
            <p>
              Marge : <strong className="tabular-nums">{formatMoney(data.margin)} F</strong>, soit{" "}
              {formatPercent(data.markupRate * 100)} % du prix pour {formatPercent(marginPct)} % visés.
            </p>
            <p className="text-muted-foreground">Prix = coût direct + part des charges + frais + marge.</p>
            {rounded && (
              <p>
                Arrondi : {formatMoney(data.rawPrice)} F devient{" "}
                <strong className="tabular-nums">{formatAmount(data.priceExclVat)} F</strong> (au multiple de{" "}
                {formatAmount(roundingStep)} F supérieur). La différence s'ajoute à votre marge.
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Reveal>
  );
}
