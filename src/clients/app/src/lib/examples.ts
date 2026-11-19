import type { PriceBreakdown } from "@prix-malin/domain";
import { formatAmount, formatMoney, formatPercent } from "./amount";

/**
 * Exemple chiffré d'un article (docs/15 E11) : tiré du calcul de l'utilisateur quand il y en a un, sinon un exemple
 * générique (le bissap de docs/03), clairement étiqueté. `null` pour les articles sans chiffre.
 */
export function exampleFor(slug: string, data: PriceBreakdown | null): string | null {
  const mine = data !== null;
  const intro = mine ? "Dans votre calcul : " : "Exemple : ";
  switch (slug) {
    case "cout-direct":
      return `${intro}${mine ? `${formatMoney(data.directCost)} F` : "210 F"} par vente.`;
    case "charges-fixes":
      return mine
        ? `${intro}${formatAmount(data.fixedTotal)} F par mois, soit ${formatMoney(data.fixedPerUnit)} F par vente.`
        : `${intro}220 000 F par mois pour 2 000 ventes, soit 110 F par vente.`;
    case "cout-de-revient":
      return `${intro}${mine ? `${formatMoney(data.fullCost)} F` : "320 F"} par vente.`;
    case "marge":
      return mine
        ? `${intro}${formatPercent(data.markupRate * 100)} % du prix, soit ${formatMoney(data.margin)} F par vente.`
        : `${intro}27,9 % du prix, soit 125,5 F par vente.`;
    case "prix":
      return `${intro}${mine ? `${formatAmount(data.priceExclVat)} F` : "450 F"}.`;
    case "seuil":
      return mine
        ? `${intro}${data.breakEvenUnits === null ? "impossible à ce prix" : `${formatAmount(data.breakEvenUnits)} ventes par mois`}.`
        : `${intro}935 ventes par mois.`;
    default:
      return null;
  }
}
