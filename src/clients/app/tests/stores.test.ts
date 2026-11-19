import { describe, expect, it } from "vitest";
import { newCalcul } from "../src/lib/model";
import { STORAGE_KEYS, memoryStorage } from "../src/lib/storage";
import { ONBOARDING_VERSION, createAppStores } from "../src/lib/stores";

/** Stores persistés (ADR-0012) : brouillon, prix enregistrés, réglages. Stockage derrière une interface, validé à la lecture. */
const make = (initial: Record<string, string> = {}) => {
  const storage = memoryStorage(initial);
  return { storage, ...createAppStores(storage) };
};
const envelope = (state: unknown) => JSON.stringify({ state, version: 1 });

describe("brouillon : actions", () => {
  it("démarre sur un calcul vierge « Je fabrique »", () => {
    const { calc } = make();
    const c = calc.getState().calcul;
    expect(c.type).toBe("making");
    expect(c.coutDirect.total).toBeNull();
    expect(calc.getState().integrity.draftLost).toBe(false);
  });

  it("change de type en appliquant ses défauts et garde les montants", () => {
    const { calc } = make();
    calc.getState().setCostTotal(210);
    calc.getState().setType("service");
    const c = calc.getState().calcul;
    expect([c.type, c.marge, c.frais, c.arrondi.pas, c.unite]).toEqual(["service", 30, 0, 500, "prestation"]);
    expect(c.coutDirect.total).toBe(210);
  });

  it("garde une unité personnalisée quand le type change, remplace l'unité par défaut", () => {
    const { calc } = make();
    calc.getState().setType("resale");
    expect(calc.getState().calcul.unite).toBe("pièce");
    calc.getState().setUnite("bouteille");
    calc.getState().setType("service");
    expect(calc.getState().calcul.unite).toBe("bouteille");
  });

  it("bascule Total → Détail sans perte : le total devient la première ligne (Q2-02)", () => {
    const { calc } = make();
    calc.getState().setCostTotal(210);
    calc.getState().setCostMode("detail");
    const { coutDirect } = calc.getState().calcul;
    expect(coutDirect.mode).toBe("detail");
    expect(coutDirect.lignes).toHaveLength(1);
    expect(coutDirect.lignes[0]).toMatchObject({ quantity: 1, unitPrice: 210 });
  });

  it("bascule Détail → Total en additionnant les lignes", () => {
    const { calc } = make();
    calc.getState().setCostMode("detail");
    calc.getState().addCostLine({ label: "Matières", quantity: 2, unitPrice: 100 });
    calc.getState().addCostLine({ label: "Emballage", quantity: 1, unitPrice: 10 });
    calc.getState().setCostMode("total");
    expect(calc.getState().calcul.coutDirect.total).toBe(210);
  });

  it("ajoute, modifie et supprime une ligne de coût par identifiant (jamais par index)", () => {
    const { calc } = make();
    calc.getState().setCostMode("detail");
    const a = calc.getState().addCostLine({ label: "A", quantity: 1, unitPrice: 5 });
    const b = calc.getState().addCostLine({ label: "B", quantity: 1, unitPrice: 6 });
    expect(a).not.toBe(b);
    calc.getState().updateCostLine(a, { unitPrice: 50 });
    calc.getState().removeCostLine(b);
    expect(calc.getState().calcul.coutDirect.lignes).toEqual([
      { id: a, label: "A", quantity: 1, unitPrice: 50 },
    ]);
  });

  it("gère les charges en détail : pastilles ajoutées puis retirées", () => {
    const { calc } = make();
    calc.getState().setChargesTotal(220000);
    calc.getState().setChargesMode("detail");
    expect(calc.getState().calcul.chargesFixes.lignes[0]).toMatchObject({ amount: 220000 });
    const id = calc.getState().addChargeLine({ label: "Loyer", amount: 0 });
    calc.getState().updateChargeLine(id, { amount: 100000 });
    calc.getState().removeChargeLine(id);
    expect(calc.getState().calcul.chargesFixes.lignes).toHaveLength(1);
  });

  it("borne la marge (0 à 70 %), les frais (0 à 20 %) et impose un volume entier ≥ 1 (RG-12)", () => {
    const { calc } = make();
    calc.getState().setMarge(99);
    calc.getState().setFrais(50);
    expect([calc.getState().calcul.marge, calc.getState().calcul.frais]).toEqual([70, 20]);
    calc.getState().setMarge(-4);
    expect(calc.getState().calcul.marge).toBe(0);
    calc.getState().setVolume(0);
    expect(calc.getState().calcul.volume).toBeNull();
    calc.getState().setVolume(12.6);
    expect(calc.getState().calcul.volume).toBe(12);
  });

  it("met à jour la date de modification à chaque changement", async () => {
    const { calc } = make();
    const before = calc.getState().calcul.modifieLe;
    await new Promise((resolve) => setTimeout(resolve, 5));
    calc.getState().setNom("Jus de bissap");
    expect(calc.getState().calcul.modifieLe > before).toBe(true);
  });

  it("repart d'un calcul vierge en gardant le dernier type choisi, avec un nouvel identifiant", () => {
    const { calc } = make();
    calc.getState().setType("resale");
    calc.getState().setCostTotal(500);
    const oldId = calc.getState().calcul.id;
    calc.getState().reset();
    const c = calc.getState().calcul;
    expect(c.type).toBe("resale");
    expect(c.coutDirect.total).toBeNull();
    expect(c.id).not.toBe(oldId);
  });

  it("charge un calcul enregistré dans le brouillon et se souvient duquel (« Mettre à jour »)", () => {
    const { calc, storage } = make();
    const saved = { ...newCalcul("service"), nom: "Coiffure" };
    calc.getState().load(saved, "prix-42");
    expect(calc.getState().calcul.nom).toBe("Coiffure");
    expect(calc.getState().linkedPriceId).toBe("prix-42");
    expect(createAppStores(storage).calc.getState().linkedPriceId).toBe("prix-42");
    calc.getState().reset();
    expect(calc.getState().linkedPriceId).toBeNull();
  });

  it("coche puis décoche une charge courante par sa pastille ; le rappel de salaire se ferme une fois", () => {
    const { calc } = make();
    const id = calc.getState().toggleChargePreset("Loyer");
    expect(id).not.toBeNull();
    expect(calc.getState().calcul.chargesFixes.lignes.map((line) => line.label)).toEqual(["Loyer"]);
    expect(calc.getState().toggleChargePreset("Loyer")).toBeNull();
    expect(calc.getState().calcul.chargesFixes.lignes).toEqual([]);
    expect(calc.getState().calcul.remunerationRappelVu).toBe(false);
    calc.getState().dismissRemunerationReminder();
    expect(calc.getState().calcul.remunerationRappelVu).toBe(true);
  });
});

