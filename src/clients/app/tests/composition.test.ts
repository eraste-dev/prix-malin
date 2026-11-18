import { computePrice, type PricingInput } from "@prix-malin/domain";
import { describe, expect, it } from "vitest";
import { formatMoney } from "../src/lib/amount";
import { compositionOf } from "../src/lib/composition";

/** Composition du prix HT (RG-05) : P = D + FU + frais + marge. Vecteur de référence : le bissap de docs/03. */
const BISSAP: PricingInput = {
  directLines: [{ quantity: 1, unitPrice: 210 }],
  fixedMonthly: [220000],
  monthlyVolume: 2000,
  marginPct: 25,
  feePct: 1,
  rounding: { enabled: true, step: 25 },
  vat: { enabled: false, base: "HT" },
};

function breakdown(overrides: Partial<PricingInput> = {}) {
  const result = computePrice({ ...BISSAP, ...overrides });
  if (!result.ok) throw new Error(`calcul impossible : ${result.reason}`);
  return result.data;
}

describe("compositionOf (RG-05)", () => {
  it("décompose 450 F en coût direct 210, charges 110, frais 4,5 et marge 125,5", () => {
    const parts = compositionOf(breakdown());
    expect(parts.map((part) => part.key)).toEqual(["direct", "fixed", "fee", "margin"]);
    expect(parts.map((part) => part.amount)).toEqual([210, 110, 4.5, 125.5]);
  });

  it("la somme des montants égale le prix HT et la somme des parts fait 100 %", () => {
    const data = breakdown();
    const parts = compositionOf(data);
    expect(parts.reduce((sum, part) => sum + part.amount, 0)).toBeCloseTo(data.priceExclVat, 9);
    expect(parts.reduce((sum, part) => sum + part.share, 0)).toBeCloseTo(100, 9);
  });

  it("omet les frais quand ils sont nuls (espèces)", () => {
    const parts = compositionOf(breakdown({ feePct: 0 }));
    expect(parts.map((part) => part.key)).toEqual(["direct", "fixed", "margin"]);
  });

  it("une marge plus faible réduit la part de la marge", () => {
    const margin = (data: ReturnType<typeof breakdown>) => compositionOf(data).find((part) => part.key === "margin")!;
    expect(margin(breakdown({ marginPct: 10 })).share).toBeLessThan(margin(breakdown()).share);
  });
});

describe("formatMoney (deux décimales au plus)", () => {
  it("garde la virgule quand elle compte, sinon n'en met pas", () => {
    expect(formatMoney(4.5)).toBe("4,5");
    expect(formatMoney(125.5)).toBe("125,5");
    expect(formatMoney(210)).toBe("210");
    expect(formatMoney(432.4324)).toBe("432,43");
    expect(formatMoney(51.25)).toBe("51,25");
  });
});
