import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Button, useToast } from "@razorpay/blade/components";
import { PageHeader, Pill, Note, Stat } from "@/components/retention/bits";
import { DataTable } from "@/components/retention/DataTable";
import { DemoScope } from "@/components/retention/DemoScope";
import { useDemo } from "@/retention/store";
import { inr, dayToDate } from "@/retention/format";
import { productById, MERCHANT_NAME } from "@/retention/data";
import {
  GOALS,
  createDraft,
  editDraft,
  saveTemplate,
  refreshDraft,
  approveDraft,
  scheduleCampaign,
  pauseCampaign,
  sendStudioBatch,
  reconcileCampaign,
  refundOutcome,
  campaignSettlement,
  defaultAssets,
  isPrepaidNudge,
  renderAsset,
  type StudioState,
  type Goal,
  type CampaignSettings,
  type CampaignAssets,
} from "@/retention/studio";

const OUTCOME_LABEL: Record<string, string> = {
  no_purchase: "No order",
  placed: "Ordered",
  collected: "Delivered and paid",
  rto: "Returned (RTO)",
  refunded: "Refunded",
};
const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  approved: "Approved · not started",
  scheduled: "Scheduled",
  running: "In progress",
  paused: "Paused",
  completed: "Sending complete",
};
export const Route = createFileRoute("/campaigns")({
  component: Campaigns,
  head: () => ({ meta: [{ title: "Campaigns — Nira Botanics" }] }),
});
const fieldClass = "mt-1 w-full rounded-lg border bg-card px-3 py-2 text-sm disabled:opacity-60";
function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      {children}
      {hint && <span className="mt-1 block text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}
function Campaigns() {
  const { state, d, update } = useDemo();
  const toast = useToast();
  const studio = state.studio;
  const view = d.studio.active;
  const [filter, setFilter] = useState("all");
  const [step, setStep] = useState("Audience");
  const [channel, setChannel] = useState("WhatsApp");
  const [sample, setSample] = useState("");
  const [offerView, setOfferView] = useState("all");
  const mutate = (fn: (s: StudioState) => StudioState) =>
    update((s) => ({ ...s, studio: fn(s.studio) }));
  const create = (goal: Goal = "replenishment", origin: "custom" | "recommended" = "custom") => {
    mutate((s) => createDraft(s, goal, origin));
    setStep("Audience");
  };
  const campaigns = studio.campaigns.filter(
    (c) =>
      filter === "all" ||
      (filter === "draft"
        ? ["draft", "approved"].includes(c.status)
        : filter === "active"
          ? ["running", "paused"].includes(c.status)
          : c.status === filter),
  );
  const c = view?.campaign;
  const locked = !!c && !["draft", "approved"].includes(c.status);
  const edit = (patch: Parameters<typeof editDraft>[2]) =>
    c && mutate((s) => editDraft(s, c.id, patch));
  const setting = (patch: Partial<CampaignSettings>) => edit({ settings: patch });
  const asset = (patch: Partial<CampaignAssets>) => edit({ assets: patch });
  const a = view?.actions.find((x) => x.customerId === sample) ?? view?.actions[0];
  const customer = a ? d.studio.byId.get(a.customerId)?.customer : undefined;
  const selectedProduct = a ? productById(a.productId) : null;
  const stats = c ? campaignSettlement(c) : null;
  const allActions = view?.actions ?? [];
  const isNudge = (x: (typeof allActions)[number]) => isPrepaidNudge(x);
  const plainCount = allActions.filter((x) => x.offer === 0).length;
  const nudgeCount = allActions.filter(isNudge).length;
  const shownActions = allActions.filter((x) =>
    offerView === "plain"
      ? x.offer === 0
      : offerView === "offer"
        ? x.offer > 0
        : offerView === "nudge"
          ? isNudge(x)
          : true,
  );
  const approve = () => {
    if (!c) return;
    const result = approveDraft(d.data, studio, c.id);
    if (result.error) toast.show({ content: result.error, color: "negative" });
    else {
      mutate(() => result.state);
      toast.show({ content: "Audience, offers and content approved.", color: "positive" });
    }
  };
  return (
    <div className="space-y-6 animate-enter">
      <PageHeader
        title="Campaigns"
        subtitle={MERCHANT_NAME + " · Drafts save automatically"}
        actions={<Button onClick={() => create()}>Create campaign</Button>}
      />
      <section className="panel p-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Campaign library">
          {[
            ["all", "All campaigns"],
            ["draft", "Not started"],
            ["scheduled", "Scheduled"],
            ["active", "In progress"],
            ["completed", "Sending complete"],
            ["templates", "Templates"],
          ].map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key!)}
              className={
                "rounded-lg px-3 py-2 text-sm " +
                (filter === key
                  ? "bg-primary-subtle font-semibold text-primary"
                  : "text-muted-foreground")
              }
            >
              {label}
            </button>
          ))}
        </div>
        {filter === "templates" ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {studio.templates.length ? (
              studio.templates.map((t) => (
                <div className="rounded-lg border p-4" key={t.id}>
                  <h3 className="font-semibold">{t.name}</h3>
                  <p className="my-2 text-xs text-muted-foreground">
                    {GOALS[t.settings.goal]} · Segment rules and message saved; customers update
                    daily.
                  </p>
                  <Button
                    size="small"
                    onClick={() => {
                      mutate((s) => createDraft(s, t.settings.goal, "template", t.id));
                      setFilter("all");
                    }}
                  >
                    Use template
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Save a campaign as a template to reuse its audience rules and content.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            {campaigns.length ? (
              campaigns.map((x) => (
                <button
                  key={x.id}
                  onClick={() => mutate((s) => ({ ...s, activeId: x.id }))}
                  className={
                    "min-w-52 rounded-lg border p-3 text-left " +
                    (studio.activeId === x.id ? "border-primary bg-primary-subtle/30" : "")
                  }
                >
                  <span className="block text-sm font-semibold">{x.name}</span>
                  <span className="mt-1 flex items-center gap-2">
                    <Pill t={x.status === "draft" ? "neutral" : "info"}>
                      {STATUS_LABEL[x.status] ?? x.status}
                    </Pill>
                    <span className="text-xs text-muted-foreground">
                      v{x.revision} · {x.origin}
                    </span>
                  </span>
                </button>
              ))
            ) : (
              <p className="py-3 text-sm text-muted-foreground">
                No campaigns yet. Start from a suggested campaign or create your own.
              </p>
            )}
          </div>
        )}
      </section>
      {!view || !c ? (
        <section data-tour="studio" className="panel p-6">
          <h2 className="section-title">Suggested for today</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {d.studio.opportunities.map((o) => (
              <div key={o.campaign.settings.goal} className="rounded-xl border p-4">
                <Pill t="info">Suggested by agent</Pill>
                <h3 className="mt-3 font-semibold">{GOALS[o.campaign.settings.goal]}</h3>
                <p className="my-3 text-sm text-muted-foreground">
                  {o.actions.length} customers to message · {inr(o.merchantKeeps)} estimated
                  earnings you keep
                </p>
                <Button
                  onClick={() => create(o.campaign.settings.goal, "recommended")}
                  variant="secondary"
                >
                  Review campaign
                </Button>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <>
          <section data-tour="studio" className="panel p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="section-title">{c.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Version {c.revision} · Checked {dayToDate(c.reviewedDay)}
                  {c.snapshot && (
                    <span>
                      {" "}
                      · Sent {c.sentIds.length} of {c.snapshot.actions.length}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    mutate((s) => saveTemplate(s, c.id));
                    toast.show({ content: "Reusable template saved.", color: "positive" });
                  }}
                >
                  Save as template
                </Button>
                {c.status === "approved" && (
                  <Button onClick={() => mutate((s) => scheduleCampaign(s, c.id))}>
                    {c.settings.scheduleDay > studio.day
                      ? "Schedule simulation"
                      : "Start simulation"}
                  </Button>
                )}
                {["running", "paused"].includes(c.status) && (
                  <Button variant="secondary" onClick={() => mutate((s) => pauseCampaign(s, c.id))}>
                    {c.status === "paused" ? "Resume" : "Pause"}
                  </Button>
                )}
                {c.status === "running" && (
                  <Button onClick={() => mutate((s) => sendStudioBatch(d.data, s, c.id))}>
                    Simulate next batch
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Campaign steps">
              {[
                "Audience",
                "Products & discounts",
                "Messages & calls",
                "Budget & approval",
                "Results",
              ].map((x) => (
                <button
                  key={x}
                  role="tab"
                  aria-selected={step === x}
                  onClick={() => setStep(x)}
                  className={
                    "rounded-lg px-3 py-2 text-sm " +
                    (step === x ? "bg-primary text-white" : "bg-muted")
                  }
                >
                  {x}
                </button>
              ))}
            </div>
          </section>
          {view.stale && (
            <Note t="warning">
              New orders came in since you last checked, so who is eligible may have changed. Your
              message and discounts are unchanged.{" "}
              <button
                className="font-semibold underline"
                onClick={() => mutate((s) => refreshDraft(s, c.id))}
              >
                Review updated customers
              </button>{" "}
              before approving.
            </Note>
          )}
          {locked && (
            <Note>
              This campaign has started. Its approved audience, offers and content are fixed. Each
              customer is checked again just before a simulated send.
            </Note>
          )}
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            <section className="panel min-w-0 p-5" role="tabpanel" aria-label={step}>
              {step === "Audience" && (
                <div className="space-y-5">
                  <h3 className="section-title">Who should hear from you?</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Campaign name">
                      <input
                        aria-label="Campaign name"
                        className={fieldClass}
                        value={c.name}
                        disabled={locked}
                        onChange={(e) => edit({ name: e.target.value })}
                      />
                    </Field>
                    <Field label="Goal">
                      <select
                        aria-label="Goal"
                        className={fieldClass}
                        value={c.settings.goal}
                        disabled={locked}
                        onChange={(e) => setting({ goal: e.target.value as Goal })}
                      >
                        {Object.entries(GOALS).map(([v, label]) => (
                          <option key={v} value={v}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Segment">
                      <select
                        aria-label="Segment"
                        className={fieldClass}
                        value={c.settings.rule}
                        disabled={locked}
                        onChange={(e) =>
                          setting({ rule: e.target.value as CampaignSettings["rule"] })
                        }
                      >
                        <option value="goal">Everyone eligible for this campaign</option>
                        <option value="repeat_buyers">Repeat customers (2+ orders)</option>
                        <option value="cod_low_risk">COD customers with low RTO risk</option>
                        <option value="discount_buyers">
                          Customers who used a discount before
                        </option>
                      </select>
                    </Field>
                    <Field label="Product category">
                      <select
                        aria-label="Product category"
                        className={fieldClass}
                        value={c.settings.category}
                        disabled={locked}
                        onChange={(e) =>
                          setting({ category: e.target.value as CampaignSettings["category"] })
                        }
                      >
                        {["All", "Skincare", "Haircare", "Body care", "Routine kits"].map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </Field>
                    <Field
                      label="Maximum audience size"
                      hint="10 to 1,000 people, including customers in the control group."
                    >
                      <input
                        aria-label="Maximum audience size"
                        type="number"
                        min="10"
                        max="1000"
                        className={fieldClass}
                        value={c.settings.maxAudience}
                        disabled={locked}
                        onChange={(e) => setting({ maxAudience: Number(e.target.value) })}
                      />
                    </Field>
                    <Field label="Send date">
                      <input
                        aria-label="Send date"
                        type="date"
                        min={new Date(Date.UTC(2026, 9, 12) + studio.day * 86400000)
                          .toISOString()
                          .slice(0, 10)}
                        className={fieldClass}
                        value={new Date(Date.UTC(2026, 9, 12) + c.settings.scheduleDay * 86400000)
                          .toISOString()
                          .slice(0, 10)}
                        disabled={locked}
                        onChange={(e) => {
                          const day =
                            (Date.parse(e.target.value) - Date.UTC(2026, 9, 12)) / 86400000;
                          if (Number.isFinite(day)) setting({ scheduleDay: day });
                        }}
                      />
                    </Field>
                  </div>
                  <Note>
                    Store history helps estimate who may be ready to reorder and which product to
                    suggest. The simulated Razorpay delivery-risk signal informs online-payment
                    recommendations. Only opted-in customers are eligible.
                  </Note>
                </div>
              )}
              {step === "Products & discounts" && (
                <div className="space-y-4">
                  <DemoScope />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Discount selection">
                      <select
                        aria-label="Discount"
                        className={fieldClass}
                        disabled={locked}
                        value={c.settings.offer}
                        onChange={(e) =>
                          setting({
                            offer:
                              e.target.value === "recommended"
                                ? "recommended"
                                : (Number(e.target.value) as 0 | 10 | 20 | 30),
                          })
                        }
                      >
                        <option value="recommended">Recommended for each customer</option>
                        {[0, 10, 20, 30].map((n) => (
                          <option key={n} value={n}>
                            {n ? n + "% code for everyone" : "No discount"}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Discount limit">
                      <select
                        aria-label="Maximum discount"
                        className={fieldClass}
                        disabled={locked}
                        value={c.settings.maxDiscount}
                        onChange={(e) =>
                          setting({ maxDiscount: Number(e.target.value) as 0 | 10 | 20 | 30 })
                        }
                      >
                        {[0, 10, 20, 30].map((n) => (
                          <option key={n} value={n}>
                            {n}%
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter actions">
                    {(
                      [
                        ["all", "All", view.actions.length],
                        ["plain", "No discount", plainCount],
                        ["offer", "With a discount code", view.actions.length - plainCount],
                        ["nudge", "Asked to pay online", nudgeCount],
                      ] as const
                    ).map(([key, label, count]) => (
                      <button
                        key={key}
                        role="tab"
                        aria-selected={offerView === key}
                        onClick={() => setOfferView(key)}
                        className={
                          "rounded-lg border px-3 py-1.5 text-sm " +
                          (offerView === key
                            ? "border-primary bg-primary-subtle font-semibold text-primary"
                            : "text-muted-foreground")
                        }
                      >
                        {label} · {count}
                      </button>
                    ))}
                  </div>
                  <DataTable
                    rows={shownActions.slice(0, 35)}
                    rowId={(r) => r.customerId}
                    label="Customers in this campaign"
                    minWidth={1100}
                    columns={[
                      {
                        key: "customer",
                        label: "Customer",
                        render: (r) => (
                          <span>
                            {d.studio.byId.get(r.customerId)?.customer.name}
                            <span className="block text-xs text-muted-foreground">
                              {r.customerId}
                            </span>
                          </span>
                        ),
                      },
                      {
                        key: "product",
                        label: "Product",
                        render: (r) => productById(r.productId).name,
                      },
                      {
                        key: "offer",
                        label: "Discount",
                        render: (r) => (r.offer ? r.offer + "% code" : "None"),
                      },
                      {
                        key: "payment",
                        label: "Payment recommendation",
                        render: (r) => r.paymentTreatment,
                      },
                      {
                        key: "evidence",
                        label: "Why this recommendation",
                        width: "minmax(260px, 2fr)",
                        render: (r) => <span className="text-xs leading-relaxed">{r.reason}</span>,
                      },
                      {
                        key: "value",
                        label: "Estimated additional earnings",
                        render: (r) => inr(r.expectedIncremental),
                      },
                    ]}
                  />
                  <p className="text-xs text-muted-foreground">
                    Showing the top {Math.min(35, shownActions.length)} of {shownActions.length},
                    ranked by estimated additional earnings. {view.noOutreachIds.length} customers
                    are not selected for messaging; {view.holdoutIds.length} are in the control
                    group. All estimates are illustrative.
                  </p>
                </div>
              )}
              {step === "Messages & calls" && (
                <div className="space-y-5">
                  <div className="grid gap-3 rounded-xl bg-surface p-4 sm:grid-cols-3">
                    {[
                      [
                        "WhatsApp message",
                        "Each customer's own product, discount code and payment line, from their orders.",
                      ],
                      [
                        "Personalised image",
                        "Their product and price in your brand style. Prices come from your catalogue.",
                      ],
                      [
                        "Voice follow-up preview",
                        "A simulated Hindi or English follow-up for customers who agreed to calls.",
                      ],
                    ].map(([t, x]) => (
                      <div key={t}>
                        <div className="text-sm font-semibold">{t}</div>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{x}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["WhatsApp", "Call flow", "Email"].map((x) => (
                      <button
                        key={x}
                        disabled={x === "Email"}
                        onClick={() => setChannel(x)}
                        className={
                          "rounded-lg border px-3 py-2 text-sm " +
                          (channel === x ? "border-primary bg-primary-subtle text-primary" : "")
                        }
                      >
                        {x}
                        {x === "Email" ? " · Not available in this demo" : ""}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Pill t="info">Sample draft</Pill>
                    <Button
                      variant="secondary"
                      size="small"
                      isDisabled={locked}
                      onClick={() => {
                        asset(defaultAssets());
                        toast.show({
                          content: "Sample draft added. Review it before approving.",
                          color: "positive",
                        });
                      }}
                    >
                      Use sample draft
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Replaces the current message, image settings and call script.
                    </span>
                  </div>
                  <Field label="Preview customer">
                    <select
                      aria-label="Preview customer"
                      className={fieldClass}
                      value={a?.customerId ?? ""}
                      onChange={(e) => setSample(e.target.value)}
                    >
                      {view.actions.slice(0, 40).map((r) => (
                        <option key={r.customerId} value={r.customerId}>
                          {d.studio.byId.get(r.customerId)?.customer.name} · {r.customerId}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {channel === "WhatsApp" ? (
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-4">
                        <Field
                          label="WhatsApp message"
                          hint="Use {{first_name}}, {{product}}, {{offer}}, {{payment}} and {{link}}. Each customer sees their own."
                        >
                          <textarea
                            aria-label="WhatsApp message"
                            rows={7}
                            className={fieldClass}
                            disabled={locked}
                            value={c.assets.whatsapp}
                            onChange={(e) => asset({ whatsapp: e.target.value })}
                          />
                        </Field>
                        <Field label="Image headline">
                          <input
                            aria-label="Image headline"
                            className={fieldClass}
                            disabled={locked}
                            value={c.assets.creativeTitle}
                            onChange={(e) => asset({ creativeTitle: e.target.value })}
                          />
                        </Field>
                        <Field label="Image style">
                          <select
                            aria-label="Image style"
                            className={fieldClass}
                            disabled={locked}
                            value={c.assets.creativeStyle}
                            onChange={(e) =>
                              asset({
                                creativeStyle: e.target.value as CampaignAssets["creativeStyle"],
                              })
                            }
                          >
                            <option value="botanical">Botanical</option>
                            <option value="minimal">Minimal</option>
                          </select>
                        </Field>
                        <p className="text-xs text-muted-foreground">
                          The background is AI-generated. Product name and price come from your
                          catalogue, never from the AI.
                        </p>
                      </div>
                      <div className="mx-auto w-full max-w-xs overflow-hidden rounded-3xl border-4 border-slate-700 bg-[#edf3ec] shadow-sm">
                        <div className="bg-[#175e4b] p-3 text-sm font-semibold text-white">
                          Nira Botanics · WhatsApp preview
                        </div>
                        <div className="p-3">
                          <div
                            className={
                              "rounded-xl p-5 " +
                              (c.assets.creativeStyle === "botanical" ? "bg-[#dcebdc]" : "bg-white")
                            }
                            style={
                              c.assets.creativeStyle === "botanical"
                                ? {
                                    backgroundImage:
                                      "linear-gradient(rgba(255,255,255,.35),rgba(255,255,255,.55)),url(/creatives/nira-botanical-base.png)",
                                    backgroundSize: "cover",
                                  }
                                : undefined
                            }
                          >
                            <span className="text-xs font-semibold tracking-widest">
                              NIRA BOTANICS
                            </span>
                            <h4 className="mt-3 font-heading text-xl">{c.assets.creativeTitle}</h4>
                            <div
                              className="mx-auto my-5 flex h-28 w-20 items-center justify-center rounded-t-2xl rounded-b-lg border-2 border-white bg-[#73977d] p-2 text-center text-xs text-white"
                              aria-label="Illustrative product packaging"
                            >
                              NIRA
                              <br />
                              {selectedProduct?.size}
                            </div>
                            <p className="text-sm font-semibold">{selectedProduct?.name}</p>
                            <p className="mt-1 text-sm">
                              {selectedProduct
                                ? inr(
                                    selectedProduct.price -
                                      Math.round((selectedProduct.price * (a?.offer ?? 0)) / 100),
                                  )
                                : "Choose an eligible customer"}
                            </p>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap rounded-lg bg-white p-3 text-xs leading-relaxed">
                            {a && customer
                              ? renderAsset(c.assets.whatsapp, customer.name, a)
                              : "No eligible preview customer."}
                          </p>
                          <div className="mt-2 rounded-lg bg-white p-2 text-center text-xs font-semibold text-primary">
                            Reorder now
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          aria-label="Call customers who do not reply"
                          checked={c.settings.callsEnabled}
                          disabled={locked}
                          onChange={(e) => setting({ callsEnabled: e.target.checked })}
                        />
                        Call customers who don't reply on WhatsApp, only where it pays off
                      </label>
                      <Note>
                        Only customers who agreed to calls, and only when estimated earnings cover
                        the call. {view.actions.filter((x) => x.callEligible).length} qualify. Voice
                        follow-ups are simulated in this demo.
                      </Note>
                      {(
                        [
                          ["callOpening", "Opening and permission"],
                          ["callInterested", "Interested customer"],
                          ["callObjection", "Price or timing objection"],
                          ["callDecline", "Decline / end call"],
                        ] as const
                      ).map(([key, label]) => (
                        <Field key={key} label={label}>
                          <textarea
                            aria-label={label}
                            rows={3}
                            className={fieldClass}
                            disabled={locked}
                            value={c.assets[key]}
                            onChange={(e) => asset({ [key]: e.target.value })}
                          />
                          {a && customer && (
                            <span className="mt-1 block text-xs font-normal text-muted-foreground">
                              {renderAsset(c.assets[key], customer.name, a)}
                            </span>
                          )}
                        </Field>
                      ))}
                      <p className="text-xs text-muted-foreground">
                        The assistant can't offer more than the approved discount. An order or a
                        'no' ends all follow-ups.
                      </p>
                    </div>
                  )}
                </div>
              )}
              {step === "Budget & approval" && (
                <div className="space-y-5">
                  <h3 className="section-title">Set your limits, then approve.</h3>
                  <Note>
                    This demo estimates a 25% success fee on additional earnings over the control
                    group. No fee is charged. Discounts, product, delivery and payment costs are
                    deducted before the estimate.
                  </Note>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(
                      [
                        ["minContribution", "Minimum earnings per delivered order (₹)"],
                        ["incentiveCap", "Maximum total discount value (₹)"],
                      ] as const
                    ).map(([key, label]) => (
                      <Field key={key} label={label}>
                        <input
                          aria-label={label}
                          type="number"
                          min="0"
                          className={fieldClass}
                          disabled={locked}
                          value={c.settings[key]}
                          onChange={(e) => setting({ [key]: Math.max(0, Number(e.target.value)) })}
                        />
                      </Field>
                    ))}
                  </div>
                  <ul className="space-y-2 text-sm">
                    {view.blockers.map((b) => (
                      <li key={b} className="text-destructive">
                        • {b}
                      </li>
                    ))}
                    {!view.blockers.length && (
                      <li className="text-success">
                        Ready for campaign approval: audience, earnings limit, discount limit,
                        message and spend checks have passed.
                      </li>
                    )}
                    <li>
                      {view.holdoutIds.length} customers in the control group won't be messaged, so
                      you can see what the campaign caused (
                      {(
                        (view.holdoutIds.length /
                          Math.max(
                            1,
                            view.actions.length +
                              view.holdoutIds.length +
                              view.noOutreachIds.length,
                          )) *
                        100
                      ).toFixed(1)}
                      %).{" "}
                    </li>{" "}
                    <li>
                      {" "}
                      The success-fee estimate is available only after deliveries, COD collection
                      and the return window are resolved.{" "}
                    </li>
                  </ul>
                  {c.status === "draft" && (
                    <Button isDisabled={view.stale || view.blockers.length > 0} onClick={approve}>
                      Approve campaign
                    </Button>
                  )}
                  {c.status === "approved" && (
                    <Pill t="success">
                      Approved. Editing before launch requires approval again.
                    </Pill>
                  )}
                </div>
              )}
              {step === "Results" && (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Stat label="Orders placed after a message" value={stats?.attributed ?? 0} />
                    <Stat label="Orders delivered and paid" value={stats?.collected ?? 0} />
                    <Stat
                      label="Orders awaiting delivery or payment"
                      value={stats?.pending ?? 0}
                      hint="Includes the control group"
                    />
                  </div>
                  {c.status === "completed" && (
                    <Button
                      variant="secondary"
                      onClick={() => mutate((s) => reconcileCampaign(d.data, s, c.id))}
                    >
                      Simulate delivery and payment updates
                    </Button>
                  )}
                  <Note>{d.studio.portfolio.reason}</Note>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Stat
                      label="Additional earnings vs control, all campaigns"
                      value={
                        d.studio.portfolio.fee === null
                          ? "Pending"
                          : inr(d.studio.portfolio.incremental)
                      }
                      hint="Messaged customers minus the control group, scaled to the same size. Can be negative."
                    />
                    <Stat
                      label="Estimated success fee (25%)"
                      value={
                        d.studio.portfolio.fee === null ? "Pending" : inr(d.studio.portfolio.fee)
                      }
                      hint="Losses on one campaign offset gains on another"
                    />
                  </div>
                  <DataTable
                    rows={c.outcomes.filter((o) => o.group === "treatment").slice(0, 30)}
                    rowId={(o) => o.customerId}
                    label="Customer outcomes"
                    columns={[
                      { key: "id", label: "Customer", render: (o) => o.customerId },
                      {
                        key: "state",
                        label: "Outcome",
                        render: (o) => OUTCOME_LABEL[o.state],
                      },
                      {
                        key: "payment",
                        label: "Payment",
                        render: (o) => o.paymentMethod.toUpperCase(),
                      },
                      { key: "amount", label: "Order value", render: (o) => inr(o.netSales) },
                      {
                        key: "refund",
                        label: "Refund",
                        render: (o) =>
                          o.state === "collected" ? (
                            <Button
                              size="small"
                              variant="tertiary"
                              onClick={() => mutate((s) => refundOutcome(s, c.id, o.customerId))}
                            >
                              Simulate refund
                            </Button>
                          ) : (
                            "—"
                          ),
                      },
                    ]}
                  />
                  <details>
                    <summary className="cursor-pointer text-sm font-semibold">Activity log</summary>
                    <ul className="mt-3 max-h-72 space-y-2 overflow-auto text-xs text-muted-foreground">
                      {[...c.log].reverse().map((e, i) => (
                        <li key={i}>
                          {dayToDate(e.day)} · {e.text}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}
            </section>
            <aside className="panel h-fit space-y-5 p-5">
              <Pill t="info">Forecast</Pill>
              <Stat
                label="Customers to message"
                value={view.actions.length}
                hint={
                  view.holdoutIds.length +
                  " in control group · " +
                  view.noOutreachIds.length +
                  " not selected for messaging"
                }
              />
              <Stat label="Estimated additional earnings" value={inr(view.expectedIncremental)} />
              <Stat label="Estimated success fee (25%)" value={inr(view.estimatedFee)} />
              <Stat label="Estimated earnings you keep" value={inr(view.merchantKeeps)} />
              <div className="border-t pt-4">
                <Stat
                  label="Messaging cost (we pay)"
                  value={inr(view.operatorCost)}
                  hint="AI, WhatsApp and calls"
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  Discount value if every customer uses their code: {inr(view.incentiveExposure)}.
                </p>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
