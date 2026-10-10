import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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

  return (
    <Sheet open={!!f} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[520px] overflow-y-auto sm:max-w-[520px]">
        {f && rec && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 font-heading">{f.customer.name} <EligibilityPill s={f.status} /></SheetTitle>
              <SheetDescription>{f.customer.id} · {f.customer.city} · synthetic customer{f.customer.scenario && <> · Scenario {f.customer.scenario}</>}</SheetDescription>
            </SheetHeader>
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
                <table className="num mt-3 w-full text-xs">
                  <thead className="text-muted-foreground"><tr><th className="text-left font-medium">Offer</th><th className="text-right font-medium">P(purchase)</th><th className="text-right font-medium">Order contrib.</th><th className="text-right font-medium">Expected / contact</th><th className="text-right font-medium">Status</th></tr></thead>
                  <tbody>{rec.evaluations.map((e) => (
                    <tr key={e.pct} className={e.pct === rec.offerPct ? "font-semibold" : ""}>
                      <td>{e.pct === 0 ? "No discount" : `${e.pct}%`}</td><td className="text-right">{pct(e.probability)}</td><td className="text-right">{inr(e.contributionAfterDiscount)}</td><td className="text-right">{inr(e.expectedContribution, true)}</td><td className="text-right">{e.permitted ? "Permitted" : "Blocked"}</td>
                    </tr>))}</tbody>
                </table>
                <div className="mt-2"><KindTag kind="forecast" /></div>
              </section>
              <section>
                <h3 className="section-title text-base">Order history</h3>
                <table className="num mt-2 w-full text-xs">
                  <thead className="text-muted-foreground"><tr><th className="text-left font-medium">Date</th><th className="text-left font-medium">Items</th><th className="text-right font-medium">Value</th><th className="text-right font-medium">Discount</th><th className="text-right font-medium">Contrib.</th><th className="text-right font-medium">Status</th></tr></thead>
                  <tbody>{f.orders.map((o) => (
                    <tr key={o.id} className="border-t">
                      <td className="py-1">{dayToDate(o.day)}</td><td className="max-w-40 truncate">{o.items.map((i) => productById(i.productId).name).join(", ")}</td>
                      <td className="text-right">{inr(orderValue(o))}</td><td className="text-right">{o.discount ? inr(o.discount) : "—"}</td><td className="text-right">{inr(orderContribution(o))}</td>
                      <td className="text-right">{o.status.replace("_", " ")}{o.source === "simulated" ? " (sim)" : ""}</td>
                    </tr>))}</tbody>
                </table>
              </section>
              <div className="flex flex-wrap gap-2 border-t pt-4">
                {!hardBlocked && (
                  <Button variant="outline" size="sm" onClick={() => update((s) => toggleExclude(s, f.customer.id))}>{merchantExcluded ? "Include again" : "Exclude customer"}</Button>
                )}
                {f.status === "review" && (
                  <Button size="sm" disabled={!f.reviewResolvable || launched} onClick={() => update((s) => resolveReview(s, f.customer.id))}>Resolve: include with product default interval</Button>
                )}
                {hardBlocked && <Note>Hard policy blocks cannot be overridden by the merchant.</Note>}
                {f.status === "review" && f.reviewResolveBlocker && <Note t="warning">{f.reviewResolveBlocker}</Note>}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
