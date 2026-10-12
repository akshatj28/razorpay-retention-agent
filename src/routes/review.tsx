import { CellTable } from "@/components/retention/DataTable";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Pause, Play, Rocket, Send, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useToast } from "@razorpay/blade/components";
import {
  Button,
  CheckCircleIcon,
  ZapIcon,
  SendIcon,
  PauseIcon,
  PlayIcon,
  ShoppingCartIcon,
} from "@razorpay/blade/components";
import { CustomerDrawer } from "@/components/retention/CustomerDrawer";
import { CheckPill, KindTag, Note, PageHeader, Pill, Stat } from "@/components/retention/bits";
import {
  BATCH_SIZE,
  approve,
  launch,
  organicPurchase,
  pause,
  recordOutcome,
  replayLast,
  resume,
  results,
  sendBatch,
  spentExposure,
  type CampaignStatus,
  type OutcomeType,
} from "@/retention/campaign";
import { productById } from "@/retention/data";
import { clockLabel, inr } from "@/retention/format";
import { useDemo } from "@/retention/store";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Review, approval & execution — Retention Agent" },
      {
        name: "description",
        content:
          "Approve, launch, pause and observe a simulated replenishment campaign with pre-send policy rechecks and an event timeline.",
      },
      { property: "og:title", content: "Review, approval & execution — Retention Agent" },
      {
        property: "og:description",
        content:
          "Controlled simulated execution with holdout, outcomes and forecast-versus-observed tracking.",
      },
    ],
  }),
  component: Review,
});

const STEPS: CampaignStatus[] = ["draft", "approved", "running", "completed"];
const resultTone = {
  ok: "success",
  skipped: "warning",
  blocked: "danger",
  ignored: "neutral",
  info: "info",
} as const;

