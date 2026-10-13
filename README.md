# Retention Agent

**A repeat-purchase decision agent for Razorpay Agent Studio.** It decides, for every past customer of a D2C brand, whether to reach out, when, with which product, whether a discount is needed at all, and how they should pay. It then measures what the campaign actually caused against a control group.

**▶ Live demo: [smart-retention-razorpay.lovable.app](https://smart-retention-razorpay.lovable.app/)** (no login needed; start with **Guided tour** in the header)

> Razorpay × ISB AI PM Build Challenge · **Track 2: Recover and Grow with AI**
> Independent concept prototype. Not an official Razorpay product. All merchant data is synthetic and nothing in this app contacts a real person or service.

---

## In 30 seconds

| | |
|---|---|
| **Merchant** | Growth or retention manager at a mid-size Shopify D2C brand on Razorpay Magic Checkout (≈5K–50K orders a month, heavy COD) |
| **Problem** | 70–80% of first-time D2C buyers never order again within 90 days. When brands do run retention campaigns, they send the same coupon to everyone, so discount money goes to customers who would have bought anyway, and COD orders come back as RTO |
| **Signal** | Order history and SKU rhythm from the store, plus payment method, COD/RTO risk, refunds and settled cash from Razorpay |
| **Decision** | Per customer: include or skip · product · discount or none · pay-online nudge for risky COD · channel |
| **Merchant control** | Suggested campaigns become editable drafts. Nothing is sent until the merchant approves. Pause any time. Caps on discount, margin and budget |
| **Proof** | Every campaign holds back a control group. Results are extra profit after discounts, RTO and refunds. Attributed sales are not counted as proof |
| **Demo merchant** | *Nira Botanics*, a fictional skincare and haircare brand: 30,000 orders, 12,000 customers, six months of history |

```mermaid
flowchart LR
    A["Store orders<br/>+ Razorpay payment,<br/>COD/RTO and refund signals"] --> B["Customer profile<br/>rhythm · spend · discount use · risk"]
    B --> C["Decision per customer<br/>skip · product · offer or none · payment"]
    C --> D["Guardrails<br/>consent · frequency · stock · margin · cap"]
    D --> E["Merchant review<br/>edit · approve · pause"]
    E --> F["WhatsApp message<br/>+ payment link"]
    F --> G["Measure vs control group<br/>net of discounts, RTO, refunds"]
    G -. "next plan" .-> B
```

---

## 1. The problem we chose

**The merchant:** a growth manager at a ₹50–100 Cr Shopify D2C brand. They spend ₹800–1,200 to acquire a beauty or personal-care customer, 30–60% of orders are COD, and most of those customers never come back.

**What they do today:** they use a WhatsApp/CRM tool (BiteSpeed, LimeChat, Interakt, Klaviyo) with fixed flows such as "reorder reminder at day 30" or "win-back at day 60", plus festive broadcasts. Everyone in a flow gets the same 15–20% coupon. Success is reported as *attributed revenue*: any order placed within X days of a message is credited to the message.

**Where it breaks:**

1. **Discount waste.** A loyal customer who reorders every 28 days at full price gets the same coupon as someone who only buys on sale. Stacked discounts reach 25–30% of revenue for many brands.
2. **RTO hides inside "revenue".** A COD reorder that is refused at the door shows up as a campaign win and as a logistics loss.
3. **Nobody can answer the finance question:** *"How much of that discount went to people who would have bought anyway, and how many of those orders came back?"* Attribution cannot answer it. Only a control group can.

**Why this matters to Razorpay:** after the first order, Razorpay has the richest data it will ever have on a shopper (what they paid, how they paid, what came back, settled cash), and no Razorpay product acts on it yet.

## 2. How we narrowed it down

We started from the whole brief ("recover and grow revenue for Razorpay merchants") and applied four filters to every persona and journey stage:

1. **Razorpay already has the data.** No new data collection is needed to start.
2. **It's a money decision that changes per customer**, so AI can beat a fixed rule.
3. **Razorpay or a direct competitor doesn't already ship it.**
4. **There are enough orders to prove impact against a control group.**

```mermaid
flowchart TD
    A["Whole space: recover and grow revenue for Razorpay merchants"] --> B["Personas: subscription · enterprise · long-tail · D2C · shopper"]
    B -->|"4 filters"| C["Mid-size Shopify D2C brand on Magic Checkout, heavy COD"]
    C --> D["Journey: browse · checkout · pay · dispatch · delivery · returns · after first order"]
    D -->|"Rich Razorpay data, no Razorpay product acting on it"| E["After the first order"]
    E --> F["Ideas tested: occasion offers · COD→prepaid · cash-truth ROAS · CRM · fixed 30/60-day reminders"]
    F --> G["Repeat-purchase decision agent"]
```

| Considered | Decision | Why |
|---|---|---|
| Subscription merchants (failed renewals) | Dropped | Razorpay's Subscription Recovery agent already covers it |
| Enterprise merchants | Dropped | Have analysts and account managers; least need |
| Long-tail merchants | Dropped | Too few orders to decide per customer or run a control group |
| Cart abandonment / failed payments | Parked | Biggest pools, but Razorpay ships its own agents and 5+ vendors compete |
| COD → prepaid before dispatch | Folded in | Scored highest, but RTO Shield and COD confirmation already ship. Kept as the agent's *payment decision* |
| A full CRM ("BiteSpeed inside Razorpay") | Rejected | BiteSpeed became a Razorpay partner in June 2026. We decide; messaging is a channel |
| Fixed 30/60-day reminders | Replaced | That's a rule that every tool already offers. The agent uses each customer's own reorder rhythm |
| Cross-merchant targeting, ad network, lending | Rejected | Needs fresh consent under DPDP and breaks Razorpay's processor role |

**Where the stages sit** (our qualitative read; sources in [docs/RESEARCH.md](docs/RESEARCH.md)):

| Journey stage | What Razorpay sees | Who already acts |
|---|---|---|
| Browse & cart | Cart + phone (Magic Checkout OTP) | Razorpay cart agent, GoKwik, BiteSpeed |
| Checkout & pay | Payment method, failures, RTO score | Magic Checkout, GoKwik, Shopflo, payment retry |
| Before dispatch (COD) | COD orders and risk | RTO Shield, COD confirmation, Shiprocket |
| Delivery / returns | RTO, refunds and reasons | Logistics tools, Return Prime |
| **After the first order** | **What was bought, how they paid, what came back, settled cash** | **Messaging tools send; nobody decides who needs an offer or proves impact** ← *we build here* |

Full research, including the competitor map, merchant pain evidence and sources: **[docs/RESEARCH.md](docs/RESEARCH.md)**.

## 3. What the product does

Open the app and the merchant lands on **Today**: three suggested campaigns, each with an audience, expected extra earnings and a control group.

| Campaign | Who | What the agent decides |
|---|---|---|
| **Reorder reminder** | Repeat customers near their *own* usual reorder gap | Same product; reminder with **no discount** where that earns more |
| **Second order** | First-time buyers 2–10 weeks after their first order | The next product in their routine, offer level |
| **Win-back** | Customers well past their usual gap (one attempt, then stop) | Whether it's worth one attempt, and the offer |

For every customer it shows a one-line reason, built only from that customer's data. For example:

> *Reorders about every 31 days; last bought 29 days ago. Paid full price on all 4 orders, so a reminder without a discount earns more than any discount. Razorpay RTO risk: medium on COD, so we ask them to pay online.*

**The merchant can:** edit the audience, product, discount cap, budget and WhatsApp copy and image. They can enable optional voice follow-ups, save drafts and templates, approve, schedule and pause. Approval freezes the recipients, offers and assets. If they edit after approving, the campaign needs approval again.

### Screens

| Route | What it shows |
|---|---|
| `/` **Today** | Suggested campaigns, expected extra earnings, saved drafts |
| `/campaigns` | Campaign editor: audience → products & offers → message → budget & approval → results |
| `/insights` **Impact simulation** | The same 2,500 customers under: no retention tool · a manual 20% sale · Retention Agent |
| `/database` **Order data** | Every order, refund and risk signal behind the decisions; searchable, downloadable as CSV |
| `/setup` **Connections** | Simulated Shopify + Razorpay + WhatsApp onboarding |

The **Guided tour** (button in the header) takes a reviewer through the main flow in about 2 minutes, explaining each product choice along the way.

## 4. Why AI, and not a fixed rule

A rule sorts customers by recency or spend and sends everyone in the segment the same coupon. It can't tell these customers apart:

| | Buys **with** an offer | Doesn't buy with an offer |
|---|---|---|
| **Buys without an offer** | *Would buy anyway* → reminder, **no discount** | *Put off by messages* → leave out |
| **Doesn't buy without an offer** | *Needs an offer* → smallest offer that works | *Won't buy either way* → spend nothing |

The agent estimates, per customer and per offer level, the **extra** profit over doing nothing:

```
extra profit = P(buy | offer) × P(delivered) × margin after discount
             − P(buy anyway) × P(delivered) × full margin
```

It picks the option with the highest value, which includes "no discount" and "don't contact". `P(delivered)` uses the Razorpay COD/RTO risk tier, so risky COD customers get a pay-online nudge instead of a bigger coupon.

**Honest about v1.** In this prototype the response estimates are transparent formulas with stated priors. For example, a customer's discount history is shrunk toward a 25% prior worth three orders (see `estimateAction` in [src/retention/studio.ts](src/retention/studio.ts)). In production this becomes an uplift model trained on control-group results per merchant. The decision logic and the merchant experience stay the same. What changes is where the probabilities come from.

## 5. How it learns from outcomes

Every approved campaign reserves a control group (customers who are eligible but get no message), and the system records:

- placed → delivered and paid → RTO / refunded (late refunds adjust results once)
- extra profit = treatment minus normalised control, with skipped and no-outreach customers kept in the denominator

**Built in the prototype:** control groups, outcome reconciliation, and per-campaign and portfolio results. **Next step (not built):** feed those results back to update each merchant's buy-anyway rate and discount response by segment, so the next plan needs fewer discounts.

## 6. Trust, permissions and failure cases

| Risk | What the product does |
|---|---|
| Sending without consent | Separate WhatsApp and voice consent; opt-outs honoured; email shown as "coming soon" |
| Wrong or stale data | Before every send it rechecks for an open refund, pending or recent order, stock, frequency cap and campaign expiry. A Razorpay signal older than 7 days falls back to store history |
| Audience creep | Approval freezes recipients. A daily refresh can only *remove* newly ineligible customers, never add new ones silently |
| Customers hit by two campaigns | An approved campaign reserves its customers, including its control group, across all campaigns |
| LLM-written prices | Prices, discounts and products come from the catalog and rules. Generated content never changes them |
| Over-claiming impact | Attributed sales are shown but never used as proof. Results are labelled as estimates; the demo's minimum group sizes are guardrails, not statistical significance |

## 7. What we measure

| Metric | Role |
|---|---|
| Extra profit vs the control group, after discounts, RTO and refunds | **Primary** |
| Discount ₹ per extra order | Should fall |
| 90-day repeat rate (baseline 20–30%) | Should rise |
| Share of repeat orders paid online | Should rise |
| Opt-out rate | Guardrail: must not rise |

Commercial idea (illustrative only): Razorpay takes 25% of positive extra profit after campaign losses offset wins, and absorbs AI and messaging costs.

## 8. What we deliberately didn't build

- **A CRM or messaging platform.** That's a crowded market, and partners already exist.
- **Sending without merchant approval.**
- **Cross-merchant targeting.** Razorpay network signals are used only for payment/delivery risk, never to infer discount sensitivity.
- **Live integrations.** Shopify OAuth, Razorpay signal APIs, WhatsApp/voice delivery and invoicing are all simulated. The boundaries are listed in [docs/PRODUCT_DECISIONS.md](docs/PRODUCT_DECISIONS.md).
- **A trained model.** See section 4. The prototype shows the decision and the merchant experience, not a fitted model.

## 9. Run it locally

The hosted version is at [smart-retention-razorpay.lovable.app](https://smart-retention-razorpay.lovable.app/). To run it yourself you need Node 20+ (Node 24+ for the data export).

```bash
npm install
npm run dev        # open the local URL Vite prints
npm test           # workflow, data, routing, persistence and policy tests
npm run typecheck
npm run build
```

Everything runs offline: no API keys, no external calls. **Reset demo** in the header restores the exact starting state. Merchant edits are saved in browser localStorage only.

## 10. Repository map

```
src/retention/          Pure decision logic (no UI)
  data.ts                 Seeded synthetic merchant: 30,000 orders, 12,000 customers
  features.ts             Customer profile: rhythm, discount use, risk, eligibility
  studio.ts               Campaign decisions, approval, sending, reconciliation, results
  benchmark.ts            Impact simulation vs no tool / manual 20% sale
  policy.ts, forecast.ts  Guardrails and offer economics
src/routes/             Screens (TanStack Start file routes)
src/components/retention/  App shell, campaign editor, customer drawer, tour
src/test/               Vitest suites
data/nira/              The same synthetic history as CSV + SQLite, with a data dictionary
docs/                   Research, product decisions, AI build log
```

The UI reads one derived state (`deriveStudio`), so numbers agree across screens. The order history is regenerated from a fixed seed (20261012) and never stored.

Legacy routes `/cohort`, `/workbench` and `/review` are an earlier offer-maths lab. They're kept for reference and aren't in the navigation.

## 11. Documentation

| Doc | What's in it |
|---|---|
| [docs/RESEARCH.md](docs/RESEARCH.md) | Narrowing, journey and competitor map, merchant pain evidence, sources, open risks |
| [docs/PRODUCT_DECISIONS.md](docs/PRODUCT_DECISIONS.md) | Every product, data, pricing and state decision, plus live-integration boundaries |
| [docs/AI_BUILD_LOG.md](docs/AI_BUILD_LOG.md) | How AI tools were used, and which decisions were made by hand |
| [BUILD_LOG.md](BUILD_LOG.md) | Detailed, dated implementation and verification history |
| [data/nira/README.md](data/nira/README.md) | Data dictionary, assumptions, SQL examples |
| [docs/CREATIVE_ASSETS.md](docs/CREATIVE_ASSETS.md) | Provenance of the AI-generated campaign image |
| [docs/history/](docs/history/README.md) | Earlier plans and UI notes, superseded |

## 12. What is simulated

Merchant data, Razorpay signals (including the RTO risk tier), message and call drafting, delivery, orders placed during execution, collections and fees are **all simulated**. Response rates and costs are assumptions, not measured results. Market figures in the research are mostly vendor-reported and are labelled that way. No real merchant was interviewed for this prototype. Validation interviews are the first next step (questions in [docs/RESEARCH.md](docs/RESEARCH.md#6-open-questions-and-how-wed-validate)).

UI built with Razorpay's open-source [Blade](https://github.com/razorpay/blade) design system. Fonts are self-hosted.
