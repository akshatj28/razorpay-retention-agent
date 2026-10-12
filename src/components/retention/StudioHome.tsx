import { useNavigate, Link } from "@tanstack/react-router";
import { Button } from "@razorpay/blade/components";
import {
  ArrowRight,
  Repeat2,
  ShoppingBag,
  Undo2,
  ShieldCheck,
  Clock3,
  Database,
  FileText,
} from "lucide-react";
import { PageHeader, Pill, Stat } from "./bits";
import { LinkButton } from "./LinkButton";
import { useDemo } from "@/retention/store";
import { MERCHANT_NAME } from "@/retention/data";
import { GOALS, advanceDay, createDraft, type Goal } from "@/retention/studio";
import { inr, dayToDate } from "@/retention/format";
export function StudioHome() {
  const { d, state, update } = useDemo();
  const navigate = useNavigate();
  const s = state.studio;
  const start = (goal: Goal, origin: "custom" | "recommended") => {
    update((prev) => ({ ...prev, studio: createDraft(prev.studio, goal, origin) }));
    navigate({ to: "/campaigns" });
  };
  const freshSignals = d.data.signals.filter((x) => x.matched && s.day - x.asOfDay <= 7).length;
  const drafts = s.campaigns.filter((c) => c.status === "draft" || c.status === "approved");
  const active = s.campaigns.filter((c) => ["scheduled", "running", "paused"].includes(c.status));
  const icons = { replenishment: Repeat2, second_purchase: ShoppingBag, winback: Undo2 };
  return (
    <div className="space-y-6 animate-enter">
      <PageHeader
        title="Your next retention campaigns."
        subtitle={MERCHANT_NAME + " · Skincare & haircare · " + dayToDate(s.day)}
        actions={
          <Button
            variant="secondary"
            onClick={() => update((prev) => ({ ...prev, studio: advanceDay(prev.studio, d.data) }))}
          >
            Advance demo day & refresh
          </Button>
        }
      />
      <section
        data-tour="opportunity"
        className="relative overflow-hidden rounded-2xl bg-[#102b62] p-6 text-white sm:p-8"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-24 size-80 rounded-full border-[48px] border-white/5"
          aria-hidden
        />
        <div className="relative grid items-center gap-7 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <span className="text-xs tracking-widest text-blue-200 uppercase">
              Merchant history + Razorpay intelligence
            </span>
            <h2 className="mt-4 max-w-lg font-heading text-3xl font-semibold leading-tight sm:text-4xl">
              Review the plan.
              <br />
              Pay for additional value.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-blue-100">
              Customer purchase rhythms, relevant products and available payment-risk signals become
              ready-to-review campaign proposals. We fund AI, messaging and calls; you approve the
              offers.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton to="/campaigns" color="white" size="large">
                Review recommended campaigns
              </LinkButton>
              <button
                className="rounded-lg border border-white/40 px-4 py-3 text-sm font-semibold hover:bg-white/10"
                onClick={() => start("replenishment", "custom")}
              >
                Build your own campaign
              </button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-blue-100">
              <ShieldCheck className="size-4" aria-hidden />
              Merchant approval before execution · All integrations simulated
            </p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 p-5">
            <div className="text-xs text-blue-100">Illustrative outcome pricing</div>
            <div className="mt-3 font-heading text-5xl font-semibold">
              25%<span className="ml-2 text-base font-normal">of additional contribution</span>
            </div>
            <ul className="mt-5 space-y-3 text-sm text-blue-100">
              <li>Discounts, returns and fulfilment included in economics</li>
              <li>Delivery and collection before fee reconciliation</li>
              <li>Losses offset campaign wins</li>
            </ul>
            <Link to="/insights" className="mt-5 flex items-center gap-2 text-sm font-semibold">
              Explore the synthetic comparison <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
      <section className="panel grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Six-month order history"
          value={d.data.orders.filter((o) => o.source === "seed").length.toLocaleString("en-IN")}
          hint="5,000 orders / month on average"
        />
        <Stat
          label="Customers"
          value={d.data.customers.length.toLocaleString("en-IN")}
          hint="Individual baskets, quantities and outcomes"
        />
        <Stat
          label="Fresh simulated network signals"
          value={freshSignals.toLocaleString("en-IN")}
          hint="Unknown or stale signals use merchant-only fallback"
        />
        <Stat
          label="Saved work"
          value={drafts.length + " drafts · " + active.length + " active"}
          hint={s.templates.length + " reusable templates"}
        />
      </section>
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title">Recommended opportunities</h2>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock3 className="size-3.5" />
            Refreshed {dayToDate(s.refreshedDay)} · Daily opportunity review
          </span>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {d.studio.opportunities.map((o) => {
            const goal = o.campaign.settings.goal;
            const Icon = icons[goal];
            return (
              <section key={goal} className="panel p-5">
                <div className="flex items-center justify-between">
                  <Icon className="size-6 text-primary" />
                  <Pill t="info">Simulated recommendation</Pill>
                </div>
                <h3 className="mt-4 font-heading text-xl font-semibold">{GOALS[goal]}</h3>
                <p className="mt-2 min-h-10 text-xs text-muted-foreground">
                  {goal === "replenishment"
                    ? "Customers approaching their estimated product replenishment window."
                    : goal === "second_purchase"
                      ? "Convert a first purchase into a relevant next product or routine."
                      : "Re-engage customers beyond their expected reorder window."}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <div className="num text-2xl font-semibold">{o.actions.length}</div>
                    <div className="text-xs text-muted-foreground">recommended contacts</div>
                  </div>
                  <div>
                    <div className="num text-2xl font-semibold">{inr(o.merchantKeeps)}</div>
                    <div className="text-xs text-muted-foreground">forecast retained uplift</div>
                  </div>
                </div>
                <p className="my-4 text-xs text-muted-foreground">
                  {o.holdoutIds.length} controls · {o.noOutreachIds.length} no outreach ·{" "}
                  {o.actions.filter((a) => a.offer === 0).length} reminders without discount
                </p>
                <Button
                  variant="secondary"
                  isDisabled={!o.actions.length}
                  onClick={() => start(goal, "recommended")}
                >
                  Review proposal
                </Button>
              </section>
            );
          })}
        </div>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="section-title flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            Your work stays yours.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Drafts save automatically. Templates retain rules and assets. Daily refreshes update the
            evidence without overwriting your message, offer or call script.
          </p>
          <Link
            to="/campaigns"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            Resume saved campaigns <ArrowRight className="size-4" />
          </Link>
        </section>
        <section className="panel p-5">
          <h2 className="section-title flex items-center gap-2">
            <Database className="size-5 text-primary" />
            Trace every decision to its inputs.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Inspect customer IDs, orders, line items, product variants, refunds and simulated
            Razorpay signal provenance. Download full tabular data.
          </p>
          <Link
            to="/database"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            Explore merchant database <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
      <p className="text-xs text-muted-foreground">
        Synthetic data and illustrative forecasts. No live Shopify, Vulcan, generative image,
        messaging, voice or billing integration. The outcome share is an example, not a commercial
        quote.
      </p>
    </div>
  );
}
