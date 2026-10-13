import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, Note, Pill, Stat } from "@/components/retention/bits";
import { DataTable } from "@/components/retention/DataTable";
import { runReferenceBenchmark } from "@/retention/benchmark";
import { inr } from "@/retention/format";
export const Route = createFileRoute("/insights")({
  component: Insights,
  head: () => ({ meta: [{ title: "Impact simulation — Retention Agent" }] }),
});
function Insights() {
  const [response, setResponse] = useState(1);
  const rows = useMemo(() => runReferenceBenchmark(response), [response]);
  const [noTool, manual, , agent] = rows;
  const uplift = (amount: number) =>
    `${((amount / noTool!.merchantContribution) * 100).toFixed(1)}%`;
  const shown = [noTool!, manual!, agent!];
  return (
    <div className="space-y-5 animate-enter">
      <PageHeader
        title="Impact simulation"
        subtitle={`The agent versus what you do today · the same ${noTool!.audience.toLocaleString("en-IN")} customers · 90 days`}
        actions={<Pill t="warning">Simulated results</Pill>}
      />
      <section data-tour="benchmark" className="panel p-5">
        <p className="text-lg font-semibold leading-relaxed">
          In a 90-day simulation on the same {noTool!.audience.toLocaleString("en-IN")} customers,
          the agent raised collected earnings by {uplift(agent!.incremental)} over a no-outreach
          control group. A blanket 20%-off sale raised them by {uplift(manual!.incremental)}.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Stat
          label="With the agent"
          value={uplift(agent!.incremental)}
          hint="Collected earnings uplift vs no outreach"
        />
        <Stat
          label="What you do today: blanket 20%-off sale"
          value={uplift(manual!.incremental)}
          hint="Collected earnings uplift vs the same no-outreach control"
        />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Collected earnings means profit after product and fulfilment costs, discounts, RTO and
          returns, before the agent's success fee. Fee details appear below.
        </p>
      </section>
      <Note>
        Each row runs the same customers through a different approach. How customers actually behave
        is simulated separately from what the agent predicts, so the agent can lose. Orders
        customers would have placed anyway, RTO, returns and discounts are all counted.
        This reference comparison uses the original sample customers; saved campaigns do not change it.
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
      <details className="panel p-4">
        <summary className="cursor-pointer font-semibold">Collected earnings and fee details</summary>
        <div className="mt-4">
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
              render: (r) => r === noTool ? "No-outreach control" : r === manual ? "What you do today: blanket 20%-off sale" : "Retention Agent",
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
          The product joins store, payment and courier data to decide whom to contact, what to offer
          and how to measure profit actually collected against a control group. It works with your
          payment provider; Razorpay merchants get a small extra delivery-risk signal where available.
        </p>
        </div>
      </details>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          [
            "Additional earnings vs no campaign outreach",
            "The estimated difference from customers who receive no campaign messages, using the same control-group comparison as Campaigns. The simulated 25% fee applies only after delivery, payment and the return window are resolved.",
          ],
          [
            "What you do today: blanket 20%-off sale",
            "Send the same 20%-off offer to customers around day 30. The comparison shows the result of that merchant workflow alongside the agent, using the same no-outreach baseline.",
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
        Each customer has one campaign opportunity within the 90-day evaluation window. Change the
        response assumption to explore how the result changes.
      </p>
    </div>
  );
}
