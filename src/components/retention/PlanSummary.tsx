import { useDemo } from "@/retention/store";
import { inr } from "@/retention/format";
import { Note, RecLabel, Stat } from "./bits";

export function PlanSummary() {
  const { d, state } = useDemo();
  const p = d.plan;
  const r = p.recommended;
  const history = r.rows.filter((row) => row.feature.intervalSource !== "merchant_default").length;
  const mix = [0, 10, 20].map((offer) => ({ offer, count: r.rows.filter((row) => row.offerPct === offer).length })).filter((x) => x.count);
  return (
    <section className="rec-accent border-y bg-primary-subtle px-4 py-5" aria-labelledby="recommended-plan">
      <RecLabel />
      <h2 id="recommended-plan" className="section-title mt-2">Recommended plan—and why</h2>
      <p className="mt-2 text-lg font-semibold">{r.launchable ? `Contact ${r.rows.length} customers about replenishing their previously purchased product.` : "Do not launch yet: the recommended mix needs constraints resolved."}</p>
      <p className="mt-2 text-sm">{mix.map((x) => `${x.count} ${x.offer ? `with ${x.offer}% off` : "with no discount"}`).join(" · ") || "No permitted positive-contribution offers"}. {r.noOutreach.length} no-outreach decisions · {p.holdout.length} holdout ({p.holdoutPct.toFixed(1)}% of {p.eligible.length} eligible).</p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label={r.launchable ? "Executable forecast contribution" : "Counterfactual contribution · not executable"} value={inr(r.totals.expected)} kind="forecast" />
        <Stat label="Exposure / budget" value={`${inr(r.totals.exposure)} / ${inr(state.config.budget)}`} />
        <Stat label="Constraint status" value={r.launchable ? "Ready for review" : "Blocked"} hint="Merchant approval still required" />
      </div>
      <p className="mt-4 text-sm"><b>Observed evidence:</b> {history} proposed contacts have history-derived purchase intervals; {r.rows.length - history} use merchant-resolved product defaults. All proposed contacts pass consent, refund, recent-purchase, stock and frequency checks and fall within the reorder window.</p>
      <p className="mt-2 text-sm"><b>Forecast assumptions:</b> offer choice maximises permitted positive contribution under the same per-product fixture probabilities for every customer buying that product—not learned customer predictions. Budget is a separate gate, not an optimiser; no partial sends.</p>
      {!r.launchable && <div className="mt-2"><Note t="warning">{r.blockers.join(". ")}.</Note></div>}
      <p className="mt-2 text-xs text-muted-foreground">This recommendation ignores merchant offer overrides; the selected plan below retains {Object.keys(state.overrides).length} overrides. No probability assumptions were changed to favour the mix. Forecast rankings are not causal uplift.</p>
    </section>
  );
}