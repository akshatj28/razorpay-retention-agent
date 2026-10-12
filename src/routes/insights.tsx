import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, Note, Pill } from "@/components/retention/bits";
import { DataTable } from "@/components/retention/DataTable";
import { useDemo } from "@/retention/store";
import { runBenchmark } from "@/retention/benchmark";
import { inr } from "@/retention/format";
export const Route = createFileRoute("/insights")({
  component: Insights,
  head: () => ({ meta: [{ title: "Outcome benchmark — Retention Agent" }] }),
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
        title="What additional value could we create?"
        subtitle="Independent synthetic counterfactual benchmark · 90-day outcome interpretation"
        actions={<Pill t="warning">Simulation, not measured uplift</Pill>}
      />
      <Note>
        The same {rows[0]?.audience.toLocaleString()} eligible customers face every strategy. Hidden
        demand and response assumptions are isolated from recommendation scores. Organic purchases,
        delivery failure, product returns and discounts are included. The agent is allowed to lose.
      </Note>
      <section className="panel p-5">
        <label className="block text-sm font-semibold">
          Assumed intervention effectiveness: {response.toFixed(2)}×
          <input
            aria-label="Intervention effectiveness"
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
          At 0×, outreach has no causal purchase benefit. Network delivery-risk treatment remains a
          separate assumed effect.
        </p>
      </section>
      <section className="panel p-4">
        <DataTable
          rows={rows}
          rowId={(r) => r.strategy}
          label="Synthetic strategy economics"
          minWidth={1400}
          columns={[
            {
              key: "strategy",
              label: "Strategy",
              width: "minmax(240px, 2fr)",
              render: (r) => r.strategy,
            },
            { key: "contacts", label: "Contacts", render: (r) => r.contacts },
            { key: "orders", label: "Collected orders", render: (r) => r.collectedOrders },
            { key: "sales", label: "Net sales", render: (r) => inr(r.netSales) },
            {
              key: "margin",
              label: "Merchant contribution",
              render: (r) => inr(r.merchantContribution),
            },
            { key: "uplift", label: "Vs conventional", render: (r) => inr(r.incremental) },
            {
              key: "fee",
              label: "Illustrative 25% share",
              render: (r) => (r.strategy.includes("intelligence") ? inr(r.successFee) : "—"),
            },
            {
              key: "keeps",
              label: "Merchant retains uplift",
              render: (r) => inr(r.merchantRetains),
            },
            { key: "cost", label: "Operator cost", render: (r) => inr(r.operatorCost) },
          ]}
        />
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          [
            "What is attributed?",
            "Orders linked to messages or campaigns. This alone does not show purchases caused by them.",
          ],
          [
            "What is incremental?",
            "The contribution difference under paired synthetic worlds, or a properly randomized real business-as-usual experiment.",
          ],
          [
            "When is a fee ready?",
            "After collection and return-window reconciliation, sufficient measurement and an agreed baseline. Real invoicing is not implemented.",
          ],
        ].map(([title, text]) => (
          <section key={title} className="panel p-5">
            <h2 className="section-title">{title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{text}</p>
          </section>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        The conventional baseline is a chosen day-30 / 20% demo policy, not a claim about all
        merchants. Results are an illustrative one-opportunity-per-customer 90-day simulator, not a
        trained model or real test.
      </p>
    </div>
  );
}
