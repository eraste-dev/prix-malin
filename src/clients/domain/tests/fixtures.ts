import type { PricingInput } from "../src/types";

/** Exemple « Je fabrique » : jus de bissap 50 cl (vecteur de référence, docs/03). */
export const bissap: PricingInput = {
  directLines: [
    { quantity: 1, unitPrice: 75 },
    { quantity: 1, unitPrice: 60 },
    { quantity: 1, unitPrice: 50 },
    { quantity: 1, unitPrice: 15 },
    { quantity: 1, unitPrice: 10 },
  ],
  fixedMonthly: [30000, 15000, 5000, 20000, 50000, 100000],
  monthlyVolume: 2000,
  marginPct: 25,
  feePct: 1,
  rounding: { enabled: true, step: 25 },
  vat: { enabled: false, base: "HT" },
};

/** Exemple « Achat-revente » : pagne wax 6 yards. */
export const pagne: PricingInput = {
  directLines: [
    { quantity: 1, unitPrice: 9000 },
    { quantity: 1, unitPrice: 300 },
    { quantity: 1, unitPrice: 100 },
    { quantity: 1, unitPrice: 200 },
  ],
  fixedMonthly: [50000, 8000, 5000, 6000, 120000],
  monthlyVolume: 120,
  marginPct: 20,
  feePct: 1,
  rounding: { enabled: true, step: 500 },
  vat: { enabled: false, base: "HT" },
};

/** Exemple « Prestation » : tresses (pose complète). */
export const tresses: PricingInput = {
  directLines: [
    { quantity: 2, unitPrice: 1500 },
    { quantity: 1, unitPrice: 300 },
    { quantity: 3, unitPrice: 1000 },
  ],
  fixedMonthly: [40000, 10000, 4000, 8000, 60000],
  monthlyVolume: 80,
  marginPct: 30,
  feePct: 0,
  rounding: { enabled: true, step: 500 },
  vat: { enabled: false, base: "HT" },
};
