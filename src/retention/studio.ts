// Pure offline orchestration. AI, network enrichment and channel delivery are explicitly simulated.
import {
  OFFER_OPTIONS,
  productById,
  type Dataset,
  type OfferPct,
  type Order,
  type Product,
} from "./data";
import { deriveFeatures, type CustomerFeature } from "./features";
import { stableUnit, isHoldout } from "./policy";
export type Goal = "replenishment" | "second_purchase" | "winback";
export type AudienceRule = "goal" | "repeat_buyers" | "cod_low_risk" | "discount_buyers";
export type StudioStatus = "draft" | "approved" | "scheduled" | "running" | "paused" | "completed";
export interface CampaignSettings {
  goal: Goal;
  rule: AudienceRule;
  category: "All" | "Skincare" | "Haircare" | "Body care" | "Routine kits";
  maxAudience: number;
  maxDiscount: OfferPct;
  offer: "recommended" | OfferPct;
  minContribution: number;
  incentiveCap: number;
  operatorCap: number;
  callsEnabled: boolean;
  scheduleDay: number;
}
export interface CampaignAssets {
  whatsapp: string;
  callOpening: string;
  callInterested: string;
  callObjection: string;
  callDecline: string;
  language: "English" | "Hindi";
  creativeTitle: string;
  creativeStyle: "botanical" | "minimal";
}
export interface ActionRow {
  customerId: string;
  productId: string;
  offer: OfferPct;
  paymentTreatment: string;
  conversion: number;
  organic: number;
  delivery: number;
  margin: number;
  expectedIncremental: number;
  operatorCost: number;
  callEligible: boolean;
  reason: string;
}
export interface ApprovalSnapshot {
  revision: number;
  day: number;
  settings: CampaignSettings;
  assets: CampaignAssets;
  actions: ActionRow[];
  holdoutIds: string[];
  noOutreachIds: string[];
  audienceIds: string[];
}
export interface CampaignOutcome {
  customerId: string;
  group: "treatment" | "control";
  purchased: boolean;
  productId: string;
  offer: OfferPct;
  paymentMethod: "cod" | "upi";
  state: "no_purchase" | "placed" | "collected" | "rto" | "refunded";
  netSales: number;
  contribution: number;
  channelCost: number;
  calls: number;
}
export interface StudioCampaign {
  id: string;
  name: string;
  origin: "custom" | "recommended" | "template";
  status: StudioStatus;
  revision: number;
  reviewedDay: number;
  updatedDay: number;
  settings: CampaignSettings;
  assets: CampaignAssets;
  snapshot: ApprovalSnapshot | null;
  cursor: number;
  sentIds: string[];
  sentDays: Record<string, number>;
  outcomes: CampaignOutcome[];
  log: { day: number; text: string }[];
  lastAudience: number;
  settlementDay: number | null;
}
export interface SavedTemplate {
  id: string;
  name: string;
  settings: CampaignSettings;
  assets: CampaignAssets;
}
export interface StudioState {
  day: number;
  refreshedDay: number;
  nextId: number;
  activeId: string | null;
  campaigns: StudioCampaign[];
  templates: SavedTemplate[];
  arrivals: Order[];
  optOutIds: string[];
}
export const GOALS: Record<Goal, string> = {
  replenishment: "Reorder reminder",
  second_purchase: "Second order",
  winback: "Win-back",
};
// Merchant-facing payment labels; shoppers see the sentences in renderAsset instead.
export const PAYMENT = {
  nudge: "Ask to pay online (RTO risk)",
  cod: "COD allowed",
  prepaid: "Usually pays online",
} as const;
// Also accepts the label used by campaigns approved before the rename.
export const isPrepaidNudge = (a: Pick<ActionRow, "paymentTreatment">) =>
  a.paymentTreatment === PAYMENT.nudge || a.paymentTreatment.startsWith("Prepaid nudge");