describe("brouillon : persistance et lecture validée (NFR-09, E14)", () => {
  it("retrouve le brouillon au lancement suivant (rien n'est perdu)", () => {
    const { calc, storage } = make();
    calc.getState().setCostTotal(210);
    calc.getState().setVolume(2000);
    const second = createAppStores(storage);
    expect(second.calc.getState().calcul.coutDirect.total).toBe(210);
    expect(second.calc.getState().calcul.volume).toBe(2000);
    expect(second.calc.getState().integrity.draftLost).toBe(false);
  });

  it("JSON illisible : repart vierge, signale la perte, sans jamais lever d'erreur", () => {
    const { calc } = make({ [STORAGE_KEYS.draft]: "{pas du json" });
    expect(calc.getState().calcul.coutDirect.total).toBeNull();
    expect(calc.getState().integrity.draftLost).toBe(true);
  });

  it("contenu valide en JSON mais hors schéma (marge 99) : repart vierge et signale la perte", () => {
    const bad = { ...newCalcul("making"), marge: 99 };
    const { calc } = make({ [STORAGE_KEYS.draft]: envelope({ calcul: bad }) });
    expect(calc.getState().calcul.marge).toBe(25);
    expect(calc.getState().integrity.draftLost).toBe(true);
  });

  it("n'écrit que les données : pas les actions ni l'état d'intégrité", () => {
    const { calc, storage } = make();
    calc.getState().setCostTotal(1);
    const raw = JSON.parse(storage.getItem(STORAGE_KEYS.draft) ?? "{}");
    expect(Object.keys(raw.state).sort()).toEqual(["calcul", "linkedPriceId"]);
    expect(raw.version).toBe(1);
  });

  it("survit à un stockage qui refuse l'écriture (navigation privée, quota)", () => {
    const storage = memoryStorage();
    storage.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    const { calc } = createAppStores(storage);
    expect(() => calc.getState().setCostTotal(210)).not.toThrow();
    expect(calc.getState().calcul.coutDirect.total).toBe(210);
  });
});

