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
import { GOALS, advanceDay, createDraft, isPrepaidNudge, type Goal } from "@/retention/studio";
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
  const all = d.studio.opportunities.flatMap((o) => o.actions);
  const today = {
    messaged: all.length,
    plain: all.filter((a) => a.offer === 0).length,
    nudge: all.filter(isPrepaidNudge).length,
    keeps: d.studio.opportunities.reduce((t, o) => t + o.merchantKeeps, 0),
  };
  return (
    <div className="space-y-6 animate-enter">
      <PageHeader
        title="Today's campaigns"
        subtitle={MERCHANT_NAME + " · Skincare & haircare · " + dayToDate(s.day)}
        actions={
          <Button
            variant="secondary"
            onClick={() => update((prev) => ({ ...prev, studio: advanceDay(prev.studio, d.data) }))}
          >
            Move to next day
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
              From your Shopify orders + Razorpay payments
            </span>
            <h2 className="mt-4 max-w-lg font-heading text-3xl font-semibold leading-tight sm:text-4xl">
              More repeat orders.
              <br />
              Fewer wasted discounts.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-blue-100">
              Every morning the agent checks who is due to reorder, who needs a discount and who
              doesn't, and which COD customers should pay online. You review the plan. Nothing goes
              out until you approve it.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton to="/campaigns" color="white" size="large">
                Review today's campaigns
              </LinkButton>
              <button
                className="rounded-lg border border-white/40 px-4 py-3 text-sm font-semibold hover:bg-white/10"
                onClick={() => start("replenishment", "custom")}
              >
                Create a campaign
              </button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-blue-100">
              <ShieldCheck className="size-4" aria-hidden />
              You approve every campaign before anything is sent
            </p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 p-5">
            <div className="text-xs text-blue-100">Across today's three campaigns</div>
            <div className="mt-3 font-heading text-5xl font-semibold">
              {inr(today.keeps)}
              <span className="ml-2 text-base font-normal">expected extra profit</span>
            </div>
            <ul className="mt-5 space-y-3 text-sm text-blue-100">
              <li>{today.messaged} customers to message</li>
              <li>{today.plain} get a reminder with no discount</li>
              <li>{today.nudge} COD customers asked to pay online</li>
            </ul>
            <Link to="/insights" className="mt-5 flex items-center gap-2 text-sm font-semibold">
              See what it adds vs no retention tool <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
      <section className="panel grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Orders, last six months"
          value={d.data.orders.filter((o) => o.source === "seed").length.toLocaleString("en-IN")}
          hint="About 5,000 a month"
        />
        <Stat
          label="Customers"
          value={d.data.customers.length.toLocaleString("en-IN")}
          hint="What they bought, when, and how they paid"
        />
        <Stat
          label="Customers with a Razorpay RTO score"
          value={freshSignals.toLocaleString("en-IN")}
          hint="Updated in the last 7 days. The rest use your store history."
        />
        <Stat
          label="Your campaigns"
          value={drafts.length + " drafts · " + active.length + " live"}
          hint={s.templates.length + " saved templates"}
        />
      </section>
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title">Suggested for today</h2>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock3 className="size-3.5" />
            Updated {dayToDate(s.refreshedDay)} · refreshed every morning
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
                  <Pill t="info">Suggested by agent</Pill>
                </div>
                <h3 className="mt-4 font-heading text-xl font-semibold">{GOALS[goal]}</h3>
                <p className="mt-2 min-h-10 text-xs text-muted-foreground">
                  {goal === "replenishment"
                    ? "Repeat customers who are about to run out, based on how often they usually reorder."
                    : goal === "second_purchase"
                      ? "First-time customers, 2 to 10 weeks after their first order, with the next product in their routine."
                      : "Customers who are well past their usual time to reorder."}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <div className="num text-2xl font-semibold">{o.actions.length}</div>
                    <div className="text-xs text-muted-foreground">customers to message</div>
                  </div>
                  <div>
                    <div className="num text-2xl font-semibold">{inr(o.merchantKeeps)}</div>
                    <div className="text-xs text-muted-foreground">expected extra profit</div>
                  </div>
                </div>
                <p className="my-4 text-xs text-muted-foreground">
                  {o.actions.filter((a) => a.offer === 0).length} with no discount ·{" "}
                  {o.actions.filter(isPrepaidNudge).length} asked to pay online ·{" "}
                  {o.holdoutIds.length} in control group
                </p>
                <Button
                  variant="secondary"
                  isDisabled={!o.actions.length}
                  onClick={() => start(goal, "recommended")}
                >
                  Review campaign
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
            Your drafts are saved.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Drafts save automatically. Each morning the agent updates who is eligible, but never
            changes your message, discount or call script.
          </p>
          <Link
            to="/campaigns"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            Open your campaigns <ArrowRight className="size-4" />
          </Link>
        </section>
        <section className="panel p-5">
          <h2 className="section-title flex items-center gap-2">
            <Database className="size-5 text-primary" />
            See the data behind every decision.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Every order, refund and Razorpay RTO score the agent used, searchable and downloadable
            as CSV.
          </p>
          <Link
            to="/database"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            Open order data <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
