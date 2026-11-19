import { formatAmount } from "../lib/amount";
import { ONBOARD } from "../lib/motion";
import { playStall, swingTag } from "../lib/stallMotion";
import { countUp, useScene } from "../lib/useScene";
import { Awning, Bottle } from "./MarketParts";

/** Point d'attache du fil de l'étiquette, dans le repère du dessin. */
const TAG_ORIGIN = "244 44";

interface HomeStallProps {
  /** Dernier prix enregistré, ou `null` s'il n'y en a pas encore. */
  readonly price: number | null;
}

/** L'étal de l'Accueil : une étiquette suspendue qui affiche le dernier prix enregistré (DESIGN.md « Accueil »). */
export function HomeStall({ price }: HomeStallProps) {
  const label = price === null ? "?" : formatAmount(price);
  const ref = useScene((_root, part, timeline) => {
    const [text] = part("price");
    playStall(part, timeline, TAG_ORIGIN);
    if (price === null || text === undefined) return;
    return countUp(timeline, text, price, formatAmount, ONBOARD.priceCountDelay, ONBOARD.priceCountDuration);
  });

  return (
    <svg
      ref={ref}
      role="img"
      aria-label={
        price === null
          ? "Un étal avec une étiquette vide : pas encore de prix enregistré"
          : `Un étal avec une étiquette : votre dernier prix, ${label} F`
      }
      viewBox="0 0 320 150"
      className="block w-full"
    >
      <rect x="0" y="132" width="320" height="18" className="fill-border" />
      <rect x="0" y="132" width="320" height="4" className="fill-foreground/15" />

      <Awning height={40} />
      <Bottle x={40} baseY={132} body="fill-primary" />
      <Bottle x={84} baseY={132} body="fill-positive" />
      <Bottle x={128} baseY={132} body="fill-primary" />

      <g
        data-part="tag"
        data-testid="home-tag"
        onClick={(event) => swingTag(event.currentTarget, TAG_ORIGIN)}
        className="cursor-pointer"
      >
        <line x1="244" y1="44" x2="244" y2="72" className="stroke-foreground" strokeWidth="2" />
        <rect x="196" y="72" width="96" height="60" rx="10" className="fill-card" />
        <circle cx="244" cy="81" r="4" className="fill-muted" />
        <text
          data-part="price"
          data-testid="home-price"
          x="244"
          y="109"
          textAnchor="middle"
          className="fill-foreground text-2xl font-light tabular-nums"
        >
          {label}
        </text>
        <text x="244" y="127" textAnchor="middle" className="fill-muted-foreground text-base font-medium">
          F CFA
        </text>
      </g>
    </svg>
  );
}
