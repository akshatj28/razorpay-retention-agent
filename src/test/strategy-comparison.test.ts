import { expect, test } from "vitest";
import { derive, initialState, editConfig, setOverride, toggleExclude } from "@/retention/campaign";

test("every baseline evaluates the same IDs, with zero-cost no-outreach", () => {
  for (const config of [{}, { maxDiscount: 5 }, { minContribution: 10000 }, { budget: 1 }]) {
    const p = derive(editConfig(initialState(), config)).plan;
    for (const c of p.comparison) {
      const ids = [
        ...c.rows.map((r) => r.feature.customer.id),
        ...c.noOutreach.map((r) => r.feature.customer.id),
      ].sort();
      expect(ids).toEqual([...p.comparisonAudienceIds].sort());
      expect(ids.some((id) => p.holdout.some((f) => f.customer.id === id))).toBe(false);
      expect(c.totals.expected).toBeCloseTo(
        c.rows.reduce((sum, r) => sum + r.evaluation.expectedContribution, 0),
      );
      if (c.launchable) {
        expect(c.rows.every((r) => r.valid)).toBe(true);
        expect(c.totals.exposure).toBeLessThanOrEqual(
          config.budget ?? initialState().config.budget,
        );
        expect(c.executableTotals).toEqual(c.totals);
      } else expect(c.executableTotals).toBeNull();
    }
  }
});

test("invalid counterfactuals never expose executable totals", () => {
  const p = derive(editConfig(initialState(), { maxDiscount: 5 })).plan;
  expect(
    p.comparison
      .filter((c) => c.mode === 10 || c.mode === 20)
      .every((c) => !c.launchable && c.totals.invalid > 0 && c.executableTotals === null),
  ).toBe(true);
  const none = derive(editConfig(initialState(), { minContribution: 10000 })).plan.recommended;
  expect(none.totals.expected).toBe(0);
  expect(none.totals.exposure).toBe(0);
  expect(none.noOutreach.length).toBeGreaterThan(0);
});

test("overrides do not change comparison assumptions or baseline results", () => {
  const initial = initialState();
  const p = derive(initial).plan;
  const changed = derive(setOverride(initial, "CUS-0001", 20)).plan;
  expect(changed.comparison.map((c) => c.totals)).toEqual(p.comparison.map((c) => c.totals));
  expect(changed.contacted.find((r) => r.feature.customer.id === "CUS-0001")?.offerPct).toBe(20);
  const reduced = derive(toggleExclude(initial, "CUS-0001")).plan;
  expect(reduced.comparisonAudienceIds).not.toContain("CUS-0001");
  expect(reduced.holdout.map((f) => f.customer.id)).toEqual(p.holdout.map((f) => f.customer.id));
  expect(p.holdoutPct).toBeCloseTo((p.holdout.length / p.eligible.length) * 100);
});
