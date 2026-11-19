import { formatAmount, formatBreakEven, formatPercent } from "./amount";
import type { Calcul } from "./model";
import type { OutcomeResult } from "./outcome";
import { describeVerdict } from "./verdict";

/** Nom proposé à l'enregistrement : celui qu'on a saisi, sinon « type · unité » (docs/15 E07). */
export function defaultPriceName(calcul: Calcul, activityLabel: string): string {
  const nom = calcul.nom.trim();
  return nom === "" ? `${activityLabel} · ${calcul.unite.trim() || "unité"}` : nom;
}

/**
 * Résumé texte à partager (docs/15 E08). Aucune donnée personnelle ni technique : ni identifiant, ni date.
 * Rien n'est envoyé par l'app elle-même : c'est l'utilisateur qui choisit où le coller ou l'envoyer.
 */
export function buildSummary(calcul: Calcul, outcome: OutcomeResult): string {
  const { data, mode, verdict } = outcome;
  const nom = calcul.nom.trim();
  const unite = calcul.unite.trim();
  const base = calcul.tva.actif ? ` ${calcul.tva.base}` : "";
  const label = mode === "monPrix" ? "Prix actuel" : "Prix conseillé";
  const lines = [
    nom === "" ? "Mon prix" : nom,
    `${label} : ${formatAmount(data.customerPrice)} F${base}${unite === "" ? "" : ` par ${unite}`}`,
    `Coût de revient : ${formatAmount(data.fullCost)} F`,
    `Marge : ${formatPercent(data.markupRate * 100)} % du prix`,
    `Ventes minimum par mois : ${formatBreakEven(data.breakEvenUnits)}`,
  ];
  if (verdict !== null) lines.push(describeVerdict(verdict, data).title);
  lines.push("", "Calculé avec Prix Malin");
  return lines.join("\n");
}
