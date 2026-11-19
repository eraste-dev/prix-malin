import type { AnalysisInput, PricingInput } from "@prix-malin/domain";
import { z } from "zod";
import { DEFAULT_ACTIVITY_ID, findActivity, type ActivityId } from "./activity";

/*
 * Modèle du calcul (docs/15, « Modèle de données manipulé »). Tout ce qui est lu depuis le stockage passe par
 * ces schémas (NFR-09) ; les données sont versionnées (`schema`) pour pouvoir migrer plus tard (ADR-0012).
 */

export const SCHEMA_VERSION = 1 as const;

const amount = z.number().int().min(0).max(1_000_000_000);
const quantity = z.number().min(0).max(1_000_000);
const idString = z.string().min(1).max(64);
const shortText = z.string().max(80);
const modeSchema = z.enum(["total", "detail"]);

export const costLineSchema = z.object({ id: idString, label: shortText, quantity, unitPrice: amount });
export const chargeLineSchema = z.object({ id: idString, label: shortText, amount });

export const calculSchema = z.object({
  schema: z.literal(SCHEMA_VERSION),
  id: idString,
  type: z.enum(["resale", "making", "service"]),
  nom: shortText,
  unite: z.string().max(40),
  coutDirect: z.object({ mode: modeSchema, total: amount.nullable(), lignes: z.array(costLineSchema).max(50) }),
  chargesFixes: z.object({
    mode: modeSchema,
    total: amount.nullable(),
    lignes: z.array(chargeLineSchema).max(50),
    source: z.enum(["propre", "activite"]),
  }),
  volume: z.number().int().min(1).max(1_000_000_000).nullable(),
  marge: z.number().min(0).max(70),
  frais: z.number().min(0).max(20),
  arrondi: z.object({ actif: z.boolean(), pas: z.number().min(1).max(100_000) }),
  tva: z.object({ actif: z.boolean(), base: z.enum(["HT", "TTC"]) }),
  concurrent: amount.nullable(),
  prixActuel: amount.nullable(),
  modeResultat: z.enum(["conseille", "monPrix"]),
  /** Le rappel « Avez-vous compté votre salaire ? » a été vu pour ce calcul (une fois par calcul). */
  remunerationRappelVu: z.boolean(),
  creeLe: z.string().max(40),
  modifieLe: z.string().max(40),
});

export type Calcul = z.infer<typeof calculSchema>;
export type CostLineItem = z.infer<typeof costLineSchema>;
export type ChargeLineItem = z.infer<typeof chargeLineSchema>;
export type InputMode = z.infer<typeof modeSchema>;
export type ResultMode = Calcul["modeResultat"];

/** Identifiant unique ; `crypto.randomUUID` n'existe pas hors contexte sécurisé (HTTP sur réseau local). */
export function newId(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi !== undefined && typeof cryptoApi.randomUUID === "function") return cryptoApi.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

interface NewCalculOptions {
  readonly now?: string;
  readonly id?: string;
}

/** Un calcul vierge pour ce type d'activité, avec ses défauts (docs/15). */
export function newCalcul(type: ActivityId = DEFAULT_ACTIVITY_ID, options: NewCalculOptions = {}): Calcul {
  const activity = findActivity(type);
  const now = options.now ?? new Date().toISOString();
  return {
    schema: SCHEMA_VERSION,
    id: options.id ?? newId(),
    type,
    nom: "",
    unite: activity.unit,
    coutDirect: { mode: "total", total: null, lignes: [] },
    chargesFixes: { mode: "total", total: null, lignes: [], source: "propre" },
    volume: null,
    marge: activity.marginPct,
    frais: activity.feePct,
    arrondi: { actif: true, pas: activity.roundingStep },
    tva: { actif: false, base: "HT" },
    concurrent: null,
    prixActuel: null,
    modeResultat: "conseille",
    remunerationRappelVu: false,
    creeLe: now,
    modifieLe: now,
  };
}

/** Passe à un autre type : applique ses défauts de marge, frais et arrondi, garde les montants (EXG-03). */
export function applyType(calcul: Calcul, type: ActivityId): Calcul {
  const next = findActivity(type);
  const previous = findActivity(calcul.type);
  return {
    ...calcul,
    type,
    marge: next.marginPct,
    frais: next.feePct,
    arrondi: { actif: true, pas: next.roundingStep },
    // Une unité saisie par l'utilisateur est conservée ; l'unité par défaut suit le type.
    unite: calcul.unite === previous.unit ? next.unit : calcul.unite,
  };
}

/** Le calcul a-t-il été réglé à la main (marge, frais, arrondi, TVA) ? Les montants saisis ne comptent pas (EXG-03). */
export function isCalculModified(calcul: Calcul): boolean {
  const defaults = findActivity(calcul.type);
  return (
    calcul.marge !== defaults.marginPct ||
    calcul.frais !== defaults.feePct ||
    !calcul.arrondi.actif ||
    calcul.arrondi.pas !== defaults.roundingStep ||
    calcul.tva.actif
  );
}

/** Évite les décimales parasites des flottants (0,1 × 3). */
const tidy = (value: number): number => Math.round(value * 1_000_000) / 1_000_000;

/** Coût direct par unité, ou `null` tant que rien n'est saisi. */
export function directTotalOf(calcul: Calcul): number | null {
  const { mode, total, lignes } = calcul.coutDirect;
  if (mode === "total") return total;
  return lignes.length === 0 ? null : tidy(lignes.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0));
}

/** Charges fixes du mois, ou `null` tant que rien n'est saisi. */
export function chargesTotalOf(calcul: Calcul): number | null {
  const { mode, total, lignes } = calcul.chargesFixes;
  if (mode === "total") return total;
  return lignes.length === 0 ? null : tidy(lignes.reduce((sum, line) => sum + line.amount, 0));
}

/** Entrées du moteur pour analyser un prix imposé (pas de marge souhaitée). */
export function toAnalysisInput(calcul: Calcul): AnalysisInput {
  const { coutDirect, chargesFixes } = calcul;
  return {
    directLines:
      coutDirect.mode === "total"
        ? coutDirect.total === null
          ? []
          : [{ quantity: 1, unitPrice: coutDirect.total }]
        : coutDirect.lignes.map((line) => ({ quantity: line.quantity, unitPrice: line.unitPrice })),
    fixedMonthly:
      chargesFixes.mode === "total"
        ? chargesFixes.total === null
          ? []
          : [chargesFixes.total]
        : chargesFixes.lignes.map((line) => line.amount),
    monthlyVolume: calcul.volume ?? 0,
    feePct: calcul.frais,
    rounding: { enabled: calcul.arrondi.actif, step: calcul.arrondi.pas },
    vat: { enabled: calcul.tva.actif, base: calcul.tva.base },
  };
}

/** Entrées du moteur pour calculer le prix conseillé. */
export function toPricingInput(calcul: Calcul): PricingInput {
  return { ...toAnalysisInput(calcul), marginPct: calcul.marge };
}
