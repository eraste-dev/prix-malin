import { newCalcul, type Calcul } from "../src/lib/model";
import { browserStorage } from "../src/lib/storage";
import { createAppStores } from "../src/lib/stores";

/** Un calcul complet (le bissap de docs/03 : 450 F), prêt à enregistrer. */
export function bissap(overrides: Partial<Calcul> = {}): Calcul {
  return {
    ...newCalcul("making"),
    nom: "Jus de bissap",
    unite: "bouteille",
    coutDirect: { mode: "total", total: 210, lignes: [] },
    chargesFixes: { mode: "total", total: 220000, lignes: [], source: "propre" },
    volume: 2000,
    ...overrides,
  };
}

/** Enregistre des prix dans le vrai stockage de test (localStorage), le plus récent en dernier. */
export function seedPrices(names: readonly string[], overrides: Partial<Calcul> = {}): string[] {
  const { prices } = createAppStores(browserStorage());
  return names.map((nom) =>
    prices.getState().save(bissap({ nom, ...overrides }), { prixConseille: 450, coutDeRevient: 320 }, nom),
  );
}

/** Remplit le brouillon stocké avec un calcul. */
export function seedDraft(calcul: Calcul): void {
  createAppStores(browserStorage()).calc.getState().load(calcul);
}
