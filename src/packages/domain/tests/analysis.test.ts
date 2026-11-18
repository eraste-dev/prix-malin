import { describe, expect, it } from "vitest";
import { analyzePrice, compareWithCompetitor } from "../src/analysis";
import { computePrice } from "../src/pricing";
import type { PriceBreakdown } from "../src/types";
import { bissap } from "./fixtures";

function advised(): PriceBreakdown {
  const r = computePrice(bissap);
  if (!r.ok) throw new Error("inattendu");
  return r.data;
}

describe("analyzePrice — mode « tester mon prix » (RG-09)", () => {
  it("perte à chaque vente sous le plancher", () => {
    const r = analyzePrice(bissap, 200);
    expect(r).toMatchObject({ ok: true, verdict: "LOSS_PER_SALE" });
  });

  it("charges non couvertes entre plancher et équilibre", () => {
    const r = analyzePrice(bissap, 300);
    expect(r).toMatchObject({ ok: true, verdict: "FIXED_COSTS_NOT_COVERED" });
    if (r.ok) {
      expect(r.data.margin).toBeLessThan(0);
      expect(r.data.monthlyProfit).toBeLessThan(0);
    }
  });

  it("bénéfice au-dessus de l'équilibre", () => {
    const r = analyzePrice(bissap, 450);
    expect(r).toMatchObject({ ok: true, verdict: "PROFITABLE" });
    if (r.ok) {
      expect(r.data.margin).toBe(125.5);
      expect(r.data.breakEvenUnits).toBe(935);
      expect(r.data.customerPrice).toBe(450);
    }
  });

  it("un prix exactement à l'équilibre est rentable", () => {
    const eq = advised().equilibriumPrice;
    const r = analyzePrice({ ...bissap, feePct: 0 }, 320);
    expect(eq).toBeGreaterThan(320);
    expect(r).toMatchObject({ ok: true, verdict: "PROFITABLE" });
  });

  it("interprète le prix saisi comme TTC en mode TTC", () => {
    const r = analyzePrice({ ...bissap, vat: { enabled: true, base: "TTC" } }, 531);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.priceExclVat).toBe(450);
      expect(r.data.customerPrice).toBe(531);
    }
  });

  it("ignore le commutateur HT/TTC quand la TVA est désactivée", () => {
    const r = analyzePrice({ ...bissap, vat: { enabled: false, base: "TTC" } }, 450);
    expect(r.ok && r.data.priceExclVat).toBe(450);
  });

  it("refuse un prix négatif ou non numérique", () => {
    expect(analyzePrice(bissap, -1)).toEqual({ ok: false, reason: "INVALID_INPUT" });
    expect(analyzePrice(bissap, Number.NaN)).toEqual({ ok: false, reason: "INVALID_INPUT" });
  });

  it("propage les erreurs de coût et de volume", () => {
    expect(analyzePrice({ ...bissap, monthlyVolume: 0 }, 450)).toEqual({
      ok: false,
      reason: "INVALID_VOLUME",
    });
  });

  it("gère un prix nul sans division par zéro", () => {
    const r = analyzePrice(bissap, 0);
    expect(r).toMatchObject({ ok: true, verdict: "LOSS_PER_SALE" });
    if (r.ok) expect(r.data.markupRate).toBe(0);
  });

  it("n'exige pas de marge souhaitée", () => {
    const { marginPct: _ignored, ...withoutMargin } = bissap;
    expect(analyzePrice(withoutMargin, 450).ok).toBe(true);
  });
});

describe("compareWithCompetitor (RG-10)", () => {
  const data = advised();

  it("le concurrent vend sous votre coût de revient", () => {
    const r = compareWithCompetitor(bissap, data, 250);
    expect(r.kind).toBe("COMPETITOR_BELOW_COST");
    expect(r.shortfallPerUnit).toBeGreaterThan(0);
  });

  it("vous êtes nettement plus cher (> 15 %) : marge au prix du concurrent", () => {
    const r = compareWithCompetitor(bissap, data, 380);
    expect(r.kind).toBe("PRICIER");
    expect(r.deltaRatio).toBeCloseTo((450 - 380) / 380, 6);
    expect(r.marginRateAtCompetitor).toBeCloseTo((380 * 0.99 - 320) / 380, 6);
  });

  it("vous êtes nettement moins cher (< −15 %)", () => {
    const r = compareWithCompetitor(bissap, data, 600);
    expect(r.kind).toBe("CHEAPER");
    expect(r.deltaRatio).toBeCloseTo(-0.25, 6);
  });

  it("prix bien placé dans la fourchette ±15 %", () => {
    expect(compareWithCompetitor(bissap, data, 400).kind).toBe("ALIGNED");
    expect(compareWithCompetitor(bissap, data, 500).kind).toBe("ALIGNED");
  });

  it("les bornes ±15 % sont incluses dans « bien placé »", () => {
    expect(compareWithCompetitor(bissap, data, 450 / 1.15).kind).toBe("ALIGNED");
    expect(compareWithCompetitor(bissap, data, 450 / 0.85).kind).toBe("ALIGNED");
  });

  it("en mode TTC, le concurrent est exprimé en TTC (même base)", () => {
    const input = { ...bissap, vat: { enabled: true, base: "TTC" as const } };
    const adv = computePrice(input);
    if (!adv.ok) throw new Error("inattendu");
    // TTC conseillé 525 ; concurrent à 520 TTC → bien placé
    const r = compareWithCompetitor(input, adv.data, 520);
    expect(r.kind).toBe("ALIGNED");
    // 280 TTC = 237,3 HT < équilibre 323 HT → sous le coût
    expect(compareWithCompetitor(input, adv.data, 280).kind).toBe(
      "COMPETITOR_BELOW_COST",
    );
  });

  it("en mode HT avec TVA, le concurrent est comparé en HT", () => {
    const input = { ...bissap, vat: { enabled: true, base: "HT" as const } };
    const adv = computePrice(input);
    if (!adv.ok) throw new Error("inattendu");
    expect(compareWithCompetitor(input, adv.data, 440).kind).toBe("ALIGNED");
  });
});
