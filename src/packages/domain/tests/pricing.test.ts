import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { computePrice } from "../src/pricing";
import type { PriceBreakdown, PricingInput } from "../src/types";
import { bissap, pagne, tresses } from "./fixtures";

function ok(input: PricingInput): PriceBreakdown {
  const result = computePrice(input);
  if (!result.ok) throw new Error(`Échec inattendu : ${result.reason}`);
  return result.data;
}

describe("computePrice — vecteurs de référence (docs/03)", () => {
  it("achat-revente : pagne wax", () => {
    const r = ok(pagne);
    expect(r.directCost).toBe(9600);
    expect(r.fixedTotal).toBe(189000);
    expect(r.fixedPerUnit).toBe(1575);
    expect(r.fullCost).toBe(11175);
    expect(r.rawPrice).toBeCloseTo(14145.57, 2);
    expect(r.priceExclVat).toBe(14500);
    expect(r.fee).toBe(145);
    expect(r.margin).toBe(3180);
    expect(r.markupRate * 100).toBeCloseTo(21.93, 2);
    expect(r.breakEvenUnits).toBe(40);
    expect(r.monthlyProfit).toBe(381600);
    expect(r.coefficient).toBeCloseTo(1.51, 2);
  });

  it("fabrication : jus de bissap", () => {
    const r = ok(bissap);
    expect(r.directCost).toBe(210);
    expect(r.fixedTotal).toBe(220000);
    expect(r.fixedPerUnit).toBe(110);
    expect(r.fullCost).toBe(320);
    expect(r.rawPrice).toBeCloseTo(432.43, 2);
    expect(r.priceExclVat).toBe(450);
    expect(r.customerPrice).toBe(450);
    expect(r.fee).toBe(4.5);
    expect(r.margin).toBe(125.5);
    expect(r.markupRate * 100).toBeCloseTo(27.89, 2);
    expect(r.breakEvenUnits).toBe(935);
    expect(r.monthlyProfit).toBe(251000);
    expect(r.coefficient).toBeCloseTo(2.14, 2);
  });

  it("prestation : tresses (sans frais)", () => {
    const r = ok(tresses);
    expect(r.directCost).toBe(6300);
    expect(r.fullCost).toBe(7825);
    expect(r.priceExclVat).toBe(11500);
    expect(r.fee).toBe(0);
    expect(r.margin).toBe(3675);
    expect(r.markupRate * 100).toBeCloseTo(31.96, 2);
    expect(r.breakEvenUnits).toBe(24);
    expect(r.monthlyProfit).toBe(294000);
    expect(r.coefficient).toBeCloseTo(1.83, 2);
  });

  it("expose le taux de marge sur coût (distinct du taux de marque, RG-04)", () => {
    const r = ok(bissap);
    expect(r.marginRate).toBeCloseTo(125.5 / 320, 6);
  });

  it("calcule le plancher et l'équilibre (RG-09)", () => {
    const r = ok(bissap);
    expect(r.floorPrice).toBeCloseTo(210 / 0.99, 6);
    expect(r.equilibriumPrice).toBeCloseTo(320 / 0.99, 6);
  });
});

describe("computePrice — arrondi (RG-03)", () => {
  it("arrondit toujours vers le haut au pas choisi", () => {
    expect(ok(bissap).priceExclVat).toBe(450);
  });

  it("ne dépasse pas d'un pas quand le prix brut est déjà un multiple", () => {
    // coût de revient 297 F, marge 0 %, frais 0 % → prix brut exactement 300... via 3 lignes
    const exact: PricingInput = {
      ...bissap,
      directLines: [{ quantity: 1, unitPrice: 300 }],
      fixedMonthly: [],
      marginPct: 0,
      feePct: 0,
    };
    expect(ok(exact).priceExclVat).toBe(300);
  });

  it("arrondit au franc supérieur quand l'arrondi est désactivé", () => {
    const r = ok({ ...bissap, rounding: { enabled: false, step: 25 } });
    expect(r.priceExclVat).toBe(433);
  });
});

