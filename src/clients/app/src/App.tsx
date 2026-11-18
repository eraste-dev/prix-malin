import { computePrice, type PricingError, type PricingInput } from "@prix-malin/domain";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { AmountField } from "./components/AmountField";
import { BottomNav, type TabId } from "./components/BottomNav";
import { Reveal } from "./components/Reveal";
import { ThemeCards } from "./components/ThemeCards";
import { ThemeButton } from "./components/ThemeButton";
import { formatAmount, formatBreakEven } from "./lib/amount";
import { formatToday } from "./lib/dateLabel";
import { BEAT, RESULT_BEAT } from "./lib/motion";
import { useTheme } from "./lib/useTheme";

/** Défauts « Je fabrique » (docs/15). Le choix du type d'activité viendra avec l'écran Q1. */
const DEFAULTS = {
  marginPct: 25,
  feePct: 1,
  rounding: { enabled: true, step: 25 },
  vat: { enabled: false, base: "HT" },
} as const satisfies Pick<PricingInput, "marginPct" | "feePct" | "rounding" | "vat">;

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

  const outcome = useMemo(() => {
    if (cost === null) return { message: INTRO } as const;
    if (fixed === null) return { message: FIXED_PROMPT } as const;
    const result = computePrice({
      ...DEFAULTS,
      directLines: [{ quantity: 1, unitPrice: cost }],
      fixedMonthly: [fixed],
      monthlyVolume: volume ?? 0,
    });
    return result.ok
      ? ({ data: result.data } as const)
      : ({ message: ERROR_MESSAGES[result.reason] } as const);
  }, [cost, fixed, volume]);

  return (
    <>
      <main className="mx-auto grid max-w-xl gap-6 px-5 pt-6 pb-32">
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

        <div hidden={tab !== "calculate"} className="grid gap-6">
          <Reveal
            as={Card}
            variant="fade"
            beat={BEAT.field1}
            className="gap-5 rounded-3xl border-0 p-5 shadow-none"
          >
            <form
              aria-label="Vos trois questions"
              onSubmit={(event) => event.preventDefault()}
              className="grid gap-5"
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
          </Reveal>

          {"data" in outcome ? (
            <Reveal
              as={Card}
              variant="emphasis"
              beat={0}
              aria-label="Résultat"
              role="region"
              className="gap-4 rounded-3xl border-0 bg-secondary p-5 text-secondary-foreground shadow-none"
            >
              <Reveal as="p" beat={RESULT_BEAT.caption} className="text-sm">
                Votre prix conseillé
              </Reveal>
              <Reveal
                as="p"
                beat={RESULT_BEAT.price}
                data-testid="price"
                className="text-6xl font-light tabular-nums"
              >
                {formatAmount(outcome.data.priceExclVat)}{" "}
                <span className="text-base font-medium opacity-75">F CFA</span>
              </Reveal>
              <dl className="grid gap-1 [&_dd]:tabular-nums [&_dt]:opacity-75">
                <Reveal beat={RESULT_BEAT.firstRow} className="flex justify-between gap-4">
                  <dt>Coût de revient</dt>
                  <dd data-testid="full-cost">{formatAmount(outcome.data.fullCost)} F</dd>
                </Reveal>
                <Reveal beat={RESULT_BEAT.secondRow} className="flex justify-between gap-4">
                  <dt>Ventes minimum par mois</dt>
                  <dd data-testid="break-even">{formatBreakEven(outcome.data.breakEvenUnits)}</dd>
                </Reveal>
              </dl>
            </Reveal>
          ) : (
            <Reveal as="p" beat={BEAT.footer} role="status" className="px-1 text-muted-foreground">
              {outcome.message}
            </Reveal>
          )}
        </div>

        <section hidden={tab !== "settings"} aria-label="Réglages" className="grid gap-3">
          <Reveal as="h2" beat={0} className="text-xl font-light">
            Thème
          </Reveal>
          <ThemeCards theme={theme} onChange={choose} />
        </section>
      </main>

      <BottomNav current={tab} onChange={setTab} />
    </>
  );
}
