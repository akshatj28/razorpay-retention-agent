// Independent counterfactual simulator. Synthetic sensitivity study, not evidence of commercial uplift.
import type { Dataset } from "./data";
import type { CustomerFeature } from "./features";
export interface BenchmarkRow {
  strategy: string;
  audience: number;
  contacts: number;
  purchases: number;
  collectedOrders: number;
  netSales: number;
  merchantContribution: number;
  operatorCost: number;
  incremental: number;
  successFee: number;
  merchantRetains: number;
  operatorContribution: number;
}
const unit = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
};
export function runBenchmark(
  data: Dataset,
  features: CustomerFeature[],
  responseScale = 1,
): BenchmarkRow[] {
  // One fixed population, independent of strategy decisions; no holdout attributes reach scoring.
  const audience = features
    .filter((f) => f.offerUsage.completed > 0 && !f.reasons.some((r) => r.hard))
    .slice(0, 2500);
  const strategies = [
    "No additional outreach",
    "Conventional: day 30 + 20%",
    "Merchant intelligence",
    "Merchant + network intelligence",
  ];
  const rows = strategies.map((strategy, index): BenchmarkRow => {
    let contacts = 0,
      purchases = 0,
      collectedOrders = 0,
      netSales = 0,
      merchantContribution = 0,
      operatorCost = 0;
    const signals = new Map(data.signals.map((s) => [s.customerId, s]));
    for (const f of audience) {
      const p = f.relevantProduct;
      const cycle = f.typicalInterval ?? p.defaultIntervalDays;
      const contact =
        index === 0
          ? false
          : index === 1
            ? f.daysSince >= 25 && f.daysSince <= 35
            : f.daysSince >= cycle * 0.8 && f.daysSince <= cycle * 1.3;
      const observedDiscount = f.offerUsage.discounted / Math.max(1, f.offerUsage.completed);
      const offer = !contact
        ? 0
        : index === 1
          ? 20
          : observedDiscount > 0.45 && p.price - p.variableCost - p.price * 0.1 >= 80
            ? 10
            : 0;
      const sig = signals.get(f.customer.id);
      const fresh = sig?.matched && -sig.asOfDay <= 7;
      const preferCod =
        f.orders.filter((o) => o.paymentMethod === "cod").length > f.orders.length / 2;
      const prepaidNudge = contact && index === 3 && fresh && sig.riskTier === "high" && preferCod;
      // Latent natural demand and offer sensitivity are independent of the recommendation model.
      const natural =
        0.05 +
        Math.min(0.14, f.offerUsage.completed * 0.015) +
        unit("latent-demand:" + f.customer.id) * 0.03;
      const fit = Math.exp(-Math.abs(f.daysSince - cycle) / Math.max(12, cycle));
      const lift = contact
        ? responseScale *
          (0.055 * fit + ((unit("latent-sensitivity:" + f.customer.id) * offer) / 100) * 0.32)
        : 0;
      const buys = unit("purchase:" + f.customer.id) < Math.min(0.7, natural + lift);
      if (contact) {
        contacts++;
        operatorCost += 1.2;
      }
      if (!buys) continue;
      purchases++;
      const risk =
        preferCod && !prepaidNudge
          ? sig?.riskTier === "high"
            ? 0.3
            : sig?.riskTier === "medium"
              ? 0.14
              : 0.045
          : 0.015;
      const failed = unit("delivery:" + f.customer.id) < risk;
      const returned = !failed && unit("return:" + f.customer.id) < 0.04;
      if (failed) {
        merchantContribution -= 170;
        continue;
      }
      if (returned) {
        merchantContribution -= 85;
        continue;
      }
      collectedOrders++;
      const sales = p.price - Math.round((p.price * offer) / 100);
      netSales += sales;
      merchantContribution += sales - p.variableCost;
    }
    return {
      strategy,
      audience: audience.length,
      contacts,
      purchases,
      collectedOrders,
      netSales,
      merchantContribution,
      operatorCost,
      incremental: 0,
      successFee: 0,
      merchantRetains: 0,
      operatorContribution: 0,
    };
  });
  const baseline = rows[1]!.merchantContribution;
  for (const r of rows) {
    r.incremental = r.merchantContribution - baseline;
    r.successFee = r.strategy.includes("intelligence") ? Math.max(0, r.incremental) * 0.25 : 0;
    r.merchantRetains = r.incremental - r.successFee;
    r.operatorContribution = r.successFee - r.operatorCost;
  }
  return rows;
}
