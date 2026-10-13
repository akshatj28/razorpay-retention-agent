import { LinkButton } from "@/components/retention/LinkButton";
import { AppModal } from "@/components/retention/AppModal";
import { createFileRoute } from "@tanstack/react-router";
import {
  Ban,
  Check,
  CircleCheck,
  Code2,
  Database,
  Image as ImageIcon,
  Link2,
  Lock,
  MessageCircle,
  Mic,
  Plug,
  ShieldCheck,
  ShoppingBag,
  Store,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button, Radio, RadioGroup, TextInput, ArrowRightIcon } from "@razorpay/blade/components";
import { Note, PageHeader, Pill } from "@/components/retention/bits";
import { baseDataset, MIN_COMPLETED_FOR_INTERVAL } from "@/retention/data";
import { useDemo } from "@/retention/store";
import {
  addStore,
  DEMO_STORE,
  getStores,
  SAMPLE_NEW_STORE,
  SETUP_EVENT,
  SETUP_KEY,
  storeName,
  type ConnectedStore,
} from "@/retention/onboarding";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Connections — Retention Agent" },
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
  step: "connections" | StepId | "done";
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
  step: "connections",
  domain: SAMPLE_NEW_STORE,
  channel: "whatsapp-voice",
};

const STEPS: { id: StepId; title: string; hint: string }[] = [
  { id: "store", title: "Preview store setup", hint: "Orders, products, customers" },
  { id: "razorpay", title: "Preview payment setup", hint: "Settlements, refunds, delivery risk" },
  { id: "import", title: "Simulate data import", hint: "Last six months + data check" },
  { id: "channel", title: "Choose demo channels", hint: "WhatsApp, images, voice preview" },
];

