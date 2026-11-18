/**
 * Arithmétique exacte sur des fractions d'entiers (ADR-0002).
 * Aucune dérive flottante : les arrondis n'interviennent qu'aux points définis
 * par les règles métier (docs/03-regles-metier.md).
 */

export interface Ratio {
  readonly n: bigint;
  readonly d: bigint;
}

/** Nombre de décimales conservées lors de la conversion depuis un `number`. */
const DECIMALS = 6;
const SCALE = 10n ** BigInt(DECIMALS);
const MAX_ABS = 1e15;

const abs = (x: bigint): bigint => (x < 0n ? -x : x);

function gcd(a: bigint, b: bigint): bigint {
  let x = abs(a);
  let y = abs(b);
  while (y !== 0n) {
    [x, y] = [y, x % y];
  }
  return x;
}

export function ratio(n: bigint, d: bigint = 1n): Ratio {
  if (d === 0n) throw new RangeError("Division par zéro");
  const sign = d < 0n ? -1n : 1n;
  // d ≠ 0, donc le pgcd vaut au moins 1.
  const divisor = gcd(n, d);
  return { n: (sign * n) / divisor, d: (sign * d) / divisor };
}

export const add = (a: Ratio, b: Ratio): Ratio => ratio(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a: Ratio, b: Ratio): Ratio => ratio(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a: Ratio, b: Ratio): Ratio => ratio(a.n * b.n, a.d * b.d);
export const div = (a: Ratio, b: Ratio): Ratio => ratio(a.n * b.d, a.d * b.n);

export function compare(a: Ratio, b: Ratio): -1 | 0 | 1 {
  const diff = a.n * b.d - b.n * a.d;
  if (diff < 0n) return -1;
  return diff > 0n ? 1 : 0;
}

/** Plus petit entier supérieur ou égal à `r`. */
export function ceil(r: Ratio): bigint {
  return r.n >= 0n ? (r.n + r.d - 1n) / r.d : r.n / r.d;
}

/** Plus petit multiple de `step` (entier > 0) supérieur ou égal à `r`. */
export function ceilToMultiple(r: Ratio, step: bigint): Ratio {
  return ratio(ceil(div(r, ratio(step))) * step);
}

/** Conversion exacte jusqu'à 6 décimales ; refuse les valeurs non finies ou démesurées. */
export function fromNumber(x: number): Ratio {
  if (!Number.isFinite(x) || Math.abs(x) > MAX_ABS) {
    throw new RangeError("Nombre hors limites");
  }
  return ratio(BigInt(x.toFixed(DECIMALS).replace(".", "")), SCALE);
}

/** Conversion pour l'affichage uniquement. */
export function toNumber(r: Ratio): number {
  const whole = r.n / r.d;
  const rest = r.n % r.d;
  return Number(whole) + Number(rest) / Number(r.d);
}
