import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, Note, Pill } from "@/components/retention/bits";
import { DataTable } from "@/components/retention/DataTable";
import { useDemo } from "@/retention/store";
import { runBenchmark } from "@/retention/benchmark";
import { inr } from "@/retention/format";
export const Route = createFileRoute("/insights")({
  component: Insights,
  head: () => ({ meta: [{ title: "Compare strategies — Retention Agent" }] }),
});
function Insights() {
  const { d } = useDemo();
  const [response, setResponse] = useState(1);
  const rows = useMemo(
    () => runBenchmark(d.data, d.studio.features, response),
    [d.data, d.studio.features, response],
  );
  return (
    <div className="space-y-5 animate-enter">
      <PageHeader
        title="How does this compare with a flat sale?"
        subtitle="The same 2,500 customers, four ways to run a campaign · simulated over 90 days"
        actions={<Pill t="warning">Simulated results</Pill>}
      />
      <Note>
        Each row runs the same {rows[0]?.audience.toLocaleString("en-IN")} customers through a
        different approach. How customers actually behave is simulated separately from what the
        agent predicts, so the agent can lose. Orders customers would have placed anyway, RTO,
        returns and discounts are all counted.
      </Note>
      <section className="panel p-5">
        <label className="block text-sm font-semibold">
          How much messages influence buying: {response.toFixed(2)}×
          <input
            aria-label="How much messages influence buying"
            type="range"
            min="0"
            max="2"
            step="0.25"
            value={response}
            onChange={(e) => setResponse(Number(e.target.value))}
            className="mt-3 block w-full max-w-lg"
          />
        </label>
        <p className="mt-2 text-xs text-muted-foreground">
          At 0×, messages don't change whether anyone buys. Asking COD customers to pay online still
          cuts RTO.
        </p>
      </section>
      <section data-tour="benchmark" className="panel p-4">
        <DataTable
          rows={rows}
          rowId={(r) => r.strategy}
          label="Results by approach"
          minWidth={1400}
          columns={[
            {
              key: "strategy",
              label: "Approach",
              width: "minmax(240px, 2fr)",
              render: (r) => r.strategy,
            },
            { key: "contacts", label: "Messaged", render: (r) => r.contacts },
            {
              key: "orders",
              label: "Delivered and paid orders",
              render: (r) => Math.round(r.collectedOrders),
            },
            { key: "sales", label: "Sales", render: (r) => inr(r.netSales) },
            {
              key: "margin",
              label: "Profit",
              render: (r) => inr(r.merchantContribution),
            },
            { key: "uplift", label: "Extra profit vs flat 20%", render: (r) => inr(r.incremental) },
            {
              key: "fee",
              label: "Fee (25%)",
              render: (r) => (r.strategy.startsWith("Agent") ? inr(r.successFee) : "—"),
            },
            {
              key: "keeps",
              label: "You keep",
              render: (r) => inr(r.merchantRetains),
            },
            { key: "cost", label: "Messaging cost (we pay)", render: (r) => inr(r.operatorCost) },
          ]}
        />
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          [
            "Sales credited to a message",
            "Any order placed after a message. It doesn't show whether the message caused it.",
          ],
          [
            "Extra profit",
            "The difference against customers who got no message: the control group.",
          ],
          [
            "When the fee is charged",
            "Only after deliveries, COD collection and the return window close, measured against the control group.",
          ],
        ].map(([title, text]) => (
          <section key={title} className="panel p-5">
            <h2 className="section-title">{title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{text}</p>
          </section>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Both agent rows use the same logic as Campaigns. "Store data only" uses your Shopify
        history. "+ Razorpay RTO score" also asks medium- or high-risk COD customers to pay online
        (we assume half of them do). Only about 8% of this store's customers carry that risk, so the
        difference is small here.
      </p>
      <p className="text-xs text-muted-foreground">
        The flat 20% sale stands in for a typical campaign; it is not a claim about every store.
        Each customer gets one campaign, and results cover 90 days.
      </p>
    </div>
  );
}
