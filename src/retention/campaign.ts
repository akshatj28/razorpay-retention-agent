// Campaign state: pure transitions over a serialisable demo state.
import { baseDataset, orderContribution, type Contact, type Dataset, type OfferPct, type Order } from "./data";
import { SEND_BLOCKING, deriveFeatures, type CustomerFeature } from "./features";
import { buildPlan, type OfferMode, type Plan } from "./policy";

export const CAMPAIGN_ID = "CMP-2026-10-REPLENISH";
export const BATCH_SIZE = 8;
export type CampaignStatus = "draft" | "approved" | "running" | "paused" | "completed";

export interface QueueItem { customerId: string; productId: string; offerPct: OfferPct; discountAmount: number; exposure: number; expected: number; message: string }
export interface DemoEvent { id: string; at: number; customerId: string | null; action: string; result: "ok" | "skipped" | "blocked" | "ignored" | "info"; reason: string }
export interface Outcome { delivered?: boolean; failed?: boolean; purchased?: string; optedOut?: boolean }

export interface DemoState {
  version: 1;
  config: { tolerancePct: number; maxDiscount: number; minContribution: number; freqDays: number; budget: number; timing: string; offerMode: OfferMode };
  excluded: string[];
  resolved: string[];
  overrides: Record<string, OfferPct>;
  optOuts: string[];
  simOrders: Order[];
  simContacts: Contact[];
  campaign: {
    status: CampaignStatus;
    approvedHash: string | null;
    invalidatedNotice: boolean;
    queue: QueueItem[] | null;
    cursor: number;
    sent: Record<string, { eventId: string; at: number }>;
    outcomes: Record<string, Outcome>;
    appliedKeys: string[];
    events: DemoEvent[];
    clock: number; // minutes after 10 Oct 2026 09:00 IST
    lastOutcome: { type: OutcomeType; customerId: string } | null;
  };
}

export type OutcomeType = "deliver" | "fail" | "purchase" | "optout";

export const initialState = (): DemoState => ({
  version: 1,
  config: { tolerancePct: 20, maxDiscount: 20, minContribution: 150, freqDays: 7, budget: 1500, timing: "10:00 IST", offerMode: "recommended" },
  excluded: [], resolved: [], overrides: {}, optOuts: [], simOrders: [], simContacts: [],
  campaign: { status: "draft", approvedHash: null, invalidatedNotice: false, queue: null, cursor: 0, sent: {}, outcomes: {}, appliedKeys: [], events: [], clock: 0, lastOutcome: null },
});

export interface Derived { data: Dataset; features: CustomerFeature[]; byId: Map<string, CustomerFeature>; plan: Plan; approvalValid: boolean }

export function derive(s: DemoState): Derived {
  const base = baseDataset();
  const data: Dataset = { ...base, orders: [...base.orders, ...s.simOrders], contacts: [...base.contacts, ...s.simContacts] };
  const features = deriveFeatures(data, s.config, { excluded: new Set(s.excluded), resolved: new Set(s.resolved), optOuts: new Set(s.optOuts) });
  const plan = buildPlan(features, s.config, s.overrides, CAMPAIGN_ID);
  return { data, features, byId: new Map(features.map((f) => [f.customer.id, f])), plan, approvalValid: s.campaign.approvedHash === plan.hash };
}

const launched = (s: DemoState) => s.campaign.queue !== null;

function log(s: DemoState, e: Omit<DemoEvent, "id" | "at">): DemoState {
  const clock = s.campaign.clock + 1;
  const id = `EVT-${String(s.campaign.events.length + 1).padStart(4, "0")}`;
  return { ...s, campaign: { ...s.campaign, clock, events: [...s.campaign.events, { id, at: clock, ...e }] } };
}

/** After any edit: an approved campaign whose plan changed loses approval. */
export function settle(prev: DemoState, next: DemoState): DemoState {
  if (next.campaign.status === "approved" && derive(next).plan.hash !== next.campaign.approvedHash) {
    return log({ ...next, campaign: { ...next.campaign, status: "draft", approvedHash: null, invalidatedNotice: true } }, { customerId: null, action: "Approval invalidated", result: "info", reason: "Audience, offer, timing or policy changed after approval; new review required." });
  }
  void prev;
  return next;
}

export function editConfig(s: DemoState, patch: Partial<DemoState["config"]>): DemoState {
  if (launched(s)) return s;
  return settle(s, { ...s, config: { ...s.config, ...patch } });
}
export function toggleExclude(s: DemoState, id: string): DemoState {
  const excluded = s.excluded.includes(id) ? s.excluded.filter((x) => x !== id) : [...s.excluded, id];
  return settle(s, { ...s, excluded });
}
export function resolveReview(s: DemoState, id: string): DemoState {
  if (launched(s)) return s;
  const f = derive(s).byId.get(id);
  if (!f || !f.reviewResolvable) return s;
  return settle(s, log({ ...s, resolved: [...s.resolved, id] }, { customerId: id, action: "Review resolved", result: "info", reason: `Merchant approved using product default interval (${f.relevantProduct.defaultIntervalDays}d).` }));
}
export function setOverride(s: DemoState, id: string, pct: OfferPct | null): DemoState {
  if (launched(s)) return s;
  const overrides = { ...s.overrides };
  if (pct === null) delete overrides[id]; else overrides[id] = pct;
  return settle(s, { ...s, overrides });
}

