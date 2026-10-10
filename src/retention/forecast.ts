// Forecast calculations. All outputs are ILLUSTRATIVE, based on explicit fixture assumptions.
import { MESSAGE_COST, OFFER_OPTIONS, type OfferPct, type Product } from "./data";

export interface PolicyLimits {
  maxDiscount: number;
  minContribution: number;
}

export interface OfferEvaluation {
  pct: OfferPct;
  discountAmount: number;
  contributionBefore: number;
  contributionAfterDiscount: number;
  probability: number;
  expectedContribution: number; // per contacted customer, net of messaging cost
  permitted: boolean;
  blockReason?: string;
}

/** E = p × (contribution before incentive − discount) − messaging cost */
export function evaluateOffer(product: Product, pct: OfferPct, limits: PolicyLimits): OfferEvaluation {
  const discountAmount = Math.round((product.price * pct) / 100);
  const contributionBefore = product.price - product.variableCost;
  const contributionAfterDiscount = contributionBefore - discountAmount;
  const probability = product.probs[pct];
  const expectedContribution = probability * contributionAfterDiscount - MESSAGE_COST;
  let blockReason: string | undefined;
  if (pct > limits.maxDiscount) blockReason = `Exceeds maximum discount of ${limits.maxDiscount}%`;
  else if (contributionAfterDiscount < limits.minContribution)
    blockReason = `Order contribution Rs ${contributionAfterDiscount} is below the Rs ${limits.minContribution} floor`;
  return { pct, discountAmount, contributionBefore, contributionAfterDiscount, probability, expectedContribution, permitted: !blockReason, blockReason };
}

export const evaluateAll = (product: Product, limits: PolicyLimits) => OFFER_OPTIONS.map((p) => evaluateOffer(product, p, limits));

/** Budget exposure for one contacted customer: maximum discount liability + messaging cost. */
export const exposureFor = (e: OfferEvaluation) => e.discountAmount + MESSAGE_COST;
