import { describe, expect, it } from "vitest";
import { backupFileName, buildBackup, importBackup, readBackup } from "../src/lib/backup";
import { memoryStorage } from "../src/lib/storage";
import { createAppStores } from "../src/lib/stores";
import { bissap } from "./helpers";

/** Sauvegarde et import (EXG-44) : un fichier lisible par l'utilisateur, validé à l'import, jamais envoyé nulle part. */
const snapshot = { prixConseille: 450, coutDeRevient: 320 };

function storesWith(names: readonly string[]) {
  const stores = createAppStores(memoryStorage());
  for (const nom of names) stores.prices.getState().save(bissap({ nom }), snapshot, nom);
  return stores;
}

describe("buildBackup", () => {
  it("écrit une enveloppe identifiée, versionnée et datée, avec les prix", () => {
    const stores = storesWith(["A", "B"]);
    const json = JSON.parse(buildBackup(stores.prices.getState().prices, new Date("2026-11-19T08:00:00Z")));
    expect(json).toMatchObject({ app: "prix-malin", schema: 1, exportedAt: "2026-11-19T08:00:00.000Z" });
    expect(json.prices.map((p: { nom: string }) => p.nom)).toEqual(["B", "A"]);
  });

  it("ne contient ni réglages ni brouillon : seulement les prix", () => {
    const json = JSON.parse(buildBackup(storesWith(["A"]).prices.getState().prices));
    expect(Object.keys(json).sort()).toEqual(["app", "exportedAt", "prices", "schema"]);
  });

  it("nomme le fichier avec la date : prix-malin-2026-11-19.json", () => {
    expect(backupFileName(new Date("2026-11-19T08:00:00Z"))).toBe("prix-malin-2026-11-19.json");
  });
});

describe("readBackup", () => {
  it("relit une sauvegarde valide", () => {
    const text = buildBackup(storesWith(["A"]).prices.getState().prices);
    const result = readBackup(text);
    expect(result).toMatchObject({ ok: true, rejected: 0 });
    expect(result.ok && result.prices).toHaveLength(1);
  });

  it.each([
    ["du texte quelconque", "pas du json", "UNREADABLE"],
    ["un JSON qui n'est pas une sauvegarde", JSON.stringify({ hello: 1 }), "NOT_A_BACKUP"],
    ["la sauvegarde d'une autre application", JSON.stringify({ app: "autre", schema: 1, prices: [] }), "NOT_A_BACKUP"],
    ["une version plus récente", JSON.stringify({ app: "prix-malin", schema: 99, exportedAt: "x", prices: [] }), "NEWER_VERSION"],
  ])("refuse %s", (_name, text, reason) => {
    expect(readBackup(text)).toEqual({ ok: false, reason });
  });

  it("écarte les prix abîmés et garde les autres", () => {
    const valid = storesWith(["Bon"]).prices.getState().prices[0];
    const text = JSON.stringify({ app: "prix-malin", schema: 1, exportedAt: "x", prices: [valid, { id: "x", nom: 5 }] });
    const result = readBackup(text);
    expect(result.ok && result.prices.map((p) => p.nom)).toEqual(["Bon"]);
    expect(result.ok && result.rejected).toBe(1);
  });
});

describe("importBackup", () => {
  it("ajoute les prix absents, en tête de liste, sans écraser", () => {
    const source = storesWith(["Importé"]);
    const text = buildBackup(source.prices.getState().prices);
    const target = storesWith(["Existant"]);

    const report = importBackup(target, text);

    expect(report).toEqual({ ok: true, added: 1, skipped: 0, rejected: 0 });
    expect(target.prices.getState().prices.map((p) => p.nom).sort()).toEqual(["Existant", "Importé"]);
  });

  it("ignore un prix déjà présent (même identifiant) : un import répété ne crée pas de doublon", () => {
    const target = storesWith(["A"]);
    const text = buildBackup(target.prices.getState().prices);

    const report = importBackup(target, text);

    expect(report).toEqual({ ok: true, added: 0, skipped: 1, rejected: 0 });
    expect(target.prices.getState().prices).toHaveLength(1);
  });

  it("relit après export : aller-retour sans perte", () => {
    const source = storesWith(["A", "B", "C"]);
    const text = buildBackup(source.prices.getState().prices);
    const target = createAppStores(memoryStorage());

    importBackup(target, text);

    expect(target.prices.getState().prices.map((p) => p.nom).sort()).toEqual(["A", "B", "C"]);
    expect(target.prices.getState().prices[0]?.calcul.coutDirect.total).toBe(210);
  });

  it("renvoie la raison quand le fichier est refusé, sans rien modifier", () => {
    const target = storesWith(["A"]);
    expect(importBackup(target, "n'importe quoi")).toEqual({ ok: false, reason: "UNREADABLE" });
    expect(target.prices.getState().prices).toHaveLength(1);
  });
});
