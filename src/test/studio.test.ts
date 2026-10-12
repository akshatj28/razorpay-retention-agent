import { describe, expect, test } from "vitest";
import {
  baseDataset,
  MONTH_WINDOWS,
  MONTHLY_ORDER_TARGETS,
  generateDataset,
  productById,
} from "@/retention/data";
import { databaseTables, csvFor } from "@/retention/tables";
import {
  initialStudio,
  createDraft,
  editDraft,
  deriveStudio,
  saveTemplate,
  advanceDay,
  refreshDraft,
  approveDraft,
  scheduleCampaign,
  pauseCampaign,
  sendStudioBatch,
  reconcileCampaign,
  refundOutcome,
  optOutCustomer,
  campaignSettlement,
  portfolioSettlement,
} from "@/retention/studio";
import { runBenchmark } from "@/retention/benchmark";
const data = baseDataset();
const start = () => createDraft(initialStudio());
describe("Shopify-shaped merchant history", () => {
  test("exact six-month totals, keys and money reconcile", () => {
    expect(data.orders.length).toBe(30000);
    expect(data.customers.length).toBe(12000);
    expect(
      MONTH_WINDOWS.map((w) => data.orders.filter((o) => o.day >= w.start && o.day < w.end).length),
    ).toEqual(MONTHLY_ORDER_TARGETS);
    expect(new Set(data.orders.map((o) => o.id)).size).toBe(30000);
    const ids = new Set(data.customers.map((c) => c.id));
    expect(
      data.orders.every(
        (o) =>
          ids.has(o.customerId) && o.items.every((it) => it.qty > 0 && !!productById(it.productId)),
      ),
    ).toBe(true);
    expect(data.orders.some((o) => o.items.length > 1)).toBe(true);
    expect(data.orders.some((o) => o.items.some((it) => it.qty > 1))).toBe(true);
    const tables = databaseTables(data);
    expect(tables["monthly_summary"]!.reduce((t, r) => t + Number(r["orders"]), 0)).toBe(30000);
    expect(
      tables["orders"]!.every(
        (o) =>
          Number(o["order_total_inr"]) ===
          Number(o["subtotal_inr"]) -
            Number(o["discount_inr"]) +
            Number(o["shipping_inr"]) +
            Number(o["tax_inr"]),
      ),
    ).toBe(true);
    expect(data.signals.every((s) => s.source === "simulated_razorpay")).toBe(true);
    expect(csvFor([{ value: 'Quoted, "text"', missing: null }])).toContain('"Quoted, ""text"""');
  });
  test("regeneration is deterministic without persisting history", () => {
    const again = generateDataset();
    expect(again.orders.slice(0, 100)).toEqual(data.orders.slice(0, 100));
    expect(again.orders.slice(-100)).toEqual(data.orders.slice(-100));
    expect(again.signals).toEqual(data.signals);
  });
});
describe("Persistent campaign lifecycle", () => {
  test("daily refresh preserves edits; templates instantiate a new draft", () => {
    let s = start();
    const id = s.activeId!;
    s = editDraft(s, id, {
      name: "My routine",
      assets: { whatsapp: "My approved wording for {{product}}. Reply STOP." },
      settings: { offer: 0 },
    });
    s = saveTemplate(s, id);
    const template = s.templates[0]!;
    s = advanceDay(s, data);
    expect(s.campaigns[0]!.assets.whatsapp).toContain("My approved wording");
    expect(s.campaigns[0]!.settings.offer).toBe(0);
    expect(deriveStudio(data, s).active!.stale).toBe(true);
    expect(approveDraft(data, s, id).error).toContain("refreshed");
    s = refreshDraft(s, id);
    expect(deriveStudio(data, s).active!.stale).toBe(false);
    const next = createDraft(s, "replenishment", "template", template.id);
    expect(next.activeId).not.toBe(id);
    expect(next.campaigns.at(-1)!.assets.whatsapp).toBe(template.assets.whatsapp);
    expect(next.campaigns.at(-1)!.snapshot).toBeNull();
    expect(JSON.parse(JSON.stringify(next))).toEqual(next);
  });
  test("approval binds assets and settings; edits invalidate and scheduled audiences freeze", () => {
    let s = start();
    const id = s.activeId!;
    s = editDraft(s, id, { settings: { scheduleDay: 1 } });
    const approval = approveDraft(data, s, id);
    expect(approval.error).toBeUndefined();
    s = approval.state;
    const original = s.campaigns[0]!.snapshot!;
    const edited = editDraft(s, id, { assets: { creativeTitle: "New headline" } });
    expect(edited.campaigns[0]!.status).toBe("draft");
    expect(edited.campaigns[0]!.snapshot).toBeNull();
    s = scheduleCampaign(s, id);
    expect(s.campaigns[0]!.status).toBe("scheduled");
    s = advanceDay(s, data);
    expect(s.campaigns[0]!.status).toBe("running");
    expect(s.campaigns[0]!.snapshot).toEqual(original);
    expect(editDraft(s, id, { settings: { maxDiscount: 30 } }).campaigns[0]).toEqual(
      s.campaigns[0],
    );
  });
  test("approved experiments reserve all recipients, including controls", () => {
    let s = start();
    s = approveDraft(data, s, s.activeId!).state;
    const reserved = new Set(s.campaigns[0]!.snapshot!.audienceIds);
    s = createDraft(s);
    const view = deriveStudio(data, s).active!;
    expect(view.candidates.some((f) => reserved.has(f.customer.id))).toBe(false);
  });
  test("outreach respects opt-outs, pause, holds and frozen send limits", () => {
    let s = start();
    const id = s.activeId!;
    s = approveDraft(data, s, id).state;
    s = scheduleCampaign(s, id);
    const target = s.campaigns[0]!.snapshot!.actions[0]!.customerId;
    s = optOutCustomer(s, target);
    s = pauseCampaign(s, id);
    expect(sendStudioBatch(data, s, id)).toEqual(s);
    s = pauseCampaign(s, id);
    s = sendStudioBatch(data, s, id);
    expect(s.campaigns[0]!.sentIds).not.toContain(target);
    expect(
      s.campaigns[0]!.sentIds.some((x) => s.campaigns[0]!.snapshot!.holdoutIds.includes(x)),
    ).toBe(false);
    expect(s.campaigns[0]!.sentIds.length).toBeLessThanOrEqual(12);
    expect(
      s.campaigns[0]!.outcomes.some((o) => o.customerId === target && o.group === "treatment"),
    ).toBe(true);
  });
  test("collection precedes fee readiness, refunds are idempotent and purchases become history", () => {
    let s = start();
    const id = s.activeId!;
    s = editDraft(s, id, { settings: { maxAudience: 1000 } });
    s = approveDraft(data, s, id).state;
    s = scheduleCampaign(s, id);
    while (s.campaigns[0]!.status === "running") s = sendStudioBatch(data, s, id);
    expect(campaignSettlement(s.campaigns[0]!).finalized).toBe(false);
    expect(portfolioSettlement(s).fee).toBeNull();
    expect(s.arrivals.some((o) => o.status === "pending_delivery")).toBe(true);
    s = reconcileCampaign(data, s, id);
    expect(campaignSettlement(s.campaigns[0]!).finalized).toBe(true);
    const collected = s.campaigns[0]!.outcomes.find((o) => o.state === "collected")!;
    expect(collected).toBeDefined();
    const after = refundOutcome(s, id, collected.customerId);
    expect(refundOutcome(after, id, collected.customerId)).toEqual(after);
    expect(after.arrivals.find((o) => o.id === id + ":" + collected.customerId)?.status).toBe(
      "returned",
    );
    expect(campaignSettlement(s.campaigns[0]!).treatmentN).toBe(
      s.campaigns[0]!.snapshot!.audienceIds.length - s.campaigns[0]!.snapshot!.holdoutIds.length,
    );
  }, 20000);
  test("losing campaigns offset wins before applying one portfolio fee", () => {
    let s = start();
    s = approveDraft(data, s, s.activeId!).state;
    const original = s.campaigns[0]!;
    const snapshot = {
      ...original.snapshot!,
      audienceIds: Array.from({ length: 120 }, (_, i) => "ID-" + i),
      holdoutIds: Array.from({ length: 20 }, (_, i) => "ID-" + i),
    };
    const positive = {
      ...original,
      snapshot,
      status: "completed" as const,
      settlementDay: 0,
      outcomes: [
        {
          customerId: "ID-21",
          group: "treatment" as const,
          purchased: true,
          productId: "P01",
          offer: 0 as const,
          paymentMethod: "upi" as const,
          state: "collected" as const,
          netSales: 1000,
          contribution: 400,
          channelCost: 1.2,
          calls: 0,
        },
      ],
    };
    const negative = {
      ...positive,
      id: "LOSS",
      outcomes: [{ ...positive.outcomes[0]!, contribution: -170, state: "rto" as const }],
    };
    s = { ...s, campaigns: [positive, negative] };
    expect(portfolioSettlement(s).incremental).toBe(230);
    expect(portfolioSettlement(s).fee).toBe(57.5);
  });
});
test("benchmark uses identical customers and permits zero intervention benefit", () => {
  const features = deriveStudio(data, initialStudio()).features;
  const base = runBenchmark(data, features);
  const zero = runBenchmark(data, features, 0);
  expect(new Set(base.map((r) => r.audience)).size).toBe(1);
  expect(zero.every((r) => r.purchases === zero[0]!.purchases)).toBe(true);
  expect(base[0]!.contacts).toBe(0);
  expect(base[0]!.successFee).toBe(0);
});
