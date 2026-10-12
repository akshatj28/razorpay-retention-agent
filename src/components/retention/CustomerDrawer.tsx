import { CellTable } from "./DataTable";
import { Drawer, DrawerHeader, Badge, DrawerBody } from "@razorpay/blade/components";
import { Button } from "@razorpay/blade/components";
import { orderContribution, orderValue, productById } from "@/retention/data";
import { resolveReview, toggleExclude } from "@/retention/campaign";
import { deterministicAdapter } from "@/retention/recommend";
import { dayToDate, inr, pct } from "@/retention/format";
import { useDemo } from "@/retention/store";
import { EligibilityPill, KindTag, Note, RecLabel } from "./bits";

export function CustomerDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { d, state, update } = useDemo();
  const f = id ? d.byId.get(id) : undefined;
  const launched = state.campaign.queue !== null;
  const rec = f ? deterministicAdapter.recommend(f, { maxDiscount: state.config.maxDiscount, minContribution: state.config.minContribution }) : null;
  const holdout = f && d.plan.holdout.some((h) => h.customer.id === f.customer.id);
  const merchantExcluded = f && state.excluded.includes(f.customer.id);
  const hardBlocked = f?.reasons.some((r) => r.hard);
  if (!f || !rec) return null;

  return (
    <Drawer isOpen={!!f} onDismiss={onClose} accessibilityLabel={f ? `Customer details: ${f.customer.name}` : "Customer details"}>

            <DrawerHeader title={f.customer.name} titleSuffix={<Badge color={f.status === "eligible" ? "positive" : f.status === "review" ? "notice" : "neutral"}>{f.status === "review" ? "Needs review" : f.status === "eligible" ? "Eligible" : "Excluded"}</Badge>} subtitle={`${f.customer.id} · ${f.customer.city} · synthetic customer${f.customer.scenario ? ` · Scenario ${f.customer.scenario}` : ""}`} />
            <DrawerBody>
            <div className="space-y-5 px-4 pb-6 text-sm">
              {f.reasons.length > 0 && (
                <section>
                  <h3 className="section-title text-base">Eligibility reasons</h3>
                  <ul className="mt-1 space-y-1">{f.reasons.map((r) => <li key={r.code} className="flex justify-between gap-2"><span>{r.label}</span><span className="text-xs text-muted-foreground">{r.hard ? "Hard block — cannot be overridden" : "Soft"}</span></li>)}</ul>
                </section>
              )}
              <section>
                <h3 className="section-title flex items-center gap-2 text-base">Observed facts <KindTag kind="observed" /></h3>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <dt className="text-muted-foreground">Marketing consent</dt><dd>{f.consent ? "Yes" : "No"}</dd>
                  <dt className="text-muted-foreground">Relevant product</dt><dd>{f.relevantProduct.name}</dd>
                  <dt className="text-muted-foreground">Last relevant purchase</dt><dd>{dayToDate(f.lastRelevantDay)} ({f.daysSince}d ago)</dd>
                  <dt className="text-muted-foreground">Orders with a discount</dt><dd className="num">{f.offerUsage.discounted} of {f.offerUsage.completed} completed</dd>
                  <dt className="text-muted-foreground">Last promotional contact</dt><dd>{f.lastPromoContactDay == null ? "None" : dayToDate(f.lastPromoContactDay)}</dd>
                  <dt className="text-muted-foreground">Product stock</dt><dd className="num">{f.relevantProduct.stock} units</dd>
                </dl>
              </section>
              <section>
                <h3 className="section-title flex items-center gap-2 text-base">Derived features <KindTag kind="derived" /></h3>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <dt className="text-muted-foreground">Purchase intervals</dt><dd className="num">{f.intervals.length ? f.intervals.join(", ") + " days" : "—"}</dd>
                  <dt className="text-muted-foreground">Typical interval (median)</dt><dd className="num">{f.typicalInterval ? `${f.typicalInterval} days${f.intervalSource === "merchant_default" ? " (product default, merchant-resolved)" : ""}` : "Not derivable"}</dd>
                  <dt className="text-muted-foreground">Reorder window (±{state.config.tolerancePct}%)</dt><dd className="num">{f.windowLow != null ? `${f.windowLow}–${f.windowHigh} days` : "—"}</dd>
                </dl>
              </section>
              <section>
                <h3 className="section-title text-base">Data limitations</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                  {f.relevantCompletedDays.length < 3 && <li>Fewer than 3 completed purchases of the relevant product; interval cannot be derived from history.</li>}
                  <li>Observed discount use does not show that discounts caused purchases.</li>
                  <li>Six months of synthetic history only; purchases elsewhere are unobserved.</li>
                </ul>
              </section>
              <section className="rec-accent rounded-md bg-surface p-3">
                <div className="flex items-center justify-between"><h3 className="section-title text-base">Proposed action</h3><RecLabel /></div>
                {holdout ? <p className="mt-2">In the no-contact holdout (stable hash of customer and campaign ID). Will not be messaged.</p>
                  : f.status !== "eligible" ? <p className="mt-2 text-muted-foreground">No action — customer is not eligible.</p>
                  : <p className="mt-2">{rec.explanation}</p>}
                <p className="mt-2 text-xs text-muted-foreground">P(purchase) is a per-product fixture assumption, identical for all customers buying this product—not learned from customer history.</p><div className="overflow-x-auto"><CellTable label="Customer offer evaluations" minWidth={520}
                  headings={[{ label: "Offer" }, { label: "P(purchase)", align: "right" }, { label: "Order contrib.", align: "right" }, { label: "Expected / contact", align: "right" }, { label: "Status", align: "right" }]}
                  rows={rec.evaluations.map((e) => ({ id: String(e.pct), cells: [e.pct === 0 ? "No discount" : `${e.pct}%`, pct(e.probability), inr(e.contributionAfterDiscount), inr(e.expectedContribution, true), e.permitted ? "Permitted" : "Blocked"] }))} /></div>
                <div className="mt-2"><KindTag kind="forecast" /></div>
              </section>
              <section>
                <h3 className="section-title text-base">Order history</h3>
                <div className="overflow-x-auto"><CellTable label="Customer order history" minWidth={650}
                  headings={[{ label: "Date" }, { label: "Items", width: "minmax(160px, 1.4fr)" }, { label: "Value", align: "right" }, { label: "Discount", align: "right" }, { label: "Contrib.", align: "right" }, { label: "Status", align: "right" }]}
                  rows={f.orders.map((o) => ({ id: o.id, cells: [dayToDate(o.day), o.items.map((i) => productById(i.productId).name).join(", "), inr(orderValue(o)), o.discount ? inr(o.discount) : "—", inr(orderContribution(o)), o.status.replace("_", " ") + (o.source === "simulated" ? " (sim)" : "")] }))} /></div>
              </section>
              <div className="flex flex-wrap gap-2 border-t pt-4">
                {!hardBlocked && (
                  <Button variant="secondary" size="small" isDisabled={launched} onClick={() => update((s) => toggleExclude(s, f.customer.id))}>{merchantExcluded ? "Include again" : "Exclude customer"}</Button>
                )}
                {f.status === "review" && (
                  <Button size="small" isDisabled={!f.reviewResolvable || launched} onClick={() => update((s) => resolveReview(s, f.customer.id))}>Resolve: include with product default interval</Button>
                )}
                {hardBlocked && <Note>Hard policy blocks cannot be overridden by the merchant.</Note>}
                {f.status === "review" && f.reviewResolveBlocker && <Note t="warning">{f.reviewResolveBlocker}</Note>}
              </div>
            </div>
            </DrawerBody>

    </Drawer>
  );
}
