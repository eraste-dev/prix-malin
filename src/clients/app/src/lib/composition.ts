import type { PriceBreakdown } from "@prix-malin/domain";

/** Décomposition du prix HT (RG-05) : prix = coût direct + part des charges + frais + marge. */

export type PartKey = "direct" | "fixed" | "fee" | "margin";

export interface CompositionPart {
  readonly key: PartKey;
  readonly label: string;
  /** En F ; les centimes sont conservés (4,5 F de frais sur 450 F). */
  readonly amount: number;
  /** Part du prix HT, en %. */
  readonly share: number;
}

const LABELS: Readonly<Record<PartKey, string>> = {
  direct: "Coût direct",
  fixed: "Part des charges",
  fee: "Frais de paiement",
  margin: "Marge",
};

/** Les parts non nulles, dans l'ordre du prix. La somme des montants égale le prix HT. */
export function compositionOf(data: PriceBreakdown): readonly CompositionPart[] {
  const amounts: Readonly<Record<PartKey, number>> = {
    direct: data.directCost,
    fixed: data.fixedPerUnit,
    fee: data.fee,
    margin: data.margin,
  };
  const keys: readonly PartKey[] = ["direct", "fixed", "fee", "margin"];
  return keys
    .filter((key) => amounts[key] > 0)
    .map((key) => ({
      key,
      label: LABELS[key],
      amount: amounts[key],
      share: (amounts[key] / data.priceExclVat) * 100,
    }));
}
