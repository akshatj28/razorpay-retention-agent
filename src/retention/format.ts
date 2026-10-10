import { DEMO_DATE_UTC } from "./data";

const inr0 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const inr = (n: number, decimals = false) => (decimals ? inr2 : inr0).format(n);
const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const dayToDate = (day: number) => dateFmt.format(new Date(DEMO_DATE_UTC + day * 86400000));
/** Simulated clock: minutes after 10 Oct 2026 09:00 IST. */
export const clockLabel = (m: number) => {
  const total = 9 * 60 + m;
  const h = Math.floor(total / 60) % 24;
  return `10 Oct 2026, ${String(h).padStart(2, "0")}:${String(total % 60).padStart(2, "0")} IST`;
};
export const pct = (p: number) => `${Math.round(p * 100)}%`;
