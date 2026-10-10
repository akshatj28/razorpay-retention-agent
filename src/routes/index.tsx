import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Repeat, ShoppingBag, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KindTag, Note, PageHeader, Pill, RecLabel, Stat } from "@/components/retention/bits";
import { inr } from "@/retention/format";
import { useDemo } from "@/retention/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Retention opportunities — Retention Agent" },
      { name: "description", content: "Find customers approaching their reorder window and decide who to contact, what to recommend and which incentive to use." },
      { property: "og:title", content: "Retention opportunities — Retention Agent" },
      { property: "og:description", content: "A merchant workspace concept for replenishment campaigns with policy checks and illustrative forecasts." },
    ],
  }),
  component: Opportunities,
});

function Opportunities() {
  const { d, state } = useDemo();
  const p = d.plan;
  const reasonCount = (code: string) => p.excluded.filter((f) => f.reasons.some((r) => r.code === code)).length;
  const hardExcluded = p.excluded.filter((f) => f.reasons.some((r) => r.hard)).length;
  const avgInterval = Math.round(p.eligible.reduce((t, f) => t + (f.typicalInterval ?? 0), 0) / Math.max(1, p.eligible.length));

  return (
    <div className="space-y-5 animate-enter">
      <PageHeader title="Retention Agent" subtitle="Proposed extension for Razorpay Agent Studio · Everyday Essentials · Snapshot 10 Oct 2026" />

      <section className="panel rec-accent geo-accent overflow-hidden" aria-labelledby="opp-title">
        <div className="bg-card/90 p-5">
          <div className="flex items-center gap-2"><RecLabel>Recommended opportunity · simulated</RecLabel><Pill t="success">Playbook 1 · Implemented</Pill></div>
          <h2 id="opp-title" className="mt-3 font-heading text-[22px] font-semibold">Bring back customers approaching their reorder window.</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {p.eligible.length} customers are inside their personal reorder window for a product they buy repeatedly, have consent, and pass refund, stock and contact-frequency checks.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-6 md:grid-cols-4">
            <Stat label="Eligible customers" kind="derived" value={p.eligible.length} hint={`${p.contacted.length} to contact · ${p.holdout.length} holdout · ${p.noOutreach.length} no outreach`} />
            <Stat label="Excluded" kind="derived" value={p.excluded.length} hint={`${hardExcluded} by hard policy blocks`} />
            <Stat label="Needs review" kind="derived" value={p.review.length} hint="Insufficient purchase history" />
            <Stat label="Expected contribution" kind="forecast" value={inr(p.totals.expected)} hint={`Exposure ${inr(p.totals.exposure)} of ${inr(state.config.budget)} budget`} />
          </div>
          <div className="mt-5 flex items-center gap-3">
            <Button asChild size="lg"><Link to="/cohort">Review opportunity <ArrowRight className="size-4" aria-hidden /></Link></Button>
            <span className="text-xs text-muted-foreground">Next: inspect cohort evidence and exclusions</span>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="panel p-5">
          <h2 className="section-title">Supporting signals</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between gap-4"><span>Typical reorder interval across eligible customers (median of each customer’s own purchases)</span><span className="num font-medium">{avgInterval} days</span></li>
            <li className="flex justify-between gap-4"><span>Reorder-window tolerance</span><span className="num font-medium">±{state.config.tolerancePct}%</span></li>
            <li className="flex justify-between gap-4"><span>Excluded for no consent / opt-out</span><span className="num font-medium">{reasonCount("no_consent")}</span></li>
            <li className="flex justify-between gap-4"><span>Excluded for unresolved refund</span><span className="num font-medium">{reasonCount("refund_pending")}</span></li>
            <li className="flex justify-between gap-4"><span>Excluded: relevant product out of stock</span><span className="num font-medium">{reasonCount("out_of_stock")}</span></li>
            <li className="flex justify-between gap-4"><span>Excluded: contacted within {state.config.freqDays} days</span><span className="num font-medium">{reasonCount("frequency")}</span></li>
            <li className="flex justify-between gap-4"><span>Outside reorder window (not due, or win-back)</span><span className="num font-medium">{reasonCount("outside_window")}</span></li>
          </ul>
          <div className="mt-4"><Note>Forecast figures are illustrative, computed from explicit fixture assumptions <KindTag kind="forecast" />. They are not evidence of causal uplift.</Note></div>
        </section>
        <section className="space-y-3" aria-label="Preview playbooks">
          {[{ icon: ShoppingBag, t: "Cross-sell complementary products", b: "e.g. filters for coffee-bean buyers." }, { icon: Undo2, t: "Win-back lapsed customers", b: "Customers past their reorder window." }].map((c) => (
            <div key={c.t} className="panel p-4 opacity-80">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2 font-medium"><c.icon className="size-4 text-muted-foreground" aria-hidden />{c.t}</div><Pill>Preview · not implemented</Pill></div>
              <p className="mt-1 text-xs text-muted-foreground">{c.b} Shown for direction only; no recommendations are generated.</p>
            </div>
          ))}
          <div className="panel p-4 text-xs text-muted-foreground"><div className="flex items-center gap-2 font-medium text-foreground"><Repeat className="size-4" aria-hidden />Campaign status</div><p className="mt-1 capitalize">{state.campaign.status}{state.campaign.queue ? ` · ${Object.keys(state.campaign.sent).length}/${state.campaign.queue.length} sent` : ""}</p></div>
        </section>
      </div>
    </div>
  );
}
