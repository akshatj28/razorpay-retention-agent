// Campaign plan + policy checks. Aggregates are sums of customer-level calculations.
import { MESSAGE_COST, OFFER_OPTIONS, type OfferPct, type Product } from "./data";
import type { CustomerFeature } from "./features";
import { evaluateOffer, exposureFor, type OfferEvaluation, type PolicyLimits } from "./forecast";
import { deterministicAdapter, messageFor, type Recommendation } from "./recommend";

export type OfferMode = "recommended" | OfferPct;

export interface PlanConfig extends PolicyLimits {
  budget: number;
  offerMode: OfferMode;
  timing: string;
  tolerancePct: number;
  freqDays: number;
}

export interface PlanRow {
  feature: CustomerFeature;
  rec: Recommendation;
  product: Product;
  offerPct: OfferPct;
  source: "recommended" | "uniform" | "override";
  evaluation: OfferEvaluation;
  valid: boolean;
  blockReason?: string | undefined;
  exposure: number;
  message: string;
}

export type CheckStatus = "passed" | "review" | "blocked";
export interface PolicyCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

/** Stable FNV-1a hash → [0,1). Uses only the customer & campaign IDs, never recommendation features. */
export function stableUnit(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 4294967296;
}
export const isHoldout = (customerId: string, campaignId: string) =>
  stableUnit(`${campaignId}:${customerId}`) < 0.1;

export interface Totals {
  contacted: number;
  expected: number;
  exposure: number;
  messaging: number;
  invalid: number;
}

export interface StrategyComparison {
  mode: OfferMode;
  rows: PlanRow[];
  noOutreach: Plan["noOutreach"];
  totals: Totals; // counterfactual totals if launchable is false
  executableTotals: Totals | null;
  launchable: boolean;
  blockers: string[];
}

function totalsOf(rows: PlanRow[]): Totals {
  return rows.reduce(
    (t, r) => ({
      contacted: t.contacted + 1,
      expected: t.expected + r.evaluation.expectedContribution,
      exposure: t.exposure + r.exposure,
      messaging: t.messaging + MESSAGE_COST,
      invalid: t.invalid + (r.valid ? 0 : 1),
    }),
    { contacted: 0, expected: 0, exposure: 0, messaging: 0, invalid: 0 },
  );
}

export interface Plan {
  eligible: CustomerFeature[];
  excluded: CustomerFeature[];
  review: CustomerFeature[];
  holdout: CustomerFeature[];
  contacted: PlanRow[];
  noOutreach: { feature: CustomerFeature; rec: Recommendation }[];
  totals: Totals;
  comparisonAudienceIds: string[];
  comparison: StrategyComparison[];
  recommended: StrategyComparison;
  holdoutPct: number;
  checks: PolicyCheck[];
  hash: string;
}

