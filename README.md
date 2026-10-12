# Retention Studio — Razorpay Agent Studio concept

Independent buildathon prototype for Track 2: Recover and Grow with AI. Not an official Razorpay product or endorsement.

An offline merchant experience for fictional **Nira Botanics**, a curated skincare and haircare D2C brand. Shopify-shaped history plus **simulated** Razorpay/Vulcan signals produces reviewable campaign proposals. Merchants can build their own, save drafts and templates, edit WhatsApp and voice assets, approve, schedule and simulate execution.

## Start

- Install project dependencies, then run npm run dev.
- npm run build builds the production app.
- npm run typecheck checks TypeScript.
- npm test runs workflow, data, routing, persistence and policy tests.
- npm run data:export regenerates CSV and SQLite (Node 24+ and Python 3; optional NIRA_PYTHON executable override).
- Reset demo clears local merchant edits/events/templates and recreates the same history. Browser state key: retention-agent-demo-v2. Older v1 demo work remains in its old key and is not imported into the different merchant.

## What changed

- One coherent personal-care brand: 18 variants, larger packs, curated kits and bundle components.
- Exactly 30,000 historical orders, 12,000 customers and 41,095 line items across 12 April–11 October 2026. Rolling monthly totals: 4,600 / 4,900 / 4,750 / 5,200 / 4,950 / 5,600.
- Order-level customer IDs, product mix, quantities, discount totals, payment/fulfilment states, collection, refunds and COD RTO. Fake contact addresses cannot reach real people.
- Searchable paginated merchant tables and CSV download; full CSV/SQLite/schema/manifest in data/nira.
- Home with prepared replenishment, second-purchase and win-back proposals, plus custom campaign creation.
- Automatically saved drafts; reusable templates; daily simulated refresh that preserves merchant edits.
- Revision-bound approval snapshots, scheduling, pausing, pre-send checks, duplicate prevention and cross-campaign experiment reservations.
- Editable WhatsApp copy, personalized visual preview, actual AI-generated background asset, and opening/interested/objection/decline call branches. Optional voice follow-ups require permission and positive operator economics. Email is coming soon.
- Collection/return reconciliation and idempotent late refunds; pending purchases enter the history and suppress follow-ups.
- Illustrative outcome pricing, with operator-funded execution, aggregate loss offsets and readiness gates.
- Independent synthetic comparison across organic, conventional, merchant-only and network-enriched strategies, including zero-effect sensitivity.

## Screens

- / — daily opportunities, saved work and outcome proposition.
- /campaigns — campaigns/templates, editor, approval, execution and reconciliation.
- /database — raw tabular history, joins and simulated signal provenance.
- /insights — same-population counterfactual benchmark.
- /setup — simulated Shopify/Razorpay/channel onboarding; six-month backfill requires older-order access in a real connector.
- /cohort, /workbench, /review — existing detailed customer, offer-mathematics and execution labs, retained for evaluator evidence. These use explicit product fixture probabilities and a separate legacy experiment; their forecasts are not the campaign-studio pricing model.

## Intelligence and honest boundaries

Vulcan is a payments foundation model, not a text LLM. Permitted derived signals could enrich payment/delivery risk, while store history drives replenishment and product affinity. Discount response remains a separate retention estimate. Missing, unmatched or stale network signals use merchant-only fallback.

All network signals, text/call drafting, messaging, voice, orders generated during execution, collection and fee outputs are **simulated**. No live Shopify OAuth, Vulcan endpoint, external LLM, messaging provider, voice provider or invoice is contacted.

The photographic creative base was generated during implementation with built-in ImageGen and saved under public/creatives. The offline app reuses it and inserts verified product/price details. Live per-customer generative images are not connected. See docs/CREATIVE_ASSETS.md for the prompt and provenance.

## Outcome economics

Illustrative success share: 25% of positive **aggregate incremental contribution**, after campaign losses offset wins. Merchant product costs, discounts, fulfilment, payment costs, RTO and refunds are included before the share. AI, creatives, WhatsApp and calls are our operating costs; they are not separate merchant usage charges.

Forecast: intervention conversion × delivery probability × discounted contribution, minus natural conversion × undiscounted contribution. Operator selection additionally considers its expected share minus delivery costs. A no-discount reminder or no outreach can win.

Actual demo accounting separates attributed orders, placed orders, collected orders and the estimated treatment-minus-normalized-control contribution. Treatment denominators retain skipped and no-outreach assignments. Readiness requires simulated reconciliation and demo minimum group sizes; these are not proof of statistical significance or authority to invoice.

The synthetic benchmark compares against an explicit conventional policy. In-app campaign controls receive no additional outreach. Real outcome billing needs an agreed business-as-usual experiment, uncertainty assessment, attribution rules and settlement window.

## Architecture and persistence

Pure logic in src/retention: data, features, forecast, policy, recommend, campaign, studio, tables and benchmark. UI reads derive(state), not independently invented headline counts. Shared history, signal lookups and customer features are cached for responsive editing.

History is regenerated from a fixed seed and never stored in localStorage. Only merchant configuration, drafts, templates, approved snapshots and simulated events persist. Hydration prevents the server's initial state from overwriting saved work during StrictMode effect replay.

Daily refresh updates opportunity evidence, while approvals freeze recipients, assets and offers. Pre-send checks can remove newly ineligible recipients but cannot silently add a new audience. Approved experiments reserve their full assignments, including holdouts.

Razorpay Blade components/tokens and self-hosted TASA Orbiter/Inter fonts remain in use. No CDN or external runtime service is required.

## Documentation

- docs/IMPLEMENTATION_PLAN.md — execution plan.
- docs/PRODUCT_DECISIONS.md — all agreed product/data/pricing/state decisions and live integration boundaries.
- data/nira/README.md — data dictionary, assumptions, SQL examples and regeneration.
- docs/CREATIVE_ASSETS.md — generated visual provenance.
- BUILD_LOG.md — factual implementation/verification history.
- roadmap.md — current and future scope.

Known limits: one merchant; local-browser workflow persistence; static synthetic stock/network inputs with freshness checks; no external execution; assumed response economics; one-opportunity-per-customer benchmark interpreted over 90 days rather than a full future-order time-series model.

## GitHub / Lovable

This repository is connected to Lovable. Additive commits to the connected main branch sync into its editor. Do not force-push or rewrite published history.