export const DEFAULT_SETTINGS: CampaignSettings = {
  goal: "replenishment",
  rule: "goal",
  category: "All",
  maxAudience: 240,
  maxDiscount: 20,
  offer: "recommended",
  minContribution: 80,
  incentiveCap: 50000,
  operatorCap: 1500,
  callsEnabled: false,
  scheduleDay: 0,
};
export const defaultAssets = (): CampaignAssets => ({
  whatsapp:
    "Hi {{first_name}}, ready for your next {{product}} from Nira Botanics? {{offer}} {{payment}} Shop here: {{link}}. Reply STOP to opt out.",
  callOpening:
    "Hello {{first_name}}, this is Nira Botanics' automated assistant. Is now convenient to talk about your {{product}}?",
  callInterested:
    "I can share a link to {{product}}. {{offer}} {{payment}} Would you like the link on WhatsApp?",
  callObjection:
    "No problem. I can explain the approved offer, but cannot increase the discount. Would you prefer a reminder later?",
  callDecline: "Thank you. We will end this call and respect your contact preferences.",
  language: "English",
  creativeTitle: "Your routine, ready to replenish",
  creativeStyle: "botanical",
});
export const initialStudio = (): StudioState => ({
  day: 0,
  refreshedDay: 0,
  nextId: 1,
  activeId: null,
  campaigns: [],
  templates: [],
  arrivals: [],
  optOutIds: [],
});
const studioFeatureCache = new WeakMap<Dataset, { key: string; features: CustomerFeature[] }>();
const signalCache = new WeakMap<Dataset, Map<string, Dataset["signals"][number]>>();
function signalIndex(data: Dataset) {
  const found = signalCache.get(data);
  if (found) return found;
  const map = new Map(data.signals.map((x) => [x.customerId, x]));
  signalCache.set(data, map);
  return map;
}
export function studioFeatures(data: Dataset, s: StudioState) {
  const key = JSON.stringify([
    s.day,
    s.optOutIds,
    s.arrivals.map((o) => [o.id, o.status, o.day]),
    s.campaigns.map((c) => [c.id, c.sentIds, c.sentDays]),
  ]);
  const cached = studioFeatureCache.get(data);
  if (cached?.key === key) return cached.features;
  const orders = [...new Map([...data.orders, ...s.arrivals].map((o) => [o.id, o])).values()];
  const contacts = [
    ...data.contacts,
    ...s.campaigns.flatMap((c) =>
      c.sentIds.map((customerId) => ({
        customerId,
        day: c.sentDays?.[customerId] ?? c.snapshot?.day ?? s.day,
        type: "promotional" as const,
        channel: "whatsapp" as const,
      })),
    ),
  ];
  const features = deriveFeatures(
    { ...data, orders, contacts },
    { tolerancePct: 25, freqDays: 7, asOfDay: s.day },
    { excluded: new Set(), resolved: new Set(), optOuts: new Set(s.optOutIds) },
  );
  studioFeatureCache.set(data, { key, features });
  return features;
}
const hardReason = (f: CustomerFeature) =>
  f.reasons.find((r) => r.hard || r.code === "merchant_excluded");
