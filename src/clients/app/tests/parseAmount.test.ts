import { describe, expect, it } from "vitest";
import { formatAmount, formatBreakEven, parseAmount } from "../src/lib/amount";

describe("formatBreakEven", () => {
  it("formate un nombre de ventes", () => {
    expect(formatBreakEven(935)).toBe("935");
  });

  it("indique « Impossible » quand aucun volume ne couvre les charges", () => {
    expect(formatBreakEven(null)).toBe("Impossible");
  });
});

describe("parseAmount", () => {
  it("retourne null pour une saisie vide", () => {
    expect(parseAmount("")).toBeNull();
    expect(parseAmount("   ")).toBeNull();
  });

  it("ignore tout ce qui n'est pas un chiffre (espaces, lettres, signes)", () => {
    expect(parseAmount("220 000")).toBe(220000);
    expect(parseAmount("12a3")).toBe(123);
    expect(parseAmount("-50")).toBe(50);
  });

  it("accepte zéro", () => {
    expect(parseAmount("0")).toBe(0);
  });

  it("borne les montants démesurés", () => {
    expect(parseAmount("9".repeat(20))).toBeNull();
  });
});

describe("formatAmount", () => {
  it("regroupe les milliers pour la saisie", () => {
    expect(formatAmount(220000).replace(/\s/g, " ")).toBe("220 000");
  });

  it("renvoie une chaîne vide pour une valeur absente", () => {
    expect(formatAmount(null)).toBe("");
  });
});
