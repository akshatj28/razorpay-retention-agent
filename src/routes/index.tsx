import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Clock3, Repeat2, ShieldCheck, ShoppingBag, Undo2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Pill, RecLabel } from "@/components/retention/bits";
import { inr } from "@/retention/format";
import { useDemo } from "@/retention/store";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Retention opportunities — Retention Agent" },
    { name: "description", content: "Find the next repeat purchase. Review audiences, offers and safe campaign execution." },
  ] }),
  component: Opportunities,
});

function Opportunities() {
  const { d, state } = useDemo();
  const p = d.plan;
  const r = p.recommended;
  const total = p.eligible.length + p.excluded.length + p.review.length;
  const groups = [
    { label: "Ready to evaluate", count: p.eligible.length, color: "bg-primary", text: "text-primary" },
    { label: "Needs your review", count: p.review.length, color: "bg-warning", text: "text-warning" },
    { label: "Excluded", count: p.excluded.length, color: "bg-slate-300", text: "text-muted-foreground" },
  ];
  const mix = [0, 10, 20].map((offer) => ({ offer, count: r.rows.filter((row) => row.offerPct === offer).length })).filter((x) => x.count);
  const reasonCount = (code: string) => p.excluded.filter((f) => f.reasons.some((x) => x.code === code)).length;
  return (
    <div className="space-y-6 animate-enter">
      <PageHeader title="Make the next purchase happen." subtitle="Retention Agent · Everyday Essentials" actions={<span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="size-3.5" aria-hidden />10 Oct 2026 snapshot</span>} />
      <section data-tour="opportunity" className="relative overflow-hidden rounded-2xl bg-[#102b62] p-6 text-white sm:p-8" aria-labelledby="opp-title">
        <div className="pointer-events-none absolute -top-24 -right-16 size-80 rounded-full border-[48px] border-white/5" aria-hidden />
        <div className="relative grid gap-7 lg:grid-cols-[1.35fr_1fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2"><span className="flex size-9 items-center justify-center rounded-xl bg-white/10"><Repeat2 className="size-5" aria-hidden /></span><span className="text-xs font-medium tracking-widest text-blue-200 uppercase">Replenishment opportunity</span><span className="rounded-full bg-white/10 px-2 py-1 text-[11px]">Demo recommendation</span></div>
            <h2 id="opp-title" className="mt-5 max-w-lg font-heading text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">Right customer.<br />Right moment. Right offer.</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-blue-100">{p.eligible.length} customers are in their reorder window. Review who to contact and protect contribution—not just conversions.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3"><Button asChild size="lg" className="bg-white text-[#102b62] hover:bg-blue-50"><Link to="/cohort">Explore the cohort <ArrowRight className="size-4" aria-hidden /></Link></Button><span className="flex items-center gap-1.5 text-xs text-blue-100"><ShieldCheck className="size-4" aria-hidden />You approve before sending</span></div>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 p-5">
            <div className="text-xs text-blue-100">Agent's recommended plan · simulated</div>
            <div className="mt-2 flex items-baseline gap-2"><span className="num font-heading text-5xl font-semibold">{r.rows.length}</span><span className="text-sm text-blue-100">customers to contact</span></div>
            <div className="mt-4 space-y-2.5">{mix.map((x) => <div key={x.offer} className="flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><div className={x.offer ? "h-full rounded-full bg-cyan-300" : "h-full rounded-full bg-blue-300"} style={{ width: x.count / Math.max(1, r.rows.length) * 100 + "%" }} /></div><span className="num w-36 text-right text-xs">{x.count} · {x.offer ? x.offer + "% offer" : "no discount"}</span></div>)}</div>
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/15 pt-4"><div><div className="text-xs text-blue-100">Illustrative contribution</div><div className="num mt-1 text-2xl font-semibold">{inr(r.totals.expected)}</div></div><div><div className="text-xs text-blue-100">Maximum exposure</div><div className="num mt-1 text-2xl font-semibold">{inr(r.totals.exposure)}</div></div></div>
            <div className="mt-3 text-xs text-blue-100">{r.launchable ? "Ready for merchant review" : "Counterfactual only · blocked"} · Budget {inr(state.config.budget)}</div>
          </div>
        </div>
      </section>
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <section className="panel p-5 sm:p-6" aria-labelledby="audience-title">
          <div className="flex items-center justify-between"><h2 id="audience-title" className="section-title">Your customer base, filtered.</h2><Users className="size-5 text-muted-foreground" aria-hidden /></div>
          <div className="mt-5 flex items-baseline gap-2"><span className="num font-heading text-3xl font-semibold">{total}</span><span className="text-sm text-muted-foreground">demo customers</span></div>
          <div className="mt-4 flex h-3 gap-1 overflow-hidden rounded-full" role="img" aria-label={groups.map((g) => g.label + ": " + g.count).join(", ")}>{groups.filter((g) => g.count > 0).map((g) => <div key={g.label} className={g.color} style={{ width: g.count / Math.max(1, total) * 100 + "%" }} />)}</div>
          <div className="mt-5 grid grid-cols-3 gap-3">{groups.map((g) => <div key={g.label}><div className={"num text-2xl font-semibold " + g.text}>{g.count}</div><div className="mt-1 text-xs text-muted-foreground">{g.label}</div></div>)}</div>
          <p className="mt-5 border-t pt-3 text-xs text-muted-foreground">{p.holdout.length} holdout ({p.holdoutPct.toFixed(1)}% of eligible) · {r.noOutreach.length} recommended no-outreach decisions</p>
          <details className="evidence-disclosure mt-3">
            <summary className="flex cursor-pointer items-center justify-between text-xs font-medium">Explore exclusion signals <ChevronDown className="size-4" aria-hidden /></summary>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">{([["No consent / opt-out", "no_consent"], ["Refund unresolved", "refund_pending"], ["Product out of stock", "out_of_stock"], ["Contacted too recently", "frequency"], ["Outside reorder window", "outside_window"] ] as const).map(([label, code]) => <li key={code} className="flex justify-between"><span>{label}</span><span className="num font-medium text-foreground">{reasonCount(code)}</span></li>)}</ul>
            <p className="mt-3 text-xs text-muted-foreground">Reasons overlap; do not sum these counts. Reorder-window tolerance: ±{state.config.tolerancePct}%.</p>
          </details>
        </section>
        <section className="panel p-5 sm:p-6" aria-labelledby="decision-title">
          <RecLabel>Three decisions. One controlled campaign.</RecLabel>
          <h2 id="decision-title" className="section-title mt-3">From insight to action.</h2>
          <div className="mt-5 space-y-4">{[
            { n: "01", title: "Who is ready?", description: "Purchase rhythm, consent and eligibility." },
            { n: "02", title: "What should they buy?", description: "The relevant product, in stock, at the right time." },
            { n: "03", title: "Which offer makes sense?", description: "Compare incentives against contribution and budget." },
          ].map((x) => <div key={x.n} className="flex items-start gap-3"><span className="num flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-xs font-semibold text-primary">{x.n}</span><div><h3 className="text-sm font-semibold">{x.title}</h3><p className="mt-0.5 text-xs text-muted-foreground">{x.description}</p></div></div>)}</div>
          <Link to="/workbench" className="mt-5 flex items-center gap-1.5 text-sm font-medium text-primary">Open decision workbench <ArrowRight className="size-4" aria-hidden /></Link>
        </section>
      </div>
      <section aria-label="Playbooks"><div className="mb-3 flex items-center justify-between"><h2 className="section-title">Built for repeat growth.</h2><Pill>Campaign: {state.campaign.status}</Pill></div><div className="grid gap-4 sm:grid-cols-3">{[
        { icon: Repeat2, title: "Replenishment", description: "Bring back repeat-product buyers.", active: true },
        { icon: ShoppingBag, title: "Cross-sell", description: "Recommend the next complementary product.", active: false },
        { icon: Undo2, title: "Win-back", description: "Re-engage customers past their reorder window.", active: false },
      ].map((x) => <div key={x.title} className={"panel p-4 " + (x.active ? "border-primary/30" : "")}><div className="flex items-center justify-between"><x.icon className={"size-5 " + (x.active ? "text-primary" : "text-muted-foreground")} aria-hidden /><Pill t={x.active ? "success" : "neutral"}>{x.active ? "Working demo" : "Concept only"}</Pill></div><h3 className="mt-3 font-semibold">{x.title}</h3><p className="mt-1 text-xs text-muted-foreground">{x.description}</p></div>)}</div></section>
      <p className="text-xs text-muted-foreground">Illustrative forecasts, not measured uplift. Recommendations and execution are simulated; no real messages or payments.</p>
    </div>
  );
}
