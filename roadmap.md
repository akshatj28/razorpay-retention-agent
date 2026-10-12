# Current roadmap — 12 October 2026

Implemented: coherent Nira Botanics merchant, six-month tabular history, simulated Razorpay enrichment, three campaign goals, custom and recommended drafts, template reuse, daily refresh, frozen approvals, WhatsApp/voice customization, execution guards, reconciliation, synthetic outcome pricing and independent benchmark.

Live integration work: OAuth and older-order access; bulk backfill and event deduplication; entitled network signals; durable server-side workflow storage; grounded text/image generation; WhatsApp/voice delivery; logistics/collection; statistically designed business-as-usual experiments; fee invoicing.

Email delivery remains coming soon. No external service is contacted by this offline app.

## Historical UI refinements (10 October)

- [x] Same-audience strategy comparisons with invalid counterfactuals separated.
- [x] Derived recommended decision, evidence and assumptions; expandable detail.
- [x] Explicit overlapping exclusions and actual hash holdout percentage.
- [x] Narrow-screen layouts and locally scrolling tables.
- [x] Regression tests and browser checks; report results.

Checks: five tests passed across acceptance, comparison and routing suites; preview build OK. Chromium checked all four pages at 1280, 600 and 390 pixels with no page overflow or runtime errors, including expanded tables. Approve, launch, send batch, pause, purchase, replay deduplication and reset-to-draft verified. Existing hash holdout retained; actual percentage displayed instead of exact 10%.
