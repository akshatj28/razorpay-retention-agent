import { expect, test } from "vitest";
import { runReferenceBenchmark } from "@/retention/benchmark";

test("pitch uses one fixed cohort and the same no-outreach denominator", () => {
  const [control, sale, , agent] = runReferenceBenchmark();
  expect(control!.audience).toBe(2500);
  expect(control!.contacts).toBe(0);
  expect(sale!.audience).toBe(control!.audience);
  expect(agent!.audience).toBe(control!.audience);
  const uplift = (profit: number) => ((profit / control!.merchantContribution) * 100).toFixed(1);
  expect(uplift(agent!.incremental)).toBe("7.2");
  expect(uplift(sale!.incremental)).toBe("0.3");
  expect(agent!.merchantRetains).toBeCloseTo(agent!.incremental * 0.75);
});

test("the response slider changes the simulation without changing the control", () => {
  const [control, sale, , agent] = runReferenceBenchmark(0);
  expect(sale!.purchases).toBe(control!.purchases);
  expect(agent!.purchases).toBe(control!.purchases);
  expect(agent!.incremental).toBeLessThan(0);
});
