# Product decisions — 12 October 2026

## Merchant and data

Use fictional Nira Botanics: one personal-care D2C brand, skincare/haircare/body care, 18 variants and component-aware routine kits. Mamaearth inspires category coherence, not business metrics or merchant-integration claims. Six rolling months average 5,000 orders; orders and customer IDs, quantities, discounts, payments, fulfilment, refunds and risk provenance remain inspectable.

The app, CSV and SQLite use one deterministic history generator. Generated history is not persisted in localStorage; only merchant work and simulated events are. Draft/template storage is local to the browser, not an operational backend.

## Intelligence boundaries

The product explains demo scope beside suggested campaigns, in the products/discounts step and in About this prototype. Six months is synthetic demo coverage, not a production retention limit. Current recommendations use rules and illustrative assumptions; no live predictive AI is connected. Proposed models would rank products and estimate timing/response from catalog information, personal history and comparable-customer patterns. This is planned capability, not implemented learning or validated uplift. Orders, inventory, consent and payment outcomes remain integration inputs; costs remain merchant-provided or confirmed estimates. Policy checks remain explicit rules. Evidence, uncertainty, predictive validation and controlled experiments are required for production claims.

Shopify supplies merchant purchase history. Proposed Razorpay enrichment supplies permitted derived payment/delivery-risk context where access is available. Vulcan is a structured-payments foundation model, not an LLM or an exportable database of raw cross-merchant customer history.

Network risk informs payment treatment and expected delivery economics. It does not imply sensitivity to a particular discount. Offer responsiveness, product relevance and timing belong to the retention layer and need task-specific validation. Missing/unmatched/stale signals fall back to merchant history. Stores not on Razorpay checkout can send payments, refunds and COD/RTO outcomes through a Payments API, webhooks or courier APIs; they lose only the Razorpay RTO score. Every demo signal is explicitly simulated.

Language-model interfaces propose messages and conversation flows; the offline adapters are deterministic simulations. One campaign background was generated using built-in ImageGen, then saved locally. Product/price personalization is deterministic, with no fabricated prices, product claims or per-recipient image-generation requests.

## Campaign experience

Home offers review of prepared recommendations or custom creation. Both paths use the same editor: audience, products/offers, channels/assets, economics/approval and outcomes.

Initial working goals: replenishment, second purchase and win-back. Familiar audience templates include repeat buyers, previously discounted purchases and COD-preferring customers with fresh low-risk simulated signals.

Messaging and calls are first-party: WhatsApp Business messages, a personalised image per customer, and AI voice follow-ups (ElevenLabs voices, planned and not live in the demo). No third-party retention tool is required. WhatsApp is the primary channel. Optional voice follow-ups require separate voice permission and operator economics. Message text, creative direction/headline and opening/interested/objection/decline branches are editable. Email appears as coming soon and cannot be selected for delivery.

## State and refresh

Draft means a saved specific campaign; template means reusable rules and assets with a newly evaluated audience. Recommended campaigns become merchant-owned drafts when created. Explicit asset regeneration replaces content only when requested.

Opportunity refresh is daily, demonstrated with an advance-day control. New synthetic orders immediately change eligibility and can suppress contact. Refresh never overwrites merchant wording or silently increases discounts. A stale draft requires an explicit current-audience review before approval.

Lifecycle: draft → approved → scheduled/running → paused/running → completed. Approval records audience assignments, assets, offers, limits and revision. Edits to an approved draft invalidate its approval. Scheduled/running assets cannot be mutated; use a template for a new version.

Before every contact, recheck consent, opt-out, open refund, pending order, recent purchase, inventory, frequency, campaign expiry and operator cost. Separate campaigns cannot contact customers reserved by another approved experiment, including controls. Controls and no-outreach decisions do not incur outreach costs.

## Outcome pricing and accounting

Illustrative model: 25% of aggregate positive incremental contribution, with campaign losses offsetting wins before the share. Operator bears AI/creative/channel costs. Merchant economics include incentives, COGS, fulfilment/payment costs, RTO and refunds.

Forecast formula: intervention purchase probability × delivery probability × discounted order contribution, minus organic probability × undiscounted contribution. Operator evaluates its expected share less channel costs; no-outreach is allowed.

Demo costs: INR1.20 per WhatsApp/inference/creative allocation, INR3 per simulated short voice follow-up, 35% assumed follow-up exposure. These are assumptions, not provider prices. Per-order product/fulfilment/payment costs are synthetic.

Placed orders are not finalized collected outcomes. Reconciliation turns them into collected/RTO/refunded records. Pending purchases enter history and suppress follow-ups. Late refunds adjust outcomes once and recalculate the fee estimate.

Campaign results use intention-to-treat denominators, including skipped/no-outreach assignments, and normalize control contribution by group size. Demo readiness thresholds (20 control, 100 treatment) are guardrails, not statistical significance. All fee outputs remain synthetic estimates, not invoices.

Commercial billing still needs an agreed business-as-usual baseline, confidence intervals, overlapping-channel rules and a defined settlement/return window. Attribution is never labelled proof of incrementality.

## Synthetic comparison

The product is measured against a merchant with no retention tool. The same customer population is evaluated with no retention tool, a manual 20% sale at day 30, and Retention Agent (which includes the Razorpay RTO score). A store-data-only run shows what a store on another checkout gets. Agent rows use the Campaign Studio decision logic. Extra profit over no retention tool is the fee base, matching the in-app control group. Independent hidden demand, discount response and delivery outcomes are separated from displayed forecasts. Response sensitivity includes zero effect. Discount savings and assumed payment-risk treatment can still affect margin with zero purchase lift.

This one-opportunity-per-customer simulator uses a 90-day evaluation interpretation; it is not a longitudinal forecast of every future order, a trained production model or measured commercial uplift.

## Live integration work

Shopify OAuth, approved older-order access, bulk backfill and idempotent event ingestion; entitled Razorpay signal retrieval; channel-specific contact permission; WhatsApp/voice delivery adapters; product-grounded generation; logistics/COD collection reconciliation; durable server-side workflow storage; causal experiments and billing. These boundaries are explicit so the offline demo does not claim live capabilities.

## Source context

- https://shopify.dev/docs/api/admin-graphql/latest/objects/Order — order/customer/line-item structure and default 60-day access.
- https://razorpay.com/blog/vulcan-how-razorpay-built-a-foundation-model-for-payment-decisions/ — payment representations and task-specific decision layers.
- https://github.com/razorpay/markdown-docs/blob/master/payments/magic-checkout/rto-intelligence.md — documented order risk tiers/reasons; not proof of arbitrary campaign-time feature access.
- https://help.klaviyo.com/hc/en-us/articles/115005054847 — audience/content/review/schedule workflow.
- https://help.klaviyo.com/hc/en-us/articles/115005248128 — message attribution semantics.
