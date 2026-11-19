import { Card } from "@/components/ui/card";
import { formatAmount, formatBreakEven } from "../lib/amount";
import { compositionOf } from "../lib/composition";
import type { Calcul } from "../lib/model";
import { RESULT_BEAT } from "../lib/motion";
import type { OutcomeResult } from "../lib/outcome";
import { describeCompetitor } from "../lib/verdict";
import { CompositionGauge } from "./CompositionGauge";
import { HelpButton } from "./HelpButton";
import { Reveal } from "./Reveal";
import { Verdict } from "./Verdict";
import { WhyPrice } from "./WhyPrice";

interface ResultCardProps {
  readonly result: OutcomeResult;
  readonly calcul: Calcul;
}

/** Carte du prix : intitulé, prix, indicateurs, verdict, concurrent, composition, puis le détail du « pourquoi ». */
export function ResultCard({ result, calcul }: ResultCardProps) {
  const { data, mode, verdict, recommended, competitor } = result;
  const own = mode === "monPrix";
  const vat = calcul.tva.actif;
  const showComposition = data.margin > 0;

  return (
    <Reveal
      as={Card}
      variant="emphasis"
      beat={0}
      aria-label={own ? "Analyse de votre prix actuel" : "Prix conseillé"}
      role="region"
      className="gap-8 rounded-3xl border-0 bg-card p-8 shadow-none"
    >
      <div className="grid gap-4">
        <Reveal as="p" beat={RESULT_BEAT.caption} className="text-sm text-muted-foreground">
          {own ? "Votre prix actuel" : "Votre prix conseillé"}
        </Reveal>
        <Reveal
          as="p"
          beat={RESULT_BEAT.price}
          data-testid="price"
          className="text-6xl font-light whitespace-nowrap tabular-nums"
        >
          {formatAmount(data.customerPrice)}{" "}
          <span className="text-base font-medium text-muted-foreground">F CFA{vat ? ` ${calcul.tva.base}` : ""}</span>
        </Reveal>
        {vat && (
          <p data-testid="price-other" className="text-muted-foreground">
            {calcul.tva.base === "HT"
              ? `Prix TTC : ${formatAmount(data.priceInclVat)} F`
              : `Prix HT : ${formatAmount(data.priceExclVat)} F`}
          </p>
        )}
        {own && recommended !== null && (
          <p data-testid="recommended" className="text-muted-foreground">
            Prix conseillé : {formatAmount(recommended.customerPrice)} F
          </p>
        )}
        <dl className="grid gap-1 [&_dd]:tabular-nums [&_dt]:text-muted-foreground">
          <Reveal beat={RESULT_BEAT.firstRow} className="flex justify-between gap-4">
            <dt className="flex items-center gap-1">
              Coût de revient
              <HelpButton term="cout-de-revient" />
            </dt>
            <dd data-testid="full-cost">{formatAmount(data.fullCost)} F</dd>
          </Reveal>
          <Reveal beat={RESULT_BEAT.secondRow} className="flex justify-between gap-4">
            <dt className="flex items-center gap-1">
              Ventes minimum par mois
              <HelpButton term="seuil" />
            </dt>
            <dd data-testid="break-even">{formatBreakEven(data.breakEvenUnits)}</dd>
          </Reveal>
        </dl>
      </div>

      {verdict !== null && <Verdict verdict={verdict} data={data} />}
      {competitor !== null && (
        <p data-testid="competitor-note" className="rounded-2xl bg-muted p-4">
          {describeCompetitor(competitor)}
        </p>
      )}

      {showComposition && <CompositionGauge parts={compositionOf(data)} />}
      {showComposition && (
        <WhyPrice
          data={data}
          volume={calcul.volume ?? 0}
          targetMarginPct={own ? null : calcul.marge}
          feePct={calcul.frais}
          roundingStep={calcul.arrondi.pas}
        />
      )}
    </Reveal>
  );
}