describe("prix enregistrés", () => {
  const snapshot = { prixConseille: 450, coutDeRevient: 320 };

  it("enregistre en tête de liste, avec le calcul figé et un identifiant unique", () => {
    const { prices, calc } = make();
    calc.getState().setCostTotal(210);
    const first = prices.getState().save(calc.getState().calcul, snapshot, "Bissap");
    const second = prices.getState().save(calc.getState().calcul, snapshot, "Bissap");
    expect(first).not.toBe(second);
    const list = prices.getState().prices;
    expect(list.map((p) => p.id)).toEqual([second, first]);
    expect(list[0]).toMatchObject({ nom: "Bissap", prixConseille: 450, coutDeRevient: 320 });
  });

  it("accepte deux prix de même nom (MP-02)", () => {
    const { prices, calc } = make();
    prices.getState().save(calc.getState().calcul, snapshot, "Jus");
    prices.getState().save(calc.getState().calcul, snapshot, "Jus");
    expect(prices.getState().prices.filter((p) => p.nom === "Jus")).toHaveLength(2);
  });

  it("le prix enregistré est une copie : modifier le brouillon ne le change pas", () => {
    const { prices, calc } = make();
    calc.getState().setCostTotal(210);
    const id = prices.getState().save(calc.getState().calcul, snapshot, "A");
    calc.getState().setCostTotal(999);
    expect(prices.getState().prices.find((p) => p.id === id)?.calcul.coutDirect.total).toBe(210);
  });

  it("met à jour un prix enregistré (« Mettre à jour »)", () => {
    const { prices, calc } = make();
    const id = prices.getState().save(calc.getState().calcul, snapshot, "A");
    prices.getState().update(id, calc.getState().calcul, { prixConseille: 500, coutDeRevient: 350 }, "A bis");
    expect(prices.getState().prices[0]).toMatchObject({ id, nom: "A bis", prixConseille: 500 });
  });

  it("duplique en « (copie) » avec un nouvel identifiant, juste au-dessus de l'original", () => {
    const { prices, calc } = make();
    const id = prices.getState().save(calc.getState().calcul, snapshot, "Jus");
    const copy = prices.getState().duplicate(id);
    expect(copy).not.toBeNull();
    expect(prices.getState().prices[0]).toMatchObject({ id: copy, nom: "Jus (copie)" });
    expect(prices.getState().prices[1]?.id).toBe(id);
  });

  it("supprime puis restaure à la même place (bandeau Annuler, MP-01)", () => {
    const { prices, calc } = make();
    const a = prices.getState().save(calc.getState().calcul, snapshot, "A");
    const b = prices.getState().save(calc.getState().calcul, snapshot, "B");
    const c = prices.getState().save(calc.getState().calcul, snapshot, "C");
    const removed = prices.getState().remove(b);
    expect(prices.getState().prices.map((p) => p.id)).toEqual([c, a]);
    prices.getState().restore(removed!);
    expect(prices.getState().prices.map((p) => p.id)).toEqual([c, b, a]);
  });

  it("remove d'un identifiant inconnu ne casse rien", () => {
    const { prices } = make();
    expect(prices.getState().remove("inconnu")).toBeNull();
  });

  it("persiste entre deux lancements", () => {
    const { prices, calc, storage } = make();
    prices.getState().save(calc.getState().calcul, snapshot, "Bissap");
    expect(createAppStores(storage).prices.getState().prices[0]?.nom).toBe("Bissap");
  });

  it("garde ce qui est lisible quand un élément est corrompu et dit combien ont été perdus (E14)", () => {
    const { prices: source, calc, storage } = make();
    source.getState().save(calc.getState().calcul, snapshot, "Bon");
    const raw = JSON.parse(storage.getItem(STORAGE_KEYS.prices)!);
    raw.state.prices.push({ id: "mauvais", nom: 12 });
    const reloaded = make({ [STORAGE_KEYS.prices]: JSON.stringify(raw) }).prices.getState();
    expect(reloaded.prices.map((p) => p.nom)).toEqual(["Bon"]);
    expect(reloaded.integrity.lost).toBe(1);
  });

  it("JSON illisible : liste vide et perte signalée", () => {
    const state = make({ [STORAGE_KEYS.prices]: "###" }).prices.getState();
    expect(state.prices).toEqual([]);
    expect(state.integrity.lost).toBeGreaterThan(0);
  });

  it("efface tout sur demande (Réglages)", () => {
    const { prices, calc } = make();
    prices.getState().save(calc.getState().calcul, snapshot, "A");
    prices.getState().clear();
    expect(prices.getState().prices).toEqual([]);
  });
});

describe("réglages (docs/14, Données)", () => {
  it("premier lancement : l'onboarding est à montrer", () => {
    const { settings } = make();
    expect(settings.getState().needsOnboarding()).toBe(true);
  });

  it("« passer » marque l'onboarding comme vu, pour toujours", () => {
    const { settings, storage } = make();
    settings.getState().markOnboardingSeen();
    expect(settings.getState().needsOnboarding()).toBe(false);
    expect(createAppStores(storage).settings.getState().needsOnboarding()).toBe(false);
  });

  it("une version d'onboarding plus récente se rejoue (ONB-05 : « Revoir la présentation »)", () => {
    const { settings } = make();
    settings.getState().markOnboardingSeen();
    settings.getState().resetOnboarding();
    expect(settings.getState().needsOnboarding()).toBe(true);
    expect(ONBOARDING_VERSION).toBeGreaterThanOrEqual(1);
  });

  it("un drapeau corrompu est traité comme un premier lancement, sans erreur", () => {
    const { settings } = make({ [STORAGE_KEYS.settings]: "n'importe quoi" });
    expect(settings.getState().needsOnboarding()).toBe(true);
  });

  it("chaque aide ne s'affiche qu'une fois ; réinitialisable", () => {
    const { settings } = make();
    expect(settings.getState().hasSeenTip("q2")).toBe(false);
    settings.getState().markTip("q2");
    settings.getState().markTip("q2");
    expect(settings.getState().hasSeenTip("q2")).toBe(true);
    expect(settings.getState().tipsSeen).toEqual(["q2"]);
    settings.getState().resetTips();
    expect(settings.getState().hasSeenTip("q2")).toBe(false);
  });

  it("retient la dernière activité choisie pour pré-sélectionner Q1", () => {
    const { settings, storage } = make();
    settings.getState().setLastActivity("service");
    expect(createAppStores(storage).settings.getState().lastActivity).toBe("service");
  });
});
