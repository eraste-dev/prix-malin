/** Types d'activité et leurs défauts (docs/15, « Défauts par type d'activité » ; EXG-01). Textes provisoires. */

export type ActivityId = "resale" | "making" | "service";

export interface Activity {
  readonly id: ActivityId;
  readonly label: string;
  readonly example: string;
  /** Unité de vente proposée par défaut (EXG-02). */
  readonly unit: string;
  readonly marginPct: number;
  readonly feePct: number;
  /** Pas de l'arrondi supérieur, en F (RG-06). */
  readonly roundingStep: number;
}

export const ACTIVITIES: readonly Activity[] = [
  {
    id: "resale",
    label: "Achat-revente",
    example: "J'achète pour revendre",
    unit: "pièce",
    marginPct: 20,
    feePct: 1,
    roundingStep: 500,
  },
  {
    id: "making",
    label: "Je fabrique",
    example: "Je prépare ce que je vends",
    unit: "unité",
    marginPct: 25,
    feePct: 1,
    roundingStep: 25,
  },
  {
    id: "service",
    label: "Prestation",
    example: "Je vends mon temps ou un service",
    unit: "prestation",
    marginPct: 30,
    feePct: 0,
    roundingStep: 500,
  },
];

export const DEFAULT_ACTIVITY_ID: ActivityId = "making";

export function findActivity(id: ActivityId): Activity {
  const found = ACTIVITIES.find((activity) => activity.id === id);
  // Table exhaustive par construction ; repli sur le type par défaut plutôt qu'une exception.
  return found ?? (ACTIVITIES.find((a) => a.id === DEFAULT_ACTIVITY_ID) as Activity);
}
