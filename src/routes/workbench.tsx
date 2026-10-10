import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Lock, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerDrawer } from "@/components/retention/CustomerDrawer";
import { CheckPill, KindTag, Note, PageHeader, Pill, RecLabel } from "@/components/retention/bits";
import { editConfig, setOverride } from "@/retention/campaign";
import { MESSAGE_COST, type OfferPct } from "@/retention/data";
import { inr, pct } from "@/retention/format";
import type { OfferMode } from "@/retention/policy";
import { useDemo } from "@/retention/store";

export const Route = createFileRoute("/workbench")({
  head: () => ({
    meta: [
      { title: "Campaign decision workbench — Retention Agent" },
      { name: "description", content: "Choose who, what and which incentive using customer-level expected contribution, budget and policy constraints." },
      { property: "og:title", content: "Campaign decision workbench — Retention Agent" },
      { property: "og:description", content: "Compare no discount, 10% and 20% offers with illustrative, inspectable assumptions." },
    ],
  }),
  component: Workbench,
});

const modeLabel = (m: OfferMode) => (m === "recommended" ? "Recommended mix" : m === 0 ? "Uniform: no discount" : `Uniform: ${m}%`);

function NumField({ id, label, value, onChange, suffix, disabled, min = 0, max }: { id: string; label: string; value: number; onChange: (n: number) => void; suffix?: string; disabled?: boolean; min?: number; max?: number }) {
  return (
    <div>
      <label htmlFor={id} className="label-text">{label}</label>
      <div className="mt-1 flex items-center gap-1.5">
        <Input id={id} type="number" className="num h-8 w-24" value={value} min={min} max={max} disabled={disabled}
          onChange={(e) => { const n = Number(e.target.value); if (Number.isFinite(n) && n >= min && (max == null || n <= max)) onChange(n); }} />
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

function Workbench() {
  const { d, state, update } = useDemo();
  const [open, setOpen] = useState<string | null>(null);
  const cfg = state.config;
  const p = d.plan;
  const launched = state.campaign.queue !== null;
  const set = (patch: Partial<typeof cfg>) => update((s) => editConfig(s, patch));
  const hero = p.contacted.find((r) => r.feature.customer.id === "CUS-0001") ?? null;
  const heroF = d.byId.get("CUS-0001")!;
  const secondF = d.byId.get("CUS-0002")!;
  const blocked = p.checks.filter((c) => c.status === "blocked");

  return (
    <div className="space-y-4 animate-enter">
      <PageHeader title="Campaign decision workbench" subtitle={<>Replenishment playbook <Pill t="success" className="ml-1">First implemented playbook</Pill></>}
        actions={<Button asChild><Link to="/review">Review & approve <ArrowRight className="size-4" aria-hidden /></Link></Button>} />
      {launched && <Note t="warning"><Lock className="mr-1 inline size-3" aria-hidden />Campaign launched — audience, offers and policy settings are locked. Reset the demo to edit.</Note>}
      {state.campaign.invalidatedNotice && <Note t="warning">Approval was invalidated by your last change. Review and approve again before launch.</Note>}

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="panel p-4" aria-labelledby="who">
          <div className="label-text">1 · WHO</div>
          <h2 id="who" className="section-title">Selected cohort</h2>
          <dl className="num mt-3 grid grid-cols-2 gap-y-1.5 text-sm">
            <dt className="text-muted-foreground">Eligible</dt><dd className="text-right font-medium">{p.eligible.length}</dd>
            <dt className="text-muted-foreground">Holdout (no contact)</dt><dd className="text-right font-medium">{p.holdout.length}</dd>
            <dt className="text-muted-foreground">No-outreach decision</dt><dd className="text-right font-medium">{p.noOutreach.length}</dd>
            <dt className="font-medium">To contact</dt><dd className="text-right font-semibold">{p.contacted.length}</dd>
            <dt className="text-muted-foreground">Excluded / Needs review</dt><dd className="text-right">{p.excluded.length} / {p.review.length}</dd>
          </dl>
          <Link to="/cohort" className="mt-3 inline-block text-xs text-primary hover:underline">Edit cohort</Link>
        </section>

        <section className="panel p-4" aria-labelledby="what">
          <div className="label-text">2 · WHAT</div>
          <h2 id="what" className="section-title">Product, timing & message</h2>
          <p className="mt-2 text-sm">Each customer’s previously purchased, in-stock relevant product.</p>
          <div className="mt-3">
            <label className="label-text" htmlFor="timing">Send timing</label>
            <Select value={cfg.timing} disabled={launched} onValueChange={(v) => set({ timing: v })}>
              <SelectTrigger id="timing" className="mt-1 h-8 w-full"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="10:00 IST">Today, 10:00 IST</SelectItem><SelectItem value="18:30 IST">Today, 18:30 IST</SelectItem><SelectItem value="Tomorrow 10:00 IST">Tomorrow, 10:00 IST</SelectItem></SelectContent>
            </Select>
          </div>
          {hero && (
            <div className="mt-3 rounded-md border bg-surface p-2.5 text-xs">
              <div className="mb-1 flex items-center gap-1 font-medium"><MessageCircle className="size-3.5" aria-hidden />Simulated WhatsApp preview</div>
              <p className="leading-relaxed">{hero.message}</p>
            </div>
          )}
        </section>

        <section className="panel p-4" aria-labelledby="inc">
          <div className="label-text">3 · INCENTIVE</div>
          <h2 id="inc" className="section-title">Offer & constraints</h2>
          <div className="mt-2">
            <label className="label-text" htmlFor="mode">Offer selection</label>
            <Select value={String(cfg.offerMode)} disabled={launched} onValueChange={(v) => set({ offerMode: v === "recommended" ? "recommended" : (Number(v) as OfferPct) })}>
              <SelectTrigger id="mode" className="mt-1 h-8 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{(["recommended", 0, 10, 20] as OfferMode[]).map((m) => <SelectItem key={String(m)} value={String(m)}>{modeLabel(m)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <NumField id="budget" label="Campaign budget (Rs)" value={cfg.budget} disabled={launched} onChange={(n) => set({ budget: n })} />
            <NumField id="maxd" label="Max discount" suffix="%" value={cfg.maxDiscount} max={50} disabled={launched} onChange={(n) => set({ maxDiscount: n })} />
            <NumField id="floor" label="Min contribution / order" suffix="Rs" value={cfg.minContribution} disabled={launched} onChange={(n) => set({ minContribution: n })} />
            <NumField id="freq" label="Contact limit: 1 per" suffix="days" min={1} max={60} value={cfg.freqDays} disabled={launched} onChange={(n) => set({ freqDays: n })} />
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section className="panel p-4">
          <div className="flex items-center justify-between"><h2 className="section-title">Compare offer strategies</h2><KindTag kind="forecast" /></div>
          <table className="num mt-3 w-full text-sm">
            <thead className="text-xs text-muted-foreground"><tr className="border-b"><th className="py-1.5 text-left font-medium">Strategy</th><th className="px-2 text-right font-medium">Contacted</th><th className="px-2 text-right font-medium">Expected</th><th className="px-2 text-right font-medium">Exposure</th><th className="pl-2 text-right font-medium">Invalid offers</th></tr></thead>
            <tbody>{p.comparison.map((c) => (
              <tr key={String(c.mode)} className={`border-b last:border-0 ${c.mode === cfg.offerMode ? "bg-primary-subtle font-medium" : ""}`}>
                <td className="py-1.5">{modeLabel(c.mode)}{c.mode === "recommended" && <span className="ml-1"><RecLabel>Recommended</RecLabel></span>}</td>
                <td className="px-2 text-right">{c.totals.contacted}</td><td className="px-2 text-right">{inr(c.totals.expected)}</td>
                <td className={`px-2 text-right ${c.totals.exposure > cfg.budget ? "text-destructive" : ""}`}>{inr(c.totals.exposure)}</td>
                <td className="pl-2 text-right">{c.totals.invalid ? <span className="text-destructive">{c.totals.invalid} blocked</span> : "0"}</td>
              </tr>))}</tbody>
          </table>
          <p className="mt-2 text-xs text-muted-foreground">Sums of customer-level calculations. Uniform options contact every non-holdout eligible customer; customers whose uniform offer breaks the cap or floor are counted as invalid and would block launch. Customer-level overrides ({Object.keys(state.overrides).length}) are kept and never silently overwritten.</p>
          <div className="mt-3 rounded-md border p-3">
            <div className="flex items-center justify-between"><span className="text-sm font-medium">Current plan: {modeLabel(cfg.offerMode)}</span><span className="num text-sm">Exposure <b>{inr(p.totals.exposure)}</b> / budget {inr(cfg.budget)}</span></div>
            <ul className="mt-2 space-y-1">{p.checks.filter((c) => ["cap", "floor", "budget", "audience"].includes(c.id)).map((c) => <li key={c.id} className="flex items-start gap-2 text-xs"><CheckPill s={c.status} /><span><b>{c.label}.</b> {c.detail}</span></li>)}</ul>
            {blocked.length === 0 && <p className="mt-2 text-xs text-success">Ready for review.</p>}
          </div>
        </section>

        <section className="panel p-4">
          <div className="flex items-center justify-between"><h2 className="section-title">Calculation & assumptions</h2><KindTag kind="forecast" /></div>
          <p className="mt-2 rounded bg-muted px-2 py-1.5 font-mono text-xs">E = P(purchase) × (contribution before incentive − discount) − messaging cost (Rs {MESSAGE_COST})</p>
          {[heroF, secondF].map((f, i) => {
            const evals = [0, 10, 20].map((x) => {
              const pr = f.relevantProduct; const disc = Math.round((pr.price * x) / 100); const c = pr.price - pr.variableCost;
              const pp = pr.probs[x as OfferPct]; return { x, disc, c, pp, e: pp * (c - disc) - MESSAGE_COST, ok: x <= cfg.maxDiscount && c - disc >= cfg.minContribution };
            });
            const best = evals.filter((e) => e.ok).sort((a, b) => b.e - a.e)[0];
            return (
              <div key={f.customer.id} className="mt-3">
                <div className="text-xs font-medium">{i === 0 ? "Hero fixture" : "Second fixture"}: {f.customer.name} — {f.relevantProduct.name}</div>
                <div className="text-xs text-muted-foreground">Basket {inr(f.relevantProduct.price)} · contribution before incentive {inr(f.relevantProduct.price - f.relevantProduct.variableCost)} (after assumed variable order costs)</div>
                <table className="num mt-1 w-full text-xs">
                  <thead className="text-muted-foreground"><tr><th className="text-left font-medium">Offer</th><th className="text-right font-medium">P</th><th className="text-right font-medium">Discount</th><th className="text-right font-medium">E / contact</th><th className="text-right font-medium" /></tr></thead>
                  <tbody>{evals.map((e) => (
                    <tr key={e.x} className={best?.x === e.x ? "font-semibold" : ""}><td>{e.x === 0 ? "No discount" : `${e.x}%`}</td><td className="text-right">{pct(e.pp)}</td><td className="text-right">{inr(e.disc)}</td><td className="text-right">{inr(e.e)}</td><td className="text-right">{!e.ok ? <Pill t="danger">Blocked</Pill> : best?.x === e.x ? <RecLabel>Best</RecLabel> : null}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            );
          })}
          <div className="mt-3"><Note>Purchase probabilities are explicit fixture assumptions per product, not measured. A higher forecast is not evidence of causal uplift; the holdout exists to test that later.</Note></div>
        </section>
      </div>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between p-4 pb-2"><h2 className="section-title">Customer-level actions</h2><span className="text-xs text-muted-foreground">{p.contacted.length} contacted · {p.noOutreach.length} no outreach</span></div>
        <div className="max-h-80 overflow-auto">
          <table className="num w-full text-sm">
            <thead className="sticky top-0 bg-surface text-left text-xs text-muted-foreground"><tr className="border-b"><th className="px-4 py-2 font-medium">Customer</th><th className="px-2 font-medium">Product</th><th className="px-2 text-right font-medium">Recommended</th><th className="px-2 font-medium">Applied offer</th><th className="px-2 text-right font-medium">E / contact</th><th className="px-2 text-right font-medium">Exposure</th><th className="px-4 font-medium">Status</th></tr></thead>
            <tbody>
              {p.contacted.map((r) => (
                <tr key={r.feature.customer.id} className="border-b last:border-0">
                  <td className="px-4 py-1.5"><button type="button" className="text-primary hover:underline" onClick={() => setOpen(r.feature.customer.id)}>{r.feature.customer.name}</button></td>
                  <td className="px-2 text-xs">{r.product.name}</td>
                  <td className="px-2 text-right">{r.rec.offerPct === null ? "No outreach" : r.rec.offerPct === 0 ? "No discount" : `${r.rec.offerPct}%`}</td>
                  <td className="px-2">
                    <Select value={String(r.offerPct)} disabled={launched} onValueChange={(v) => update((s) => setOverride(s, r.feature.customer.id, Number(v) as OfferPct))}>
                      <SelectTrigger className="h-7 w-32 text-xs" aria-label={`Offer for ${r.feature.customer.name}`}><SelectValue /></SelectTrigger>
                      <SelectContent>{[0, 10, 20].map((x) => <SelectItem key={x} value={String(x)}>{x === 0 ? "No discount" : `${x}%`}</SelectItem>)}</SelectContent>
                    </Select>
                    {r.source === "override" && <button type="button" disabled={launched} className="ml-1 text-xs text-primary hover:underline" onClick={() => update((s) => setOverride(s, r.feature.customer.id, null))}>Clear override</button>}
                  </td>
                  <td className="px-2 text-right">{inr(r.evaluation.expectedContribution, true)}</td>
                  <td className="px-2 text-right">{inr(r.exposure)}</td>
                  <td className="px-4 text-xs">{r.valid ? <CheckPill s="passed" /> : <span className="flex items-center gap-1"><CheckPill s="blocked" />{r.blockReason}</span>}</td>
                </tr>
              ))}
              {p.noOutreach.map((n) => (
                <tr key={n.feature.customer.id} className="border-b bg-surface text-muted-foreground last:border-0">
                  <td className="px-4 py-1.5"><button type="button" className="hover:underline" onClick={() => setOpen(n.feature.customer.id)}>{n.feature.customer.name}</button></td>
                  <td className="px-2 text-xs">{n.feature.relevantProduct.name}</td><td className="px-2 text-right">No outreach</td><td className="px-2 text-xs" colSpan={4}>{n.rec.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <CustomerDrawer id={open} onClose={() => setOpen(null)} />
    </div>
  );
}