function matchesGoal(f: CustomerFeature, cfg: CampaignSettings) {
  if (
    !f.offerUsage.completed ||
    hardReason(f) ||
    (cfg.category !== "All" && f.relevantProduct.category !== cfg.category)
  )
    return false;
  const cycle = f.typicalInterval ?? f.relevantProduct.defaultIntervalDays;
  if (cfg.goal === "second_purchase")
    return f.offerUsage.completed === 1 && f.daysSince >= 14 && f.daysSince <= 75;
  if (cfg.goal === "winback") return f.daysSince > cycle * 1.25 && f.daysSince <= 180;
  // Replenishment needs a repeat rhythm; one-order customers belong to second purchase.
  return f.offerUsage.completed >= 2 && f.daysSince >= cycle * 0.75 && f.daysSince <= cycle * 1.25;
}
function recommendedProduct(f: CustomerFeature, goal: Goal): Product {
  if (goal !== "second_purchase") return f.relevantProduct;
  const purchased = new Set(
    f.orders
      .filter((o) => o.status === "completed")
      .flatMap((o) =>
        o.items.flatMap((it) => [it.productId, ...(productById(it.productId).components ?? [])]),
      ),
  );
  const family =
    f.relevantProduct.category === "Routine kits" ? "Skincare" : f.relevantProduct.category;
  return (
    ["P05", "P07", "P09", "P08", "P14"]
      .map(productById)
      .find((p) => p.stock > 0 && p.category === family && !purchased.has(p.id)) ??
    f.relevantProduct
  );
}
export function estimateAction(
  f: CustomerFeature,
  data: Dataset,
  cfg: CampaignSettings,
  day: number,
  useNetwork = true,
): ActionRow | null {
  const p = recommendedProduct(f, cfg.goal);
  const signal = signalIndex(data).get(f.customer.id);
  const fresh = useNetwork && signal?.matched && day - signal.asOfDay <= 7;
  const risk = fresh ? signal.riskTier : "unknown";
  const prefersCod = fresh
    ? signal.paymentPreference === "cod"
    : f.orders.filter((o) => o.paymentMethod === "cod").length > f.orders.length / 2;
  const delivery = prefersCod
    ? risk === "high"
      ? 0.72
      : risk === "medium"
        ? 0.86
        : risk === "low"
          ? 0.965
          : 0.9
    : 0.99;
  const organic = Math.min(0.24, 0.035 + Math.min(6, f.offerUsage.completed) * 0.015);
  const affinity = cfg.goal === "replenishment" ? 0.065 : cfg.goal === "winback" ? 0.025 : 0.04;
  // Shrink toward a 25% prior worth three orders: one discounted order is weak evidence.
  const discountHistory = (f.offerUsage.discounted + 0.75) / (f.offerUsage.completed + 3);
  const options = cfg.offer === "recommended" ? OFFER_OPTIONS : [cfg.offer];
  let best: ActionRow | null = null;
  let score = 0;
  let plainValue: number | null = null;
  for (const offer of options) {
    const discount = Math.round((p.price * offer) / 100);
    const margin = p.price - p.variableCost - discount;
    if (
      offer > cfg.maxDiscount ||
      margin < cfg.minContribution ||
      (data.products.find((x) => x.id === p.id)?.stock ?? 0) <= 0
    )
      continue;
    const conversion = Math.min(
      0.65,
      organic + affinity + (offer / 100) * (0.15 + discountHistory * 0.6),
    );
    const expectedIncremental =
      conversion * delivery * margin - organic * delivery * (p.price - p.variableCost);
    if (offer === 0) plainValue = expectedIncremental;
    const callEligible =
      cfg.callsEnabled && f.customer.callConsent && expectedIncremental * 0.25 > 4.2;
    const operatorCost = 1.2 + (callEligible ? 3 * 0.35 : 0);
    const operatorValue = expectedIncremental * 0.25 - operatorCost;
    if (operatorValue <= score) continue;
    score = operatorValue;
    best = {
      customerId: f.customer.id,
      productId: p.id,
      offer,
      conversion,
      organic,
      delivery,
      margin,
      expectedIncremental,
      operatorCost,
      callEligible,
      paymentTreatment: prefersCod
        ? risk === "high" || risk === "medium"
          ? PAYMENT.nudge
          : PAYMENT.cod
        : PAYMENT.prepaid,
      reason: "",
    };
  }
  if (best) best.reason = explainAction(f, p, cfg, best, plainValue, fresh ? risk : null);
  return best;
}
// Plain-language evidence for one decision, built only from this customer's own inputs.
function explainAction(
  f: CustomerFeature,
  p: Product,
  cfg: CampaignSettings,
  a: ActionRow,
  plainValue: number | null,
  risk: string | null,
) {
  const n = f.offerUsage.completed;
  const used = f.offerUsage.discounted;
  const timing =
    cfg.goal === "second_purchase"
      ? p.id === f.relevantProduct.id
        ? `First order ${f.daysSince} days ago`
        : `First order ${f.daysSince} days ago; ${p.name} is the next routine step`
      : f.typicalInterval
        ? `Reorders about every ${Math.round(f.typicalInterval)} days; last bought ${f.daysSince} days ago`
        : `Last bought ${f.daysSince} days ago; ${p.defaultIntervalDays}-day product cycle`;
  const history =
    used === 0
      ? `Paid full price on ${n === 1 ? "their only order" : n === 2 ? "both orders" : `all ${n} orders`}`
      : `Used a discount on ${used} of ${n} orders`;
  const gain = plainValue === null ? 0 : a.expectedIncremental - plainValue;
  const offer =
    cfg.offer !== "recommended"
      ? `you set the discount to ${a.offer ? a.offer + "%" : "none"}`
      : a.offer === 0
        ? "a reminder without a discount earns more than any discount"
        : plainValue === null
          ? `a ${a.offer}% code is the best allowed option`
          : `a ${a.offer}% code earns about ₹${gain < 1 ? gain.toFixed(1) : Math.round(gain)} more than a plain reminder`;
  const payment = risk
    ? `Razorpay RTO risk: ${risk}` +
      (isPrepaidNudge(a) ? " on COD, so we ask them to pay online" : "")
    : "No recent Razorpay RTO score, so we use your store history";
  return `${timing}. ${history}, so ${offer}. ${payment}.`;
}
export interface CampaignView {
  campaign: StudioCampaign;
  candidates: CustomerFeature[];
  actions: ActionRow[];
  holdoutIds: string[];
  noOutreachIds: string[];
  expectedIncremental: number;
  estimatedFee: number;
  merchantKeeps: number;
  operatorCost: number;
  incentiveExposure: number;
  blockers: string[];
  stale: boolean;
}
export function deriveCampaign(
  data: Dataset,
  features: CustomerFeature[],
  s: StudioState,
  c: StudioCampaign,
): CampaignView {
  const signals = signalIndex(data);
  const reserved = new Set(
    s.campaigns
      .filter((x) => x.id !== c.id && x.snapshot && s.day <= x.settings.scheduleDay + 90)
      .flatMap((x) => x.snapshot!.audienceIds),
  );
  let candidates = features.filter(
    (f) => !reserved.has(f.customer.id) && matchesGoal(f, c.settings),
  );
  if (c.settings.rule === "repeat_buyers")
    candidates = candidates.filter((f) => f.offerUsage.completed >= 2);
  if (c.settings.rule === "discount_buyers")
    candidates = candidates.filter((f) => f.offerUsage.discounted > 0);
  if (c.settings.rule === "cod_low_risk")
    candidates = candidates.filter((f) => {
      const sig = signals.get(f.customer.id);
      return (
        sig?.matched &&
        sig.riskTier === "low" &&
        sig.paymentPreference === "cod" &&
        s.day - sig.asOfDay <= 7
      );
    });
  // Score everyone first, then cap by expected value, so the cap keeps the best customers.
  // Controls are hashed from the same ranked audience, keeping them comparable to treatment.
  const ranked = candidates
    .map((f) => ({ f, a: estimateAction(f, data, c.settings, s.day) }))
    .sort(
      (x, y) =>
        (y.a?.expectedIncremental ?? -Infinity) - (x.a?.expectedIncremental ?? -Infinity) ||
        x.f.customer.id.localeCompare(y.f.customer.id),
    )
    .slice(0, Math.max(0, Math.min(1000, c.settings.maxAudience)));
  candidates = ranked.map((x) => x.f);
  const holdoutIds = candidates
    .filter((f) => isHoldout(f.customer.id, c.id))
    .map((f) => f.customer.id);
  const holdouts = new Set(holdoutIds);
  const actions: ActionRow[] = [];
  const noOutreachIds: string[] = [];
  for (const { f, a } of ranked)
    if (!holdouts.has(f.customer.id)) {
      if (a) actions.push(a);
      else noOutreachIds.push(f.customer.id);
    }
  const frozen = c.snapshot && c.status !== "draft";
  const activeActions = frozen ? c.snapshot!.actions : actions;
  const expectedIncremental = activeActions.reduce((t, a) => t + a.expectedIncremental, 0);
  const operatorCost = activeActions.reduce((t, a) => t + a.operatorCost, 0);
  const incentiveExposure = activeActions.reduce(
    (t, a) => t + Math.round((productById(a.productId).price * a.offer) / 100),
    0,
  );
  const blockers: string[] = [];
  if (!c.name.trim()) blockers.push("Give this campaign a name.");
  if (
    c.settings.maxAudience < 10 ||
    c.settings.maxAudience > 1000 ||
    !Number.isInteger(c.settings.maxAudience)
  )
    blockers.push("Choose a whole number of customers between 10 and 1,000.");
  if (!activeActions.length) blockers.push("No customer here is worth messaging at these limits.");
  if (operatorCost > c.settings.operatorCap)
    blockers.push("Messaging cost is above the spend limit.");
  if (incentiveExposure > c.settings.incentiveCap)
    blockers.push("Total discount value is above your discount budget.");
  if (c.settings.scheduleDay < s.day && c.status === "draft")
    blockers.push("Choose today or a future send date.");
  if (!c.assets.whatsapp.trim() || !c.assets.whatsapp.toUpperCase().includes("STOP"))
    blockers.push("The WhatsApp message needs text and a 'Reply STOP to opt out' line.");
  if (c.settings.callsEnabled && (!c.assets.callOpening.trim() || !c.assets.callDecline.trim()))
    blockers.push("The call script needs an opening line and a goodbye line.");
  return {
    campaign: c,
    candidates,
    actions: activeActions,
    holdoutIds: frozen ? c.snapshot!.holdoutIds : holdoutIds,
    noOutreachIds: frozen ? c.snapshot!.noOutreachIds : noOutreachIds,
    expectedIncremental,
    estimatedFee: Math.max(0, expectedIncremental) * 0.25,
    merchantKeeps: expectedIncremental * 0.75,
    operatorCost,
    incentiveExposure,
    blockers,
    stale: c.status === "draft" && c.reviewedDay !== s.day,
  };
}
export function deriveStudio(data: Dataset, s: StudioState) {
  const features = studioFeatures(data, s);
  const views = s.campaigns.map((c) => deriveCampaign(data, features, s, c));
  const opportunities = (Object.keys(GOALS) as Goal[]).map((goal) =>
    deriveCampaign(
      data,
      features,
      s,
      makeDraft(
        "NIRA-CMP-" + String(s.nextId).padStart(4, "0"),
        GOALS[goal] + " opportunity",
        "recommended",
        s.day,
        { ...DEFAULT_SETTINGS, goal, scheduleDay: s.day },
      ),
    ),
  );
  return {
    features,
    byId: new Map(features.map((f) => [f.customer.id, f])),
    views,
    active: views.find((v) => v.campaign.id === s.activeId) ?? null,
    opportunities,
    portfolio: portfolioSettlement(s),
  };
}
function makeDraft(
  id: string,
  name: string,
  origin: StudioCampaign["origin"],
  day: number,
  settings: CampaignSettings,
  assets = defaultAssets(),
): StudioCampaign {
  return {
    id,
    name,
    origin,
    status: "draft",
    revision: 1,
    reviewedDay: day,
    updatedDay: day,
    settings: { ...settings },
    assets: { ...assets },
    snapshot: null,
    cursor: 0,
    sentIds: [],
    sentDays: {},
    outcomes: [],
    log: [{ day, text: "Draft created." }],
    lastAudience: 0,
    settlementDay: null,
  };
}
export function createDraft(
  s: StudioState,
  goal: Goal = "replenishment",
  origin: StudioCampaign["origin"] = "custom",
  templateId?: string,
): StudioState {
  const template = s.templates.find((t) => t.id === templateId);
  const id = "NIRA-CMP-" + String(s.nextId).padStart(4, "0");
  const c = makeDraft(
    id,
    template
      ? template.name + " · new campaign"
      : GOALS[goal] + " · " + (origin === "custom" ? "my campaign" : "suggested by agent"),
    origin,
    s.day,
    {
      ...(template?.settings ?? DEFAULT_SETTINGS),
      goal: template?.settings.goal ?? goal,
      scheduleDay: s.day,
    },
    template?.assets,
  );
  return { ...s, nextId: s.nextId + 1, activeId: id, campaigns: [...s.campaigns, c] };
}
const replace = (
  s: StudioState,
  id: string,
  fn: (c: StudioCampaign) => StudioCampaign,
): StudioState => ({ ...s, campaigns: s.campaigns.map((c) => (c.id === id ? fn(c) : c)) });
export function editDraft(
  s: StudioState,
  id: string,
  patch: { name?: string; settings?: Partial<CampaignSettings>; assets?: Partial<CampaignAssets> },
): StudioState {
  return replace(s, id, (c) => {
    if (["scheduled", "running", "paused", "completed"].includes(c.status)) return c;
    const settings = { ...c.settings, ...patch.settings };
    return {
      ...c,
      name: patch.name ?? c.name,
      settings,
      assets: { ...c.assets, ...patch.assets },
      status: "draft",
      snapshot: null,
      revision: c.revision + 1,
      updatedDay: s.day,
      log: [
        ...c.log.slice(-80),
        {
          day: s.day,
          text:
            c.status === "approved"
              ? "Edit invalidated approval; review again."
              : "Draft saved automatically.",
        },
      ],
    };
  });
}
export function refreshDraft(s: StudioState, id: string): StudioState {
  return replace(s, id, (c) =>
    c.status !== "draft"
      ? c
      : {
          ...c,
          reviewedDay: s.day,
          settings: { ...c.settings, scheduleDay: Math.max(s.day, c.settings.scheduleDay) },
          revision: c.revision + 1,
          log: [
            ...c.log,
            {
              day: s.day,
              text: "Refreshed audience reviewed. Merchant content and offer choices preserved.",
            },
          ],
        },
  );
}
export function saveTemplate(s: StudioState, id: string): StudioState {
  const c = s.campaigns.find((x) => x.id === id);
  if (!c) return s;
  const t = { id: "TPL-" + id, name: c.name, settings: { ...c.settings }, assets: { ...c.assets } };
  return { ...s, templates: [...s.templates.filter((x) => x.id !== t.id), t] };
}
export function approveDraft(
  data: Dataset,
  s: StudioState,
  id: string,
): { state: StudioState; error?: string } {
  const c = s.campaigns.find((x) => x.id === id);
  if (!c || c.status !== "draft") return { state: s, error: "Only a draft can be approved." };
  const view = deriveCampaign(data, studioFeatures(data, s), s, c);
  if (view.stale || view.blockers.length)
    return {
      state: s,
      error: view.stale
        ? "Review the refreshed audience before approval."
        : view.blockers.join(" "),
    };
  const snapshot: ApprovalSnapshot = {
    revision: c.revision,
    day: s.day,
    settings: { ...c.settings },
    assets: { ...c.assets },
    actions: view.actions.map((a) => ({ ...a })),
    holdoutIds: [...view.holdoutIds],
    noOutreachIds: [...view.noOutreachIds],
    audienceIds: view.candidates.map((f) => f.customer.id),
  };
  return {
    state: replace(s, id, (x) => ({
      ...x,
      status: "approved",
      snapshot,
      lastAudience: snapshot.audienceIds.length,
      log: [
        ...x.log,
        {
          day: s.day,
          text:
            "Exact audience, assets, offers and experiment approved at revision " +
            c.revision +
            ".",
        },
      ],
    })),
  };
}
export function scheduleCampaign(s: StudioState, id: string): StudioState {
  return replace(s, id, (c) =>
    c.status !== "approved" || !c.snapshot || c.snapshot.revision !== c.revision
      ? c
      : {
          ...c,
          status: c.settings.scheduleDay > s.day ? "scheduled" : "running",
          log: [
            ...c.log,
            {
              day: s.day,
              text:
                c.settings.scheduleDay > s.day
                  ? "Scheduled; approved recipients remain fixed."
                  : "Demo execution started; no real communication.",
            },
          ],
        },
  );
}
export function advanceDay(s: StudioState, data: Dataset): StudioState {
  const day = s.day + 1;
  const buyer = data.customers.find(
    (c) => !s.arrivals.some((o) => o.customerId === c.id) && c.consent,
  );
  const p = productById("P05");
  const arrivals = buyer
    ? [
        ...s.arrivals,
        {
          id: "IMPORT-DEMO-" + day,
          customerId: buyer.id,
          day,
          items: [{ productId: p.id, qty: 1, unitPrice: p.price }],
          discount: 0,
          status: "completed" as const,
          source: "simulated" as const,
          paymentMethod: "upi" as const,
        },
      ]
    : s.arrivals;
  return {
    ...s,
    day,
    refreshedDay: day,
    arrivals,
    campaigns: s.campaigns.map((c) =>
      c.status === "scheduled" && c.settings.scheduleDay <= day
        ? {
            ...c,
            status: "running",
            log: [
              ...c.log,
              {
                day,
                text: "Scheduled date reached. Frozen audience retained; pre-send checks apply.",
              },
            ],
          }
        : c,
    ),
  };
}
export function pauseCampaign(s: StudioState, id: string): StudioState {
  return replace(s, id, (c) =>
    c.status === "running"
      ? { ...c, status: "paused" }
      : c.status === "paused"
        ? { ...c, status: "running" }
        : c,
  );
}
export function renderAsset(text: string, customerName: string, a: ActionRow) {
  const p = productById(a.productId);
  const fields: Record<string, string> = {
    first_name: customerName.split(" ")[0]!,
    product: p.name,
    offer: a.offer
      ? "Use REFILL" + a.offer + " for " + a.offer + "% off."
      : "Reorder when you are ready.",
    payment: isPrepaidNudge(a)
      ? "Pay online with UPI for faster delivery."
      : a.paymentTreatment === PAYMENT.cod
        ? "Cash on delivery is available."
        : "Pay in one tap with UPI.",
    link: "https://nira.example.invalid/reorder/" + p.id,
  };
  return text.replace(/\{\{(\w+)\}\}/g, (match, field: string) => fields[field] ?? match);
}
// Outcomes use independent latent assumptions, never the model's displayed probabilities.
function syntheticOutcome(
  f: CustomerFeature,
  group: CampaignOutcome["group"],
  a: ActionRow | null,
  id: string,
): CampaignOutcome {
  const customerId = f.customer.id;
  const productId = a?.productId ?? f.relevantProduct.id;
  const p = productById(productId);
  const offer = a?.offer ?? 0;
  const intrinsic =
    0.04 +
    Math.min(0.18, f.offerUsage.completed * 0.017) +
    stableUnit("latent-affinity:" + customerId) * 0.04;
  const chance = Math.min(
    0.7,
    intrinsic + (a ? 0.04 + (stableUnit("latent-offer:" + customerId) * 0.7 * offer) / 100 : 0),
  );
  const draw = stableUnit("outcome:" + id + ":" + customerId);
  const calls =
    a?.callEligible && draw >= chance && stableUnit("voice-followup:" + id + customerId) < 0.35
      ? 1
      : 0;
  const purchased = draw < chance + calls * 0.03;
  const cod =
    f.orders.filter((o) => o.paymentMethod === "cod").length > f.orders.length / 2 &&
    !(a && isPrepaidNudge(a));
  return {
    customerId,
    group,
    purchased,
    productId,
    offer,
    paymentMethod: cod ? "cod" : "upi",
    state: purchased ? "placed" : "no_purchase",
    netSales: purchased ? p.price - Math.round((p.price * offer) / 100) : 0,
    contribution: 0,
    channelCost: a ? 1.2 + calls * 3 : 0,
    calls,
  };
}
export function sendStudioBatch(data: Dataset, s: StudioState, id: string): StudioState {
  const c = s.campaigns.find((x) => x.id === id);
  if (!c || c.status !== "running" || !c.snapshot) return s;
  const byId = new Map(studioFeatures(data, s).map((f) => [f.customer.id, f]));
  const otherAudience = new Set(
    s.campaigns
      .filter((x) => x.id !== id && x.snapshot && s.day <= x.settings.scheduleDay + 90)
      .flatMap((x) => x.snapshot!.audienceIds),
  );
  const next = {
    ...c,
    sentIds: [...c.sentIds],
    sentDays: { ...c.sentDays },
    outcomes: [...c.outcomes],
    log: [...c.log],
  };
  if (!next.outcomes.some((o) => o.group === "control"))
    for (const customerId of c.snapshot.holdoutIds) {
      const f = byId.get(customerId);
      if (f) next.outcomes.push(syntheticOutcome(f, "control", null, id));
    }
  for (const customerId of c.snapshot.noOutreachIds)
    if (!next.outcomes.some((o) => o.customerId === customerId)) {
      const f = byId.get(customerId);
      if (f) next.outcomes.push(syntheticOutcome(f, "treatment", null, id));
    }
  for (const a of c.snapshot.actions.slice(c.cursor, c.cursor + 12)) {
    next.cursor++;
    const f = byId.get(a.customerId);
    const blocked = !f
      ? "Customer missing"
      : (data.products.find((p) => p.id === a.productId)?.stock ?? 0) <= 0
        ? "Recommended product is out of stock"
        : hardReason(f)?.label;
    if (
      blocked ||
      otherAudience.has(a.customerId) ||
      next.sentIds.includes(a.customerId) ||
      s.day - c.settings.scheduleDay > 7
    ) {
      next.log.push({
        day: s.day,
        text:
          "Skipped " +
          a.customerId +
          ": " +
          (blocked ??
            (otherAudience.has(a.customerId)
              ? "Reserved by another experiment"
              : "Duplicate or expired campaign")),
      });
      if (f && !next.outcomes.some((o) => o.customerId === a.customerId))
        next.outcomes.push(syntheticOutcome(f, "treatment", null, id));
      continue;
    }
    const outcome = syntheticOutcome(
      f!,
      "treatment",
      { ...a, callEligible: a.callEligible && f!.customer.callConsent },
      id,
    );
    if (
      next.outcomes.reduce((t, o) => t + o.channelCost, 0) + outcome.channelCost >
      c.settings.operatorCap
    ) {
      next.log.push({ day: s.day, text: "Operator spending limit reached; contact skipped." });
      next.outcomes.push(syntheticOutcome(f!, "treatment", null, id));
      continue;
    }
    next.sentIds.push(a.customerId);
    next.sentDays[a.customerId] = s.day;
    next.outcomes.push(outcome);
  }
  next.log.push({
    day: s.day,
    text: "Simulated WhatsApp batch. Permitted voice follow-ups logged. No real messages or calls.",
  });
  if (next.cursor >= c.snapshot.actions.length) next.status = "completed";
  const replaced = replace(s, id, () => next);
  const known = new Set(s.arrivals.map((o) => o.id));
  const purchases: Order[] = next.outcomes
    .filter((o) => o.purchased && !known.has(id + ":" + o.customerId))
    .map((o) => ({
      id: id + ":" + o.customerId,
      customerId: o.customerId,
      day: s.day,
      items: [{ productId: o.productId, qty: 1, unitPrice: productById(o.productId).price }],
      discount: Math.round((productById(o.productId).price * o.offer) / 100),
      status: "pending_delivery",
      source: "simulated",
      paymentMethod: o.paymentMethod,
      attributedCampaign:
        o.group === "treatment" && next.sentIds.includes(o.customerId) ? id : undefined,
      collected: 0,
      financialStatus: "pending",
      fulfillmentStatus: "unfulfilled",
    }));
  return { ...replaced, arrivals: [...s.arrivals, ...purchases] };
}
export function reconcileCampaign(data: Dataset, s: StudioState, id: string): StudioState {
  const replaced = replace(s, id, (c) => {
    if (c.status !== "completed") return c;
    const outcomes = c.outcomes.map((o) => {
      if (o.state !== "placed") return o;
      const p = productById(o.productId);
      const sig = signalIndex(data).get(o.customerId);
      const rtoChance = sig?.riskTier === "high" ? 0.28 : sig?.riskTier === "medium" ? 0.13 : 0.03;
      const rto =
        o.paymentMethod === "cod" && stableUnit("delivery:" + id + o.customerId) < rtoChance;
      const returned = !rto && stableUnit("refund:" + id + o.customerId) < 0.04;
      return {
        ...o,
        state: rto ? ("rto" as const) : returned ? ("refunded" as const) : ("collected" as const),
        netSales: rto || returned ? 0 : o.netSales,
        contribution: rto ? -170 : returned ? -85 : o.netSales - p.variableCost,
      };
    });
    return {
      ...c,
      outcomes,
      settlementDay: s.day,
      log: [
        ...c.log,
        {
          day: s.day,
          text: "Synthetic delivery, collection and return-window reconciliation. This is not an invoice.",
        },
      ],
    };
  });
  const campaign = replaced.campaigns.find((c) => c.id === id);
  return {
    ...replaced,
    arrivals: replaced.arrivals.map((o) => {
      if (!o.id.startsWith(id + ":")) return o;
      const outcome = campaign?.outcomes.find((x) => id + ":" + x.customerId === o.id);
      if (!outcome || outcome.state === "placed") return o;
      return {
        ...o,
        status:
          outcome.state === "collected"
            ? "completed"
            : outcome.state === "rto"
              ? "rto"
              : "returned",
        collected: outcome.state === "collected" ? outcome.netSales : 0,
        financialStatus: outcome.state === "collected" ? "paid" : "refunded",
        fulfillmentStatus: outcome.state === "collected" ? "delivered" : "returned",
      };
    }),
  };
}
export function refundOutcome(s: StudioState, id: string, customerId: string): StudioState {
  const c = s.campaigns.find((x) => x.id === id);
  if (!c?.outcomes.some((o) => o.customerId === customerId && o.state === "collected")) return s;
  const replaced = replace(s, id, (x) => ({
    ...x,
    outcomes: x.outcomes.map((o) =>
      o.customerId === customerId ? { ...o, state: "refunded", netSales: 0, contribution: -85 } : o,
    ),
    log: [...x.log, { day: s.day, text: "Late refund applied; portfolio estimate recalculated." }],
  }));
  return {
    ...replaced,
    arrivals: replaced.arrivals.map((o) =>
      o.id === id + ":" + customerId ? { ...o, status: "returned", refund: o.collected ?? 0 } : o,
    ),
  };
}
export function optOutCustomer(s: StudioState, customerId: string): StudioState {
  return s.optOutIds.includes(customerId) ? s : { ...s, optOutIds: [...s.optOutIds, customerId] };
}
export function campaignSettlement(c: StudioCampaign) {
  const treatmentN = c.snapshot ? c.snapshot.audienceIds.length - c.snapshot.holdoutIds.length : 0;
  const controlN = c.snapshot?.holdoutIds.length ?? 0;
  const treatment = c.outcomes
    .filter((o) => o.group === "treatment")
    .reduce((t, o) => t + o.contribution, 0);
  const control = c.outcomes
    .filter((o) => o.group === "control")
    .reduce((t, o) => t + o.contribution, 0);
  const incremental = controlN ? treatment - (control / controlN) * treatmentN : null;
  const finalized =
    c.status === "completed" &&
    c.settlementDay !== null &&
    !c.outcomes.some((o) => o.state === "placed");
  return {
    incremental,
    finalized,
    treatmentN,
    controlN,
    collected: c.outcomes.filter((o) => o.group === "treatment" && o.state === "collected").length,
    attributed: c.outcomes.filter((o) => o.group === "treatment" && o.purchased).length,
    pending: c.outcomes.filter((o) => o.state === "placed").length,
    operatorCost: c.outcomes.reduce((t, o) => t + o.channelCost, 0),
  };
}
export function portfolioSettlement(s: StudioState) {
  const cohorts = s.campaigns
    .filter((c) => c.snapshot && c.outcomes.length)
    .map(campaignSettlement);
  const incremental = cohorts.reduce((t, c) => t + (c.incremental ?? 0), 0);
  const ready =
    cohorts.length > 0 &&
    cohorts.every((c) => c.finalized && c.controlN >= 20 && c.treatmentN >= 100);
  const fee = ready ? Math.max(0, incremental) * 0.25 : null;
  const operatorCost = cohorts.reduce((t, c) => t + c.operatorCost, 0);
  return {
    incremental,
    ready,
    fee,
    operatorCost,
    merchantKeeps: fee === null ? null : incremental - fee,
    operatorContribution: fee === null ? null : fee - operatorCost,
    reason: !cohorts.length
      ? "No campaign results yet."
      : !ready
        ? "Results appear once deliveries and COD payments are settled and each campaign has at least 20 customers in the control group and 100 messaged."
        : "Extra profit compared with the control group, after returns and refunds. Losses on one campaign offset gains on another before the 25% fee.",
  };
}
