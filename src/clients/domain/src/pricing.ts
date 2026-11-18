import {
  buildBreakdown,
  buildContext,
  gross,
  isPct,
  MAX_MARGIN_PCT,
  MIN_DENOMINATOR,
  ONE,
  pct,
} from "./context";
import { ceil, ceilToMultiple, compare, div, mul, ratio, sub, type Ratio } from "./ratio";
import type { PricingInput, PricingResult, RoundingOptions } from "./types";

/** Arrondi toujours vers le haut : au pas choisi, sinon au franc (RG-03). */
function roundUp(value: Ratio, rounding: RoundingOptions): Ratio {
  return rounding.enabled
    ? ceilToMultiple(value, BigInt(rounding.step))
    : ratio(ceil(value));
}

/**
 * Prix conseillé (RG-01 à RG-07).
 * Fonction pure : mêmes entrées, mêmes sorties, sur toutes les plateformes.
 */
export function computePrice(input: PricingInput): PricingResult {
  if (!isPct(input.marginPct)) return { ok: false, reason: "INVALID_INPUT" };

  const built = buildContext(input);
  if (!built.ok) return built;
  const { ctx } = built;

  const denominator = sub(sub(ONE, pct(input.marginPct)), ctx.feeRate);
  if (input.marginPct > MAX_MARGIN_PCT || compare(denominator, MIN_DENOMINATOR) <= 0) {
    return { ok: false, reason: "MARGIN_FEES_TOO_HIGH" };
  }

  const rawPrice = div(ctx.fullCost, denominator);
  const priceExclVat = ctx.isTtcBase
    ? div(roundUp(mul(rawPrice, gross(ctx)), input.rounding), gross(ctx))
    : roundUp(rawPrice, input.rounding);

  return { ok: true, data: buildBreakdown(ctx, priceExclVat, rawPrice) };
}