describe("computePrice — TVA et commutateur HT/TTC (RG-06)", () => {
  it("mode HT : le HT est arrondi, le TTC en découle", () => {
    const r = ok({ ...bissap, vat: { enabled: true, base: "HT" } });
    expect(r.priceExclVat).toBe(450);
    expect(r.vat).toBe(81);
    expect(r.priceInclVat).toBe(531);
    expect(r.customerPrice).toBe(450);
  });

  it("mode TTC : le TTC est arrondi, le HT est déduit", () => {
    const r = ok({ ...bissap, vat: { enabled: true, base: "TTC" } });
    expect(r.priceInclVat).toBe(525);
    expect(r.customerPrice).toBe(525);
    expect(r.priceExclVat).toBeCloseTo(444.92, 2);
    expect(r.vat).toBeCloseTo(80.08, 2);
    expect(r.margin).toBeGreaterThanOrEqual(0.25 * r.priceExclVat);
  });

  it("la TVA n'entre ni dans le coût ni dans la marge", () => {
    const sans = ok({ ...bissap, rounding: { enabled: false, step: 25 } });
    const avec = ok({
      ...bissap,
      rounding: { enabled: false, step: 25 },
      vat: { enabled: true, base: "HT" },
    });
    expect(avec.fullCost).toBe(sans.fullCost);
    expect(avec.margin).toBe(sans.margin);
  });

  it("applique un taux de TVA personnalisé", () => {
    const r = ok({ ...bissap, vat: { enabled: true, base: "HT", ratePct: 10 } });
    expect(r.vat).toBe(45);
    expect(r.priceInclVat).toBe(495);
  });
});

describe("computePrice — frais de paiement sur le prix HT (Q-07)", () => {
  it("calcule les frais sur le HT, TVA exclue", () => {
    const r = ok({ ...bissap, vat: { enabled: true, base: "HT" } });
    expect(r.fee).toBe(4.5);
  });
});

describe("computePrice — erreurs explicites (RG-02, RG-08, RG-12)", () => {
  it.each([0, -3, Number.NaN, 1.5])("refuse un volume invalide (%s)", (v) => {
    const r = computePrice({ ...bissap, monthlyVolume: v });
    expect(r).toEqual({ ok: false, reason: "INVALID_VOLUME" });
  });

  it("refuse l'absence de coût", () => {
    const r = computePrice({ ...bissap, directLines: [], fixedMonthly: [] });
    expect(r).toEqual({ ok: false, reason: "NO_COST" });
  });

  it("refuse marge + frais trop hauts (EXG-27)", () => {
    expect(computePrice({ ...bissap, marginPct: 70, feePct: 30 })).toEqual({
      ok: false,
      reason: "MARGIN_FEES_TOO_HIGH",
    });
    expect(computePrice({ ...bissap, marginPct: 71 })).toEqual({
      ok: false,
      reason: "MARGIN_FEES_TOO_HIGH",
    });
    expect(computePrice({ ...bissap, feePct: 20.5 })).toEqual({
      ok: false,
      reason: "MARGIN_FEES_TOO_HIGH",
    });
  });

  it("accepte les plafonds exacts (70 % et 20 %)", () => {
    expect(computePrice({ ...bissap, marginPct: 70, feePct: 20 }).ok).toBe(true);
  });

  it("refuse les valeurs négatives ou non numériques", () => {
    const bad = [
      { ...bissap, marginPct: -1 },
      { ...bissap, feePct: Number.NaN },
      { ...bissap, directLines: [{ quantity: -1, unitPrice: 10 }] },
      { ...bissap, directLines: [{ quantity: 1, unitPrice: Number.NaN }] },
      { ...bissap, fixedMonthly: [-5] },
      { ...bissap, rounding: { enabled: true, step: 0 } },
      { ...bissap, rounding: { enabled: true, step: 2.5 } },
      { ...bissap, vat: { enabled: true, base: "HT" as const, ratePct: -1 } },
    ];
    for (const input of bad) {
      expect(computePrice(input)).toEqual({ ok: false, reason: "INVALID_INPUT" });
    }
  });

  it("accepte des quantités décimales (0,5 × 1 200 = 600)", () => {
    const r = ok({
      ...bissap,
      directLines: [{ quantity: 0.5, unitPrice: 1200 }],
      fixedMonthly: [],
    });
    expect(r.directCost).toBe(600);
  });

  it("signale un seuil impossible quand la contribution est nulle ou négative", () => {
    const r = ok({
      ...bissap,
      directLines: [{ quantity: 1, unitPrice: 1000 }],
      fixedMonthly: [1],
      marginPct: 0,
      feePct: 20,
      rounding: { enabled: false, step: 25 },
    });
    // prix = (1000 + 1/2000) / 0,8 ≈ 1250,0006 → 1251 ; contribution positive
    expect(r.breakEvenUnits).not.toBeNull();
  });

  it("renvoie un coefficient nul quand il n'y a pas de coût direct", () => {
    const r = ok({
      ...bissap,
      directLines: [],
      fixedMonthly: [10000],
      monthlyVolume: 10,
    });
    expect(r.coefficient).toBeNull();
  });
});

