import { describe, expect, it } from "vitest";
import {
  add,
  ceil,
  ceilToMultiple,
  compare,
  div,
  fromNumber,
  mul,
  ratio,
  sub,
  toNumber,
} from "../src/ratio";

describe("ratio", () => {
  it("normalise le signe et réduit la fraction", () => {
    const r = ratio(6n, -4n);
    expect(r).toEqual({ n: -3n, d: 2n });
  });

  it("refuse une division par zéro", () => {
    expect(() => ratio(1n, 0n)).toThrow(RangeError);
    expect(() => div(ratio(1n), ratio(0n))).toThrow(RangeError);
  });

  it("additionne, soustrait, multiplie et divise exactement", () => {
    const a = ratio(1n, 3n);
    const b = ratio(1n, 6n);
    expect(add(a, b)).toEqual(ratio(1n, 2n));
    expect(sub(a, b)).toEqual(ratio(1n, 6n));
    expect(mul(a, b)).toEqual(ratio(1n, 18n));
    expect(div(a, b)).toEqual(ratio(2n));
  });

  it("n'accumule aucune dérive flottante (0,1 + 0,2 = 0,3)", () => {
    expect(add(fromNumber(0.1), fromNumber(0.2))).toEqual(fromNumber(0.3));
  });

  it("compare deux fractions", () => {
    expect(compare(ratio(1n, 3n), ratio(1n, 2n))).toBe(-1);
    expect(compare(ratio(2n, 4n), ratio(1n, 2n))).toBe(0);
    expect(compare(ratio(3n, 4n), ratio(1n, 2n))).toBe(1);
  });

  it("calcule le plafond d'un nombre positif ou négatif", () => {
    expect(ceil(ratio(7n, 2n))).toBe(4n);
    expect(ceil(ratio(8n, 2n))).toBe(4n);
    expect(ceil(ratio(-7n, 2n))).toBe(-3n);
    expect(ceil(ratio(0n))).toBe(0n);
  });

  it("arrondit toujours au multiple supérieur", () => {
    expect(ceilToMultiple(fromNumber(432.43), 25n)).toEqual(ratio(450n));
    expect(ceilToMultiple(ratio(450n), 25n)).toEqual(ratio(450n));
    expect(ceilToMultiple(fromNumber(14145.57), 500n)).toEqual(ratio(14500n));
  });

  it("convertit depuis un nombre décimal sans perte jusqu'à 6 décimales", () => {
    expect(fromNumber(0.5)).toEqual(ratio(1n, 2n));
    expect(fromNumber(-1.25)).toEqual(ratio(-5n, 4n));
    expect(fromNumber(1200)).toEqual(ratio(1200n));
  });

  it("refuse les nombres non finis ou démesurés", () => {
    expect(() => fromNumber(Number.NaN)).toThrow(RangeError);
    expect(() => fromNumber(Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => fromNumber(1e16)).toThrow(RangeError);
  });

  it("convertit en nombre pour l'affichage", () => {
    expect(toNumber(ratio(1n, 4n))).toBe(0.25);
    expect(toNumber(ratio(-7n, 2n))).toBe(-3.5);
    expect(toNumber(ratio(14500n))).toBe(14500);
  });
});
