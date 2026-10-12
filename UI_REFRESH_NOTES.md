# UI refresh — 10 Oct 2026

## Blade migration — 12 Oct 2026

- Replaced the live retention screens' Radix/shadcn controls with actual `@razorpay/blade` components: buttons, fields, dropdowns, slider, tabs, modal, drawer, badges, alerts, headings, all eight data tables, and toast notifications.
- Added `BladeTheme` and mapped Blade's resolved theme tokens into the custom layout utilities; retained the local fonts and responsive application shell. Server styles are collected per render and hoisted to the head for hydration.
- Desktop dialogs use Blade Modal; mobile dialogs use Blade BottomSheet. Customer evidence uses Blade Drawer.
- Preserved the retention engine, seeded data, stable holdout, approval binding, pre-send checks, duplicate prevention, and exact reset behaviour.
- Updated the About dialog to accurately describe Blade usage and retained the independent-project and simulation disclosures.
- Refreshed the Bun lockfile. Development SSR pre-bundles Blade/styled-components and excludes React from that bundle to share the server renderer's instance.
- Store setup uses Blade inputs, buttons and radio controls plus the shared responsive permissions dialog. Shopify permissions, Razorpay linking, import, channel selection, completion, saved progress and navigation to opportunities were verified at desktop and mobile sizes; campaign state remains unchanged. Connections and imports are simulated.
- Mobile bottom sheets are portalled to the document body so animated page containers cannot constrain their fixed positioning.
- Final verification: 10 tests across 5 files passed; TypeScript and the production build passed. A React 19 type annotation in the shared onboarding test was corrected without changing its behaviour.
- Browser verification: all four retention screens inspected at 1440×900 and 390×844, with no page overflow, application errors, hydration errors, or external requests. Drawer dismissal, slider, all cohort tabs, discount cap, offer dropdown, blocked approval, approval invalidation, launch, send, pause, purchase, replay deduplication, exact reset, six-stop tour, and mobile reset/cancel passed.
- Known upstream development diagnostic: Blade 12.129.0's TableHeaderRow calls its parent's density setter during render. React logs a development warning; table rendering and interactions passed. The warning remains visible and is recorded separately from application errors in the browser reports.
- Earlier verification and publication notes below describe the previous UI pass.

## Previous presentation pass

Local presentation pass, without retention-engine changes.

- Replaced the duplicated landing-page explanation panels with a blue opportunity card, offer-mix bars and a customer-base segmentation strip.
- Condensed the shared recommendation panel. Evidence, probability assumptions and merchant-override semantics remain available under “Why this plan?”.
- Moved cohort-window and comparison methodology explanations into disclosures.
- Kept self-hosted TASA Orbiter and Inter; refined spacing, radii, table density and navigation.
- Header now reads “Demo data · No live customer data”. Simulation labels remain on recommendations; the About dialog retains the full synthetic-data and deterministic-adapter disclosure.
- Cross-sell and win-back remain concept-only. No forecasts are represented as causal uplift.

Verification: 5 tests across 3 test files passed; production build passed. Browser inspected at 1440×900 and 390×844. Discount-cap change to 5% switched recommendations to no discount; restored to 20% afterward.

Not pushed or published. The locally generated pnpm lockfile is not part of the UI change; the original Bun lockfile was preserved.

## Evaluator walkthrough

- First-visit welcome is optional and remembers dismissal separately from campaign state.
- Six cross-screen stops with a nonmodal PM-rationale card, suggested interactions and pointer-transparent target outlines.
- Back / Next / Finish / Exit, Escape, restart from header, and return-to-stop after independent navigation.
- No automatic approvals, sends, resets or campaign edits. Implementation and future-AI limitations remain explicit.
- Verification: 8 tests across 4 files passed, including welcome/skip persistence, six-stop navigation, Back, Finish, restart and Escape. Production build and TypeScript checks passed.
- Visual verification of the new overlay remains pending: browser automation timed out and could not reconnect. Earlier UI screenshots do not depict the new tour.
