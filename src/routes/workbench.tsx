import { CellTable } from "@/components/retention/DataTable";
import { SelectField } from "@/components/retention/SelectField";
import { LinkButton } from "@/components/retention/LinkButton";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Lock, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@razorpay/blade/components";
import { TextInput } from "@razorpay/blade/components";
import { PlanSummary } from "@/components/retention/PlanSummary";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Campaign decision workbench — Retention Agent" },
      {
        name: "description",
        content:
          "Choose who, what and which incentive using customer-level expected contribution, budget and policy constraints.",
      },
      { property: "og:title", content: "Campaign decision workbench — Retention Agent" },
      {
        property: "og:description",
        content:
          "Compare no discount, 10% and 20% offers with illustrative, inspectable assumptions.",
      },
    ],
  }),
  component: Workbench,
});

const modeLabel = (m: OfferMode) =>
  m === "recommended" ? "Recommended mix" : m === 0 ? "Uniform: no discount" : `Uniform: ${m}%`;

function NumField({
  id,
  label,
  value,
  onChange,
  suffix,
  disabled,
  min = 0,
  max,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <TextInput
      label={label}
      name={id}
      type="number"
      value={String(value)}
      {...(suffix ? { suffix } : {})}
      isDisabled={disabled ?? false}
      onChange={({ value: raw }) => {
        const n = Number(raw);
        if (raw?.trim() && Number.isFinite(n) && n >= min && (max == null || n <= max)) onChange(n);
      }}
    />
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
  const heroF = d.byId.get("CUS-0001");
  const secondF = d.byId.get("CUS-0002");
  const blocked = p.checks.filter((c) => c.status === "blocked");

  return (
    <div className="space-y-4 animate-enter">
      <PageHeader
        title="Build a contribution-first campaign."
        subtitle={
          <>
            Decision workbench · Replenishment{" "}
            <Pill t="success" className="ml-1">
              Working demo
            </Pill>
          </>
        }
        actions={<LinkButton to="/review">Review & approve</LinkButton>}
      />
      {launched && (
        <Note t="warning">
          <Lock className="mr-1 inline size-3" aria-hidden />
          Campaign launched — audience, offers and policy settings are locked. Reset the demo to
          edit.
        </Note>
      )}
      {state.campaign.invalidatedNotice && (
        <Note t="warning">
          Approval was invalidated by your last change. Review and approve again before launch.
        </Note>
      )}

      <PlanSummary />
      <div data-tour="decisions" className="grid gap-4 lg:grid-cols-3">
        <section className="panel p-4" aria-labelledby="who">
          <div className="label-text">1 · WHO</div>
          <h2 id="who" className="section-title">
            Selected cohort
          </h2>
          <dl className="num mt-3 grid grid-cols-2 gap-y-1.5 text-sm">
            <dt className="text-muted-foreground">Eligible</dt>
            <dd className="text-right font-medium">{p.eligible.length}</dd>
            <dt className="text-muted-foreground">Holdout (no contact)</dt>
            <dd className="text-right font-medium">
              {p.holdout.length} ({p.holdoutPct.toFixed(1)}%)
            </dd>
            <dt className="text-muted-foreground">No-outreach decision</dt>
            <dd className="text-right font-medium">{p.noOutreach.length}</dd>
            <dt className="font-medium">To contact</dt>
            <dd className="text-right font-semibold">{p.contacted.length}</dd>
            <dt className="text-muted-foreground">Excluded / Needs review</dt>
            <dd className="text-right">
              {p.excluded.length} / {p.review.length}
            </dd>
          </dl>
          <Link to="/cohort" className="mt-3 inline-block text-xs text-primary hover:underline">
            Edit cohort
          </Link>
        </section>

        <section className="panel p-4" aria-labelledby="what">
          <div className="label-text">2 · WHAT</div>
          <h2 id="what" className="section-title">
            Product, timing & message
          </h2>
          <p className="mt-2 text-sm">
            Each customer’s previously purchased, in-stock relevant product.
          </p>
          <div className="mt-3">
            <SelectField
              label="Send timing"
              value={cfg.timing}
              isDisabled={launched}
              onChange={(value) => set({ timing: value })}
              options={[
                { value: "10:00 IST", label: "Today, 10:00 IST" },
                { value: "18:30 IST", label: "Today, 18:30 IST" },
                { value: "Tomorrow 10:00 IST", label: "Tomorrow, 10:00 IST" },
              ]}
            />
          </div>
          {hero && (
            <div className="mt-3 rounded-md border bg-surface p-2.5 text-xs">
              <div className="mb-1 flex items-center gap-1 font-medium">
                <MessageCircle className="size-3.5" aria-hidden />
                Simulated WhatsApp preview
              </div>
              <p className="leading-relaxed">{hero.message}</p>
            </div>
          )}
        </section>

        <section className="panel p-4" aria-labelledby="inc">
          <div className="label-text">3 · INCENTIVE</div>
          <h2 id="inc" className="section-title">
            Offer & constraints
          </h2>
          <div className="mt-2">
            <SelectField
              label="Offer selection"
              value={String(cfg.offerMode)}
              isDisabled={launched}
              onChange={(value) =>
                set({
                  offerMode: value === "recommended" ? "recommended" : (Number(value) as OfferPct),
                })
              }
              options={(["recommended", 0, 10, 20, 30] as OfferMode[]).map((mode) => ({
                value: String(mode),
                label: modeLabel(mode),
              }))}
            />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <NumField
              id="budget"
              label="Campaign budget (Rs)"
              value={cfg.budget}
              disabled={launched}
              onChange={(n) => set({ budget: n })}
            />
            <NumField
              id="maxd"
              label="Max discount"
              suffix="%"
              value={cfg.maxDiscount}
              max={50}
              disabled={launched}
              onChange={(n) => set({ maxDiscount: n })}
            />
            <NumField
              id="floor"
              label="Min contribution / order"
              suffix="Rs"
              value={cfg.minContribution}
              disabled={launched}
              onChange={(n) => set({ minContribution: n })}
            />
            <NumField
              id="freq"
              label="Contact limit: 1 per"
              suffix="days"
              min={1}
              max={60}
              value={cfg.freqDays}
              disabled={launched}
              onChange={(n) => set({ freqDays: n })}
            />
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section className="panel p-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Compare offer strategies</h2>
            <KindTag kind="forecast" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Same {p.comparisonAudienceIds.length} eligible customers · Same assumptions · Approval
            required
          </p>
          <details className="mt-2 text-xs">
            <summary className="cursor-pointer font-medium">
              Comparison methodology & audience
            </summary>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Every strategy evaluates the same eligible non-holdout IDs after exclusions and review
              resolution. No outreach has zero forecast contribution, exposure and cost. Baselines
              ignore offer overrides; your selected plan retains them. Invalid strategies are
              counterfactuals, not executable alternatives.
            </p>
            <p className="mt-2 break-words">
              {p.comparisonAudienceIds.join(", ") || "Empty audience"}
            </p>
          </details>
          {[true, false].map((valid) => (
            <div key={String(valid)} className="mt-3">
              <h3 className="text-sm font-semibold">
                {valid
                  ? "Executable strategies · approval required"
                  : "Invalid counterfactuals · cannot launch"}
              </h3>
              <div className="overflow-x-auto">
                <CellTable
                  label={valid ? "Executable offer strategies" : "Invalid offer counterfactuals"}
                  minWidth={820}
                  headings={[
                    { label: "Strategy", width: "minmax(160px, 1.2fr)" },
                    { label: "Audience", align: "center" },
                    { label: "Contact / no outreach", align: "center" },
                    {
                      label: valid ? "Forecast contribution" : "Counterfactual contribution",
                      align: "right",
                    },
                    { label: "Exposure", align: "right" },
                    { label: "Launchability", width: "minmax(190px, 1.5fr)" },
                  ]}
                  rows={p.comparison
                    .filter((c) => c.launchable === valid)
                    .map((c) => ({
                      id: String(c.mode),
                      cells: [
                        modeLabel(c.mode),
                        p.comparisonAudienceIds.length,
                        `${c.rows.length} / ${c.noOutreach.length}`,
                        inr(c.totals.expected),
                        inr(c.totals.exposure),
                        valid ? (
                          "Yes, after approval"
                        ) : (
                          <span className="text-destructive">No · {c.blockers.join("; ")}</span>
                        ),
                      ],
                    }))}
                />
              </div>
              {!p.comparison.some((c) => c.launchable === valid) && (
                <p className="mt-1 text-xs text-muted-foreground">
                  None under the current constraints.
                </p>
              )}
            </div>
          ))}
          <div className="mt-3 border-t pt-3">
            <div className="grid min-w-0 gap-2">
              <span className="text-sm font-medium">Selected plan: {modeLabel(cfg.offerMode)}</span>
              <span className="num text-sm">
                Exposure <b>{inr(p.totals.exposure)}</b> / budget {inr(cfg.budget)}
              </span>
            </div>
            <ul className="mt-2 space-y-1">
              {p.checks
                .filter((c) => ["cap", "floor", "budget", "audience"].includes(c.id))
                .map((c) => (
                  <li key={c.id} className="flex items-start gap-2 text-xs">
                    <CheckPill s={c.status} />
                    <span>
                      <b>{c.label}.</b> {c.detail}
                    </span>
                  </li>
                ))}
            </ul>
            {blocked.length === 0 && <p className="mt-2 text-xs text-success">Ready for review.</p>}
          </div>
        </section>

        <details data-tour="economics" className="panel p-4">
          <summary className="section-title cursor-pointer">Calculation & assumptions</summary>
          <p className="mt-2 rounded bg-muted px-2 py-1.5 font-mono text-xs">
            E = P(purchase) × (contribution before incentive − discount) − messaging cost (Rs{" "}
            {MESSAGE_COST})
          </p>
          {[heroF, secondF]
            .filter((f) => f !== undefined)
            .map((f, i) => {
              const evals = [0, 10, 20, 30].map((x) => {
                const pr = f.relevantProduct;
                const disc = Math.round((pr.price * x) / 100);
                const c = pr.price - pr.variableCost;
                const pp = pr.probs[x as OfferPct];
                return {
                  x,
                  disc,
                  c,
                  pp,
                  e: pp * (c - disc) - MESSAGE_COST,
                  ok: x <= cfg.maxDiscount && c - disc >= cfg.minContribution,
                };
              });
              const best = evals.filter((e) => e.ok).sort((a, b) => b.e - a.e)[0];
              return (
                <div key={f.customer.id} className="mt-3">
                  <div className="text-xs font-medium">
                    {i === 0 ? "Hero fixture" : "Second fixture"}: {f.customer.name} —{" "}
                    {f.relevantProduct.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Basket {inr(f.relevantProduct.price)} · contribution before incentive{" "}
                    {inr(f.relevantProduct.price - f.relevantProduct.variableCost)} (after assumed
                    variable order costs)
                  </div>
                  <div className="overflow-x-auto">
                    <CellTable
                      label={`Offer calculations for ${f.customer.name}`}
                      minWidth={450}
                      headings={[
                        { label: "Offer" },
                        { label: "P", align: "right" },
                        { label: "Discount", align: "right" },
                        { label: "E / contact", align: "right" },
                        { label: "Status", align: "right" },
                      ]}
                      rows={evals.map((e) => ({
                        id: String(e.x),
                        cells: [
                          e.x === 0 ? "No discount" : `${e.x}%`,
                          pct(e.pp),
                          inr(e.disc),
                          <span className={best?.x === e.x ? "font-semibold" : ""}>
                            {inr(e.e)}
                          </span>,
                          !e.ok ? (
                            <Pill t="danger">Blocked</Pill>
                          ) : best?.x === e.x ? (
                            <RecLabel>Best</RecLabel>
                          ) : (
                            "Permitted"
                          ),
                        ],
                      }))}
                    />
                  </div>
                </div>
              );
            })}
          <div className="mt-3">
            <Note>
              Purchase probabilities are per-product fixture assumptions shared by all customers
              buying that product, not measured or learned customer-level predictions. Customer
              purchase history determines eligibility and product selection, not P. A higher
              forecast is not evidence of causal uplift; the holdout exists to test that later.
            </Note>
          </div>
        </details>
      </div>

      <details className="panel overflow-hidden">
        <summary className="cursor-pointer p-4">
          <span className="section-title">Customer-level actions</span>
          <span className="ml-2 text-xs text-muted-foreground">
            {p.contacted.length} proposed contacts · {p.noOutreach.length} no outreach
          </span>
        </summary>
        <div className="max-h-80 overflow-auto">
          <CellTable
            label="Customer-level campaign actions"
            minWidth={1050}
            headings={[
              { label: "Customer", width: "minmax(170px, 1fr)" },
              { label: "Product", width: "minmax(160px, 1fr)" },
              { label: "Recommended", align: "right" },
              { label: "Applied offer", width: "minmax(190px, 1.2fr)" },
              { label: "E / contact", align: "right" },
              { label: "Exposure", align: "right" },
              { label: "Status", width: "minmax(170px, 1fr)" },
            ]}
            rows={[
              ...p.contacted.map((r) => ({
                id: r.feature.customer.id,
                cells: [
                  <Button
                    variant="tertiary"
                    size="small"
                    onClick={() => setOpen(r.feature.customer.id)}
                  >
                    {r.feature.customer.name}
                  </Button>,
                  r.product.name,
                  r.rec.offerPct === null
                    ? "No outreach"
                    : r.rec.offerPct === 0
                      ? "No discount"
                      : `${r.rec.offerPct}%`,
                  <div>
                    <SelectField
                      value={String(r.offerPct)}
                      isDisabled={launched}
                      accessibilityLabel={`Offer for ${r.feature.customer.name}`}
                      onChange={(value) =>
                        update((s) =>
                          setOverride(s, r.feature.customer.id, Number(value) as OfferPct),
                        )
                      }
                      options={[0, 10, 20, 30].map((x) => ({
                        value: String(x),
                        label: x === 0 ? "No discount" : `${x}%`,
                      }))}
                    />
                    {r.source === "override" && (
                      <Button
                        size="small"
                        variant="tertiary"
                        isDisabled={launched}
                        onClick={() => update((s) => setOverride(s, r.feature.customer.id, null))}
                      >
                        Clear override
                      </Button>
                    )}
                  </div>,
                  inr(r.evaluation.expectedContribution, true),
                  inr(r.exposure),
                  r.valid ? (
                    <CheckPill s="passed" />
                  ) : (
                    <span>
                      <CheckPill s="blocked" /> {r.blockReason}
                    </span>
                  ),
                ],
              })),
              ...p.noOutreach.map((n) => ({
                id: n.feature.customer.id,
                cells: [
                  <Button
                    variant="tertiary"
                    size="small"
                    onClick={() => setOpen(n.feature.customer.id)}
                  >
                    {n.feature.customer.name}
                  </Button>,
                  n.feature.relevantProduct.name,
                  "No outreach",
                  "—",
                  "—",
                  "—",
                  n.rec.explanation,
                ],
              })),
            ]}
          />
        </div>
      </details>
      <CustomerDrawer id={open} onClose={() => setOpen(null)} />
    </div>
  );
}
