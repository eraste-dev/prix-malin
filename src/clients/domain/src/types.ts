/** Types publics du moteur de calcul. Montants en F CFA ; pourcentages en points (25 = 25 %). */

export interface CostLine {
  readonly quantity: number;
  readonly unitPrice: number;
}

export interface RoundingOptions {
  readonly enabled: boolean;
  /** Pas d'arrondi en F (5, 25, 50, 100, 500…). Ignoré si `enabled` est faux. */
  readonly step: number;
}

export type VatBase = "HT" | "TTC";

export interface VatOptions {
  readonly enabled: boolean;
  /** Prix de référence : arrondi, concurrent et prix saisi sont exprimés dans cette base. */
  readonly base: VatBase;
  /** Taux en %, 18 par défaut. */
  readonly ratePct?: number;
}

export interface PricingInput {
  readonly directLines: readonly CostLine[];
  /** Charges fixes mensuelles, un montant par charge. */
  readonly fixedMonthly: readonly number[];
  readonly monthlyVolume: number;
  /** Part du prix HT que l'on garde (0–70). */
  readonly marginPct: number;
  /** Frais de paiement, % du prix HT (0–20). */
  readonly feePct: number;
  readonly rounding: RoundingOptions;
  readonly vat: VatOptions;
}

/** Entrées de l'analyse d'un prix imposé : la marge souhaitée n'est pas nécessaire. */
export type AnalysisInput = Omit<PricingInput, "marginPct">;

export type PricingError =
  | "INVALID_INPUT"
  | "INVALID_VOLUME"
  | "NO_COST"
  | "MARGIN_FEES_TOO_HIGH";

export interface PriceBreakdown {
  readonly directCost: number;
  readonly fixedTotal: number;
  readonly fixedPerUnit: number;
  /** Coût de revient : coût direct + part des charges fixes. */
  readonly fullCost: number;
  /** Prix HT avant arrondi (en analyse : le prix HT imposé). */
  readonly rawPrice: number;
  readonly priceExclVat: number;
  readonly vat: number;
  readonly priceInclVat: number;
  /** Prix affiché au client dans la base choisie (TTC en mode TTC, sinon HT). */
  readonly customerPrice: number;
  readonly fee: number;
  readonly margin: number;
  /** Marge ÷ prix de vente HT. */
  readonly markupRate: number;
  /** Marge ÷ coût de revient. */
  readonly marginRate: number;
  /** Prix HT ÷ coût direct ; `null` sans coût direct. */
  readonly coefficient: number | null;
  /** Ventes minimales par mois ; `null` si la contribution est nulle ou négative. */
  readonly breakEvenUnits: number | null;
  readonly monthlyProfit: number;
  /** Prix HT minimal pour ne pas perdre sur chaque unité. */
  readonly floorPrice: number;
  /** Prix HT minimal pour couvrir toutes les charges. */
  readonly equilibriumPrice: number;
}

export type PricingResult =
  | { readonly ok: true; readonly data: PriceBreakdown }
  | { readonly ok: false; readonly reason: PricingError };

export type PriceVerdict = "LOSS_PER_SALE" | "FIXED_COSTS_NOT_COVERED" | "PROFITABLE";

export type AnalysisResult =
  | { readonly ok: true; readonly data: PriceBreakdown; readonly verdict: PriceVerdict }
  | { readonly ok: false; readonly reason: PricingError };

export type CompetitorKind = "COMPETITOR_BELOW_COST" | "PRICIER" | "CHEAPER" | "ALIGNED";

export interface CompetitorComparison {
  readonly kind: CompetitorKind;
  /** (votre prix − prix concurrent) ÷ prix concurrent, dans la base choisie. */
  readonly deltaRatio: number;
  /** Perte par unité si vous vous alignez (concurrent sous le coût de revient). */
  readonly shortfallPerUnit?: number;
  /** Votre taux de marque si vous vous alignez sur un concurrent moins cher. */
  readonly marginRateAtCompetitor?: number;
}

export type CompetitorResult =
  | { readonly ok: true; readonly data: CompetitorComparison }
  | { readonly ok: false; readonly reason: "INVALID_INPUT" };
