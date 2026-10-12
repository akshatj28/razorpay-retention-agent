import { useDemo } from "@/retention/store";
import { inr } from "@/retention/format";
import { Note, RecLabel, Stat } from "./bits";
import { CheckCircle2, ChevronDown, ShieldCheck } from "lucide-react";

export function PlanSummary() {
  const { d, state } = useDemo();
  const p = d.plan;
  const r = p.recommended;
  const history = r.rows.filter((row) => row.feature.intervalSource !== "merchant_default").length;
  const mix = [0, 10, 20].map((offer) => ({ offer, count: r.rows.filter((row) => row.offerPct === offer).length })).filter((x) => x.count);
  return (
    <section className="panel overflow-hidden" aria-labelledby="recommended-plan">
      <div className="bg-primary-subtle/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2"><RecLabel /><span className="flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="size-4" aria-hidden />Approval required</span></div>
        <h2 id="recommended-plan" className="mt-3 font-heading text-2xl font-semibold">{r.launchable ? `A timely reminder for ${r.rows.length} customers.` : "Resolve constraints before launch."}</h2>
        <div className="mt-3 flex flex-wrap gap-2">{mix.map((x) => <span key={x.offer} className="rounded-full border bg-card px-3 py-1 text-sm"><b className="num">{x.count}</b> {x.offer ? `with ${x.offer}% off` : "without a discount"}</span>)}<span className="self-center text-xs text-muted-foreground">{r.noOutreach.length} no outreach · {p.holdout.length} holdout ({p.holdoutPct.toFixed(1)}%)</span></div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat label={r.launchable ? "Forecast contribution" : "Counterfactual · not executable"} value={inr(r.totals.expected)} kind="forecast" />
          <Stat label="Exposure / budget" value={`${inr(r.totals.exposure)} / ${inr(state.config.budget)}`} />
          <div><div className="label-text">Policy status</div><div className={`mt-2 flex items-center gap-2 font-medium ${r.launchable ? "text-success" : "text-warning"}`}><CheckCircle2 className="size-5" aria-hidden />{r.launchable ? "Ready for your review" : "Blocked"}</div></div>
        </div>
        {!r.launchable && <div className="mt-3"><Note t="warning">{r.blockers.join(". ")}.</Note></div>}
      </div>
      <details className="evidence-disclosure border-t px-5 py-3">
        <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">Why this plan? <ChevronDown className="size-4" aria-hidden /></summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
          <p><b className="text-foreground">Evidence:</b> {history} contacts use purchase-history intervals; {r.rows.length - history} use merchant-resolved defaults. All pass consent, refund, recent-purchase, stock and frequency checks.</p>
          <p><b className="text-foreground">Assumptions:</b> offers maximise positive permitted contribution using shared per-product demo probabilities, not learned customer predictions. Budget is a separate gate, not an optimiser; no partial sends. Forecast rankings are not causal uplift.</p>
          <p><b className="text-foreground">Your edits:</b> this recommendation excludes overrides. The selected plan below retains {Object.keys(state.overrides).length} merchant overrides.</p>
        </div>
      </details>
    </section>
  );
}
