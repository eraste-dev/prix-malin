import type { CompetitorComparison, PriceBreakdown, PriceVerdict } from "@prix-malin/domain";
import { formatAmount, formatMoney, formatPercent } from "./amount";

/** Un verdict se comprend sans la couleur : titre et phrase, toujours accompagnés d'une icône (RES-04). */
export interface VerdictText {
  readonly title: string;
  readonly sentence: string;
}

export function describeVerdict(verdict: PriceVerdict, data: PriceBreakdown): VerdictText {
  switch (verdict) {
    case "LOSS_PER_SALE": {
      const lossPerSale = Math.max(0, data.directCost + data.fee - data.priceExclVat);
      return {
        title: "Vous perdez de l'argent à chaque vente",
        sentence: `Chaque vente vous coûte environ ${formatAmount(lossPerSale)} F de plus qu'elle ne rapporte, avant même vos charges.`,
      };
    }
    case "FIXED_COSTS_NOT_COVERED": {
      const missing = formatAmount(Math.abs(data.monthlyProfit));
      const need =
        data.breakEvenUnits === null
          ? ""
          : ` Il faudrait vendre au moins ${formatAmount(data.breakEvenUnits)} par mois.`;
      return {
        title: "Vos charges ne sont pas couvertes",
        sentence: `Vous couvrez ce que coûte chaque vente, mais pas vos charges du mois : il manque environ ${missing} F par mois.${need}`,
      };
    }
    case "PROFITABLE":
      return {
        title: "Ce prix vous fait gagner de l'argent",
        sentence: `Il vous reste environ ${formatAmount(data.monthlyProfit)} F par mois, une fois vos charges payées.`,
      };
  }
}

/** Ce que dit la comparaison au concurrent (RG-10) : une information, jamais un reproche. */
export function describeCompetitor(comparison: CompetitorComparison): string {
  const gap = formatPercent(Math.abs(comparison.deltaRatio) * 100);
  switch (comparison.kind) {
    case "COMPETITOR_BELOW_COST":
      return `Votre concurrent vend moins cher que son coût de revient estimé. Vous aligner vous ferait perdre environ ${formatMoney(comparison.shortfallPerUnit ?? 0)} F par vente.`;
    case "PRICIER": {
      const kept = comparison.marginRateAtCompetitor;
      const tail = kept === undefined ? "" : ` À son prix, il vous resterait ${formatPercent(kept * 100)} % du prix en marge.`;
      return `Vous êtes ${gap} % plus cher que votre concurrent.${tail}`;
    }
    case "CHEAPER":
      return `Vous êtes ${gap} % moins cher que votre concurrent : vous avez de la marge pour monter votre prix.`;
    case "ALIGNED":
      return "Vous êtes au niveau de votre concurrent.";
  }
}
