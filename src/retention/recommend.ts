// Mock recommendation adapter — deterministic and SIMULATED.
// Replaceable later by a grounded AI service implementing the same RecommendationAdapter interface.
import type { OfferPct, Product } from "./data";
import type { CustomerFeature } from "./features";
import { evaluateAll, type OfferEvaluation, type PolicyLimits } from "./forecast";

export interface Recommendation {
  adapter: string;
  action: "replenish" | "no_outreach";
  product: Product;
  offerPct: OfferPct | null;
  evaluations: OfferEvaluation[];
  chosen: OfferEvaluation | null;
  explanation: string;
}

export interface RecommendationAdapter {
  id: string;
  recommend(f: CustomerFeature, limits: PolicyLimits): Recommendation;
}

export const deterministicAdapter: RecommendationAdapter = {
  id: "deterministic-simulated-v1",
  recommend(f, limits) {
    const evaluations = evaluateAll(f.relevantProduct, limits);
    const permitted = evaluations.filter((e) => e.permitted);
    const best = permitted.reduce<OfferEvaluation | null>((b, e) => (!b || e.expectedContribution > b.expectedContribution ? e : b), null);
    if (!best || best.expectedContribution <= 0) {
      return {
        adapter: this.id, action: "no_outreach", product: f.relevantProduct, offerPct: null, evaluations, chosen: null,
        explanation: !best ? "No offer satisfies the discount cap and contribution floor, so no outreach is recommended." : "No permitted offer has positive expected contribution after messaging cost.",
      };
    }
    const label = best.pct === 0 ? "a no-discount reminder" : `a ${best.pct}% offer`;
    return {
      adapter: this.id, action: "replenish", product: f.relevantProduct, offerPct: best.pct, evaluations, chosen: best,
      explanation: `Last bought ${f.relevantProduct.name} ${f.daysSince} days ago against a typical interval of ${f.typicalInterval} days. Among permitted offers, ${label} has the highest illustrative expected contribution (Rs ${best.expectedContribution.toFixed(2)} per contact).`,
    };
  },
};

export function messageFor(name: string, product: Product, daysSince: number, pct: OfferPct) {
  const first = name.split(" ")[0];
  const offer = pct === 0 ? "" : ` Use code REFILL${pct} for ${pct}% off this reorder.`;
  return `Hi ${first}, it's been about ${daysSince} days since your last ${product.name} from Everyday Essentials — running low? Reorder in one tap.${offer} Reply STOP to opt out.`;
}
