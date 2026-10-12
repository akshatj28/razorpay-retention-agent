import { CellTable } from "@/components/retention/DataTable";
import { LinkButton } from "@/components/retention/LinkButton";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@razorpay/blade/components";
import { TextInput, SearchIcon, SliderInput, Tabs, TabList, TabItem, TabPanel } from "@razorpay/blade/components";
import { CustomerDrawer } from "@/components/retention/CustomerDrawer";
import { EligibilityPill, Note, PageHeader, Pill } from "@/components/retention/bits";
import { editConfig, toggleExclude } from "@/retention/campaign";
import type { Eligibility } from "@/retention/features";
import { dayToDate } from "@/retention/format";
import { useDemo } from "@/retention/store";

export const Route = createFileRoute("/cohort")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
      <PageHeader title="Find customers ready to return." subtitle="Cohort intelligence · Purchase rhythm meets policy checks."
        actions={<LinkButton to="/workbench">Continue to decision</LinkButton>} />

      <div className="panel grid gap-4 p-4 lg:grid-cols-3">
        <div className="w-full min-w-0 max-w-72">
          <SliderInput label={`Reorder-window tolerance: ±${state.config.tolerancePct}%`} min={5} max={50} step={5}
            value={state.config.tolerancePct} isDisabled={launched} formatValue={(value) => `±${value}%`}
            onChange={({ value }) => update((s) => editConfig(s, { tolerancePct: value }))} />
        </div>
        <details className="self-center text-xs text-muted-foreground"><summary className="cursor-pointer font-medium text-foreground">How is the reorder window calculated?</summary><p className="mt-2 leading-relaxed">Days since last relevant purchase must fall within typical interval × (1 ± tolerance). Typical interval is the median gap between completed purchases (at least 3 required).</p></details>
        <div className="relative min-w-0">
          <TextInput value={q} onChange={({ value }) => setQ(value ?? "")} placeholder="Search customer or product" accessibilityLabel="Search customers" leading={SearchIcon} />
        </div>
      </div>

      <Tabs value={tab} onChange={(v) => setTab(v as Eligibility)} variant="bordered" size="small">
        <TabList>
          <TabItem value="eligible">Eligible <span className="num ml-1.5 text-muted-foreground">{d.plan.eligible.length}</span></TabItem>
          <TabItem value="excluded">Excluded <span className="num ml-1.5 text-muted-foreground">{d.plan.excluded.length}</span></TabItem>
          <TabItem value="review">Needs review <span className="num ml-1.5 text-muted-foreground">{d.plan.review.length}</span></TabItem>
        </TabList>
      <TabPanel value={tab}>
      <div data-tour="cohort" className="panel overflow-hidden">
        <div className="max-h-[520px] overflow-auto">
          <CellTable label="Customer cohort" minWidth={1100} empty="No customers in this view."
            headings={[{ label: "Customer", width: "minmax(170px, 1.2fr)" }, { label: "Last purchase" }, { label: "Relevant product", width: "minmax(160px, 1fr)" }, { label: "Typical interval", align: "right" }, { label: "Observed offer usage", align: "right" }, { label: "Eligibility", width: "minmax(160px, 1fr)" }, { label: "Reason", width: "minmax(180px, 1.4fr)" }, { label: "Actions" }]}
            rows={rows.map((f) => {
              const hard = f.reasons.some((r) => r.hard);
              const merchant = state.excluded.includes(f.customer.id);
              return { id: f.customer.id, cells: [
                <div><Button variant="tertiary" size="small" onClick={() => setOpen(f.customer.id)}>{f.customer.name}</Button><div className="text-xs text-muted-foreground">{f.customer.id}{f.customer.scenario && ` · Scenario ${f.customer.scenario.split(" · ")[0]}`}</div></div>,
                <div className="num">{dayToDate(f.lastRelevantDay)}<div className="text-xs text-muted-foreground">{f.daysSince}d ago</div></div>,
                f.relevantProduct.name,
                <div className="num">{f.typicalInterval ? `${f.typicalInterval}d` : "—"}{f.windowLow != null && <div className="text-xs text-muted-foreground">window {Math.round(f.windowLow)}–{Math.round(f.windowHigh ?? 0)}d</div>}</div>,
                `${f.offerUsage.discounted}/${f.offerUsage.completed} orders`,
                <div className="flex flex-wrap gap-1"><EligibilityPill s={f.status} />{holdoutIds.has(f.customer.id) && <Pill>Holdout</Pill>}</div>,
                f.reasons.length ? f.reasons.map((r) => r.label).join("; ") : f.intervalSource === "merchant_default" ? "Resolved by merchant" : "In reorder window",
                <>{!hard && tab !== "review" && (tab === "eligible" || merchant) && <Button size="small" variant="tertiary" isDisabled={launched} onClick={() => update((s) => toggleExclude(s, f.customer.id))}>{merchant ? "Include" : "Exclude"}</Button>}{tab === "review" && <Button size="small" variant="secondary" onClick={() => setOpen(f.customer.id)}>Inspect</Button>}</>,
              ] };
            })} />
        </div>
      </div>
      </TabPanel></Tabs>
      <p className="text-xs text-muted-foreground">Reasons may overlap; each customer appears once in a status tab. Holdout: {d.plan.holdout.length} of {d.plan.eligible.length} eligible ({d.plan.holdoutPct.toFixed(1)}%).</p>
      <Note>Merchant overrides cannot bypass consent, refund, recent-purchase, stock or frequency blocks. Holdout is assigned by a stable hash of customer and campaign ID only (hash threshold &lt;10%, not exactly 10% of the audience). Observed offer usage is not evidence that discounts caused purchases.</Note>
      <CustomerDrawer id={open} onClose={() => setOpen(null)} />
    </div>
  );
}
