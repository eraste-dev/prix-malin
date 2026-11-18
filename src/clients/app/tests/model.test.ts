import { describe, expect, it } from "vitest";
import {
  SCHEMA_VERSION,
  calculSchema,
  chargesTotalOf,
  directTotalOf,
  isCalculModified,
  newCalcul,
  toAnalysisInput,
  toPricingInput,
} from "../src/lib/model";

/** Modèle du calcul (docs/15, « Modèle de données manipulé ») : valeurs par type, validation, entrées du moteur. */
const NOW = "2026-11-18T10:00:00.000Z";
const fresh = (type: Parameters<typeof newCalcul>[0] = "making") => newCalcul(type, { now: NOW, id: "c1" });

describe("newCalcul : défauts par type d'activité (docs/15)", () => {
  it.each([
    ["resale", 20, 1, 500, "pièce"],
    ["making", 25, 1, 25, "unité"],
    ["service", 30, 0, 500, "prestation"],
  ] as const)("%s : marge %i %%, frais %i %%, arrondi %i F, unité « %s »", (type, marge, frais, pas, unite) => {
    const c = fresh(type);
    expect(c.marge).toBe(marge);
    expect(c.frais).toBe(frais);
    expect(c.arrondi).toEqual({ actif: true, pas });
    expect(c.unite).toBe(unite);
  });

  it("démarre vierge : aucun montant, TVA désactivée en HT, mode « prix conseillé »", () => {
    const c = fresh();
    expect(c.coutDirect).toEqual({ mode: "total", total: null, lignes: [] });
    expect(c.chargesFixes).toEqual({ mode: "total", total: null, lignes: [], source: "propre" });
    expect(c.volume).toBeNull();
    expect(c.tva).toEqual({ actif: false, base: "HT" });
    expect(c.modeResultat).toBe("conseille");
    expect(c.concurrent).toBeNull();
    expect(c.prixActuel).toBeNull();
    expect(c.schema).toBe(SCHEMA_VERSION);
    expect(c.creeLe).toBe(NOW);
    expect(c.modifieLe).toBe(NOW);
  });

  it("génère un identifiant quand on n'en donne pas, différent à chaque appel", () => {
    expect(newCalcul("making").id).not.toBe(newCalcul("making").id);
  });
});

describe("calculSchema (NFR-09 : tout est validé à la lecture)", () => {
  it("accepte un calcul neuf", () => {
    expect(calculSchema.safeParse(fresh()).success).toBe(true);
  });

  it.each([
    ["marge hors plage (80 %)", { marge: 80 }],
    ["frais hors plage (25 %)", { frais: 25 }],
    ["volume décimal", { volume: 1.5 }],
    ["volume nul", { volume: 0 }],
    ["type inconnu", { type: "magie" }],
    ["schéma d'une autre version", { schema: 99 }],
    ["TVA de base inconnue", { tva: { actif: true, base: "XX" } }],
  ])("refuse : %s", (_name, patch) => {
    expect(calculSchema.safeParse({ ...fresh(), ...patch }).success).toBe(false);
  });

  it("refuse un montant négatif dans une ligne de coût", () => {
    const bad = { ...fresh(), coutDirect: { mode: "detail", total: null, lignes: [{ id: "a", label: "x", quantity: 1, unitPrice: -5 }] } };
    expect(calculSchema.safeParse(bad).success).toBe(false);
  });
});

describe("totaux et entrées du moteur", () => {
  const detailed = {
    ...fresh(),
    coutDirect: {
      mode: "detail" as const,
      total: null,
      lignes: [
        { id: "a", label: "Bissap", quantity: 0.5, unitPrice: 200 },
        { id: "b", label: "Sucre", quantity: 2, unitPrice: 55 },
      ],
    },
    chargesFixes: {
      mode: "detail" as const,
      total: null,
      source: "propre" as const,
      lignes: [
        { id: "c", label: "Loyer", amount: 100000 },
        { id: "d", label: "Ma rémunération", amount: 120000 },
      ],
    },
    volume: 2000,
  };

  it("somme les lignes de coût direct (quantité × prix) en mode détail", () => {
    expect(directTotalOf(detailed)).toBe(210);
  });

  it("somme les charges en mode détail", () => {
    expect(chargesTotalOf(detailed)).toBe(220000);
  });

  it("renvoie null tant que rien n'est saisi (total vide, ou détail sans ligne)", () => {
    expect(directTotalOf(fresh())).toBeNull();
    expect(chargesTotalOf(fresh())).toBeNull();
    expect(directTotalOf({ ...fresh(), coutDirect: { mode: "detail", total: null, lignes: [] } })).toBeNull();
  });

  it("mode total : une seule ligne de quantité 1 pour le coût, un seul montant pour les charges", () => {
    const c = { ...fresh(), coutDirect: { mode: "total" as const, total: 210, lignes: [] }, chargesFixes: { mode: "total" as const, total: 220000, lignes: [], source: "propre" as const }, volume: 2000 };
    const input = toPricingInput(c);
    expect(input.directLines).toEqual([{ quantity: 1, unitPrice: 210 }]);
    expect(input.fixedMonthly).toEqual([220000]);
    expect(input.monthlyVolume).toBe(2000);
  });

  it("mode détail : une ligne du moteur par ligne saisie", () => {
    const input = toPricingInput(detailed);
    expect(input.directLines).toEqual([
      { quantity: 0.5, unitPrice: 200 },
      { quantity: 2, unitPrice: 55 },
    ]);
    expect(input.fixedMonthly).toEqual([100000, 120000]);
  });

  it("transmet marge, frais, arrondi et TVA, et traite un volume absent comme 0", () => {
    const c = { ...fresh("service"), tva: { actif: true, base: "TTC" as const } };
    const input = toPricingInput(c);
    expect(input).toMatchObject({
      marginPct: 30,
      feePct: 0,
      monthlyVolume: 0,
      rounding: { enabled: true, step: 500 },
      vat: { enabled: true, base: "TTC" },
    });
  });

  it("arrondi désactivé : le moteur le reçoit désactivé", () => {
    const c = { ...fresh(), arrondi: { actif: false, pas: 25 } };
    expect(toPricingInput(c).rounding.enabled).toBe(false);
  });

  it("l'analyse d'un prix imposé n'a pas de marge", () => {
    expect("marginPct" in toAnalysisInput(fresh())).toBe(false);
  });
});

describe("isCalculModified (EXG-03)", () => {
  it("est faux pour un calcul neuf, quel que soit le type", () => {
    expect(isCalculModified(fresh("resale"))).toBe(false);
  });

  it("devient vrai dès que la marge, les frais, l'arrondi ou la TVA s'écartent des défauts", () => {
    const base = fresh();
    expect(isCalculModified({ ...base, marge: 10 })).toBe(true);
    expect(isCalculModified({ ...base, frais: 0 })).toBe(true);
    expect(isCalculModified({ ...base, arrondi: { actif: false, pas: 25 } })).toBe(true);
    expect(isCalculModified({ ...base, arrondi: { actif: true, pas: 100 } })).toBe(true);
    expect(isCalculModified({ ...base, tva: { actif: true, base: "HT" } })).toBe(true);
  });

  it("ne tient pas compte des montants saisis (ils ne sont jamais détruits)", () => {
    expect(isCalculModified({ ...fresh(), volume: 2000, coutDirect: { mode: "total", total: 210, lignes: [] } })).toBe(false);
  });
});
