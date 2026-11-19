import { Link } from "react-router";
import { findActivity } from "../lib/activity";
import { formatAmount } from "../lib/amount";
import { HOME } from "../lib/motion";
import type { SavedPrice } from "../lib/stores";
import { SCENE_CLEAR, useScene } from "../lib/useScene";

interface PriceCarouselProps {
  readonly prices: readonly SavedPrice[];
  /** Appelé quand on ouvre un prix (charge son calcul avant la navigation). */
  readonly onOpen: (price: SavedPrice) => void;
}

/** Derniers prix en carrousel horizontal : la carte suivante dépasse, elles arrivent de la droite une à une. */
export function PriceCarousel({ prices, onOpen }: PriceCarouselProps) {
  const ref = useScene<HTMLUListElement>((_root, part, timeline) => {
    timeline.from(part("card"), {
      x: HOME.cardSlidePx,
      opacity: 0,
      duration: HOME.cardDuration,
      stagger: HOME.cardStagger,
      ease: "power3.out",
      clearProps: SCENE_CLEAR,
    });
  });

  return (
    <ul
      ref={ref}
      aria-label="Derniers prix"
      className="-mx-5 flex list-none snap-x snap-mandatory gap-3 overflow-x-auto p-0 px-5 pb-2"
    >
      {prices.map((price) => (
        <li key={price.id} data-part="card" className="w-56 shrink-0 snap-start">
          <Link
            to="/calculer"
            onClick={() => onOpen(price)}
            className="grid h-full content-between gap-4 rounded-3xl bg-card p-5 outline-offset-4 focus-visible:outline-3 focus-visible:outline-ring"
          >
            <span className="truncate text-lg">{price.nom === "" ? "Sans nom" : price.nom}</span>{" "}
            <span className="text-4xl font-light tabular-nums">{formatAmount(price.prixConseille)} F</span>{" "}
            <span className="text-base text-muted-foreground">{findActivity(price.calcul.type).label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
