import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, Note, Pill, Stat } from "@/components/retention/bits";
import { DataTable } from "@/components/retention/DataTable";
import { useDemo } from "@/retention/store";
import { runBenchmark } from "@/retention/benchmark";
import { inr } from "@/retention/format";
export const Route = createFileRoute("/insights")({
  component: Insights,
  head: () => ({ meta: [{ title: "Impact simulation — Retention Agent" }] }),
});
function Insights() {
  const { d } = useDemo();
  const [response, setResponse] = useState(1);
  const rows = useMemo(
    () => runBenchmark(d.data, d.studio.features, response),
    [d.data, d.studio.features, response],
  );
  const [noTool, manual, storeOnly, agent] = rows;
  // The full product includes the Razorpay RTO score; the store-data-only run is shown as a note
  // for stores on another checkout.
  const shown = [noTool!, manual!, agent!];
  return (
    <div className="space-y-5 animate-enter">
      <PageHeader
        title="Impact simulation"
        subtitle={`Compared with running your store without a retention tool · the same ${noTool!.audience.toLocaleString("en-IN")} customers · simulated over 90 days`}
        actions={<Pill t="warning">Simulated results</Pill>}
      />
      <section data-tour="benchmark" className="panel grid gap-5 p-5 sm:grid-cols-3">
        <Stat
          label="Additional earnings vs no campaign outreach"
          value={inr(agent!.incremental)}
          hint="Over 90 days, after discounts, RTO and returns"
        />
        <Stat
          label="Estimated earnings you keep"
          value={inr(agent!.merchantRetains)}
          hint="After the estimated 25% success fee"
        />
        <Stat
          label="Additional earnings vs a manual 20% sale"
          value={inr(agent!.vsFlatSale)}
          hint="If you would otherwise send everyone 20% off"
        />
      </section>
      <Note>
        Each row runs the same customers through a different approach. How customers actually behave
        is simulated separately from what the agent predicts, so the agent can lose. Orders
        customers would have placed anyway, RTO, returns and discounts are all counted.
      </Note>
      <section className="panel p-5">
        <label className="block text-sm font-semibold">
          Assumed message response: {response.toFixed(2)}×
          <input
            aria-label="Assumed message response"
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
          At 0×, campaign messages create no additional orders. Simulated online-payment reminders
          can still reduce return-to-origin risk for COD orders.
        </p>
      </section>
      <section className="panel p-4">
        <DataTable
          rows={shown}
          rowId={(r) => r.strategy}
          label="Results by approach"
          minWidth={1200}
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
              label: "Earnings after product and fulfilment costs",
              render: (r) => inr(r.merchantContribution),
            },
            {
              key: "uplift",
              label: "Additional earnings vs no campaign outreach",
              render: (r) => inr(r.incremental),
            },
            {
              key: "fee",
              label: "Estimated success fee (25%)",
              render: (r) => (r.strategy.startsWith("Retention Agent") ? inr(r.successFee) : "—"),
            },
            {
              key: "keeps",
              label: "Estimated earnings you keep",
              render: (r) => inr(r.merchantRetains),
            },
            {
              key: "cost",
              label: "Messaging cost",
              render: (r) =>
                !r.operatorCost
                  ? inr(0)
                  : inr(r.operatorCost) +
                    (r.strategy.startsWith("Retention Agent") ? " (we pay)" : " (you pay)"),
            },
          ]}
        />
        <p className="mt-3 text-xs text-muted-foreground">
          This simulation includes a Razorpay delivery-risk estimate for checkout customers and can
          recommend online payment for medium- or high-risk COD orders. With store data alone, the
          simulated additional earnings are {inr(storeOnly!.incremental)}, compared with{" "}
          {inr(agent!.incremental)} when that signal is available.
        </p>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          [
            "Additional earnings vs no campaign outreach",
            "The estimated difference from customers who receive no campaign messages, using the same control-group comparison as Campaigns. The simulated 25% fee applies only after delivery, payment and the return window are resolved.",
          ],
          [
            "Manual 20% sale",
            "What a store without a tool might do instead: one WhatsApp blast with 20% off for everyone at day 30. Shown so you can see what a blanket discount costs.",
          ],
          [
            "Sales credited to a message",
            "Any order placed after a message. It doesn't show whether the message caused it, so the comparisons above don't use it.",
          ],
        ].map(([title, text]) => (
          <section key={title} className="panel p-5">
            <h2 className="section-title">{title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{text}</p>
          </section>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        The manual sale stands in for a typical blanket discount; it is not a claim about every
        store. Each customer gets one campaign, and results cover 90 days.
      </p>
    </div>
  );
}
