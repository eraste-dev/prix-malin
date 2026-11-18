import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ActivityChoice } from "../components/ActivityChoice";
import { AdjustPanel } from "../components/AdjustPanel";
import { AmountField } from "../components/AmountField";
import { ChangeActivityDialog } from "../components/ChangeActivityDialog";
import { PageHeader } from "../components/PageHeader";
import { ResultCard } from "../components/ResultCard";
import { Step } from "../components/Step";
import { StepRail } from "../components/StepRail";
import { chargesTotalOf, directTotalOf } from "../lib/model";
import { BEAT } from "../lib/motion";
import { computeOutcome } from "../lib/outcome";
import { computeStepStatuses, describeSteps, STEP_TITLES } from "../lib/steps";
import { useCalc, useStores } from "../lib/storeContext";
import { useActivity } from "../lib/useActivity";

/** Écran Calculer : un stepper vertical fixe, de « Que vendez-vous ? » jusqu'au prix et à ses réglages. */
export function CalculerPage() {
  const stores = useStores();
  const calcul = useCalc((state) => state.calcul);
  const actions = stores.calc.getState();
  const { activity, marginPct, feePct, pending, setMarginPct, setFeePct, requestChange, confirmChange, cancelChange } =
    useActivity();

  const outcome = useMemo(() => computeOutcome(calcul), [calcul]);
  const cost = directTotalOf(calcul);
  const fixed = chargesTotalOf(calcul);
  const result = "data" in outcome ? outcome : null;

  const statuses = computeStepStatuses({ hasCost: cost !== null, hasResult: result !== null });
  const summaries = describeSteps({
    activityLabel: activity.label,
    cost,
    fixed,
    volume: calcul.volume,
    price: result === null ? null : result.data.priceExclVat,
    marginPct,
    feePct,
  });

  return (
    <>
      <PageHeader>
        Bonjour, trouvons <span className="font-normal">votre prix</span>
      </PageHeader>

      <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3">
        <StepRail titles={STEP_TITLES} statuses={statuses} summaries={summaries} />
        {/* Colonne réservée : le rail est en position fixe, hors du flux. */}
        <div aria-hidden="true" />
        <div className="grid gap-12">
          <Step stepKey="type" title={STEP_TITLES.type} status={statuses.type} beat={BEAT.title}>
            <ActivityChoice value={activity.id} onChange={requestChange} />
          </Step>

          <Step stepKey="numbers" title={STEP_TITLES.numbers} status={statuses.numbers} beat={BEAT.field1}>
            <Card className="gap-8 rounded-3xl border-0 p-8 shadow-none">
              <form
                aria-label="Vos trois questions"
                onSubmit={(event) => event.preventDefault()}
                className="grid gap-8"
              >
                <AmountField
                  id="cost"
                  label="Ce que ça vous coûte à chaque vente"
                  hint="Comptez tout ce que vous dépensez pour une vente : matières, emballage, transport."
                  example="210"
                  unit="FCFA"
                  beat={BEAT.field1}
                  value={calcul.coutDirect.total}
                  onChange={actions.setCostTotal}
                />
                <AmountField
                  id="fixed"
                  label="Vos charges du mois"
                  hint="Loyer, électricité, transport… et votre salaire."
                  example="220 000"
                  unit="FCFA"
                  beat={BEAT.field2}
                  value={calcul.chargesFixes.total}
                  onChange={actions.setChargesTotal}
                />
                <AmountField
                  id="volume"
                  label="Ventes par mois"
                  hint="Combien de ventes faites-vous en un mois ?"
                  example="2 000"
                  beat={BEAT.field3}
                  value={calcul.volume}
                  onChange={actions.setVolume}
                />
              </form>
            </Card>
          </Step>

          <Step stepKey="result" title={STEP_TITLES.result} status={statuses.result} beat={BEAT.footer}>
            {result !== null ? (
              <ResultCard
                data={result.data}
                volume={calcul.volume ?? 0}
                marginPct={marginPct}
                feePct={feePct}
                roundingStep={calcul.arrondi.pas}
              />
            ) : (
              <p role="status" className="text-muted-foreground">
                {"message" in outcome ? outcome.message : ""}
              </p>
            )}
          </Step>

          <Step stepKey="adjust" title={STEP_TITLES.adjust} status={statuses.adjust} beat={BEAT.footer}>
            {result !== null ? (
              <AdjustPanel
                marginPct={marginPct}
                feePct={feePct}
                onMarginChange={setMarginPct}
                onFeeChange={setFeePct}
              />
            ) : (
              <p className="text-muted-foreground">Marge et frais de paiement : disponibles avec votre prix.</p>
            )}
          </Step>
        </div>
      </div>

      <ChangeActivityDialog pending={pending} onConfirm={confirmChange} onCancel={cancelChange} />
    </>
  );
}
