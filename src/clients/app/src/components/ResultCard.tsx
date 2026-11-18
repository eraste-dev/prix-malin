import type { PriceBreakdown } from "@prix-malin/domain";
import { Card } from "@/components/ui/card";
import { formatAmount, formatBreakEven } from "../lib/amount";
import { compositionOf } from "../lib/composition";
import { RESULT_BEAT } from "../lib/motion";
import { CompositionGauge } from "./CompositionGauge";
import { Reveal } from "./Reveal";
import { WhyPrice } from "./WhyPrice";

interface ResultCardProps {
  readonly data: PriceBreakdown;
  readonly volume: number;
  readonly marginPct: number;
  readonly feePct: number;
  readonly roundingStep: number;
}

/** Carte sauge du prix conseillé : intitulé, prix, indicateurs, composition, puis le détail du « pourquoi ». */
export function ResultCard({ data, volume, marginPct, feePct, roundingStep }: ResultCardProps) {
  return (
    <Reveal
      as={Card}
      variant="emphasis"
      beat={0}
      aria-label="Prix conseillé"
      role="region"
      className="gap-8 rounded-3xl border-0 bg-card p-8 shadow-none"
    >
      <div className="grid gap-4">
        <Reveal as="p" beat={RESULT_BEAT.caption} className="text-sm text-muted-foreground">
          Votre prix conseillé
        </Reveal>
        <Reveal
          as="p"
          beat={RESULT_BEAT.price}
          data-testid="price"
          className="text-6xl font-light tabular-nums"
        >
          {formatAmount(data.priceExclVat)}{" "}
          <span className="text-base font-medium text-muted-foreground">F CFA</span>
        </Reveal>
        <dl className="grid gap-1 [&_dd]:tabular-nums [&_dt]:text-muted-foreground">
          <Reveal beat={RESULT_BEAT.firstRow} className="flex justify-between gap-4">
            <dt>Coût de revient</dt>
            <dd data-testid="full-cost">{formatAmount(data.fullCost)} F</dd>
          </Reveal>
          <Reveal beat={RESULT_BEAT.secondRow} className="flex justify-between gap-4">
            <dt>Ventes minimum par mois</dt>
            <dd data-testid="break-even">{formatBreakEven(data.breakEvenUnits)}</dd>
          </Reveal>
        </dl>
      </div>
      <CompositionGauge parts={compositionOf(data)} />
      <WhyPrice data={data} volume={volume} marginPct={marginPct} feePct={feePct} roundingStep={roundingStep} />
    </Reveal>
  );
}
