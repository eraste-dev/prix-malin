import { ONBOARD } from "../lib/motion";
import { playStall, swingTag } from "../lib/stallMotion";
import { countUp, useScene } from "../lib/useScene";
import { Awning, Bottle } from "./MarketParts";

const PRICE = 450;
/** Point d'attache du fil de l'étiquette, dans le repère du dessin : le balancier tourne autour. */
const TAG_ORIGIN = "222 56";

/** Scène 1 : l'étal, les bouteilles de bissap et l'étiquette de prix suspendue (DESIGN.md « Onboarding »). */
export function SceneMarket() {
  const ref = useScene((_root, part, timeline) => {
    const [price] = part("price");
    if (price === undefined) return;
    playStall(part, timeline, TAG_ORIGIN);
    return countUp(timeline, price, PRICE, String, ONBOARD.priceCountDelay, ONBOARD.priceCountDuration);
  });

  return (
    <svg
      ref={ref}
      role="img"
      aria-label="Un étal de bissap : trois bouteilles sous un auvent, avec une étiquette à 450 F"
      viewBox="0 0 320 280"
      className="h-full max-h-72 w-full"
    >
      <rect x="0" y="196" width="320" height="84" className="fill-border" />
      <rect x="0" y="196" width="320" height="6" className="fill-foreground/15" />

      <Awning height={48} />
      <Bottle x={56} baseY={196} body="fill-primary" />
      <Bottle x={100} baseY={196} body="fill-positive" />
      <Bottle x={144} baseY={196} body="fill-primary" />

      <g
        data-part="tag"
        data-testid="scene-tag"
        onClick={(event) => swingTag(event.currentTarget, TAG_ORIGIN)}
        className="cursor-pointer"
      >
        <line x1="222" y1="56" x2="222" y2="104" className="stroke-foreground" strokeWidth="2" />
        <rect x="186" y="104" width="72" height="66" rx="10" className="fill-card" />
        <circle cx="222" cy="114" r="4" className="fill-muted" />
        <text
          data-part="price"
          data-testid="scene-price"
          x="222"
          y="144"
          textAnchor="middle"
          className="fill-foreground text-3xl font-light tabular-nums"
        >
          {PRICE}
        </text>
        <text x="222" y="163" textAnchor="middle" className="fill-muted-foreground text-base font-medium">
          F CFA
        </text>
      </g>
    </svg>
  );
}