function Review() {
  const toast = useToast();
  const { d, state, update, run } = useDemo();
  const [open, setOpen] = useState<string | null>(null);
  const c = state.campaign;
  const p = d.plan;
  const queue = c.queue;
  const r = results(state);
  const blocked = p.checks.filter((x) => x.status === "blocked");
  const doRun = (fn: Parameters<typeof run>[0], ok: string) => {
    const e = run(fn);
    toast.show({ content: e ?? ok, color: e ? "negative" : "positive" });
  };
  const name = (id: string | null) => (id ? (d.byId.get(id)?.customer.name ?? id) : "—");
  const outcomeBtn = (t: OutcomeType, id: string, label: string) => (
    <Button size="small" variant="secondary" onClick={() => update((s) => recordOutcome(s, t, id))}>
      {label}
    </Button>
  );

  let primary: React.ReactNode;
  if (c.status === "draft")
    primary = (
      <Button
        size="large"
        isDisabled={blocked.length > 0}
        onClick={() => doRun(approve, "Campaign approved")}
        icon={CheckCircleIcon}
      >
        Approve campaign
      </Button>
    );
  else if (c.status === "approved")
    primary = (
      <Button
        size="large"
        onClick={() => doRun(launch, "Campaign launched (simulated)")}
        icon={ZapIcon}
      >
        Launch campaign
      </Button>
    );
  else if (c.status === "running")
    primary = (
      <>
        <Button size="large" onClick={() => update(sendBatch)} icon={SendIcon}>
          Send next demo batch ({BATCH_SIZE})
        </Button>
        <Button variant="secondary" size="large" onClick={() => update(pause)} icon={PauseIcon}>
          Pause
        </Button>
      </>
    );
  else if (c.status === "paused")
    primary = (
      <>
        <Button size="large" onClick={() => doRun(resume, "Resumed")} icon={PlayIcon}>
          Resume
        </Button>
        <Button size="large" isDisabled>
          Send next demo batch
        </Button>
      </>
    );
  else primary = <Pill t="success">Completed</Pill>;

  return (
    <div data-tour="outcomes" className="space-y-4 animate-enter">
      <PageHeader
        title="Review & execution"
        subtitle={`Replenishment campaign · ${state.config.timing} · simulated WhatsApp`}
        actions={primary}
      />

      <ol
        data-tour="approval"
        className="panel flex flex-wrap items-center gap-2 px-4 py-2.5 text-sm"
        aria-label="Campaign state"
      >
        {STEPS.map((s, i) => {
          const idx = STEPS.indexOf(c.status === "paused" ? "running" : c.status);
          return (
            <li key={s} className="flex items-center gap-2">
              <span
                className={`flex size-5 items-center justify-center rounded-full text-xs ${i <= idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {i + 1}
              </span>
              <span
                className={`capitalize ${i === idx ? "font-semibold" : "text-muted-foreground"}`}
              >
                {s === "running" && c.status === "paused" ? "Paused" : s}
              </span>
              {i < STEPS.length - 1 && <span className="mx-2 h-px w-8 bg-border" aria-hidden />}
            </li>
          );
        })}
        {c.status === "draft" && blocked.length > 0 && (
          <span className="ml-auto text-xs text-destructive">
            {blocked.length} blocked check{blocked.length > 1 ? "s" : ""} — approval disabled
          </span>
        )}
        {c.status === "approved" && (
          <span className="ml-auto text-xs text-muted-foreground">
            Any edit to audience, offer, timing or policy invalidates approval.
          </span>
        )}
      </ol>
      {c.invalidatedNotice && c.status === "draft" && (
        <Note t="warning">
          Approval was invalidated by a change after approval. Review the plan below and approve
          again.
        </Note>
      )}

      {!queue ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <section className="panel p-4">
            <h2 className="section-title">Final plan</h2>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Stat
                label="Audience"
                kind="derived"
                value={p.contacted.length}
                hint={`Holdout ${p.holdout.length} · no outreach ${p.noOutreach.length}`}
              />
              <Stat
                label="Budget exposure"
                kind="derived"
                value={inr(p.totals.exposure)}
                hint={`Budget ${inr(state.config.budget)}`}
              />
              <Stat
                label={blocked.length ? "Counterfactual · blocked plan" : "Forecast contribution"}
                kind="forecast"
                value={inr(p.totals.expected)}
                hint="Net of messaging cost"
              />
            </div>
            <div className="mt-4 text-sm">
              <div className="label-text mb-1">Offer summary</div>
              {[0, 10, 20, 30].map((x) => {
                const n = p.contacted.filter((r2) => r2.offerPct === x).length;
                return n ? (
                  <div key={x} className="num flex justify-between">
                    <span>{x === 0 ? "No-discount reminder" : `${x}% offer`}</span>
                    <span>{n} customers</span>
                  </div>
                ) : null;
              })}
              <div className="num flex justify-between text-muted-foreground">
                <span>Excluded / needs review</span>
                <span>
                  {p.excluded.length} / {p.review.length}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <div className="label-text mb-1">Message previews (simulated)</div>
              <ul className="space-y-2">
                {p.contacted.slice(0, 2).map((r2) => (
                  <li
                    key={r2.feature.customer.id}
                    className="rounded-md border bg-surface p-2 text-xs"
                  >
                    <b>{r2.feature.customer.name}</b>: {r2.message}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <Note>
                Assumptions: per-product fixture purchase probabilities, Rs 1 per message, exposure
                = maximum discount liability + messaging. Holdout {p.holdout.length} of{" "}
                {p.eligible.length} eligible ({p.holdoutPct.toFixed(1)}%) by stable hash threshold
                &lt;10%, not an exact-size sample; experimental design only — not proof of uplift.
              </Note>
            </div>
          </section>
          <section className="panel p-4">
            <h2 className="section-title">Policy checks</h2>
            <ul className="mt-3 space-y-2.5">
              {p.checks.map((x) => (
                <li key={x.id} className="flex items-start gap-3 text-sm">
                  <CheckPill s={x.status} />
                  <div>
                    <div className="font-medium">{x.label}</div>
                    <div className="text-xs text-muted-foreground">{x.detail}</div>
                  </div>
                </li>
              ))}
              <li className="flex items-start gap-3 text-sm">
                <CheckPill s={c.status === "approved" && d.approvalValid ? "passed" : "blocked"} />
                <div>
                  <div className="font-medium">Merchant approval</div>
                  <div className="text-xs text-muted-foreground">
                    {c.status === "approved"
                      ? "Approved for this exact plan."
                      : "Launch is blocked until approved."}
                  </div>
                </div>
              </li>
            </ul>
          </section>
        </div>
      ) : (
        <>
          <section className="panel p-4">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Outcome tracking</h2>
              <span className="text-xs text-muted-foreground">
                Simulated events · sent {r.sent}/{queue.length} · exposure used{" "}
                {inr(spentExposure(state))} of {inr(state.config.budget)}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-6">
              <Stat
                label="Sent"
                kind="observed"
                value={r.sent}
                hint={`${r.skipped} skipped at recheck`}
              />
              <Stat
                label="Delivered / failed"
                kind="observed"
                value={`${r.delivered} / ${r.failed}`}
              />
              <Stat
                label="Attributed orders"
                kind="observed"
                value={r.attributedOrders}
                hint={`${r.optOuts} opt-outs`}
              />
              <Stat
                label="Realised contribution"
                kind="observed"
                value={inr(r.realised)}
                hint="From synthetic orders"
              />
              <Stat label="Message cost" kind="observed" value={inr(r.messaging)} />
              <Stat
                label="Forecast vs observed"
                value={
                  <span className="text-base">
                    {inr(r.forecast)} → {inr(r.observedNet)}
                  </span>
                }
                hint="Net, for sent customers"
              />
            </div>
            <div className="mt-3">
              <Note t="warning">
                Insufficient evidence to estimate uplift. Attributed purchases are not incremental
                revenue; with {r.sent} sends and {p.holdout.length} holdout customers no causal
                estimate is made. Outcomes are recorded for future evaluation — no model is
                retrained.
              </Note>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            <section className="panel overflow-hidden">
              <div className="flex items-center justify-between p-4 pb-2">
                <h2 className="section-title">Send queue</h2>
                <Button
                  size="small"
                  variant="tertiary"
                  isDisabled={!c.lastOutcome}
                  onClick={() => update(replayLast)}
                >
                  Replay last outcome event
                </Button>
              </div>
              <div className="max-h-[420px] overflow-auto">
                <CellTable
                  label="Campaign send queue"
                  minWidth={820}
                  headings={[
                    { label: "Customer", width: "minmax(180px, 1fr)" },
                    { label: "Offer", width: "80px" },
                    { label: "State", width: "minmax(160px, 1fr)" },
                    { label: "Simulate", width: "minmax(350px, 2fr)" },
                  ]}
                  rows={queue.map((q, i) => {
                    const sent = c.sent[q.customerId];
                    const o = c.outcomes[q.customerId] ?? {};
                    const skipped = !sent && i < c.cursor;
                    return {
                      id: q.customerId,
                      cells: [
                        <div>
                          <Button
                            variant="tertiary"
                            size="small"
                            onClick={() => setOpen(q.customerId)}
                          >
                            {name(q.customerId)}
                          </Button>
                          <div className="text-xs text-muted-foreground">
                            {productById(q.productId).name}
                          </div>
                        </div>,
                        q.offerPct ? `${q.offerPct}%` : "None",
                        sent ? (
                          <span className="flex flex-wrap gap-1">
                            <Pill t="info">Sent</Pill>
                            {o.delivered && <Pill t="success">Delivered</Pill>}
                            {o.failed && <Pill t="danger">Failed</Pill>}
                            {o.purchased && <Pill t="success">Purchased</Pill>}
                            {o.optedOut && <Pill t="warning">Opted out</Pill>}
                          </span>
                        ) : skipped ? (
                          <Pill t="warning">Skipped</Pill>
                        ) : (
                          <Pill>Queued</Pill>
                        ),
                        <div className="flex flex-wrap gap-1 py-1">
                          {sent ? (
                            <>
                              {outcomeBtn("deliver", q.customerId, "Delivered")}
                              {outcomeBtn("fail", q.customerId, "Failed")}
                              {outcomeBtn("purchase", q.customerId, "Purchase")}
                              {outcomeBtn("optout", q.customerId, "Opt out")}
                            </>
                          ) : (
                            !skipped && (
                              <Button
                                size="small"
                                variant="tertiary"
                                onClick={() => update((s) => organicPurchase(s, q.customerId))}
                                icon={ShoppingCartIcon}
                              >
                                Organic purchase
                              </Button>
                            )
                          )}
                        </div>,
                      ],
                    };
                  })}
                />
              </div>
            </section>
            <section className="panel overflow-hidden">
              <div className="flex items-center justify-between p-4 pb-2">
                <h2 className="section-title">Event timeline</h2>
                <KindTag kind="observed" />
              </div>
              <Timeline events={c.events} name={name} />
            </section>
          </div>
        </>
      )}
      {!queue && c.events.length > 0 && (
        <section className="panel overflow-hidden">
          <div className="p-4 pb-2">
            <h2 className="section-title">Event timeline</h2>
          </div>
          <Timeline events={c.events} name={name} />
        </section>
      )}
      <CustomerDrawer id={open} onClose={() => setOpen(null)} />
    </div>
  );

  function Timeline({
    events,
    name: nm,
  }: {
    events: typeof c.events;
    name: (id: string | null) => string;
  }) {
    return (
      <div className="max-h-[420px] overflow-auto">
        <CellTable
          label="Campaign event timeline"
          minWidth={850}
          empty="No events yet."
          headings={[
            { label: "Event" },
            { label: "Time" },
            { label: "Customer", width: "minmax(140px, 1fr)" },
            { label: "Action" },
            { label: "Result" },
            { label: "Reason", width: "minmax(220px, 2fr)" },
          ]}
          rows={[...events]
            .reverse()
            .map((e) => ({
              id: e.id,
              cells: [
                <span className="font-mono">{e.id}</span>,
                clockLabel(e.at).slice(13),
                nm(e.customerId),
                e.action,
                <Pill t={resultTone[e.result]}>{e.result}</Pill>,
                e.reason,
              ],
            }))}
        />
      </div>
    );
  }
}
