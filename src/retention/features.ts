// Feature derivation: turns raw fixtures into per-customer observed facts and derived features.
import {
  MIN_COMPLETED_FOR_INTERVAL,
  RECENT_PURCHASE_DAYS,
  productById,
  type Contact,
  type Customer,
  type Dataset,
  type Order,
  type Product,
} from "./data";

export type Eligibility = "eligible" | "excluded" | "review";

export type ReasonCode =
  | "no_consent"
  | "refund_pending"
  | "recent_purchase"
  | "out_of_stock"
  | "frequency"
  | "merchant_excluded"
  | "insufficient_history"
  | "outside_window";

export interface Reason {
  code: ReasonCode;
  label: string;
  hard: boolean; // hard policy block: merchant overrides cannot bypass
}

export interface FeatureConfig {
  tolerancePct: number;
  freqDays: number;
}

export interface FeatureOverrides {
  excluded: Set<string>;
  resolved: Set<string>;
  optOuts: Set<string>;
}

export interface CustomerFeature {
  customer: Customer;
  orders: Order[];
  relevantProduct: Product;
  relevantCompletedDays: number[];
  lastRelevantDay: number;
  lastAnyOrderDay: number;
  daysSince: number;
  intervals: number[];
  typicalInterval: number | null;
  intervalSource: "history" | "merchant_default" | null;
  windowLow: number | null;
  windowHigh: number | null;
  inWindow: boolean;
  offerUsage: { discounted: number; completed: number };
  lastPromoContactDay: number | null;
  consent: boolean;
  status: Eligibility;
  reasons: Reason[];
  reviewResolvable: boolean;
  reviewResolveBlocker?: string;
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export function deriveFeatures(data: Dataset, cfg: FeatureConfig, ov: FeatureOverrides): CustomerFeature[] {
  const byCustomer = new Map<string, Order[]>();
  for (const o of data.orders) {
    const arr = byCustomer.get(o.customerId) ?? [];
    arr.push(o);
    byCustomer.set(o.customerId, arr);
  }
  const contactsBy = new Map<string, Contact[]>();
  for (const c of data.contacts) {
    const arr = contactsBy.get(c.customerId) ?? [];
    arr.push(c);
    contactsBy.set(c.customerId, arr);
  }
  const tol = cfg.tolerancePct / 100;

  return data.customers.map((customer) => {
    const orders = (byCustomer.get(customer.id) ?? []).slice().sort((a, b) => b.day - a.day);
    const completed = orders.filter((o) => o.status === "completed");
    const counts = new Map<string, number>();
    for (const o of completed) for (const it of o.items) counts.set(it.productId, (counts.get(it.productId) ?? 0) + 1);
    // relevant product = most frequently completed purchase (ties: most recent)
    let relevantId = orders[0]?.items[0].productId ?? "P01";
    let best = -1;
    for (const o of completed) for (const it of o.items) {
      const c = counts.get(it.productId)!;
      if (c > best) { best = c; relevantId = it.productId; }
    }
    const relevantProduct = productById(relevantId);
    const relevantCompletedDays = completed.filter((o) => o.items.some((i) => i.productId === relevantId)).map((o) => o.day).sort((a, b) => b - a);
    const intervals: number[] = [];
    for (let i = 0; i < relevantCompletedDays.length - 1; i++) intervals.push(relevantCompletedDays[i] - relevantCompletedDays[i + 1]);
    const lastRelevantDay = relevantCompletedDays[0] ?? orders[0]?.day ?? -999;
    const lastAnyOrderDay = orders.filter((o) => o.status !== "cancelled")[0]?.day ?? -999;
    const daysSince = -lastRelevantDay;
    const contacts = contactsBy.get(customer.id) ?? [];
    const lastPromoContactDay = contacts.length ? Math.max(...contacts.map((c) => c.day)) : null;
    const consent = customer.consent && !ov.optOuts.has(customer.id);

    const hasHistory = relevantCompletedDays.length >= MIN_COMPLETED_FOR_INTERVAL;
    const resolved = ov.resolved.has(customer.id);
    let typicalInterval: number | null = null;
    let intervalSource: CustomerFeature["intervalSource"] = null;
    if (hasHistory) { typicalInterval = Math.round(median(intervals)); intervalSource = "history"; }
    else if (resolved) { typicalInterval = relevantProduct.defaultIntervalDays; intervalSource = "merchant_default"; }
    const windowFor = (t: number) => [Math.round(t * (1 - tol) * 10) / 10, Math.round(t * (1 + tol) * 10) / 10] as const;
    const [windowLow, windowHigh] = typicalInterval != null ? windowFor(typicalInterval) : [null, null];
    const inWindow = windowLow != null && windowHigh != null && daysSince >= windowLow && daysSince <= windowHigh;

    const reasons: Reason[] = [];
    if (!consent) reasons.push({ code: "no_consent", label: ov.optOuts.has(customer.id) ? "Opted out of promotional messages" : "No marketing consent", hard: true });
    if (orders.some((o) => o.status === "refund_pending")) reasons.push({ code: "refund_pending", label: "Unresolved refund — promotion suppressed", hard: true });
    if (-lastAnyOrderDay <= RECENT_PURCHASE_DAYS) reasons.push({ code: "recent_purchase", label: `Purchased ${-lastAnyOrderDay === 0 ? "today" : -lastAnyOrderDay === 1 ? "yesterday" : `${-lastAnyOrderDay} days ago`}`, hard: true });
    if (relevantProduct.stock <= 0) reasons.push({ code: "out_of_stock", label: `${relevantProduct.name} out of stock`, hard: true });
    if (lastPromoContactDay != null && -lastPromoContactDay < cfg.freqDays) reasons.push({ code: "frequency", label: `Contacted ${-lastPromoContactDay === 0 ? "today" : `${-lastPromoContactDay}d ago`} (limit 1 per ${cfg.freqDays}d)`, hard: true });
    if (ov.excluded.has(customer.id)) reasons.push({ code: "merchant_excluded", label: "Excluded by merchant", hard: false });
    if (!hasHistory && !resolved) reasons.push({ code: "insufficient_history", label: `Only ${relevantCompletedDays.length} completed purchase${relevantCompletedDays.length === 1 ? "" : "s"} of relevant product`, hard: false });
    if (typicalInterval != null && !inWindow) reasons.push({ code: "outside_window", label: daysSince < windowLow! ? "Not yet in reorder window" : "Past reorder window (win-back candidate)", hard: false });

    const hard = reasons.some((r) => r.hard);
    let status: Eligibility;
    if (hard || reasons.some((r) => r.code === "merchant_excluded" || r.code === "outside_window")) status = "excluded";
    else if (reasons.some((r) => r.code === "insufficient_history")) status = "review";
    else status = "eligible";

    let reviewResolvable = false;
    let reviewResolveBlocker: string | undefined;
    if (!hasHistory) {
      const [lo, hi] = windowFor(relevantProduct.defaultIntervalDays);
      if (hard) reviewResolveBlocker = "A hard policy block applies; review cannot override it.";
      else if (relevantCompletedDays.length === 0) reviewResolveBlocker = "No completed purchase of the relevant product.";
      else if (daysSince < lo || daysSince > hi) reviewResolveBlocker = `Not within the product default window (${lo}–${hi} days).`;
      else reviewResolvable = true;
    }

    return {
      customer, orders, relevantProduct, relevantCompletedDays, lastRelevantDay, lastAnyOrderDay, daysSince,
      intervals, typicalInterval, intervalSource, windowLow, windowHigh, inWindow,
      offerUsage: { discounted: completed.filter((o) => o.discount > 0).length, completed: completed.length },
      lastPromoContactDay, consent, status, reasons, reviewResolvable, reviewResolveBlocker,
    };
  });
}

/** Reasons that must block an individual send at pre-send recheck. */
export const SEND_BLOCKING: ReasonCode[] = ["no_consent", "refund_pending", "recent_purchase", "out_of_stock", "frequency", "merchant_excluded"];