const planCache = new WeakMap<CustomerFeature[], Map<string, Plan>>();
export function buildPlan(
  features: CustomerFeature[],
  cfg: PlanConfig,
  overrides: Record<string, OfferPct>,
  campaignId: string,
): Plan {
  const cacheKey = JSON.stringify([cfg, overrides, campaignId]);
  const cached = planCache.get(features)?.get(cacheKey);
  if (cached) return cached;
  const eligible = features.filter((f) => f.status === "eligible");
  const excluded = features.filter((f) => f.status === "excluded");
  const review = features.filter((f) => f.status === "review");
  const holdout = eligible.filter((f) => isHoldout(f.customer.id, campaignId));
  const treat = eligible.filter((f) => !isHoldout(f.customer.id, campaignId));
  const limits: PolicyLimits = {
    maxDiscount: cfg.maxDiscount,
    minContribution: cfg.minContribution,
  };

  const rowsFor = (mode: OfferMode, useOverrides: boolean) => {
    const rows: PlanRow[] = [];
    const none: Plan["noOutreach"] = [];
    for (const f of treat) {
      const rec = deterministicAdapter.recommend(f, limits);
      const ov = useOverrides ? overrides[f.customer.id] : undefined;
      let pct: OfferPct | null;
      let source: PlanRow["source"];
      if (ov !== undefined) {
        pct = ov;
        source = "override";
      } else if (mode === "recommended") {
        pct = rec.offerPct;
        source = "recommended";
      } else {
        pct = mode;
        source = "uniform";
      }
      if (pct === null) {
        none.push({ feature: f, rec });
        continue;
      }
      const evaluation = evaluateOffer(f.relevantProduct, pct, limits);
      rows.push({
        feature: f,
        rec,
        product: f.relevantProduct,
        offerPct: pct,
        source,
        evaluation,
        valid: evaluation.permitted,
        blockReason: evaluation.blockReason,
        exposure: exposureFor(evaluation),
        message: messageFor(f.customer.name, f.relevantProduct, f.daysSince, pct),
      });
    }
    return { rows, none };
  };

  const { rows: contacted, none: noOutreach } = rowsFor(cfg.offerMode, true);
  const totals = totalsOf(contacted);
  const comparison = (["recommended", ...OFFER_OPTIONS] as OfferMode[]).map(
    (mode): StrategyComparison => {
      const { rows, none } = rowsFor(mode, false);
      const totals = totalsOf(rows);
      const blockers: string[] = [];
      if (totals.invalid)
        blockers.push(`${totals.invalid} offers break the discount cap or contribution floor`);
      if (totals.exposure > cfg.budget) blockers.push(`Exposure exceeds budget Rs ${cfg.budget}`);
      if (!rows.length) blockers.push("No customers to contact");
      const launchable = blockers.length === 0;
      return {
        mode,
        rows,
        noOutreach: none,
        totals,
        executableTotals: launchable ? totals : null,
        launchable,
        blockers,
      };
    },
  );
  const recommended = comparison[0];
  if (!recommended) throw new Error("Recommended comparison missing");
  const holdoutPct = eligible.length ? (holdout.length / eligible.length) * 100 : 0;

  const checks: PolicyCheck[] = [];
  checks.push({
    id: "consent",
    label: "Marketing consent",
    status: "passed",
    detail: `${excluded.filter((f) => f.reasons.some((r) => r.code === "no_consent")).length} customers without consent are blocked and cannot be messaged.`,
  });
  const hardCount = excluded.filter((f) => f.reasons.some((r) => r.hard)).length;
  checks.push({
    id: "hard",
    label: "Refund, recent purchase, stock & frequency blocks",
    status: "passed",
    detail: `${hardCount} customers held back by hard policy blocks; rechecked before every send.`,
  });
  checks.push({
    id: "review",
    label: "Needs-review items",
    status: review.length ? "review" : "passed",
    detail: review.length
      ? `${review.length} customers need review and are not included until resolved.`
      : "No pending review items.",
  });
  checks.push({
    id: "holdout",
    label: "Holdout separation",
    status: "passed",
    detail: `${holdout.length} of ${eligible.length} eligible customers (${holdoutPct.toFixed(1)}%) reserved as no-contact holdout; excluded from costs and exposure. Stable hash threshold <10%, not an exact-size sample.`,
  });
  const capInvalid = contacted.filter((r) => r.offerPct > cfg.maxDiscount).length;
  checks.push({
    id: "cap",
    label: `Maximum discount (${cfg.maxDiscount}%)`,
    status: capInvalid ? "blocked" : "passed",
    detail: capInvalid
      ? `${capInvalid} customers have an offer above the cap. Change the offer or exclude them.`
      : "All offers are within the cap.",
  });
  const floorInvalid = contacted.filter((r) => r.offerPct <= cfg.maxDiscount && !r.valid).length;
  checks.push({
    id: "floor",
    label: `Contribution floor (Rs ${cfg.minContribution}/order)`,
    status: floorInvalid ? "blocked" : "passed",
    detail: floorInvalid
      ? `${floorInvalid} customers' offers would drop order contribution below the floor.`
      : "All offers keep post-discount contribution above the floor.",
  });
  if (contacted.length === 0)
    checks.push({
      id: "audience",
      label: "Audience",
      status: "blocked",
      detail: "No customer has a permitted, sensible action. Decision: no outreach.",
    });
  else
    checks.push({
      id: "audience",
      label: "Audience",
      status: "passed",
      detail: `${contacted.length} customers to contact; ${noOutreach.length} with a no-outreach decision.`,
    });
  if (totals.exposure > cfg.budget) {
    checks.push({
      id: "budget",
      label: "Budget exposure",
      status: "blocked",
      detail: `Exposure Rs ${Math.round(totals.exposure)} exceeds budget Rs ${cfg.budget}. Raise the budget, exclude customers, or review a lower-exposure strategy and its offer constraints. Partial sends are not allowed.`,
    });
  } else
    checks.push({
      id: "budget",
      label: "Budget exposure",
      status: "passed",
      detail: `Exposure Rs ${Math.round(totals.exposure)} within budget Rs ${cfg.budget}.`,
    });

  const hash = String(
    stableUnit(
      JSON.stringify({
        c: contacted.map((r) => [r.feature.customer.id, r.product.id, r.offerPct]),
        h: holdout.map((f) => f.customer.id),
        t: cfg.timing,
        m: cfg.maxDiscount,
        f: cfg.minContribution,
        b: cfg.budget,
        q: cfg.freqDays,
        w: cfg.tolerancePct,
      }),
    ),
  );

  const plan = {
    eligible,
    excluded,
    review,
    holdout,
    holdoutPct,
    contacted,
    noOutreach,
    totals,
    comparisonAudienceIds: treat.map((f) => f.customer.id),
    comparison,
    recommended,
    checks,
    hash,
  };
  const cache = planCache.get(features) ?? new Map<string, Plan>();
  if (cache.size > 30) cache.clear();
  cache.set(cacheKey, plan);
  planCache.set(features, cache);
  return plan;
}
