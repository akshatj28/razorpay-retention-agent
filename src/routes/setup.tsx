import { LinkButton } from "@/components/retention/LinkButton";
import { AppModal } from "@/components/retention/AppModal";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Ban,
  Check,
  CircleCheck,
  Code2,
  Database,
  Link2,
  Lock,
  MessageCircle,
  Plug,
  ShieldCheck,
  ShoppingBag,
  Store,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Button,
  Radio,
  RadioGroup,
  TextInput,
  ArrowRightIcon,
  RefreshIcon,
} from "@razorpay/blade/components";
import { Note, PageHeader, Pill } from "@/components/retention/bits";
import { baseDataset, MIN_COMPLETED_FOR_INTERVAL } from "@/retention/data";
import { useDemo } from "@/retention/store";
import { SETUP_KEY } from "@/retention/onboarding";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Connect store — Retention Agent" },
      {
        name: "description",
        content:
          "Connect a Shopify store and link Razorpay data before the Retention Agent recommends anything.",
      },
    ],
  }),
  component: Setup,
});

type StepId = "store" | "razorpay" | "import" | "channel";
interface SetupState {
  step: StepId | "done";
  domain: string;
  channel: string;
}
interface Stats {
  orders: number;
  lineItems: number;
  customers: number;
  products: number;
  consented: number;
  refundPending: number;
  outOfStock: number;
  repeatSkus: number;
  withInterval: number;
}
const START: SetupState = {
  step: "store",
  domain: "nira-botanics.myshopify.com",
  channel: "agent-studio",
};

const STEPS: { id: StepId; title: string; hint: string }[] = [
  { id: "store", title: "Connect your store", hint: "Orders, products, customers" },
  { id: "razorpay", title: "Link Razorpay", hint: "Settlements, refunds, RTO" },
  { id: "import", title: "Import order history", hint: "Last six months + data check" },
  { id: "channel", title: "Choose WhatsApp sender", hint: "Where messages go out from" },
];

const SHOPIFY_SCOPES = [
  {
    icon: ShoppingBag,
    label: "Read orders and line items",
    detail:
      "Last six months (older than 60 days requires Shopify read_all_orders approval), then live order, fulfilment and refund updates",
  },
  { icon: Database, label: "Read customers", detail: "Name, phone, email and marketing consent" },
  {
    icon: Store,
    label: "Read products and inventory",
    detail: "So the agent never promotes out-of-stock items",
  },
];
const NOT_REQUESTED = [
  "Edit orders, prices or products",
  "Card or bank details",
  "Write anything to your storefront",
];

