import { describe, expect, it } from "vitest";
import { newCalcul, type Calcul } from "../src/lib/model";
import { computeOutcome } from "../src/lib/outcome";

/** Résultat d'un calcul : messages guidés (RG-02, RG-08), prix conseillé (RG-01 à RG-06), mon prix (RG-09), concurrent (RG-10). */
const BISSAP: Calcul = {
  ...newCalcul("making", { now: "2026-11-18T10:00:00.000Z", id: "c1" }),
  coutDirect: { mode: "total", total: 210, lignes: [] },
  chargesFixes: { mode: "total", total: 220000, lignes: [], source: "propre" },
  volume: 2000,
};

describe("messages guidés tant que le calcul est incomplet", () => {
  it("coût absent : invite à commencer par trois nombres", () => {
    const outcome = computeOutcome(newCalcul("making"));
    expect("message" in outcome && outcome.message).toMatch(/trois nombres/i);
  });

  it("charges absentes : demande ce qu'on paie chaque mois", () => {
    const outcome = computeOutcome({ ...BISSAP, chargesFixes: { mode: "total", total: null, lignes: [], source: "propre" }, volume: null });
    expect("message" in outcome && outcome.message).toMatch(/chaque mois/i);
  });

  it("volume absent : demande combien de ventes (RG-08), jamais de prix faux", () => {
    const outcome = computeOutcome({ ...BISSAP, volume: null });
    expect("message" in outcome && outcome.message).toMatch(/combien en vendez-vous par mois/i);
  });

  it("aucun coût du tout (direct et charges à 0) : demande ce que coûte une vente (RG-02)", () => {
    const outcome = computeOutcome({
      ...BISSAP,
      coutDirect: { mode: "total", total: 0, lignes: [] },
      chargesFixes: { mode: "total", total: 0, lignes: [], source: "propre" },
    });
    expect("message" in outcome && outcome.message).toMatch(/vous coûte une vente/i);
  });

  it("un coût direct nul reste calculable tant que les charges ne le sont pas (service sans matière)", () => {
    const outcome = computeOutcome({ ...BISSAP, coutDirect: { mode: "total", total: 0, lignes: [] } });
    expect("data" in outcome).toBe(true);
  });
});

describe("prix conseillé", () => {
  it("bissap : 450 F, coût de revient 320 F, seuil 935 ventes (vecteur de docs/03)", () => {
    const outcome = computeOutcome(BISSAP);
    if (!("data" in outcome)) throw new Error("résultat attendu");
    expect(outcome.mode).toBe("conseille");
    expect(outcome.data.priceExclVat).toBe(450);
    expect(outcome.data.fullCost).toBe(320);
    expect(outcome.data.breakEvenUnits).toBe(935);
    expect(outcome.verdict).toBeNull();
  });

  it("le détail des lignes donne le même prix que le total équivalent", () => {
    const detailed: Calcul = {
      ...BISSAP,
      coutDirect: { mode: "detail", total: null, lignes: [{ id: "a", label: "Matières", quantity: 1, unitPrice: 210 }] },
      chargesFixes: { mode: "detail", total: null, source: "propre", lignes: [{ id: "b", label: "Loyer", amount: 100000 }, { id: "c", label: "Salaire", amount: 120000 }] },
    };
    const outcome = computeOutcome(detailed);
    expect("data" in outcome && outcome.data.priceExclVat).toBe(450);
  });

  it("tient compte du type : prestation (marge 30 %, frais 0 %, arrondi 500 F)", () => {
    const outcome = computeOutcome({ ...newCalcul("service"), coutDirect: BISSAP.coutDirect, chargesFixes: BISSAP.chargesFixes, volume: 2000 });
    expect("data" in outcome && outcome.data.priceExclVat).toBe(500);
  });
});

describe("mode « mon prix » (RG-09)", () => {
  const own = (prixActuel: number | null): Calcul => ({ ...BISSAP, modeResultat: "monPrix", prixActuel });

  it("sans prix saisi : demande à quel prix on vend", () => {
    const outcome = computeOutcome(own(null));
    expect("message" in outcome && outcome.message).toMatch(/à quel prix vendez-vous/i);
  });

  it.each([
    [200, "LOSS_PER_SALE"],
    [300, "FIXED_COSTS_NOT_COVERED"],
    [450, "PROFITABLE"],
  ] as const)("prix actuel %i F : verdict %s", (price, verdict) => {
    const outcome = computeOutcome(own(price));
    if (!("data" in outcome)) throw new Error("résultat attendu");
    expect(outcome.mode).toBe("monPrix");
    expect(outcome.verdict).toBe(verdict);
    expect(outcome.data.customerPrice).toBe(price);
  });

  it("garde le prix conseillé en comparaison", () => {
    const outcome = computeOutcome(own(300));
    expect("data" in outcome && outcome.recommended?.priceExclVat).toBe(450);
  });
});

describe("prix du concurrent (RG-10)", () => {
  const withCompetitor = (concurrent: number): Calcul => ({ ...BISSAP, concurrent });

  it("absent : aucune comparaison", () => {
    const outcome = computeOutcome(BISSAP);
    expect("data" in outcome && outcome.competitor).toBeNull();
  });

  it("concurrent nettement moins cher que nous (450 F contre 380 F, +18 %) : on est plus cher", () => {
    const outcome = computeOutcome(withCompetitor(380));
    expect("data" in outcome && outcome.competitor?.kind).toBe("PRICIER");
  });

  it("concurrent sous notre coût de revient (300 F pour 323 F d'équilibre) : information, pas de verdict de perte", () => {
    const outcome = computeOutcome(withCompetitor(300));
    expect("data" in outcome && outcome.competitor?.kind).toBe("COMPETITOR_BELOW_COST");
  });

  it("concurrent au même niveau : aligné", () => {
    const outcome = computeOutcome(withCompetitor(450));
    expect("data" in outcome && outcome.competitor?.kind).toBe("ALIGNED");
  });
});
