# Prototype refinements
- [x] Same-audience strategy comparisons with invalid counterfactuals separated.
- [x] Derived recommended decision, evidence and assumptions; expandable detail.
- [x] Explicit overlapping exclusions and actual hash holdout percentage.
- [x] Narrow-screen layouts and locally scrolling tables.
- [x] Regression tests and browser checks; report results.

Checks: five tests passed across acceptance, comparison and routing suites; preview build OK. Chromium checked all four pages at 1280, 600 and 390 pixels with no page overflow or runtime errors, including expanded tables. Approve, launch, send batch, pause, purchase, replay deduplication and reset-to-draft verified. Existing hash holdout retained; actual percentage displayed instead of exact 10%.