function Setup() {
  const { d } = useDemo();
  const [s, setS] = useState<SetupState>(START);
  const [consentOpen, setConsentOpen] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETUP_KEY);
      if (raw) setS({ ...START, ...JSON.parse(raw) });
    } catch {
      /* fall back to a fresh setup */
    }
  }, []);
  const save = (next: SetupState) => {
    setS(next);
    try {
      localStorage.setItem(SETUP_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  };
  const go = (step: SetupState["step"]) => save({ ...s, step });

  const stats = useMemo((): Stats => {
    const data = baseDataset();
    const lineItems = data.orders.reduce((n, o) => n + o.items.length, 0);
    const repeatSkus = new Set(
      d.features
        .filter((f) => f.relevantCompletedDays.length >= MIN_COMPLETED_FOR_INTERVAL)
        .map((f) => f.relevantProduct.id),
    );
    return {
      orders: data.orders.length,
      lineItems,
      customers: data.customers.length,
      products: data.products.length,
      consented: data.customers.filter((c) => c.consent).length,
      refundPending: data.orders.filter((o) => o.status === "refund_pending").length,
      outOfStock: data.products.filter((p) => p.stock === 0).length,
      repeatSkus: repeatSkus.size,
      withInterval: d.features.filter(
        (f) => f.relevantCompletedDays.length >= MIN_COMPLETED_FOR_INTERVAL,
      ).length,
    };
  }, [d.features]);

  const idx = s.step === "done" ? STEPS.length : STEPS.findIndex((x) => x.id === s.step);

  return (
    <div className="space-y-6 animate-enter">
      <PageHeader
        title="Connect your store to get started."
        subtitle="About 5 minutes · Read-only access · Disconnect any time"
      />

      {s.step !== "done" && (
        <section className="panel flex flex-wrap items-center gap-4 p-4">
          <div className="min-w-0 flex-1">
            <div className="font-semibold">Use the Nira Botanics demo store</div>
            <p className="text-sm text-muted-foreground">
              Connect its Shopify store and Razorpay account in one click, or go through each screen
              below.
            </p>
          </div>
          <Button onClick={() => save({ ...s, domain: s.domain.trim(), step: "done" })}>
            Connect demo store
          </Button>
          <Link to="/" className="text-sm font-semibold text-primary">
            Skip to today's campaigns
          </Link>
        </section>
      )}

      <div data-tour="setup" className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <ol className="panel h-fit space-y-1 p-3" aria-label="Setup steps">
          {STEPS.map((x, i) => {
            const state = i < idx ? "done" : i === idx ? "current" : "next";
            return (
              <li
                key={x.id}
                aria-current={state === "current" ? "step" : undefined}
                className={`flex items-start gap-3 rounded-lg px-2 py-2.5 ${state === "current" ? "bg-primary-subtle" : ""}`}
              >
                <span
                  className={`num mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${state === "done" ? "bg-success text-white" : state === "current" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {state === "done" ? <Check className="size-3.5" aria-label="Done" /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span
                    className={`block text-sm ${state === "next" ? "text-muted-foreground" : "font-semibold"}`}
                  >
                    {x.title}
                  </span>
                  <span className="block text-xs text-muted-foreground">{x.hint}</span>
                </span>
              </li>
            );
          })}
        </ol>

        <div className="min-w-0">
          {s.step === "store" && (
            <StepPanel
              n={1}
              title="Where do you sell?"
              subtitle="The agent needs to know what each customer bought and when. That comes from your store, not from payments."
            >
              <div
                className="grid gap-3 sm:grid-cols-3"
                role="radiogroup"
                aria-label="Store platform"
              >
                <PlatformCard
                  icon={ShoppingBag}
                  name="Shopify"
                  detail="1-click app install"
                  selected
                  tag={<Pill t="success">Recommended</Pill>}
                />
                <PlatformCard
                  icon={Plug}
                  name="WooCommerce"
                  detail="Plugin"
                  tag={<Pill>Coming soon</Pill>}
                />
                <PlatformCard
                  icon={Code2}
                  name="Custom or headless"
                  detail="Orders API or CSV upload"
                  tag={<Pill>Coming soon</Pill>}
                />
              </div>
              <div className="mt-5 max-w-md">
                <TextInput
                  label="Shopify store address"
                  value={s.domain}
                  onChange={({ value }) => setS({ ...s, domain: value ?? "" })}
                  helpText="Your .myshopify.com address, found in Shopify admin → Settings → Domains"
                />
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  icon={ArrowRightIcon}
                  iconPosition="right"
                  isDisabled={!/^[a-z0-9-]+\.myshopify\.com$/i.test(s.domain.trim())}
                  onClick={() => setConsentOpen(true)}
                >
                  Install on Shopify
                </Button>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="size-3.5" aria-hidden />
                  Read-only access. You approve the permissions in Shopify.
                </span>
              </div>
              <AppModal
                isOpen={consentOpen}
                onDismiss={() => setConsentOpen(false)}
                title="Install Retention Agent on your store?"
                subtitle={`${s.domain} · Shopify permission screen (simulated)`}
                size="medium"
                footer={
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setConsentOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        setConsentOpen(false);
                        save({ ...s, domain: s.domain.trim(), step: "razorpay" });
                      }}
                    >
                      Install app
                    </Button>
                  </div>
                }
              >
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="label-text mb-2">THE APP WILL BE ABLE TO</div>
                    <ul className="space-y-2.5">
                      {SHOPIFY_SCOPES.map((x) => (
                        <li key={x.label} className="flex gap-3">
                          <x.icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                          <span>
                            <span className="font-medium">{x.label}</span>
                            <span className="block text-xs text-muted-foreground">{x.detail}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-t pt-3">
                    <div className="label-text mb-2">IT WILL NOT</div>
                    <ul className="space-y-1.5 text-muted-foreground">
                      {NOT_REQUESTED.map((x) => (
                        <li key={x} className="flex items-center gap-2">
                          <Ban className="size-3.5 shrink-0" aria-hidden />
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AppModal>
            </StepPanel>
          )}

          {s.step === "razorpay" && (
            <StepPanel
              n={2}
              title="Link your Razorpay data"
              subtitle="Your store knows what was ordered. Razorpay knows what was actually paid, refunded or never collected."
            >
              <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-surface p-4">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Wallet className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">Nira Botanics</div>
                  <div className="text-xs text-muted-foreground">
                    Razorpay account detected from your dashboard login · demo account
                  </div>
                </div>
                <Pill t="success">Signed in</Pill>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["Settlements", "Net cash received per order, after fees"],
                  ["Refunds and disputes", "So refunded orders don't count as wins"],
                  ["Payment method and failures", "UPI, card, COD; failed attempts and why"],
                  ["Magic Checkout events", "Cart, address and COD-risk signals, if enabled"],
                ].map(([t, x]) => (
                  <div key={t} className="flex gap-3 rounded-lg border p-3">
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                    <div>
                      <div className="text-sm font-medium">{t}</div>
                      <div className="text-xs text-muted-foreground">{x}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Note>
                  Payments are matched to Shopify orders by order ID, and courier updates confirm
                  when COD cash is collected. Razorpay shares an RTO risk score only, never another
                  store's customer data.
                </Note>
              </div>
              <StepNav
                onBack={() => go("store")}
                onNext={() => go("import")}
                next="Link and continue"
              />
            </StepPanel>
          )}

          {s.step === "import" && (
            <ImportStep stats={stats} onBack={() => go("razorpay")} onNext={() => go("channel")} />
          )}

          {s.step === "channel" && (
            <StepPanel
              n={4}
              title="How should the agent reach customers?"
              subtitle="The agent decides who to contact and what to offer. A messaging channel delivers it, and only after you approve the campaign."
            >
              <RadioGroup
                label="Messaging channel"
                name="channel"
                value={s.channel}
                onChange={({ value }) => setS({ ...s, channel: value })}
              >
                <Radio value="agent-studio" helpText="Uses your existing WhatsApp Business number">
                  WhatsApp via Razorpay Agent Studio
                </Radio>
                <Radio
                  value="bitespeed"
                  helpText="Keep your current retention tool; the agent sends it the audience and offers"
                >
                  WhatsApp via BiteSpeed (Razorpay partner)
                </Radio>
                <Radio
                  value="export"
                  helpText="Download the approved audience and send it yourself"
                >
                  CSV export only
                </Radio>
              </RadioGroup>
              <div className="mt-5 space-y-2 rounded-xl border p-4 text-sm">
                {[
                  [
                    MessageCircle,
                    `Only customers who opted in to marketing in Shopify (${stats.consented} of ${stats.customers})`,
                  ],
                  [ShieldCheck, "Every campaign waits for your approval before anything is sent"],
                  [Link2, "Reorder links open a pre-filled Razorpay checkout"],
                ].map(([Icon, t]) => {
                  const I = Icon as typeof MessageCircle;
                  return (
                    <div key={t as string} className="flex items-center gap-2.5">
                      <I className="size-4 shrink-0 text-primary" aria-hidden />
                      {t as string}
                    </div>
                  );
                })}
              </div>
              <StepNav onBack={() => go("import")} onNext={() => go("done")} next="Finish setup" />
            </StepPanel>
          )}

          {s.step === "done" && (
            <section className="panel p-6 sm:p-8" aria-labelledby="done-title">
              <span className="flex size-11 items-center justify-center rounded-xl bg-success-subtle text-success">
                <CircleCheck className="size-6" aria-hidden />
              </span>
              <h2 id="done-title" className="mt-4 font-heading text-2xl font-semibold">
                Retention Agent is ready.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                {s.domain} and your Razorpay account are linked. The agent found{" "}
                <span className="font-semibold text-foreground">
                  {d.studio.opportunities.reduce((n, o) => n + o.actions.length, 0)} customers
                </span>{" "}
                worth messaging today across three campaigns. Nothing is sent until you approve.
              </p>
              <div className="mt-5 grid max-w-xl gap-3 sm:grid-cols-3">
                <MiniStat label="Orders imported" value={stats.orders} />
                <MiniStat label="Customers" value={stats.customers} />
                <MiniStat label="Repeat products" value={stats.repeatSkus} />
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <LinkButton to="/" size="large">
                  See today's campaigns
                </LinkButton>
                <Button variant="tertiary" icon={RefreshIcon} onClick={() => save(START)}>
                  Run setup again
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function ImportStep({
  stats,
  onBack,
  onNext,
}: {
  stats: Stats;
  onBack: () => void;
  onNext: () => void;
}) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () =>
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(t);
            return 100;
          }
          return p + 10;
        }),
      180,
    );
    return () => clearInterval(t);
  }, []);
  const done = progress >= 100;
  const rows = [
    ["Orders", stats.orders, `${stats.lineItems} line items`],
    ["Customers", stats.customers, `${stats.consented} opted in to marketing`],
    ["Products", stats.products, `${stats.outOfStock} out of stock`],
  ] as const;
  const checks: { ok: boolean; title: string; detail: string }[] = [
    {
      ok: true,
      title: "Every order has line items",
      detail: "Needed to predict what each customer runs out of",
    },
    {
      ok: stats.repeatSkus > 0,
      title: `${stats.repeatSkus} products are bought repeatedly`,
      detail: `${stats.withInterval} customers have ${MIN_COMPLETED_FOR_INTERVAL}+ purchases of one product, enough to estimate their cycle`,
    },
    {
      ok: false,
      title: `${stats.refundPending} orders have a refund still open`,
      detail: "Those customers are held back until the refund settles",
    },
    {
      ok: false,
      title: `${stats.customers - stats.consented} customers haven't opted in to marketing`,
      detail: "They will never be messaged",
    },
  ];
  return (
    <StepPanel
      n={3}
      title="Importing your order history"
      subtitle="We read the last six months once, then keep up through live updates."
    >
      <div className="space-y-4">
        {rows.map(([label, n, sub]) => (
          <div key={label}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">{label}</span>
              <span className="num text-muted-foreground">
                {Math.round((n * progress) / 100)} / {n} · {sub}
              </span>
            </div>
            <div
              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label={`${label} imported`}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: progress + "%" }}
              />
            </div>
          </div>
        ))}
      </div>
      {done && (
        <div className="mt-6 animate-enter">
          <h3 className="section-title">Data check</h3>
          <ul className="mt-3 divide-y rounded-xl border">
            {checks.map((c) => (
              <li key={c.title} className="flex items-start gap-3 p-3">
                <span className="mt-0.5">
                  {c.ok ? <Pill t="success">Ready</Pill> : <Pill t="warning">Handled</Pill>}
                </span>
                <div>
                  <div className="text-sm font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.detail}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <StepNav onBack={onBack} onNext={onNext} next="Continue" disabled={!done} />
    </StepPanel>
  );
}

function StepPanel({
  n,
  title,
  subtitle,
  children,
}: {
  n: number;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="panel p-5 sm:p-6 animate-enter" aria-labelledby={`step-${n}`}>
      <div className="label-text">
        STEP {n} OF {STEPS.length}
      </div>
      <h2 id={`step-${n}`} className="mt-1 font-heading text-xl font-semibold">
        {title}
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function StepNav({
  onBack,
  onNext,
  next,
  disabled,
}: {
  onBack: () => void;
  onNext: () => void;
  next: string;
  disabled?: boolean;
}) {
  return (
    <div className="mt-6 flex items-center justify-between border-t pt-4">
      <Button variant="tertiary" onClick={onBack}>
        Back
      </Button>
      <Button icon={ArrowRightIcon} iconPosition="right" isDisabled={!!disabled} onClick={onNext}>
        {next}
      </Button>
    </div>
  );
}

function PlatformCard({
  icon: Icon,
  name,
  detail,
  tag,
  selected,
}: {
  icon: typeof Store;
  name: string;
  detail: string;
  tag: ReactNode;
  selected?: boolean;
}) {
  return (
    <div
      role="radio"
      aria-checked={!!selected}
      aria-disabled={!selected}
      className={`rounded-xl border p-4 ${selected ? "border-primary bg-primary-subtle/40 ring-1 ring-primary" : "opacity-60"}`}
    >
      <div className="flex items-center justify-between">
        <Icon
          className={`size-5 ${selected ? "text-primary" : "text-muted-foreground"}`}
          aria-hidden
        />
        {tag}
      </div>
      <div className="mt-3 font-semibold">{name}</div>
      <div className="text-xs text-muted-foreground">{detail}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="num font-heading text-2xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
