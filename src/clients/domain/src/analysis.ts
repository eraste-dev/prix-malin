import {
  buildBreakdown,
  buildContext,
  equilibriumPrice,
  floorPrice,
  gross,
  isAmount,
  ONE,
} from "./context";
import { compare, div, fromNumber, mul, ratio, sub, toNumber } from "./ratio";
import type {
  AnalysisInput,
  AnalysisResult,
  CompetitorKind,
  CompetitorResult,
  PriceBreakdown,
  PriceVerdict,
} from "./types";

/** Écart de prix au-delà duquel on se juge nettement plus cher ou moins cher (RG-10). */
const PRICE_GAP_THRESHOLD = ratio(15n, 100n);

/**
 * Mode « tester mon prix actuel » (EXG-26, RG-09).
 * `ownPrice` est exprimé dans la base choisie (TTC si la TVA est active en mode TTC).
 */
export function analyzePrice(input: AnalysisInput, ownPrice: number): AnalysisResult {
  if (!isAmount(ownPrice)) return { ok: false, reason: "INVALID_INPUT" };
  const built = buildContext(input);
  if (!built.ok) return built;
  const { ctx } = built;

  const own = fromNumber(ownPrice);
  const priceExclVat = ctx.isTtcBase ? div(own, gross(ctx)) : own;

  const verdict: PriceVerdict =
    compare(priceExclVat, floorPrice(ctx)) < 0
      ? "LOSS_PER_SALE"
      : compare(priceExclVat, equilibriumPrice(ctx)) < 0
        ? "FIXED_COSTS_NOT_COVERED"
        : "PROFITABLE";

  return { ok: true, data: buildBreakdown(ctx, priceExclVat, priceExclVat), verdict };
}

/**
 * Compare votre prix au prix d'un concurrent, exprimé dans la même base (RG-10).
 * `data.customerPrice` doit provenir de `computePrice` ou `analyzePrice`.
 */
export function compareWithCompetitor(
  input: AnalysisInput,
  data: PriceBreakdown,
  competitorPrice: number,
): CompetitorResult {
  const built = buildContext(input);
  if (!built.ok || !isAmount(competitorPrice) || competitorPrice === 0) {
    return { ok: false, reason: "INVALID_INPUT" };
  }
  const { ctx } = built;

  const competitor = fromNumber(competitorPrice);
  const competitorExclVat = ctx.isTtcBase ? div(competitor, gross(ctx)) : competitor;
  const delta = div(sub(fromNumber(data.customerPrice), competitor), competitor);
  const deltaRatio = toNumber(delta);

  if (compare(competitorExclVat, equilibriumPrice(ctx)) < 0) {
    const shortfall = toNumber(sub(equilibriumPrice(ctx), competitorExclVat));
    return { ok: true, data: { kind: "COMPETITOR_BELOW_COST", deltaRatio, shortfallPerUnit: shortfall } };
  }

  if (compare(delta, PRICE_GAP_THRESHOLD) > 0) {
    const netAtCompetitor = sub(mul(competitorExclVat, sub(ONE, ctx.feeRate)), ctx.fullCost);
    return {
      ok: true,
      data: {
        kind: "PRICIER",
        deltaRatio,
        marginRateAtCompetitor: toNumber(div(netAtCompetitor, competitorExclVat)),
      },
    };
  }

  const kind: CompetitorKind =
    compare(delta, ratio(-15n, 100n)) < 0 ? "CHEAPER" : "ALIGNED";
  return { ok: true, data: { kind, deltaRatio } };
}
