import { describe, expect, it } from "vitest";
import {
  ARTICLES,
  CONTENT_VERSION,
  GLOSSARY,
  HELP_TERMS,
  contentSchema,
  findArticle,
  tipOfTheDay,
} from "../src/content/comprendre";
import { exampleFor } from "../src/lib/examples";
import { computeOutcome } from "../src/lib/outcome";
import { bissap } from "./helpers";

/** Contenu pédagogique : donnée versionnée et validée (ADR-0005), jamais écrite en dur dans les écrans. */
describe("contenu « Comprendre » (E11)", () => {
  it("est versionné et respecte son schéma", () => {
    expect(CONTENT_VERSION).toBeGreaterThanOrEqual(1);
    expect(contentSchema.safeParse({ schema: 1, version: CONTENT_VERSION, articles: ARTICLES, glossary: GLOSSARY }).success).toBe(true);
  });

  it("couvre les six concepts, « à compter » et les cinq erreurs (docs/15 E11)", () => {
    expect(ARTICLES.map((article) => article.slug)).toEqual([
      "cout-direct",
      "charges-fixes",
      "cout-de-revient",
      "marge",
      "prix",
      "seuil",
      "a-compter",
      "cinq-erreurs",
    ]);
  });

  it("chaque article a un titre, un résumé, des paragraphes et un conseil", () => {
    for (const article of ARTICLES) {
      expect(article.title.length).toBeGreaterThan(3);
      expect(article.summary.length).toBeGreaterThan(10);
      expect(article.paragraphs.length).toBeGreaterThanOrEqual(2);
      expect(article.tip.length).toBeGreaterThan(10);
    }
  });

  it("les identifiants sont uniques et sans caractère spécial (ils servent d'adresse)", () => {
    const slugs = ARTICLES.map((article) => article.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("refuse un contenu abîmé (article sans titre)", () => {
    const broken = { schema: 1, version: 1, articles: [{ ...ARTICLES[0], title: "" }], glossary: GLOSSARY };
    expect(contentSchema.safeParse(broken).success).toBe(false);
  });

  it("findArticle renvoie l'article, ou undefined pour une adresse inconnue", () => {
    expect(findArticle("marge")?.title).toMatch(/marge/i);
    expect(findArticle("n-importe-quoi")).toBeUndefined();
  });

  it("n'emploie pas de jargon non expliqué : jamais « CAF », « EBE » ni « BFR »", () => {
    const text = JSON.stringify(ARTICLES);
    expect(text).not.toMatch(/\b(CAF|EBE|BFR)\b/);
  });
});

describe("aide contextuelle (E12)", () => {
  it("définit chaque terme en quelques lignes, avec un lien vers un article existant", () => {
    for (const term of HELP_TERMS) {
      const entry = GLOSSARY[term];
      expect(entry.title).not.toBe("");
      expect(entry.text.length).toBeGreaterThan(20);
      expect(entry.text.length).toBeLessThan(260); // « 3 à 5 lignes » (docs/15 E12)
      expect(findArticle(entry.slug)).toBeDefined();
    }
  });
});

describe("conseil du moment (E01)", () => {
  it("est stable pour un même jour et change d'un jour à l'autre", () => {
    const monday = tipOfTheDay(new Date("2026-11-16T10:00:00"));
    expect(tipOfTheDay(new Date("2026-11-16T22:00:00"))).toEqual(monday);
    expect(tipOfTheDay(new Date("2026-11-17T10:00:00"))).not.toEqual(monday);
  });

  it("renvoie un conseil lié à un article existant", () => {
    const tip = tipOfTheDay(new Date("2026-11-18T10:00:00"));
    expect(findArticle(tip.slug)).toBeDefined();
    expect(tip.text.length).toBeGreaterThan(10);
  });
});

describe("exemple chiffré (E11 : tiré de l'activité de l'utilisateur quand c'est possible)", () => {
  const outcome = computeOutcome(bissap());
  const data = "data" in outcome ? outcome.data : null;

  it("avec un prix calculé : reprend les chiffres de l'utilisateur", () => {
    expect(exampleFor("cout-direct", data)).toMatch(/210 F/);
    expect(exampleFor("charges-fixes", data)).toMatch(/110 F par vente/);
    expect(exampleFor("cout-de-revient", data)).toMatch(/320 F/);
    expect(exampleFor("marge", data)).toMatch(/27,9 %/);
    expect(exampleFor("prix", data)).toMatch(/450 F/);
    expect(exampleFor("seuil", data)).toMatch(/935/);
    expect(exampleFor("cout-direct", data)).toMatch(/votre calcul/i);
  });

  it("sans calcul : donne un exemple générique, étiqueté comme tel", () => {
    expect(exampleFor("cout-direct", null)).toMatch(/^Exemple/);
    expect(exampleFor("prix", null)).toMatch(/450 F/);
  });

  it("pas d'exemple pour les articles de liste", () => {
    expect(exampleFor("a-compter", data)).toBeNull();
    expect(exampleFor("cinq-erreurs", null)).toBeNull();
  });
});
