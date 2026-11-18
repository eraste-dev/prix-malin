import { computePrice, type PricingError, type PricingInput } from "@prix-malin/domain";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { ActivityChoice } from "./components/ActivityChoice";
import { AdjustPanel } from "./components/AdjustPanel";
import { AmountField } from "./components/AmountField";
import { BottomNav, type TabId } from "./components/BottomNav";
import { ChangeActivityDialog } from "./components/ChangeActivityDialog";
import { Reveal } from "./components/Reveal";
import { ResultCard } from "./components/ResultCard";
import { Step } from "./components/Step";
import { StepRail } from "./components/StepRail";
import { ThemeCards } from "./components/ThemeCards";
import { ThemeButton } from "./components/ThemeButton";
import { BEAT } from "./lib/motion";
import { formatToday } from "./lib/dateLabel";
import { computeStepStatuses, describeSteps, STEP_TITLES } from "./lib/steps";
import { useActivity } from "./lib/useActivity";
import { useTheme } from "./lib/useTheme";

/** TVA désactivée, base HT par défaut (docs/15). Marge, frais et arrondi viennent du type d'activité. */
const VAT_DEFAULT = { enabled: false, base: "HT" } as const satisfies PricingInput["vat"];

const INTRO = "Trois nombres suffisent pour votre premier prix.";
const FIXED_PROMPT = "Combien payez-vous chaque mois, même sans vendre ?";
const GENERIC_ERROR = "Ces valeurs ne permettent pas de calculer un prix.";

/** Un message par cause d'échec du moteur ; la table est exhaustive par construction. */
const ERROR_MESSAGES: Readonly<Record<PricingError, string>> = {
  INVALID_VOLUME: "Combien en vendez-vous par mois ?",
  NO_COST: "Combien vous coûte une vente ?",
  INVALID_INPUT: GENERIC_ERROR,
  MARGIN_FEES_TOO_HIGH: GENERIC_ERROR,
};

export function App() {
  const [cost, setCost] = useState<number | null>(null);
  const [fixed, setFixed] = useState<number | null>(null);
  const [volume, setVolume] = useState<number | null>(null);
  const [tab, setTab] = useState<TabId>("calculate");
  const { theme, effective, choose, toggle } = useTheme();
  const { activity, marginPct, feePct, pending, setMarginPct, setFeePct, requestChange, confirmChange, cancelChange } =
    useActivity();
  const roundingStep = activity.roundingStep;

  const outcome = useMemo(() => {
    if (cost === null) return { message: INTRO } as const;
    if (fixed === null) return { message: FIXED_PROMPT } as const;
    const result = computePrice({
      vat: VAT_DEFAULT,
      rounding: { enabled: true, step: roundingStep },
      marginPct,
      feePct,
      directLines: [{ quantity: 1, unitPrice: cost }],
      fixedMonthly: [fixed],
      monthlyVolume: volume ?? 0,
    });
    return result.ok
      ? ({ data: result.data } as const)
      : ({ message: ERROR_MESSAGES[result.reason] } as const);
  }, [cost, fixed, volume, marginPct, feePct, roundingStep]);

  const statuses = computeStepStatuses({ hasCost: cost !== null, hasResult: "data" in outcome });
  const summaries = describeSteps({
    activityLabel: activity.label,
    cost,
    fixed,
    volume,
    price: "data" in outcome ? outcome.data.priceExclVat : null,
    marginPct,
    feePct,
  });

  return (
    <>
      <main className="mx-auto grid max-w-xl gap-12 px-5 pt-6 pb-32">
        <header className="flex items-start justify-between gap-4">
          <div className="grid gap-1">
            <Reveal
              as="p"
              beat={BEAT.top}
              data-testid="today"
              className="text-sm text-muted-foreground first-letter:uppercase"
            >
              {formatToday(new Date())}
            </Reveal>
            <Reveal as="h1" beat={BEAT.title} className="text-4xl leading-tight font-light">
              Bonjour, trouvons <span className="font-normal">votre prix</span>
            </Reveal>
          </div>
          <Reveal beat={BEAT.top} sub={1} className="shrink-0">
            <ThemeButton effective={effective} onToggle={toggle} />
          </Reveal>
        </header>

        <div hidden={tab !== "calculate"} className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3">
          {/* Colonne réservée : le rail est en position fixe, hors du flux. */}
          <StepRail titles={STEP_TITLES} statuses={statuses} summaries={summaries} />
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
                  value={cost}
                  onChange={setCost}
                />
                <AmountField
                  id="fixed"
                  label="Vos charges du mois"
                  hint="Loyer, électricité, transport… et votre salaire."
                  example="220 000"
                  unit="FCFA"
                  beat={BEAT.field2}
                  value={fixed}
                  onChange={setFixed}
                />
                <AmountField
                  id="volume"
                  label="Ventes par mois"
                  hint="Combien de ventes faites-vous en un mois ?"
                  example="2 000"
                  beat={BEAT.field3}
                  value={volume}
                  onChange={setVolume}
                />
              </form>
            </Card>
          </Step>

          <Step stepKey="result" title={STEP_TITLES.result} status={statuses.result} beat={BEAT.footer}>
            {"data" in outcome ? (
              <ResultCard
                data={outcome.data}
                volume={volume ?? 0}
                marginPct={marginPct}
                feePct={feePct}
                roundingStep={roundingStep}
              />
            ) : (
              <p role="status" className="text-muted-foreground">
                {outcome.message}
              </p>
            )}
          </Step>

          <Step stepKey="adjust" title={STEP_TITLES.adjust} status={statuses.adjust} beat={BEAT.footer}>
            {"data" in outcome ? (
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

        <section hidden={tab !== "settings"} aria-label="Réglages" className="grid gap-3">
          <Reveal as="h2" beat={0} className="text-xl font-light">
            Thème
          </Reveal>
          <ThemeCards theme={theme} onChange={choose} />
        </section>
      </main>

      <ChangeActivityDialog pending={pending} onConfirm={confirmChange} onCancel={cancelChange} />
      <BottomNav current={tab} onChange={setTab} />
    </>
  );
}
