# AI build log (factual)

## 12 October 2026 — merchant-language pass

- First visit opens on Connect store with an intro pop-up: the four-step flow (Connect, Review, Approve, Measure) and a guided-tour invitation for whoever is reviewing the build. One-click "Connect demo store" and "Skip to today's campaigns".
- Guided tour gains a setup stop (seven stops) and uses merchant vocabulary.
- Screens rewritten in the words merchants already use in Shopify, the Razorpay dashboard and BiteSpeed/Klaviyo: extra profit, control group, sales credited to messages, delivered and paid, discount code, segment, RTO risk. Sidebar: Connect store, Today, Campaigns, Order data, Compare strategies.
- Home hero now leads with today's decisions and expected extra profit; the 25% fee moved to Budget & approval.
- Repeated per-card "simulated" labels replaced by one "Demo store · sample data" badge plus the intro and About text.
- Fixed shopper WhatsApp text: {{payment}} previously inserted the internal label ("Prepaid nudge; COD rechecked at checkout"); shoppers now see plain sentences.
- Verification: TypeScript, 23 tests across seven files and the production build passed.

## 12 October 2026 — review fixes

- Campaign audiences are scored first and capped by expected additional contribution, not by customer ID; controls are hashed from the same ranked audience.
- Each action's evidence now states the customer's own rhythm, discount history, why the offer (or no offer) was chosen, and the Razorpay signal used.
- Discount history is shrunk toward a 25% prior worth three orders; offer response is 0.15 + 0.6 × history (was 0.3 + 0.45 × history). Replenishment requires at least two orders. Prepaid nudge covers medium- and high-risk COD buyers. These are illustrative assumptions.
- Benchmark intelligence rows call the Campaign Studio decision function (with and without network signals) and use expected delivery/return outcomes instead of one random draw per customer.
- Guided tour now covers Opportunities, Campaign Studio, the benchmark and the database; legacy labs removed from the sidebar. Products & offers adds reminder/offer/prepaid-nudge filters.
- Verification: TypeScript, 23 tests across seven files and the production build passed.

## 12 October 2026 — Nira Botanics campaign studio

- Implemented the agreed merchant, intelligence, campaign, state and outcome-pricing decisions; see docs/IMPLEMENTATION_PLAN.md and docs/PRODUCT_DECISIONS.md.
- Replaced the mixed catalog with 18 personal-care variants and bundle components.
- Generated 30,000 orders, 12,000 customers and 41,095 line items. CSV/SQLite joins, monthly counts, totals and database integrity reconciled.
- Added prepared/custom campaigns, saved drafts/templates, revision-bound approval, scheduling, daily refresh, WhatsApp/voice editors and email coming soon.
- Added simulated signal freshness/fallback, economic offer selection, internal operator costs, experiment reservations and pre-send policy checks.
- Added pending-order suppression, collection/return reconciliation, intention-to-treat outcome estimates and aggregate success-fee loss offsets.
- Generated a botanical background with built-in ImageGen and saved it locally. Live per-recipient text/image/voice generation remains disconnected.
- Browser reload exposed a StrictMode persistence race; fixed hydration-before-write and added a remount regression test.
- Final verification: all 21 tests across seven files passed, TypeScript checks passed, and the production build passed.
- Historical entries below describe earlier versions and their then-current assumptions; they are not current dataset counts.

Session on 10 Oct 2026, built by the Lovable AI agent from the uploaded brief.

1. Read the brief. Fetched Blade's `fonts.css` and `fontFamily.web.ts` from GitHub; did not browse blade.razorpay.com or razorpay.com/razorsense pages.
2. Chose Blade-inspired styling over Blade components (React 19 + TanStack Start stack; avoided adding styled-components). Downloaded Blade's TASA Orbiter and Inter woff2 files to `public/fonts`.
3. Wrote logic modules in `src/retention/` (data, features, forecast, policy, recommend, campaign, store).
4. Ran a script to check counts: 48 eligible, 235 excluded, 17 needs review at defaults; hero Rs 39/44/35; second fixture prefers no discount. Set default budget to Rs 1500 (plan exposure Rs 1125).
5. Built four screens and the shell. Wrote `src/test/retention-acceptance.test.ts` covering checks 2–14 (passing).
6. Checked with headless Chromium at 1440×900: both fonts report loaded, no non-localhost requests, no console errors; walked approve → launch → send batch → purchase.
