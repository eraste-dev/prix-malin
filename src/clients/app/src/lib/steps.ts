import { formatAmount } from "./amount";

/** États des étapes du stepper vertical : une étape se débloque quand la précédente est faite. */

export type StepKey = "type" | "numbers" | "result" | "adjust";
/**
 * - `locked` : pas encore débloquée (grise, désactivée) ;
 * - `available` : débloquée, mais ce n'est pas l'étape en cours (blanche) ;
 * - `current` : l'étape en cours, **une seule à la fois** (primary) ;
 * - `done` : terminée (noire, coche).
 */
export type StepStatus = "locked" | "available" | "current" | "done";

export const STEP_KEYS: readonly StepKey[] = ["type", "numbers", "result", "adjust"];

export interface StepProgress {
  /** Le coût par vente est saisi : l'utilisateur est entré dans le calcul. */
  readonly hasCost: boolean;
  /** Le moteur a rendu un prix. */
  readonly hasResult: boolean;
}

export function computeStepStatuses({ hasCost, hasResult }: StepProgress): Readonly<Record<StepKey, StepStatus>> {
  return {
    type: hasCost ? "done" : "current",
    numbers: hasResult ? "done" : hasCost ? "current" : "available",
    result: hasResult ? "done" : "locked",
    adjust: hasResult ? "current" : "locked",
  };
}

/** Titres des étapes, partagés par le rail (noms accessibles des ronds) et les sections. */
export const STEP_TITLES: Readonly<Record<StepKey, string>> = {
  type: "Que vendez-vous ?",
  numbers: "Vos chiffres",
  result: "Résultat",
  adjust: "Ajuster",
};

export interface StepSummaryInput {
  readonly activityLabel: string;
  readonly cost: number | null;
  readonly fixed: number | null;
  readonly volume: number | null;
  /** Prix conseillé, ou `null` tant que le moteur n'en rend pas. */
  readonly price: number | null;
  readonly marginPct: number;
  readonly feePct: number;
}

/** Résumé d'une phrase par étape (info-bulles et description accessible) : ce qui est fait ou à faire. */
export function describeSteps(input: StepSummaryInput): Readonly<Record<StepKey, string>> {
  const { activityLabel, cost, fixed, volume, price, marginPct, feePct } = input;
  const statuses = computeStepStatuses({ hasCost: cost !== null, hasResult: price !== null });
  const filled = [cost, fixed, volume].filter((value) => value !== null).length;
  return {
    type: statuses.type === "done" ? `Activité : ${activityLabel}` : `Activité : ${activityLabel} (par défaut)`,
    numbers:
      price !== null
        ? `Coût ${formatAmount(cost)} F · Charges ${formatAmount(fixed)} F · ${formatAmount(volume)} ventes par mois`
        : `${filled} sur 3 valeurs renseignées`,
    result: price !== null ? `Prix conseillé : ${formatAmount(price)} F` : "Disponible une fois les 3 valeurs renseignées",
    adjust: price !== null ? `Marge ${marginPct} % · Frais de paiement ${feePct} %` : "Disponible avec votre prix",
  };
}
