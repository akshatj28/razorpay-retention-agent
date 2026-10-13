export function RecommendationScope() {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
      <p>
        This demo uses six months of synthetic Nira Botanics orders and simulated payment and
        delivery-risk signals. Six months is the demo's data scope, not a limit on the proposed
        product's customer history.
      </p>
      <p>
        Today's product, timing and offer recommendations are calculated using rules and illustrative
        assumptions. Purchase-response estimates and campaign outcomes are simulated; no live AI
        model is connected.
      </p>
      <p>
        In the proposed live product, orders, product details, inventory, consent and payment outcomes
        would come from connected systems. Costs would come from merchant records or confirmed
        estimates. AI models would help rank suitable products and estimate purchase timing and
        response using product information, customer history and patterns among comparable buyers.
      </p>
      <p>
        Predictions would show their supporting evidence and uncertainty. Consent, stock, discount
        and margin limits would remain explicit checks. Predictive accuracy and extra profit would
        need validation with real merchant data and controlled experiments.
      </p>
    </div>
  );
}

export function DemoScope() {
  return (
    <aside aria-label="Recommendation demo scope" className="rounded-xl border bg-card p-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Demo intelligence:</span> Six months of
        synthetic history, with simulated recommendations and outcomes. Live AI predictions are
        planned.
      </p>
      <details className="mt-2">
        <summary className="cursor-pointer text-sm font-medium text-primary">
          How recommendations would work with live data
        </summary>
        <div className="mt-3">
          <RecommendationScope />
        </div>
      </details>
    </aside>
  );
}