export function approve(s: DemoState): { state: DemoState; error?: string } {
  const d = derive(s);
  if (s.campaign.status !== "draft") return { state: s, error: "Only a draft can be approved." };
  const blocked = d.plan.checks.filter((c) => c.status === "blocked");
  if (blocked.length) return { state: s, error: `Resolve blocked checks first: ${blocked.map((b) => b.label).join(", ")}.` };
  return { state: log({ ...s, campaign: { ...s.campaign, status: "approved", approvedHash: d.plan.hash, invalidatedNotice: false } }, { customerId: null, action: "Campaign approved", result: "ok", reason: `${d.plan.contacted.length} customers, exposure Rs ${Math.round(d.plan.totals.exposure)}.` }) };
}

export function launch(s: DemoState): { state: DemoState; error?: string } {
  const d = derive(s);
  if (s.campaign.status !== "approved") return { state: s, error: "Launch requires approval." };
  if (!d.approvalValid) return { state: s, error: "Approval is no longer valid; review again." };
  if (d.plan.checks.some((c) => c.status === "blocked")) return { state: s, error: "Blocked checks must be resolved." };
  const queue: QueueItem[] = d.plan.contacted.map((r) => ({ customerId: r.feature.customer.id, productId: r.product.id, offerPct: r.offerPct, discountAmount: r.evaluation.discountAmount, exposure: r.exposure, expected: r.evaluation.expectedContribution, message: r.message }));
  return { state: log({ ...s, campaign: { ...s.campaign, status: "running", queue, cursor: 0 } }, { customerId: null, action: "Campaign launched", result: "ok", reason: `${queue.length} messages queued; ${d.plan.holdout.length} in holdout (no contact).` }) };
}

export const spentExposure = (s: DemoState) => (s.campaign.queue ?? []).filter((q) => s.campaign.sent[q.customerId]).reduce((t, q) => t + q.exposure, 0);

export function sendBatch(s0: DemoState): DemoState {
  if (s0.campaign.status !== "running" || !s0.campaign.queue) return s0;
  let s = s0;
  const queue = s0.campaign.queue;
  let processed = 0;
  while (s.campaign.cursor < queue.length && processed < BATCH_SIZE) {
    const item = queue[s.campaign.cursor]!;
    s = { ...s, campaign: { ...s.campaign, cursor: s.campaign.cursor + 1 } };
    processed++;
    if (s.campaign.sent[item.customerId]) { s = log(s, { customerId: item.customerId, action: "Send", result: "ignored", reason: "Already sent — duplicate prevented." }); continue; }
    const f = derive(s).byId.get(item.customerId)!; // pre-send recheck on current state
    const block = f.reasons.find((r) => SEND_BLOCKING.includes(r.code));
    if (block) { s = log(s, { customerId: item.customerId, action: "Pre-send recheck", result: "skipped", reason: block.label }); continue; }
    if (spentExposure(s) + item.exposure > s.config.budget) { s = log(s, { customerId: item.customerId, action: "Pre-send recheck", result: "skipped", reason: "Budget exposure would be exceeded." }); continue; }
    s = log(s, { customerId: item.customerId, action: `Message sent (simulated WhatsApp, ${item.offerPct ? `${item.offerPct}% offer` : "no discount"})`, result: "ok", reason: "All pre-send checks passed." });
    const ev = s.campaign.events[s.campaign.events.length - 1];
    s = { ...s, simContacts: [...s.simContacts, { customerId: item.customerId, day: 0, type: "promotional", channel: "whatsapp" }], campaign: { ...s.campaign, sent: { ...s.campaign.sent, [item.customerId]: { eventId: ev.id, at: ev.at } } } };
  }
  if (s.campaign.cursor >= queue.length) s = log({ ...s, campaign: { ...s.campaign, status: "completed" } }, { customerId: null, action: "Campaign completed", result: "info", reason: "Queue exhausted. Outcomes can still be recorded." });
  return s;
}

export function pause(s: DemoState): DemoState {
  if (s.campaign.status !== "running") return s;
  return log({ ...s, campaign: { ...s.campaign, status: "paused" } }, { customerId: null, action: "Campaign paused", result: "info", reason: "No further sends. Sent messages cannot be recalled." });
}
export function resume(s: DemoState): { state: DemoState; error?: string } {
  if (s.campaign.status !== "paused") return { state: s };
  if (spentExposure(s) >= s.config.budget) return { state: s, error: "Budget exhausted; cannot resume." };
  return { state: log({ ...s, campaign: { ...s.campaign, status: "running" } }, { customerId: null, action: "Campaign resumed", result: "ok", reason: "Budget and approval valid; each send is rechecked." }) };
}

