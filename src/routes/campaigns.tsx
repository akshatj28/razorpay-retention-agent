import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Button, useToast } from "@razorpay/blade/components";
import { PageHeader, Pill, Note, Stat } from "@/components/retention/bits";
import { DataTable } from "@/components/retention/DataTable";
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
  renderAsset,
  type StudioState,
  type Goal,
  type CampaignSettings,
  type CampaignAssets,
} from "@/retention/studio";

export const Route = createFileRoute("/campaigns")({
  component: Campaigns,
  head: () => ({ meta: [{ title: "Campaign Studio — Nira Botanics" }] }),
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
  const isNudge = (x: (typeof allActions)[number]) =>
    x.paymentTreatment.startsWith("Prepaid nudge");
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
        title="Campaign Studio"
        subtitle={MERCHANT_NAME + " · Your work saves automatically in this browser"}
        actions={<Button onClick={() => create()}>Build a campaign</Button>}
      />
      <section className="panel p-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Campaign library">
          {[
            ["all", "All campaigns"],
            ["draft", "Drafts"],
            ["scheduled", "Scheduled"],
            ["active", "Active"],
            ["completed", "Completed"],
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
                    {GOALS[t.settings.goal]} · Audience rules and content saved; recipients refresh.
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
                    <Pill t={x.status === "draft" ? "neutral" : "info"}>{x.status}</Pill>
                    <span className="text-xs text-muted-foreground">
                      v{x.revision} · {x.origin}
                    </span>
                  </span>
                </button>
              ))
            ) : (
              <p className="py-3 text-sm text-muted-foreground">
                No campaigns here yet. Start with a recommendation or build your own.
              </p>
            )}
          </div>
        )}
      </section>
      {!view || !c ? (
        <section data-tour="studio" className="panel p-6">
          <h2 className="section-title">Start with a goal.</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {d.studio.opportunities.map((o) => (
              <div key={o.campaign.settings.goal} className="rounded-xl border p-4">
                <Pill t="info">Agent proposal · simulated</Pill>
                <h3 className="mt-3 font-semibold">{GOALS[o.campaign.settings.goal]}</h3>
                <p className="my-3 text-sm text-muted-foreground">
                  {o.actions.length} recommended contacts · {inr(o.merchantKeeps)} expected
                  additional contribution after fee.
                </p>
                <Button
                  onClick={() => create(o.campaign.settings.goal, "recommended")}
                  variant="secondary"
                >
                  Review proposal
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
                  {c.id} · Revision {c.revision} · Reviewed {dayToDate(c.reviewedDay)}
                  {c.snapshot && (
                    <span>
                      {" "}
                      · Processed {c.cursor}/{c.snapshot.actions.length} · Sent {c.sentIds.length}
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
                      ? "Schedule campaign"
                      : "Start demo campaign"}
                  </Button>
                )}
                {["running", "paused"].includes(c.status) && (
                  <Button variant="secondary" onClick={() => mutate((s) => pauseCampaign(s, c.id))}>
                    {c.status === "paused" ? "Resume" : "Pause"}
                  </Button>
                )}
                {c.status === "running" && (
                  <Button onClick={() => mutate((s) => sendStudioBatch(d.data, s, c.id))}>
                    Send next demo batch (12)
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Campaign steps">
              {[
                "Audience",
                "Products & offers",
                "Channels & assets",
                "Economics & approval",
                "Outcomes",
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
              New transactions and the daily refresh changed the evidence. Your edits are preserved.{" "}
              <button
                className="font-semibold underline"
                onClick={() => mutate((s) => refreshDraft(s, c.id))}
              >
                Review refreshed audience
              </button>{" "}
              before approving.
            </Note>
          )}
          {locked && (
            <Note>
              Approved audience, offer limits and assets are frozen. Eligibility is checked before
              sending. Save a template to start a revised campaign.
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
                    <Field label="Audience template">
                      <select
                        aria-label="Audience template"
                        className={fieldClass}
                        value={c.settings.rule}
                        disabled={locked}
                        onChange={(e) =>
                          setting({ rule: e.target.value as CampaignSettings["rule"] })
                        }
                      >
                        <option value="goal">All eligible for this goal</option>
                        <option value="repeat_buyers">Repeat buyers</option>
                        <option value="cod_low_risk">COD preference + fresh low-risk signal</option>
                        <option value="discount_buyers">Previously purchased with an offer</option>
                      </select>
                    </Field>
                    <Field label="Product family">
                      <select
                        aria-label="Product family"
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
                      label="Maximum audience"
                      hint="10–1,000 per demo campaign; includes the stable holdout."
                    >
                      <input
                        aria-label="Maximum audience"
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
                    Store history determines product relevance. Simulated Razorpay signals inform
                    payment and delivery-risk treatment. Discount responsiveness is a separate
                    estimate. No new shoppers are acquired from Razorpay's network.
                  </Note>
                </div>
              )}
              {step === "Products & offers" && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Offer strategy">
                      <select
                        aria-label="Offer strategy"
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
                        <option value="recommended">Agent compares permitted offers</option>
                        {[0, 10, 20, 30].map((n) => (
                          <option key={n} value={n}>
                            {n ? n + "% offer" : "Reminder without discount"}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Maximum discount">
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
                        ["plain", "Reminder, no discount", plainCount],
                        ["offer", "With an offer", view.actions.length - plainCount],
                        ["nudge", "Prepaid nudge", nudgeCount],
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
                    label="Personalized campaign actions"
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
                        label: "Recommended product",
                        render: (r) => productById(r.productId).name,
                      },
                      {
                        key: "offer",
                        label: "Offer",
                        render: (r) => (r.offer ? r.offer + "%" : "None"),
                      },
                      {
                        key: "payment",
                        label: "Payment treatment",
                        render: (r) => r.paymentTreatment,
                      },
                      {
                        key: "evidence",
                        label: "Evidence & signal source",
                        width: "minmax(260px, 2fr)",
                        render: (r) => <span className="text-xs leading-relaxed">{r.reason}</span>,
                      },
                      {
                        key: "value",
                        label: "Expected additional contribution",
                        render: (r) => inr(r.expectedIncremental),
                      },
                    ]}
                  />
                  <p className="text-xs text-muted-foreground">
                    Showing the top {Math.min(35, shownActions.length)} of {shownActions.length},
                    ranked by expected additional contribution. {view.noOutreachIds.length}{" "}
                    no-outreach decisions; {view.holdoutIds.length} stable no-contact controls.
                    Probability and contribution estimates are illustrative.
                  </p>
                </div>
              )}
              {step === "Channels & assets" && (
                <div className="space-y-5">
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
                        {x === "Email" ? " · Coming soon" : ""}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Pill t="info">Simulated AI drafting</Pill>
                    <Button
                      variant="secondary"
                      size="small"
                      isDisabled={locked}
                      onClick={() => {
                        asset(defaultAssets());
                        toast.show({
                          content: "Simulated AI draft generated. Review before approval.",
                          color: "positive",
                        });
                      }}
                    >
                      Generate draft assets
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Explicit regeneration replaces edited assets.
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
                          hint="Personalize with {{first_name}}, {{product}}, {{offer}}, {{payment}} and {{link}}."
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
                        <Field label="Creative headline">
                          <input
                            aria-label="Creative headline"
                            className={fieldClass}
                            disabled={locked}
                            value={c.assets.creativeTitle}
                            onChange={(e) => asset({ creativeTitle: e.target.value })}
                          />
                        </Field>
                        <Field label="Creative direction">
                          <select
                            aria-label="Creative direction"
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
                          Personalized layout preview. AI-generated base artwork; personalized
                          product and price are verified fields. Live generation is not connected.
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
                            Reorder · preview only
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          aria-label="Enable selective call follow-ups"
                          checked={c.settings.callsEnabled}
                          disabled={locked}
                          onChange={(e) => setting({ callsEnabled: e.target.checked })}
                        />
                        Enable selective call follow-ups after WhatsApp
                      </label>
                      <Note>
                        Calls require voice permission and positive operator economics.{" "}
                        {view.actions.filter((x) => x.callEligible).length} currently qualify. Call
                        costs are borne by us; no customer is called in this demo.
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
                        Offer concessions are restricted to the approved offer. Purchasing or
                        declining stops further contact.
                      </p>
                    </div>
                  )}
                </div>
              )}
              {step === "Economics & approval" && (
                <div className="space-y-5">
                  <h3 className="section-title">Pay for additional value.</h3>
                  <Note>
                    Illustrative 25% share of estimated incremental contribution. We fund AI,
                    creative, WhatsApp and calls. Merchant discounts, product costs, fulfilment and
                    payment costs are accounted for before the share.
                  </Note>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(
                      [
                        ["minContribution", "Minimum contribution per collected order"],
                        ["incentiveCap", "Maximum merchant discount liability"],
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
                        Audience, contribution floor, incentive cap, assets and operator cost checks
                        pass.
                      </li>
                    )}
                    <li>
                      {view.holdoutIds.length} no-contact controls; actual percentage{" "}
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
                      %.
                    </li>
                    <li>Order attribution is tracked separately from estimated incrementality.</li>
                    <li>
                      Finalization requires delivery/collection and return-window reconciliation.
                    </li>
                  </ul>
                  {c.status === "draft" && (
                    <Button isDisabled={view.stale || view.blockers.length > 0} onClick={approve}>
                      Approve campaign
                    </Button>
                  )}
                  {c.status === "approved" && (
                    <Pill t="success">Approved for this exact version</Pill>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Holdout receives no additional outreach. Live commercial measurement would also
                    require a business-as-usual comparator, confidence intervals and an agreed
                    reconciliation period.
                  </p>
                </div>
              )}
              {step === "Outcomes" && (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Stat label="Attributed purchases" value={stats?.attributed ?? 0} />
                    <Stat label="Collected orders" value={stats?.collected ?? 0} />
                    <Stat
                      label="Awaiting reconciliation"
                      value={stats?.pending ?? 0}
                      hint="Includes treatment and control purchases"
                    />
                  </div>
                  {c.status === "completed" && (
                    <Button
                      variant="secondary"
                      onClick={() => mutate((s) => reconcileCampaign(d.data, s, c.id))}
                    >
                      Reconcile demo delivery & collection
                    </Button>
                  )}
                  <Note>{d.studio.portfolio.reason}</Note>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Stat
                      label="Portfolio incremental contribution"
                      value={inr(d.studio.portfolio.incremental)}
                      hint="Aggregate treatment minus normalized control; can be negative"
                    />
                    <Stat
                      label="Illustrative portfolio success fee"
                      value={
                        d.studio.portfolio.fee === null ? "Pending" : inr(d.studio.portfolio.fee)
                      }
                      hint="Losses offset wins; not a real invoice"
                    />
                  </div>
                  <DataTable
                    rows={c.outcomes.filter((o) => o.group === "treatment").slice(0, 30)}
                    rowId={(o) => o.customerId}
                    label="Campaign order reconciliation"
                    columns={[
                      { key: "id", label: "Customer", render: (o) => o.customerId },
                      {
                        key: "state",
                        label: "Outcome",
                        render: (o) => o.state.replaceAll("_", " "),
                      },
                      {
                        key: "payment",
                        label: "Payment",
                        render: (o) => o.paymentMethod.toUpperCase(),
                      },
                      { key: "amount", label: "Net sales", render: (o) => inr(o.netSales) },
                      {
                        key: "refund",
                        label: "Late adjustment",
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
                    <summary className="cursor-pointer text-sm font-semibold">
                      Campaign audit history
                    </summary>
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
              <Pill t="info">Illustrative campaign forecast</Pill>
              <Stat
                label="Customers to contact"
                value={view.actions.length}
                hint={
                  view.holdoutIds.length +
                  " controls · " +
                  view.noOutreachIds.length +
                  " no outreach"
                }
              />
              <Stat
                label="Additional contribution before fee"
                value={inr(view.expectedIncremental)}
              />
              <Stat label="Our 25% success share" value={inr(view.estimatedFee)} />
              <Stat label="Merchant retains" value={inr(view.merchantKeeps)} />
              <div className="border-t pt-4">
                <Stat
                  label="Our estimated delivery cost"
                  value={inr(view.operatorCost)}
                  hint="AI, creative, WhatsApp and selective calls"
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  Merchant incentive liability: {inr(view.incentiveExposure)}. These are
                  assumptions, not measured results.
                </p>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
