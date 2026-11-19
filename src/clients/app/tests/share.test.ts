import { describe, expect, it } from "vitest";
import { newCalcul, type Calcul } from "../src/lib/model";
import { computeOutcome } from "../src/lib/outcome";
import { buildSummary, defaultPriceName } from "../src/lib/share";

/** Résumé partageable (docs/15 E08) et nom suggéré à l'enregistrement (E07). */
const BISSAP: Calcul = {
  ...newCalcul("making", { now: "2026-11-18T10:00:00.000Z", id: "c1" }),
  nom: "Jus de bissap",
  unite: "bouteille",
  coutDirect: { mode: "total", total: 210, lignes: [] },
  chargesFixes: { mode: "total", total: 220000, lignes: [], source: "propre" },
  volume: 2000,
};

function summaryOf(calcul: Calcul): string {
  const outcome = computeOutcome(calcul);
  if (!("data" in outcome)) throw new Error("résultat attendu");
  return buildSummary(calcul, outcome);
}

describe("buildSummary", () => {
  it("donne le nom, le prix, le coût de revient, la marge et le seuil, puis la mention de l'app", () => {
    const text = summaryOf(BISSAP);
    const lines = text.split("\n");
    expect(lines[0]).toBe("Jus de bissap");
    expect(text).toMatch(/Prix conseillé : 450 F/);
    expect(text).toMatch(/Coût de revient : 320 F/);
    expect(text).toMatch(/Marge : 27,9 % du prix/);
    expect(text).toMatch(/Ventes minimum par mois : 935/);
    expect(lines.at(-1)).toBe("Calculé avec Prix Malin");
  });

  it("nomme « Mon prix » sans nom saisi, et dit l'unité de vente", () => {
    const text = summaryOf({ ...BISSAP, nom: "" });
    expect(text.split("\n")[0]).toBe("Mon prix");
    expect(text).toMatch(/par bouteille/);
  });

  it("n'inclut aucune donnée personnelle : pas d'identifiant, pas de date", () => {
    const text = summaryOf(BISSAP);
    expect(text).not.toMatch(/c1|2026/);
  });

  it("mon prix : donne le verdict en toutes lettres", () => {
    const text = summaryOf({ ...BISSAP, modeResultat: "monPrix", prixActuel: 300 });
    expect(text).toMatch(/Prix actuel : 300 F/);
    expect(text).toMatch(/charges ne sont pas couvertes/i);
  });
});

describe("defaultPriceName (E07)", () => {
  it("reprend le nom saisi", () => {
    expect(defaultPriceName(BISSAP, "Je fabrique")).toBe("Jus de bissap");
  });

  it("sinon suggère « type · unité »", () => {
    expect(defaultPriceName({ ...BISSAP, nom: "  " }, "Je fabrique")).toBe("Je fabrique · bouteille");
  });
});
