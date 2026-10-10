// Seeded synthetic fixtures for the fictional merchant "Everyday Essentials".
// Deterministic: the same seed always produces the identical dataset.

export type Category = "Coffee" | "Personal care" | "Household";
export type OfferPct = 0 | 10 | 20;
export const OFFER_OPTIONS: OfferPct[] = [0, 10, 20];

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number; // Rs, basket for a single-unit replenishment order
  variableCost: number; // Rs, assumed variable order costs (COGS, shipping, payment fees)
  stock: number;
  defaultIntervalDays: number; // used only when a merchant resolves an insufficient-history review item
  /** Explicit fixture purchase-probability assumptions per offer. Illustrative, not measured. */
  probs: Record<OfferPct, number>;
}

export interface Customer {
  id: string;
  name: string;
  city: string;
  consent: boolean;
  scenario?: string;
}

export type OrderStatus = "completed" | "cancelled" | "returned" | "refund_pending";

export interface Order {
  id: string;
  customerId: string;
  day: number; // offset in days from the demo date (0 = 10 Oct 2026, negative = past)
  items: { productId: string; qty: number; unitPrice: number }[];
  discount: number; // Rs
  status: OrderStatus;
  source: "seed" | "simulated";
  attributedCampaign?: string;
}

export interface Contact {
  customerId: string;
  day: number;
  type: "promotional";
  channel: "whatsapp" | "email";
}

export const DEMO_DATE_UTC = Date.UTC(2026, 9, 10);
export const MESSAGE_COST = 1;
export const RECENT_PURCHASE_DAYS = 2;
export const MIN_COMPLETED_FOR_INTERVAL = 3;
export const SEED = 20261010;

export const PRODUCTS: Product[] = [
  { id: "P01", name: "Single-Origin Coffee Beans 1kg", category: "Coffee", price: 1000, variableCost: 600, stock: 140, defaultIntervalDays: 30, probs: { 0: 0.1, 10: 0.15, 20: 0.18 } },
  { id: "P02", name: "Ground Filter Coffee 500g", category: "Coffee", price: 600, variableCost: 360, stock: 90, defaultIntervalDays: 25, probs: { 0: 0.12, 10: 0.16, 20: 0.19 } },
  { id: "P03", name: "Cold Brew Packs (12)", category: "Coffee", price: 450, variableCost: 270, stock: 60, defaultIntervalDays: 21, probs: { 0: 0.14, 10: 0.17, 20: 0.2 } },
  { id: "P04", name: "Paper Coffee Filters (200)", category: "Coffee", price: 200, variableCost: 110, stock: 200, defaultIntervalDays: 45, probs: { 0: 0.18, 10: 0.19, 20: 0.2 } },
  { id: "P05", name: "Instant Coffee Jar 200g", category: "Coffee", price: 350, variableCost: 210, stock: 75, defaultIntervalDays: 28, probs: { 0: 0.15, 10: 0.17, 20: 0.19 } },
  { id: "P06", name: "Herbal Shampoo 400ml", category: "Personal care", price: 400, variableCost: 230, stock: 110, defaultIntervalDays: 35, probs: { 0: 0.13, 10: 0.16, 20: 0.18 } },
  { id: "P07", name: "Citrus Body Wash 350ml", category: "Personal care", price: 350, variableCost: 200, stock: 95, defaultIntervalDays: 30, probs: { 0: 0.14, 10: 0.16, 20: 0.18 } },
  { id: "P08", name: "Toothpaste 4-pack", category: "Personal care", price: 300, variableCost: 180, stock: 180, defaultIntervalDays: 40, probs: { 0: 0.17, 10: 0.18, 20: 0.19 } },
  { id: "P09", name: "Daily Face Moisturiser 100ml", category: "Personal care", price: 800, variableCost: 440, stock: 50, defaultIntervalDays: 35, probs: { 0: 0.1, 10: 0.14, 20: 0.17 } },
  { id: "P10", name: "Razor Cartridges (8)", category: "Personal care", price: 900, variableCost: 480, stock: 40, defaultIntervalDays: 42, probs: { 0: 0.11, 10: 0.15, 20: 0.18 } },
  { id: "P11", name: "Laundry Liquid 2L", category: "Household", price: 500, variableCost: 300, stock: 130, defaultIntervalDays: 28, probs: { 0: 0.2, 10: 0.21, 20: 0.22 } },
  { id: "P12", name: "Dishwash Gel 750ml", category: "Household", price: 250, variableCost: 150, stock: 160, defaultIntervalDays: 24, probs: { 0: 0.19, 10: 0.2, 20: 0.21 } },
  { id: "P13", name: "Surface Cleaner 1L", category: "Household", price: 300, variableCost: 175, stock: 85, defaultIntervalDays: 32, probs: { 0: 0.16, 10: 0.18, 20: 0.19 } },
  { id: "P14", name: "Compostable Trash Bags (60)", category: "Household", price: 280, variableCost: 170, stock: 120, defaultIntervalDays: 36, probs: { 0: 0.17, 10: 0.18, 20: 0.19 } },
  { id: "P15", name: "Bamboo Paper Towels (6)", category: "Household", price: 320, variableCost: 200, stock: 0, defaultIntervalDays: 26, probs: { 0: 0.16, 10: 0.18, 20: 0.2 } },
];

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)!;

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ["Aanya", "Kabir", "Meera", "Rohan", "Isha", "Vihaan", "Tara", "Arjun", "Nisha", "Dev", "Leela", "Samar", "Zoya", "Ira", "Neel", "Kiara", "Rehan", "Mira", "Yash", "Anika", "Farhan", "Riya", "Omar", "Sana", "Ved"];
const LAST = ["Kulkarni", "Bose", "Raman", "Dsouza", "Malhotra", "Iyer", "Sethi", "Chatterjee", "Nair", "Ghosh", "Rao", "Bhatt", "Kapoor", "Menon", "Pillai", "Saxena", "Varma", "Dutta", "Joshi", "Qureshi"];
const CITIES = ["Pune", "Bengaluru", "Jaipur", "Kochi", "Indore", "Lucknow", "Chennai", "Surat", "Nagpur", "Mysuru"];

