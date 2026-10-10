import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerDrawer } from "@/components/retention/CustomerDrawer";
import { EligibilityPill, Note, PageHeader, Pill } from "@/components/retention/bits";
import { editConfig, toggleExclude } from "@/retention/campaign";
import type { Eligibility } from "@/retention/features";
import { dayToDate } from "@/retention/format";
import { useDemo } from "@/retention/store";

export const Route = createFileRoute("/cohort")({
  head: () => ({
    meta: [
      { title: "Cohort intelligence — Retention Agent" },
      { name: "description", content: "Inspect eligible, excluded and needs-review customers with evidence, reorder intervals and policy reasons." },
      { property: "og:title", content: "Cohort intelligence — Retention Agent" },
      { property: "og:description", content: "Customer-level evidence behind a replenishment audience." },
    ],
  }),
  component: Cohort,
});

function Cohort() {
  const { d, state, update } = useDemo();
  const [tab, setTab] = useState<Eligibility>("eligible");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const launched = state.campaign.queue !== null;
  const holdoutIds = useMemo(() => new Set(d.plan.holdout.map((h) => h.customer.id)), [d.plan.holdout]);
  const lists = { eligible: d.plan.eligible, excluded: d.plan.excluded, review: d.plan.review };
  const rows = lists[tab]
    .filter((f) => !q || `${f.customer.name} ${f.customer.id} ${f.relevantProduct.name}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (a.customer.scenario ? -1 : 0) - (b.customer.scenario ? -1 : 0) || a.customer.id.localeCompare(b.customer.id));

  return (
    <div className="space-y-4 animate-enter">
      <PageHeader title="Cohort intelligence" subtitle="Who to contact — derived from each customer’s own completed purchases of the relevant product."
        actions={<Button asChild><Link to="/workbench">Continue to decision <ArrowRight className="size-4" aria-hidden /></Link></Button>} />

      <div className="panel flex flex-wrap items-center gap-6 p-4">
        <div className="w-72">
          <label htmlFor="tol" className="label-text">Reorder-window tolerance: <span className="num font-semibold text-foreground">±{state.config.tolerancePct}%</span></label>
          <Slider id="tol" className="mt-2" min={5} max={50} step={5} value={[state.config.tolerancePct]} disabled={launched} onValueChange={([v]) => update((s) => editConfig(s, { tolerancePct: v }))} aria-label="Reorder-window tolerance percent" />
        </div>
        <p className="max-w-md text-xs text-muted-foreground">A customer is due when days since their last relevant purchase fall within typical interval × (1 ± tolerance). Typical interval = median gap between completed purchases (needs ≥3).</p>
        <div className="relative ml-auto">
          <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" aria-hidden />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customer or product" className="w-64 pl-8" aria-label="Search customers" />
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Eligibility)}>
        <TabsList>
          <TabsTrigger value="eligible">Eligible <span className="num ml-1.5 text-muted-foreground">{d.plan.eligible.length}</span></TabsTrigger>
          <TabsTrigger value="excluded">Excluded <span className="num ml-1.5 text-muted-foreground">{d.plan.excluded.length}</span></TabsTrigger>
          <TabsTrigger value="review">Needs review <span className="num ml-1.5 text-muted-foreground">{d.plan.review.length}</span></TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="panel overflow-hidden">
        <div className="max-h-[520px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface text-left text-xs text-muted-foreground">
              <tr className="border-b">
                <th className="px-3 py-2 font-medium">Customer</th><th className="px-3 py-2 font-medium">Last purchase</th><th className="px-3 py-2 font-medium">Relevant product</th>
                <th className="px-3 py-2 text-right font-medium">Typical interval</th><th className="px-3 py-2 text-right font-medium">Observed offer usage</th><th className="px-3 py-2 font-medium">Eligibility</th><th className="px-3 py-2 font-medium">Reason</th><th className="px-3 py-2"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={8} className="px-3 py-10 text-center text-muted-foreground">No customers in this view.</td></tr>}
              {rows.map((f) => {
                const hard = f.reasons.some((r) => r.hard);
                const merchant = state.excluded.includes(f.customer.id);
                return (
                  <tr key={f.customer.id} className="border-b last:border-0 hover:bg-surface">
                    <td className="px-3 py-2">
                      <button type="button" className="text-left font-medium text-primary hover:underline" onClick={() => setOpen(f.customer.id)}>{f.customer.name}</button>
                      <div className="text-xs text-muted-foreground">{f.customer.id}{f.customer.scenario && <> · <span className="text-foreground">Scenario {f.customer.scenario.split(" · ")[0]}</span></>}</div>
                    </td>
                    <td className="num px-3 py-2">{dayToDate(f.lastRelevantDay)}<div className="text-xs text-muted-foreground">{f.daysSince}d ago</div></td>
                    <td className="px-3 py-2">{f.relevantProduct.name}</td>
                    <td className="num px-3 py-2 text-right">{f.typicalInterval ? `${f.typicalInterval}d` : "—"}{f.windowLow != null && <div className="text-xs text-muted-foreground">window {Math.round(f.windowLow)}–{Math.round(f.windowHigh!)}d</div>}</td>
                    <td className="num px-3 py-2 text-right">{f.offerUsage.discounted}/{f.offerUsage.completed} orders</td>
                    <td className="px-3 py-2"><EligibilityPill s={f.status} />{holdoutIds.has(f.customer.id) && <Pill className="ml-1">Holdout</Pill>}</td>
                    <td className="px-3 py-2 text-xs">{f.reasons[0]?.label ?? (f.intervalSource === "merchant_default" ? "Resolved by merchant" : "In reorder window")}</td>
                    <td className="px-3 py-2 text-right">
                      {!hard && (tab !== "review") && (tab === "eligible" || merchant) && (
                        <Button size="sm" variant="ghost" onClick={() => update((s) => toggleExclude(s, f.customer.id))}>{merchant ? "Include" : "Exclude"}</Button>
                      )}
                      {tab === "review" && <Button size="sm" variant="outline" onClick={() => setOpen(f.customer.id)}>Inspect</Button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Note>Merchant overrides cannot bypass consent, refund, recent-purchase, stock or frequency blocks. Holdout is assigned by a stable hash of customer and campaign ID only. Observed offer usage is not evidence that discounts caused purchases.</Note>
      <CustomerDrawer id={open} onClose={() => setOpen(null)} />
    </div>
  );
}
