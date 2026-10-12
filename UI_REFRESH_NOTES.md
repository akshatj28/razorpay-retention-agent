# UI refresh — 10 Oct 2026

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