const SHOPIFY_SCOPES = [
  {
    icon: ShoppingBag,
    label: "Read orders and line items",
    detail:
      "Last six months in this simulation. A live app would request Shopify approval for older orders and ongoing updates.",
  },
  { icon: Database, label: "Read customers", detail: "Name, phone, email and marketing consent" },
  {
    icon: Store,
    label: "Read products and inventory",
    detail: "So the agent never promotes out-of-stock items",
  },
];
const CHANNELS = [
  {
    icon: MessageCircle,
    title: "WhatsApp messages",
    detail:
      "Simulated messages using a sample business number. Each customer gets their own text, product, price and discount code.",
    live: true,
  },
  {
    icon: ImageIcon,
    title: "Personalised images",
    detail:
      "An image for each customer with their product and price in your brand style. Prices come from your catalogue, never from the AI.",
    live: true,
  },
  {
    icon: Mic,
    title: "AI voice follow-ups",
    detail:
      "Simulated Hindi or English follow-ups. The assistant follows your script and cannot exceed the approved discount.",
    live: false,
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
  const [stores, setStores] = useState<ConnectedStore[]>([DEMO_STORE]);
  const [consentOpen, setConsentOpen] = useState(false);
  useEffect(() => {
    // Reload when the store menu starts "Add store" while this page is already open.
    const load = () => {
      setStores(getStores());
      try {
        const raw = localStorage.getItem(SETUP_KEY);
        setS(raw ? { ...START, ...JSON.parse(raw) } : START);
      } catch {
        setS(START);
      }
    };
    load();
    window.addEventListener(SETUP_EVENT, load);
    return () => window.removeEventListener(SETUP_EVENT, load);
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
  const inWizard = s.step !== "connections";
  const domain = s.domain.trim().toLowerCase();
  const alreadyConnected = stores.some((x) => x.domain === domain);

  return (
    <div className="space-y-6 animate-enter">
      <PageHeader
        title={inWizard ? "Add a store" : "Connections"}
        subtitle={
          inWizard
            ? "About 5 minutes · Read-only access · Disconnect any time"
            : "Your store, payments and messaging · Read-only access · Disconnect any time"
        }
        actions={
          inWizard ? (
            <Button variant="tertiary" onClick={() => go("connections")}>
              {s.step === "done" ? "Back to connections" : "Cancel"}
            </Button>
          ) : (
            <Button onClick={() => save({ ...START, step: "store" })}>Add store</Button>
          )
        }
      />

      {!inWizard && <ConnectionsView stores={stores} orders={stats.orders} />}

      {inWizard && (
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
                    helpText={
                      alreadyConnected
                        ? "This store already has a demo connection."
                        : "Your .myshopify.com address, found in Shopify admin → Settings → Domains"
                    }
                  />
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Button
                    icon={ArrowRightIcon}
                    iconPosition="right"
                    isDisabled={alreadyConnected || !/^[a-z0-9-]+\.myshopify\.com$/i.test(domain)}
                    onClick={() => setConsentOpen(true)}
                  >
                    Preview Shopify permissions
                  </Button>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="size-3.5" aria-hidden />
                    Simulated permission review. No Shopify account is contacted.
                  </span>
                </div>
                <AppModal
                  isOpen={consentOpen}
                  onDismiss={() => setConsentOpen(false)}
                  title="Preview Retention Agent permissions"
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
                        Continue demo setup
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
                              <span className="block text-xs text-muted-foreground">
                                {x.detail}
                              </span>
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
                title="Link your payment data"
                subtitle="Your store knows what was ordered. Your payment provider knows what was actually paid, refunded or never collected."
              >
                <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-surface p-4">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Wallet className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">Nira Botanics</div>
                    <div className="text-xs text-muted-foreground">
                      Sample Razorpay account for this demo
                    </div>
                  </div>
                  <Pill t="success">Simulated connection</Pill>
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
                    In a live product, payments would be matched to Shopify orders by order ID and
                    courier updates would confirm COD collection. This demo uses generated payment
                    and delivery-risk data.
                  </Note>
                </div>
                <div className="mt-4 rounded-xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold">Not on Razorpay checkout?</div>
                    <Pill>Supported by API</Pill>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm">
                    {[
                      [
                        "Another payment gateway",
                        "Send payments, refunds and failures through our Payments API or webhooks.",
                      ],
                      [
                        "Your courier or shipping partner",
                        "Send COD collection and RTO status by API, so returns don't count as wins.",
                      ],
                      [
                        "What changes",
                        "No delivery-risk estimate. The agent uses store and courier history instead, so online-payment recommendations are less precise.",
                      ],
                    ].map(([t, x]) => (
                      <li key={t}>
                        <span className="font-medium">{t}.</span>{" "}
                        <span className="text-muted-foreground">{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <StepNav
                  onBack={() => go("store")}
                  onNext={() => go("import")}
                  next="Link and continue"
                />
              </StepPanel>
            )}

            {s.step === "import" && (
              <ImportStep
                stats={stats}
                onBack={() => go("razorpay")}
                onNext={() => go("channel")}
              />
            )}

            {s.step === "channel" && (
              <StepPanel
                n={4}
                title="How should the agent reach customers?"
                subtitle="This demo simulates messages and calls only after campaign approval. Every preview uses one customer's order and payment history."
              >
                <div className="mb-5 grid gap-3 md:grid-cols-3">
                  {CHANNELS.map((x) => (
                    <div key={x.title} className="rounded-xl border p-4">
                      <div className="flex items-center justify-between gap-2">
                        <x.icon className="size-5 text-primary" aria-hidden />
                        <Pill t={x.live ? "success" : "neutral"}>
                          {x.live ? "Included in simulation" : "Preview only"}
                        </Pill>
                      </div>
                      <div className="mt-3 font-semibold">{x.title}</div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {x.detail}
                      </p>
                    </div>
                  ))}
                </div>
                <RadioGroup
                  label="Send campaigns by"
                  name="channel"
                  value={s.channel}
                  onChange={({ value }) => setS({ ...s, channel: value })}
                >
                  <Radio
                    value="whatsapp-voice"
                    helpText="WhatsApp first; a voice call only for customers who don't reply and agreed to calls"
                  >
                    WhatsApp + voice follow-up preview
                  </Radio>
                  <Radio value="whatsapp" helpText="Uses your WhatsApp Business number">
                    WhatsApp only
                  </Radio>
                  <Radio
                    value="export"
                    helpText="Download the approved customers and offers and send them yourself"
                  >
                    Planned: export approved recipients
                  </Radio>
                </RadioGroup>
                <div className="mt-5 space-y-2 rounded-xl border p-4 text-sm">
                  {[
                    [
                      MessageCircle,
                      `Only customers who opted in to marketing in Shopify (${stats.consented} of ${stats.customers})`,
                    ],
                    [ShieldCheck, "Every campaign waits for approval before a simulated send"],
                    [Mic, "Voice previews include only customers who agreed to calls"],
                    [Link2, "Reorder links preview a pre-filled Razorpay checkout"],
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
                <StepNav
                  onBack={() => go("import")}
                  onNext={() => {
                    addStore(domain);
                    go("done");
                  }}
                  next="Finish setup"
                />
              </StepPanel>
            )}

            {s.step === "done" && (
              <section className="panel p-6 sm:p-8" aria-labelledby="done-title">
                <span className="flex size-11 items-center justify-center rounded-xl bg-success-subtle text-success">
                  <CircleCheck className="size-6" aria-hidden />
                </span>
                <h2 id="done-title" className="mt-4 font-heading text-2xl font-semibold">
                  Demo setup complete for {storeName(domain)}
                </h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  This simulated setup uses read-only permissions for {domain}. In a live product,
                  order history would import in the background. This demo has sample orders only for
                  Nira Botanics, so Today continues to show that store.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <LinkButton to="/" size="large">
                    See today's campaigns
                  </LinkButton>
                  <Button variant="tertiary" onClick={() => go("connections")}>
                    Back to connections
                  </Button>
                </div>
              </section>
            )}
          </div>
        </div>
      )}
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
      title="Simulating your order-history import"
      subtitle="This step previews a six-month import and the checks a live connection would run."
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
                  {c.ok ? <Pill t="success">Ready</Pill> : <Pill t="warning">Review</Pill>}
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

function ConnectionsView({ stores, orders }: { stores: ConnectedStore[]; orders: number }) {
  const rows = [
    ...stores.map((st) => ({
      icon: ShoppingBag,
      group: "Store",
      title: st.name,
      detail:
        "Shopify · " +
        st.domain +
        (st.hasData ? " · " + orders.toLocaleString("en-IN") + " orders imported" : ""),
      tone: st.hasData ? ("success" as const) : ("neutral" as const),
      status: st.hasData ? "Simulated connection" : "Demo connection · no sample history",
    })),
    {
      icon: Wallet,
      group: "Payments",
      title: "Razorpay",
      detail: "Settlements, refunds, COD collection and RTO risk score",
      tone: "success" as const,
      status: "Simulated connection",
    },
    {
      icon: MessageCircle,
      group: "Messaging",
      title: "WhatsApp Business",
      detail: "Messages from your business number, with a personalised image for each customer",
      tone: "success" as const,
      status: "Simulated channel",
    },
    {
      icon: Mic,
      group: "Calls",
      title: "AI voice follow-ups",
      detail:
        "Hindi or English calls with ElevenLabs voices, only to customers who agreed to calls",
      tone: "neutral" as const,
      status: "Preview only",
    },
  ];
  return (
    <div className="space-y-4">
      <section data-tour="setup" className="panel divide-y" aria-label="Connections">
        {rows.map((r) => (
          <div key={r.group + r.title} className="flex flex-wrap items-center gap-4 p-4">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-subtle text-primary">
              <r.icon className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="label-text">{r.group}</div>
              <div className="font-semibold">{r.title}</div>
              <div className="text-xs text-muted-foreground">{r.detail}</div>
            </div>
            <Pill t={r.tone}>{r.status}</Pill>
          </div>
        ))}
      </section>
      <Note>
        Not on Razorpay checkout? A store on another payment provider can send payments, refunds and
        COD outcomes by API or webhooks. Add store, step 2, shows how.
      </Note>
    </div>
  );
}
