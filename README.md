# Retention Agent — Proposed extension for Razorpay Agent Studio

Independent buildathon concept for the Razorpay AI PM Build Challenge, Track 2 (Recover and Grow with AI).
**Not an official Razorpay product**, not endorsed by Razorpay, no live integration.

Demo mode · Synthetic data · Simulated recommendations and messaging.

## Run and reset
- `bun install && bun run dev`, open the app. Desktop-first (designed at 1440×900).
- State persists in `localStorage` (`retention-agent-demo-v1`). **Reset demo** (header) clears it and restores the identical seeded dataset and a fresh draft campaign.
- `bunx vitest run src/test/retention-acceptance.test.ts` runs the executable acceptance checks.

## What actually works
- Seeded dataset (seed `20261010`): 300 fictional customers, 15 products (coffee, personal care, household), ~6 months of orders with quantities, prices, discounts, statuses (completed / cancelled / returned / refund pending), marketing consent, contact history, stock and variable costs.
- Feature derivation per customer: relevant product, completed-purchase intervals, median typical interval, configurable reorder-window tolerance, observed offer usage.
- Eligibility with enforced hard blocks (no consent/opt-out, unresolved refund, purchased within 2 days, out of stock, contact-frequency limit) plus merchant exclusion, needs-review (insufficient history) and review resolution where permitted.
- Customer-level offer recommendation, uniform-offer comparison, per-customer overrides, budget/discount-cap/contribution-floor policy checks, no-outreach decisions.
- Stable ≈10% holdout (FNV hash of campaign ID + customer ID only).
- Campaign states Draft → Approved → Running ⇄ Paused → Completed; approval bound to a plan hash and invalidated by any change.
- Controlled “Send next demo batch” with pre-send recheck of consent, recent purchase, refund, stock, frequency, merchant exclusion and budget; duplicate-send prevention.
- Simulated outcomes (delivery, failure, purchase, opt-out, organic purchase), idempotent event application with replay, chronological event log, forecast-vs-observed.

## What is simulated
Recommendations (deterministic adapter `deterministic-simulated-v1`), WhatsApp messages, deliveries, purchases and opt-outs. No external AI, messaging, payment, database or auth services are used or contacted.

## Data and forecast assumptions
- Each product has explicit fixture purchase probabilities for 0% / 10% / 20% offers (`src/retention/data.ts`). They are illustrative assumptions, not measurements or learned customer-level predictions. Customer history controls relevance and eligibility, not purchase probabilities.
- Contribution before incentive = price − assumed variable order costs. Messaging cost Rs 1 per contacted customer.
- Hero fixture (CUS-0001, coffee beans): basket Rs 1000, contribution Rs 400, P = 0.10 / 0.15 / 0.18 → Rs 39 / 44 / 35 → 10% recommended.
- Second fixture (CUS-0002, laundry liquid): basket Rs 500, contribution Rs 200, P = 0.20 / 0.21 / 0.22 → Rs 39 / 30.5 / 21 → no discount recommended.

## Calculation definitions
- Expected contribution per contacted customer = P × (contribution before incentive − discount) − messaging cost.
- Offer permitted iff discount ≤ max discount and post-discount contribution (before messaging) ≥ minimum contribution per order.
- Budget exposure = Σ maximum discount liability + Σ messaging cost across contacted (non-holdout) customers. Launch is blocked if exposure > budget; no partial sends.
- Aggregates are sums of customer-level calculations.
- Due window: days since last relevant purchase ∈ typical interval × (1 ± tolerance). Typical interval requires ≥3 completed purchases.

## Known limitations
- Forecast superiority is not evidence of causal uplift; sample sizes are too small to estimate uplift (the UI says so).
- Holdout is hash-based, so its size is approximately, not exactly, 10%.
- Single merchant, single implemented playbook; cross-sell and win-back are labelled previews only.
- Simulated clock; all events occur on 10 Oct 2026.
- Settings are locked after launch (reset to edit).

## Design and fonts
- Blade-inspired styling: Razorpay Blade components are **not** used (Blade depends on styled-components and its own provider; we kept the existing Radix/shadcn primitives restyled with semantic tokens). Colour values are approximations, not official Blade tokens.
- Fonts: TASA Orbiter (headings) and Inter (body) are self-hosted copies of the files in `razorpay/blade/packages/blade/fonts` (SIL Open Font License 1.1), with Blade's fallback order (→ Arial/sans-serif). See `public/fonts/NOTICE.md`.

## Future grounded AI adapter
Implement `RecommendationAdapter` (`src/retention/recommend.ts`) with a service that receives derived features (never holdout assignment) and returns action, offer and explanation. Policy checks, budget and pre-send rechecks stay deterministic and run after the adapter, so the AI cannot bypass them.

## Module layout
`src/retention/`: `data.ts` (seeded fixtures) · `features.ts` (feature derivation) · `forecast.ts` (calculations) · `policy.ts` (plan + checks) · `recommend.ts` (mock adapter) · `campaign.ts` (state transitions) · `store.tsx` (persistence). UI in `src/routes/` and `src/components/retention/`.

## Strategy comparison semantics
All baselines evaluate the same explicitly listed eligible non-holdout IDs after exclusions and review resolution. Offer overrides are ignored by baselines and retained by the selected plan. No outreach has zero forecast contribution, exposure and messaging cost; contact counts can therefore differ without changing the decision audience. A strategy with any invalid offer, excessive budget exposure, or no contacts is not executable: its full totals are labelled counterfactual, never a partial executable forecast. Assumptions are unchanged across strategies. The recommended mix maximises positive permitted expected contribution per customer but does not solve budget allocation.
Holdout membership remains the existing stable campaign/customer FNV threshold <0.1; actual count and percentage of currently eligible customers are displayed, not an exact 10% claim.