export interface Dataset {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  contacts: Contact[];
}

function scenarioOrders(customerId: string, productId: string, days: number[], opts: { discountOn?: number[]; refundPendingDay?: number } = {}): Order[] {
  const p = productById(productId);
  return days.map((day, i) => ({
    id: `ORD-${customerId.slice(4)}-${String(i + 1).padStart(2, "0")}`,
    customerId,
    day,
    items: [{ productId, qty: 1, unitPrice: p.price }],
    discount: opts.discountOn?.includes(day) ? Math.round(p.price * 0.1) : 0,
    status: opts.refundPendingDay === day ? "refund_pending" : "completed",
    source: "seed" as const,
  }));
}

export function generateDataset(seed = SEED): Dataset {
  const rnd = mulberry32(seed);
  const int = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1));
  const pick = <T,>(xs: T[]): T => xs[int(0, xs.length - 1)] as T;
  const customers: Customer[] = [];
  const orders: Order[] = [];
  const contacts: Contact[] = [];

  // Named, inspectable scenarios
  const scenarios: { c: Customer; o: Order[]; ct?: Contact[] }[] = [
    { c: { id: "CUS-0001", name: "Aanya Kulkarni", city: "Pune", consent: true, scenario: "1 · Reorder due; 10% offer has best expected contribution" },
      o: scenarioOrders("CUS-0001", "P01", [-27, -57, -88, -118, -149, -179], { discountOn: [-88] }) },
    { c: { id: "CUS-0002", name: "Kabir Bose", city: "Bengaluru", consent: true, scenario: "2 · Reorder due; no-discount reminder is preferable" },
      o: scenarioOrders("CUS-0002", "P11", [-24, -52, -79, -108, -135, -163]) },
    { c: { id: "CUS-0003", name: "Meera Raman", city: "Chennai", consent: true, scenario: "3 · Purchased yesterday; excluded" },
      o: scenarioOrders("CUS-0003", "P01", [-1, -31, -60, -92, -121, -152]) },
    { c: { id: "CUS-0004", name: "Rohan Dsouza", city: "Kochi", consent: true, scenario: "4 · Unresolved refund; promotional outreach suppressed" },
      o: scenarioOrders("CUS-0004", "P02", [-22, -47, -72, -97, -122], { refundPendingDay: -47 }) },
    { c: { id: "CUS-0005", name: "Isha Malhotra", city: "Jaipur", consent: false, scenario: "5 · No marketing consent; blocked" },
      o: scenarioOrders("CUS-0005", "P06", [-33, -68, -104, -139, -173]) },
    { c: { id: "CUS-0006", name: "Vihaan Iyer", city: "Indore", consent: true, scenario: "6 · Insufficient history; needs review" },
      o: scenarioOrders("CUS-0006", "P09", [-30, -66]) },
    { c: { id: "CUS-0007", name: "Tara Sethi", city: "Surat", consent: true, scenario: "7 · Relevant product out of stock; blocked" },
      o: scenarioOrders("CUS-0007", "P15", [-25, -51, -77, -103, -128, -154]) },
  ];
  for (const s of scenarios) {
    customers.push(s.c);
    orders.push(...s.o);
    contacts.push({ customerId: s.c.id, day: -40, type: "promotional", channel: "whatsapp" });
  }

  for (let i = 8; i <= 300; i++) {
    const id = `CUS-${String(i).padStart(4, "0")}`;
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    const consent = rnd() < 0.88;
    customers.push({ id, name, city: pick(CITIES), consent });
    const primary = pick(PRODUCTS);
    const cadence = primary.defaultIntervalDays + int(-5, 5);
    const sparse = rnd() < 0.07;
    const lastDay = -int(0, Math.round(cadence * 1.7));
    const days: number[] = [];
    let d = lastDay;
    while (d >= -182 && (!sparse || days.length < int(1, 2))) {
      days.push(d);
      d -= cadence + int(-3, 3);
    }
    const usesOffers = rnd() < 0.35;
    const refundPending = rnd() < 0.03 && days.length > 2;
    days.forEach((day, k) => {
      const items = [{ productId: primary.id, qty: 1, unitPrice: primary.price }];
      if (rnd() < 0.2) {
        const extra = pick(PRODUCTS);
        if (extra.id !== primary.id) items.push({ productId: extra.id, qty: 1, unitPrice: extra.price });
      }
      const value = items.reduce((s, it) => s + it.unitPrice * it.qty, 0);
      const discounted = usesOffers ? rnd() < 0.5 : rnd() < 0.08;
      let status: OrderStatus = "completed";
      if (refundPending && k === 1) status = "refund_pending";
      else if (k > 0 && rnd() < 0.04) status = rnd() < 0.5 ? "returned" : "cancelled";
      orders.push({ id: `ORD-${id.slice(4)}-${String(k + 1).padStart(2, "0")}`, customerId: id, day, items, discount: discounted ? Math.round(value * 0.1) : 0, status, source: "seed" });
    });
    const nContacts = int(0, 3);
    for (let k = 0; k < nContacts; k++) contacts.push({ customerId: id, day: -int(8, 170), type: "promotional", channel: rnd() < 0.7 ? "whatsapp" : "email" });
    if (rnd() < 0.08) contacts.push({ customerId: id, day: -int(1, 6), type: "promotional", channel: "email" });
  }
  return { products: PRODUCTS, customers, orders, contacts };
}

let cached: Dataset | null = null;
export function baseDataset(): Dataset {
  if (!cached) cached = generateDataset();
  return cached;
}

export const orderValue = (o: Order) => o.items.reduce((s, it) => s + it.unitPrice * it.qty, 0);
export const orderContribution = (o: Order) =>
  o.items.reduce((s, it) => s + (it.unitPrice - productById(it.productId).variableCost) * it.qty, 0) - o.discount;
