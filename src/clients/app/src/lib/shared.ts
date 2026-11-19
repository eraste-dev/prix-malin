import type { Calcul } from "./model";

/*
 * Charges partagées entre produits (E10, EXG-16). Règle par défaut, à confirmer (Q-27) : chaque produit porte une
 * part des charges **proportionnelle à ses ventes mensuelles**. Un produit qui se vend deux fois plus porte deux fois
 * plus de charges, et la somme des parts égale toujours le total.
 */

/** La part du produit, en F par mois ; `null` tant que son volume de ventes n'est pas connu. */
export function sharedShare(total: number, volume: number | null, otherVolumes: readonly number[]): number | null {
  if (volume === null || volume <= 0) return null;
  const sum = volume + otherVolumes.reduce((acc, other) => acc + other, 0);
  return Math.round((total * volume) / sum);
}

/**
 * Le calcul tel que le moteur doit le voir : si les charges viennent de l'activité, le total est la part du
 * produit. Sinon (charges propres, ou rien de partagé), le calcul est rendu tel quel.
 */
export function withSharedCharges(calcul: Calcul, sharedTotal: number, otherVolumes: readonly number[]): Calcul {
  if (calcul.chargesFixes.source !== "activite" || sharedTotal <= 0) return calcul;
  const share = sharedShare(sharedTotal, calcul.volume, otherVolumes);
  return { ...calcul, chargesFixes: { mode: "total", total: share, lignes: [], source: "activite" } };
}
