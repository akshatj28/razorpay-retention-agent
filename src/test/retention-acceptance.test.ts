import { expect, test } from "vitest";
import * as C from "@/retention/campaign";
const d = C.derive;
test("acceptance", () => {
  let s = C.initialState();
  const p0 = d(s).plan;
  // 3,4
  const hero = p0.contacted.find(r=>r.feature.customer.id==="CUS-0001")!;
  expect(hero.rec.evaluations.map(e=>e.expectedContribution)).toEqual([39,44,35]); expect(hero.offerPct).toBe(10);
  expect(p0.contacted.find(r=>r.feature.customer.id==="CUS-0002")!.offerPct).toBe(0);
  // 2
  const other = p0.contacted.find(r=>r.feature.customer.id!=="CUS-0001")!.feature.customer.id;
  const s2 = C.toggleExclude(s, other); const p2 = d(s2).plan;
  expect(p2.contacted.length).toBe(p0.contacted.length-1); expect(p2.totals.exposure).toBeLessThan(p0.totals.exposure);
  // 5
  const p5 = d(C.editConfig(s,{maxDiscount:5})).plan; expect(p5.contacted.every(r=>r.offerPct===0)).toBe(true);
  expect(d(C.editConfig(s,{maxDiscount:5, offerMode:10})).plan.checks.find(c=>c.id==="cap")!.status).toBe("blocked");
  // 6,7
  expect(p0.contacted.some(r=>!r.feature.consent)).toBe(false);
  expect(p0.contacted.some(r=>p0.holdout.includes(r.feature))).toBe(false);
  // 8
  expect(C.approve(C.editConfig(s,{budget:500})).error).toBeTruthy();
  // 9
  s = C.approve(s).state; expect(s.campaign.status).toBe("approved");
  const s9 = C.editConfig(s,{timing:"18:30 IST"}); expect(s9.campaign.status).toBe("draft");
  expect(C.launch(s9).error).toBeTruthy();
  // launch
  s = C.launch(s).state; expect(s.campaign.status).toBe("running");
  const target = s.campaign.queue![2]!.customerId;
  s = C.organicPurchase(s, target);
  s = C.sendBatch(s);
  expect(s.campaign.sent[target]).toBeUndefined(); // 10
  const sentId = Object.keys(s.campaign.sent)[0]!;
  s = C.pause(s); const before = Object.keys(s.campaign.sent).length; s = C.sendBatch(s);
  expect(Object.keys(s.campaign.sent).length).toBe(before); // 11
  s = C.recordOutcome(s,"purchase",sentId); s = C.replayLast(s); s = C.replayLast(s);
  expect(C.results(s).attributedOrders).toBe(1); // 13
  expect(d(s).byId.get(sentId)!.status).toBe("excluded"); // 12
  // 14
  expect(JSON.stringify(C.initialState())).toBe(JSON.stringify(C.initialState()));
});
