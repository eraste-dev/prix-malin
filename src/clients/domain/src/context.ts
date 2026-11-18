import {
  add,
  ceil,
  compare,
  div,
  fromNumber,
  mul,
  ratio,
  sub,
  toNumber,
  type Ratio,
} from "./ratio";
import type { AnalysisInput, PriceBreakdown, PricingError } from "./types";

export const MAX_MARGIN_PCT = 70;
export const MAX_FEE_PCT = 20;
export const DEFAULT_VAT_RATE_PCT = 18;
/** Dénominateur minimal de 1 − marge − frais (RG-02). */
export const MIN_DENOMINATOR: Ratio = ratio(5n, 100n);

const MAX_AMOUNT = 1e12;
const ONE = ratio(1n);
const ZERO = ratio(0n);
const HUNDRED = ratio(100n);

export const isAmount = (x: number): boolean =>
  Number.isFinite(x) && x >= 0 && x <= MAX_AMOUNT;

export const isPct = (x: number): boolean => Number.isFinite(x) && x >= 0 && x <= 100;

export const pct = (x: number): Ratio => div(fromNumber(x), HUNDRED);

/** Données exactes partagées par le calcul d'un prix et l'analyse d'un prix imposé. */
export interface Context {
  readonly directCost: Ratio;
  readonly fixedTotal: Ratio;
  readonly volume: bigint;
  readonly fixedPerUnit: Ratio;
  readonly fullCost: Ratio;
  readonly feeRate: Ratio;
  readonly vatRate: Ratio;
  /** Le prix de référence (arrondi, concurrent, prix saisi) est le TTC. */
  readonly isTtcBase: boolean;
}

export type ContextResult =
  | { readonly ok: true; readonly ctx: Context }
  | { readonly ok: false; readonly reason: PricingError };

const fail = (reason: PricingError): ContextResult => ({ ok: false, reason });

function hasValidAmounts(input: AnalysisInput): boolean {
  return (
    input.directLines.every((l) => isAmount(l.quantity) && isAmount(l.unitPrice)) &&
    input.fixedMonthly.every(isAmount)
  );
}

function hasValidOptions(input: AnalysisInput): boolean {
  const roundingOk =
    !input.rounding.enabled ||
    (Number.isInteger(input.rounding.step) && input.rounding.step > 0);
  const vatOk = !input.vat.enabled || isPct(input.vat.ratePct ?? DEFAULT_VAT_RATE_PCT);
  return roundingOk && vatOk && isPct(input.feePct);
}

export function buildContext(input: AnalysisInput): ContextResult {
  if (!hasValidAmounts(input) || !hasValidOptions(input)) return fail("INVALID_INPUT");
  if (!Number.isInteger(input.monthlyVolume) || input.monthlyVolume < 1) {
    return fail("INVALID_VOLUME");
  }

  const directCost = input.directLines.reduce(
    (total, l) => add(total, mul(fromNumber(l.quantity), fromNumber(l.unitPrice))),
    ZERO,
  );
  const fixedTotal = input.fixedMonthly.reduce((t, a) => add(t, fromNumber(a)), ZERO);
  const volume = BigInt(input.monthlyVolume);
  const fixedPerUnit = div(fixedTotal, ratio(volume));
  const fullCost = add(directCost, fixedPerUnit);
  if (compare(fullCost, ZERO) <= 0) return fail("NO_COST");
  if (input.feePct > MAX_FEE_PCT) return fail("MARGIN_FEES_TOO_HIGH");

  const vatRate = input.vat.enabled ? pct(input.vat.ratePct ?? DEFAULT_VAT_RATE_PCT) : ZERO;
  return {
    ok: true,
    ctx: {
      directCost,
      fixedTotal,
      volume,
      fixedPerUnit,
      fullCost,
      feeRate: pct(input.feePct),
      vatRate,
      isTtcBase: input.vat.enabled && input.vat.base === "TTC",
    },
  };
}

/** Prix HT minimal pour ne pas perdre sur l'unité (RG-09). */
export const floorPrice = (ctx: Context): Ratio => div(ctx.directCost, sub(ONE, ctx.feeRate));

/** Prix HT minimal pour couvrir toutes les charges (RG-09). */
export const equilibriumPrice = (ctx: Context): Ratio => div(ctx.fullCost, sub(ONE, ctx.feeRate));

/** Décomposition complète d'un prix HT donné (RG-04 à RG-07). */
export function buildBreakdown(ctx: Context, priceExclVat: Ratio, rawPrice: Ratio): PriceBreakdown {
  const fee = mul(priceExclVat, ctx.feeRate);
  const margin = sub(sub(priceExclVat, fee), ctx.fullCost);
  const contribution = sub(mul(priceExclVat, sub(ONE, ctx.feeRate)), ctx.directCost);
  const hasContribution = compare(contribution, ZERO) > 0;
  const vat = mul(priceExclVat, ctx.vatRate);
  const priceInclVat = add(priceExclVat, vat);

  return {
    directCost: toNumber(ctx.directCost),
    fixedTotal: toNumber(ctx.fixedTotal),
    fixedPerUnit: toNumber(ctx.fixedPerUnit),
    fullCost: toNumber(ctx.fullCost),
    rawPrice: toNumber(rawPrice),
    priceExclVat: toNumber(priceExclVat),
    vat: toNumber(vat),
    priceInclVat: toNumber(priceInclVat),
    customerPrice: toNumber(ctx.isTtcBase ? priceInclVat : priceExclVat),
    fee: toNumber(fee),
    margin: toNumber(margin),
    markupRate: compare(priceExclVat, ZERO) > 0 ? toNumber(div(margin, priceExclVat)) : 0,
    marginRate: toNumber(div(margin, ctx.fullCost)),
    coefficient:
      compare(ctx.directCost, ZERO) > 0 ? toNumber(div(priceExclVat, ctx.directCost)) : null,
    breakEvenUnits: hasContribution ? Number(ceil(div(ctx.fixedTotal, contribution))) : null,
    monthlyProfit: toNumber(sub(mul(ratio(ctx.volume), contribution), ctx.fixedTotal)),
    floorPrice: toNumber(floorPrice(ctx)),
    equilibriumPrice: toNumber(equilibriumPrice(ctx)),
  };
}

export const gross = (ctx: Context): Ratio => add(ONE, ctx.vatRate);
export { ONE, ZERO };
