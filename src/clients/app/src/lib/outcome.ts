import {
  analyzePrice,
  compareWithCompetitor,
  computePrice,
  type CompetitorComparison,
  type PriceBreakdown,
  type PriceVerdict,
  type PricingError,
} from "@prix-malin/domain";
import { chargesTotalOf, directTotalOf, toAnalysisInput, toPricingInput, type Calcul, type ResultMode } from "./model";

export const INTRO = "Trois nombres suffisent pour votre premier prix.";
export const FIXED_PROMPT = "Combien payez-vous chaque mois, même sans vendre ?";
export const OWN_PRICE_PROMPT = "À quel prix vendez-vous aujourd'hui ?";
const GENERIC_ERROR = "Ces valeurs ne permettent pas de calculer un prix.";

/** Un message par cause d'échec du moteur ; la table est exhaustive par construction. */
const ERROR_MESSAGES: Readonly<Record<PricingError, string>> = {
  INVALID_VOLUME: "Combien en vendez-vous par mois ?",
  NO_COST: "Combien vous coûte une vente ?",
  INVALID_INPUT: GENERIC_ERROR,
  MARGIN_FEES_TOO_HIGH: GENERIC_ERROR,
};

export interface OutcomeResult {
  /** Le prix affiché : conseillé, ou celui que l'utilisateur pratique (mode « mon prix »). */
  readonly data: PriceBreakdown;
  readonly mode: ResultMode;
  /** Verdict de rentabilité du prix pratiqué ; `null` pour le prix conseillé (RG-09). */
  readonly verdict: PriceVerdict | null;
  /** Le prix conseillé, gardé en comparaison quand on teste son prix. */
  readonly recommended: PriceBreakdown | null;
  /** Comparaison au prix d'un concurrent, si saisi (RG-10). */
  readonly competitor: CompetitorComparison | null;
}

export type Outcome = OutcomeResult | { readonly message: string };

/** Du calcul saisi au résultat : un prix, ou une phrase qui dit quoi faire (EXG-27). Jamais de prix faux. */
export function computeOutcome(calcul: Calcul): Outcome {
  if (directTotalOf(calcul) === null) return { message: INTRO };
  if (chargesTotalOf(calcul) === null) return { message: FIXED_PROMPT };

  const recommended = computePrice(toPricingInput(calcul));
  const recommendedData = recommended.ok ? recommended.data : null;

  if (calcul.modeResultat === "monPrix") {
    if (calcul.prixActuel === null) return { message: OWN_PRICE_PROMPT };
    const analysis = analyzePrice(toAnalysisInput(calcul), calcul.prixActuel);
    if (!analysis.ok) return { message: ERROR_MESSAGES[analysis.reason] };
    return finish(calcul, analysis.data, "monPrix", analysis.verdict, recommendedData);
  }

  if (!recommended.ok) return { message: ERROR_MESSAGES[recommended.reason] };
  return finish(calcul, recommended.data, "conseille", null, null);
}

function finish(
  calcul: Calcul,
  data: PriceBreakdown,
  mode: ResultMode,
  verdict: PriceVerdict | null,
  recommended: PriceBreakdown | null,
): OutcomeResult {
  const comparison =
    calcul.concurrent !== null && calcul.concurrent > 0
      ? compareWithCompetitor(toAnalysisInput(calcul), data, calcul.concurrent)
      : null;
  return { data, mode, verdict, recommended, competitor: comparison?.ok === true ? comparison.data : null };
}