export function recordOutcome(s: DemoState, type: OutcomeType, customerId: string): DemoState {
  const key = `${type}:${customerId}`;
  const names = { deliver: "Delivery confirmed", fail: "Delivery failed", purchase: "Purchase", optout: "Opt-out" } as const;
  const base = { ...s, campaign: { ...s.campaign, lastOutcome: { type, customerId } } };
  if (!s.campaign.sent[customerId]) return log(base, { customerId, action: names[type], result: "blocked", reason: "Customer was not messaged by this campaign." });
  if (s.campaign.appliedKeys.includes(key)) return log(base, { customerId, action: `${names[type]} (replay)`, result: "ignored", reason: "Duplicate event — not counted again." });
  const o = s.campaign.outcomes[customerId] ?? {};
  if ((type === "deliver" && o.failed) || (type === "fail" && o.delivered)) return log(base, { customerId, action: names[type], result: "blocked", reason: "Conflicts with recorded delivery status." });
  if (type === "purchase" && (o.failed || o.optedOut)) return log(base, { customerId, action: names[type], result: "blocked", reason: o.failed ? "Message was not delivered." : "Customer opted out." });
  let next: DemoState = { ...base, campaign: { ...base.campaign, appliedKeys: [...s.campaign.appliedKeys, key] } };
  let reason = "";
  if (type === "deliver") { next.campaign.outcomes = { ...s.campaign.outcomes, [customerId]: { ...o, delivered: true } }; reason = "Simulated delivery receipt."; }
  if (type === "fail") { next.campaign.outcomes = { ...s.campaign.outcomes, [customerId]: { ...o, failed: true } }; reason = "Logged. No automatic retry."; }
  if (type === "optout") { next = { ...next, optOuts: [...s.optOuts, customerId] }; next.campaign.outcomes = { ...s.campaign.outcomes, [customerId]: { ...o, optedOut: true } }; reason = "Future promotional contact blocked."; }
  if (type === "purchase") {
    const q = s.campaign.queue!.find((x) => x.customerId === customerId)!;
    const p = baseDataset().products.find((x) => x.id === q.productId)!;
    const order: Order = { id: `SIM-ORD-${String(s.simOrders.length + 1).padStart(3, "0")}`, customerId, day: 0, items: [{ productId: p.id, qty: 1, unitPrice: p.price }], discount: q.discountAmount, status: "completed", source: "simulated", attributedCampaign: CAMPAIGN_ID };
    next = { ...next, simOrders: [...s.simOrders, order] };
    next.campaign.outcomes = { ...s.campaign.outcomes, [customerId]: { ...o, delivered: o.delivered ?? true, purchased: order.id } };
    reason = `${order.id} created (contribution Rs ${orderContribution(order)}); reorder follow-ups suppressed.`;
  }
  return log(next, { customerId, action: names[type], result: "ok", reason });
}

export function replayLast(s: DemoState): DemoState {
  const l = s.campaign.lastOutcome;
  return l ? recordOutcome(s, l.type, l.customerId) : s;
}

export function organicPurchase(s: DemoState, customerId: string): DemoState {
  const f = derive(s).byId.get(customerId);
  if (!f) return s;
  const p = f.relevantProduct;
  const order: Order = { id: `SIM-ORD-${String(s.simOrders.length + 1).padStart(3, "0")}`, customerId, day: 0, items: [{ productId: p.id, qty: 1, unitPrice: p.price }], discount: 0, status: "completed", source: "simulated" };
  return log({ ...s, simOrders: [...s.simOrders, order] }, { customerId, action: "Organic purchase (simulated, not attributed)", result: "info", reason: `${order.id} — will be excluded at pre-send recheck.` });
}

export function results(s: DemoState) {
  const sentIds = Object.keys(s.campaign.sent);
  const queue = s.campaign.queue ?? [];
  const attributed = s.simOrders.filter((o) => o.attributedCampaign === CAMPAIGN_ID);
  const realised = attributed.reduce((t, o) => t + orderContribution(o), 0);
  const messaging = sentIds.length * 1;
  const forecast = queue.filter((q) => s.campaign.sent[q.customerId]).reduce((t, q) => t + q.expected, 0);
  const vals = Object.values(s.campaign.outcomes);
  return {
    sent: sentIds.length, delivered: vals.filter((o) => o.delivered).length, failed: vals.filter((o) => o.failed).length,
    optOuts: vals.filter((o) => o.optedOut).length, attributedOrders: attributed.length, realised, messaging,
    observedNet: realised - messaging, forecast, skipped: s.campaign.events.filter((e) => e.result === "skipped").length,
  };
}
