import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { formatAmount, formatPercent } from "../lib/amount";
import { SHARE, motionAllowed } from "../lib/motion";

gsap.registerPlugin(useGSAP);

export interface ProductShare {
  readonly id: string;
  readonly name: string;
  readonly volume: number;
  /** Part des charges, en francs par mois. */
  readonly amount: number;
  /** Part des charges, de 0 à 100. */
  readonly percent: number;
}

/** Barre fine : piste en `border`, remplissage encre. Se remplit à l'arrivée puis glisse quand la part change. */
function ShareBar({ percent, rank }: { readonly percent: number; readonly rank: number }) {
  const fill = useRef<SVGRectElement>(null);
  const previous = useRef(0);

  useGSAP(
    () => {
      const from = previous.current;
      previous.current = percent;
      if (!motionAllowed() || fill.current === null || from === percent) return;
      gsap.fromTo(
        fill.current,
        { attr: { width: from } },
        {
          attr: { width: percent },
          duration: SHARE.duration,
          delay: from === 0 ? Math.min(rank, SHARE.maxRank) * SHARE.stagger : 0,
          ease: "power2.out",
        },
      );
    },
    { dependencies: [percent], scope: fill },
  );

  return (
    <svg viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true" className="h-2 w-full">
      <rect x="0" y="0" width="100" height="8" rx="4" className="fill-border" />
      <rect ref={fill} data-testid="share-bar-fill" x="0" y="0" width={percent} height="8" rx="4" className="fill-foreground" />
    </svg>
  );
}

/** Répartition des charges : une carte par produit, sa part en francs, une barre et le détail du calcul. */
export function ShareList({ shares }: { readonly shares: readonly ProductShare[] }) {
  return (
    <ul aria-label="Répartition des charges par produit" className="grid list-none gap-3 p-0">
      {shares.map((share, rank) => (
        <li key={share.id} className="grid gap-2 rounded-3xl bg-card p-5">
          <div className="flex items-baseline justify-between gap-4">
            <span className="min-w-0 truncate font-semibold">{share.name}</span>
            <span className="shrink-0 font-semibold tabular-nums">{formatAmount(share.amount)} F</span>
          </div>
          <ShareBar percent={share.percent} rank={rank} />
          <p className="text-muted-foreground tabular-nums">
            {formatAmount(share.volume)} ventes par mois · {formatPercent(share.percent)} % des charges
          </p>
        </li>
      ))}
    </ul>
  );
}