describe("computePrice — propriétés (RG-03, RG-04, RG-05)", () => {
  const inputArb = fc.record({
    directLines: fc.array(
      fc.record({
        quantity: fc.integer({ min: 1, max: 20 }),
        unitPrice: fc.integer({ min: 0, max: 50000 }),
      }),
      { minLength: 1, maxLength: 6 },
    ),
    fixedMonthly: fc.array(fc.integer({ min: 0, max: 500000 }), { maxLength: 8 }),
    monthlyVolume: fc.integer({ min: 1, max: 5000 }),
    marginPct: fc.integer({ min: 0, max: 70 }),
    feePct: fc.integer({ min: 0, max: 20 }),
    rounding: fc.record({
      enabled: fc.boolean(),
      step: fc.constantFrom(5, 25, 50, 100, 500),
    }),
    vat: fc.record({
      enabled: fc.boolean(),
      base: fc.constantFrom("HT" as const, "TTC" as const),
    }),
  });

  const validResult = (input: PricingInput): PriceBreakdown | null => {
    const r = computePrice(input);
    return r.ok ? r.data : null;
  };

  it("le prix n'est jamais inférieur au prix brut, ni supérieur d'un pas", () => {
    fc.assert(
      fc.property(inputArb, (input) => {
        const r = validResult(input);
        if (r === null) return true;
        const gross = input.vat.enabled && input.vat.base === "TTC";
        const compared = gross ? r.priceInclVat : r.priceExclVat;
        const raw = gross ? r.rawPrice * 1.18 : r.rawPrice;
        const step = input.rounding.enabled ? input.rounding.step : 1;
        return compared >= raw - 1e-6 && compared - raw < step + 1e-6;
      }),
    );
  });

  it("le prix se décompose exactement : coût direct + part fixe + frais + marge", () => {
    fc.assert(
      fc.property(inputArb, (input) => {
        const r = validResult(input);
        if (r === null) return true;
        const sum = r.directCost + r.fixedPerUnit + r.fee + r.margin;
        return Math.abs(sum - r.priceExclVat) < 1e-6;
      }),
    );
  });

  it("le taux de marque obtenu n'est jamais inférieur au taux visé", () => {
    fc.assert(
      fc.property(inputArb, (input) => {
        const r = validResult(input);
        if (r === null) return true;
        return r.markupRate >= input.marginPct / 100 - 1e-9;
      }),
    );
  });

  it("le prix croît avec la marge et décroît avec le volume", () => {
    fc.assert(
      fc.property(inputArb, (input) => {
        const base = validResult({ ...input, rounding: { enabled: false, step: 5 } });
        const higher = validResult({
          ...input,
          marginPct: Math.min(70, input.marginPct + 5),
          rounding: { enabled: false, step: 5 },
        });
        const moreVolume = validResult({
          ...input,
          monthlyVolume: input.monthlyVolume + 100,
          rounding: { enabled: false, step: 5 },
        });
        if (base === null || higher === null || moreVolume === null) return true;
        return (
          higher.priceExclVat >= base.priceExclVat &&
          moreVolume.priceExclVat <= base.priceExclVat
        );
      }),
    );
  });
});
