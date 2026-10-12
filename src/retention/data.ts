// Fictional merchant. Deterministic synthetic Shopify-shaped history, not company data.
export const MERCHANT_NAME = "Nira Botanics";
export const DEMO_DATE_UTC = Date.UTC(2026, 9, 12);
export const SEED = 20261012;
export const MONTHLY_ORDER_TARGETS = [4600, 4900, 4750, 5200, 4950, 5600];
export type Category = "Skincare" | "Haircare" | "Body care" | "Routine kits";
export type OfferPct = 0 | 10 | 20 | 30;
export const OFFER_OPTIONS: OfferPct[] = [0, 10, 20, 30];
export const MESSAGE_COST = 1;
export const RECENT_PURCHASE_DAYS = 2;
export const MIN_COMPLETED_FOR_INTERVAL = 3;
export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  variableCost: number;
  stock: number;
  defaultIntervalDays: number;
  probs: Record<OfferPct, number>;
  sku: string;
  size: string;
  cogs: number;
  components?: string[] | undefined;
}
export interface Customer {
  id: string;
  name: string;
  city: string;
  consent: boolean;
  callConsent: boolean;
  shopifyId: string;
  email: string;
  phone: string;
  scenario?: string;
}
export type OrderStatus =
  "completed" | "cancelled" | "returned" | "refund_pending" | "rto" | "pending_delivery";
export interface Order {
  id: string;
  customerId: string;
  day: number;
  items: { productId: string; qty: number; unitPrice: number }[];
  discount: number;
  status: OrderStatus;
  source: "seed" | "simulated";
  attributedCampaign?: string | undefined;
  shopifyId?: string;
  createdAt?: string;
  paymentMethod?: "cod" | "upi" | "card";
  financialStatus?: "paid" | "pending" | "refunded" | "voided";
  fulfillmentStatus?: "delivered" | "unfulfilled" | "returned";
  shipping?: number;
  tax?: number;
  refund?: number;
  collected?: number;
}
export interface Contact {
  customerId: string;
  day: number;
  type: "promotional";
  channel: "whatsapp" | "email" | "call";
}
export interface NetworkSignal {
  customerId: string;
  source: "simulated_razorpay";
  matched: boolean;
  riskTier: "low" | "medium" | "high" | "unknown";
  paymentPreference: "cod" | "upi" | "card" | "unknown";
  confidence: "high" | "medium" | "low";
  asOfDay: number;
  riskReason: string;
}
export interface Dataset {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  contacts: Contact[];
  signals: NetworkSignal[];
}
const product = (
  id: string,
  name: string,
  category: Category,
  price: number,
  cogs: number,
  days: number,
  size: string,
  probs = [0.12, 0.17, 0.2, 0.22],
  components?: string[],
): Product => ({
  id,
  name,
  category,
  price,
  cogs,
  variableCost: cogs + 85,
  stock: id === "P15" ? 0 : 1200,
  defaultIntervalDays: days,
  size,
  sku: "NIRA-" + id + "-" + size.replace(/\s/g, ""),
  probs: { 0: probs[0]!, 10: probs[1]!, 20: probs[2]!, 30: probs[3]! },
  components,
});
export const PRODUCTS: Product[] = [
  product(
    "P01",
    "Glow Routine Kit",
    "Routine kits",
    1000,
    515,
    30,
    "3 products",
    [0.1, 0.15, 0.18, 0.2],
    ["P03", "P04", "P05"],
  ),
  product(
    "P02",
    "Daily Sunscreen Duo",
    "Routine kits",
    500,
    215,
    28,
    "2 × 50g",
    [0.2, 0.21, 0.22, 0.23],
    ["P05", "P05"],
  ),
  product("P03", "Gentle Face Wash", "Skincare", 299, 100, 42, "100ml"),
  product("P04", "Vitamin C Serum", "Skincare", 599, 195, 52, "30ml"),
  product("P05", "Daily Sunscreen SPF 50", "Skincare", 399, 130, 32, "50g"),
  product("P06", "Onion Shampoo", "Haircare", 349, 105, 38, "250ml"),
  product("P07", "Onion Conditioner", "Haircare", 349, 105, 48, "250ml"),
  product("P08", "Onion Hair Oil", "Haircare", 399, 125, 55, "150ml"),
  product("P09", "Barrier Moisturiser", "Skincare", 449, 140, 45, "80ml"),
  product("P10", "Niacinamide Serum", "Skincare", 549, 170, 58, "30ml"),
  product("P11", "Shampoo Refill", "Haircare", 599, 180, 74, "500ml"),
  product("P12", "Haircare Routine Duo", "Routine kits", 649, 205, 40, "2 products", undefined, [
    "P06",
    "P08",
  ]),
  product("P13", "Aloe Body Wash", "Body care", 349, 105, 38, "300ml"),
  product("P14", "Cocoa Body Lotion", "Body care", 399, 125, 45, "200ml"),
  product("P15", "Repair Hair Mask", "Haircare", 449, 145, 60, "200ml"),
  product("P16", "Gentle Face Wash Refill", "Skincare", 499, 150, 78, "200ml"),
  product("P17", "Daily Sunscreen SPF 50 Large", "Skincare", 699, 205, 62, "100g"),
  product("P18", "Hydration Routine Kit", "Routine kits", 899, 275, 45, "3 products", undefined, [
    "P03",
    "P09",
    "P05",
  ]),
];
export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)!;
export const DAY_MS = 86400000;
export const isoDay = (day: number) => new Date(DEMO_DATE_UTC + day * DAY_MS).toISOString();
export function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const FIRST = [
  "Aanya",
  "Kabir",
  "Meera",
  "Rohan",
  "Isha",
  "Vihaan",
  "Tara",
  "Arjun",
  "Nisha",
  "Dev",
  "Leela",
  "Samar",
  "Zoya",
  "Ira",
  "Neel",
  "Kiara",
  "Rehan",
  "Mira",
  "Yash",
  "Anika",
  "Farhan",
  "Riya",
  "Omar",
  "Sana",
  "Ved",
];
const LAST = [
  "Kulkarni",
  "Bose",
  "Raman",
  "Dsouza",
  "Malhotra",
  "Iyer",
  "Sethi",
  "Chatterjee",
  "Nair",
  "Ghosh",
  "Rao",
  "Bhatt",
  "Kapoor",
  "Menon",
  "Pillai",
  "Saxena",
  "Varma",
  "Dutta",
  "Joshi",
  "Qureshi",
];
const CITIES = [
  "Pune",
  "Bengaluru",
  "Jaipur",
  "Kochi",
  "Indore",
  "Lucknow",
  "Chennai",
  "Surat",
  "Nagpur",
  "Mysuru",
];
export const MONTH_WINDOWS = Array.from({ length: 6 }, (_, i) => ({
  start: Math.round((Date.UTC(2026, 3 + i, 12) - DEMO_DATE_UTC) / DAY_MS),
  end: Math.round((Date.UTC(2026, 4 + i, 12) - DEMO_DATE_UTC) / DAY_MS),
  label:
    new Date(Date.UTC(2026, 3 + i, 12)).toISOString().slice(0, 10) +
    " to " +
    new Date(Date.UTC(2026, 4 + i, 11)).toISOString().slice(0, 10),
}));
export function generateDataset(seed = SEED): Dataset {
  const rnd = mulberry32(seed);
  const int = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1));
  const customers: Customer[] = [];
  const orders: Order[] = [];
  const contacts: Contact[] = [];
  const signals: NetworkSignal[] = [];
  const profiles = new Map<
    string,
    {
      primary: Product;
      repeat: boolean;
      discountSensitive: boolean;
      cadence: number;
      lastDay: number;
      signal: NetworkSignal;
    }
  >();
  for (let i = 1; i <= 12000; i++) {
    const id = "CUS-" + String(i).padStart(i <= 7 ? 4 : 5, "0");
    const consent = i === 5 ? false : i <= 7 || rnd() < 0.83;
    customers.push({
      id,
      shopifyId: "gid://shopify/Customer/" + (8100000000 + i),
      name: FIRST[(i - 1) % FIRST.length] + " " + LAST[(i - 1) % LAST.length],
      city: CITIES[int(0, CITIES.length - 1)]!,
      consent,
      callConsent: consent && rnd() < 0.52,
      email: "customer-" + i + "@example.invalid",
      phone: "DEMO-PHONE-" + String(i).padStart(5, "0"),
    });
    const primary = PRODUCTS[i <= 7 ? [0, 1, 0, 1, 5, 8, 14][i - 1]! : int(2, 17)]!;
    const matched = rnd() < 0.8;
    const risk = rnd();
    const signal: NetworkSignal = {
      customerId: id,
      source: "simulated_razorpay",
      matched,
      riskTier: matched ? (risk < 0.78 ? "low" : risk < 0.94 ? "medium" : "high") : "unknown",
      paymentPreference: matched
        ? rnd() < 0.44
          ? "cod"
          : rnd() < 0.75
            ? "upi"
            : "card"
        : "unknown",
      confidence: matched ? (rnd() < 0.7 ? "high" : "medium") : "low",
      asOfDay: -int(0, 12),
      riskReason: matched
        ? risk < 0.78
          ? "Synthetic network delivery pattern indicates low RTO risk"
          : risk < 0.94
            ? "Synthetic mixed delivery and address signals"
            : "Synthetic repeated failed-delivery pattern"
        : "No permitted network match available",
    };
    signals.push(signal);
    profiles.set(id, {
      primary,
      repeat: i <= 7 || rnd() < 0.44,
      discountSensitive: rnd() < 0.3,
      cadence: Math.round(primary.defaultIntervalDays * (0.65 + rnd() * 0.85)),
      lastDay: -999,
      signal,
    });
  }
  const addOrder = (
    customer: Customer,
    day: number,
    forced?: { productId: string; status?: OrderStatus; discount?: number },
  ) => {
    const profile = profiles.get(customer.id)!;
    const signal = profile.signal;
    const p = forced ? productById(forced.productId) : profile.primary;
    const items = [{ productId: p.id, qty: forced ? 1 : rnd() < 0.13 ? 2 : 1, unitPrice: p.price }];
    if (!forced && rnd() < 0.38) {
      const candidates = PRODUCTS.filter(
        (x) =>
          x.id !== p.id &&
          !x.components &&
          (x.category === p.category ||
            (p.category === "Routine kits" && x.category === "Skincare")),
      );
      const extra = candidates[int(0, candidates.length - 1)] ?? PRODUCTS[4]!;
      if (!p.components?.includes(extra.id))
        items.push({ productId: extra.id, qty: 1, unitPrice: extra.price });
    }
    const subtotal = items.reduce((t, it) => t + it.qty * it.unitPrice, 0);
    const discount =
      forced?.discount ??
      (rnd() < (profile.discountSensitive ? 0.72 : 0.18)
        ? Math.round(subtotal * (rnd() < 0.7 ? 0.1 : 0.2))
        : 0);
    const paymentMethod =
      rnd() < 0.7 && signal.paymentPreference !== "unknown"
        ? signal.paymentPreference
        : rnd() < 0.4
          ? "cod"
          : "upi";
    const roll = rnd();
    const status: OrderStatus =
      forced?.status ??
      (roll < 0.025
        ? "cancelled"
        : roll < 0.045
          ? "refund_pending"
          : roll < 0.078
            ? "returned"
            : paymentMethod === "cod" && roll < (signal.riskTier === "high" ? 0.22 : 0.105)
              ? "rto"
              : "completed");
    const net = subtotal - discount;
    const shipping = net < 499 ? 49 : 0;
    const tax = Math.round(net * 0.18); // Tax-exclusive synthetic catalog assumptions.
    const full = net + shipping + tax;
    const collected =
      status === "completed" || status === "refund_pending"
        ? full
        : status === "returned"
          ? full
          : 0;
    const refund = status === "returned" ? full : 0;
    const seq = orders.length + 1;
    orders.push({
      id: "ORD-" + String(seq).padStart(6, "0"),
      shopifyId: "gid://shopify/Order/" + (9100000000 + seq),
      customerId: customer.id,
      day,
      createdAt: new Date(DEMO_DATE_UTC + day * DAY_MS + int(0, 86399) * 1000).toISOString(),
      items,
      discount,
      status,
      source: "seed",
      paymentMethod,
      financialStatus:
        status === "completed" || status === "refund_pending"
          ? "paid"
          : status === "returned"
            ? "refunded"
            : status === "cancelled"
              ? "voided"
              : "pending",
      fulfillmentStatus:
        status === "completed"
          ? "delivered"
          : status === "returned" || status === "rto"
            ? "returned"
            : "unfulfilled",
      shipping,
      tax,
      refund,
      collected,
    });
    profile.lastDay = Math.max(profile.lastDay, day);
  };
  const fixtures = [
    { i: 0, p: "P01", days: [-27, -57, -88, -118, -149, -179] },
    { i: 1, p: "P02", days: [-24, -52, -79, -108, -135, -163] },
    { i: 2, p: "P01", days: [-1, -31, -60, -92, -121, -152] },
    { i: 3, p: "P02", days: [-22, -47, -72, -97, -122] },
    { i: 4, p: "P06", days: [-33, -68, -104, -139, -173] },
    { i: 5, p: "P09", days: [-30, -66] },
    { i: 6, p: "P15", days: [-25, -51, -77, -103, -128, -154] },
  ];
  for (const f of fixtures)
    for (const day of f.days)
      addOrder(customers[f.i]!, day, {
        productId: f.p,
        status: f.i === 3 && day === -47 ? "refund_pending" : "completed",
        discount: f.i === 0 && day === -88 ? 100 : 0,
      });
  for (let month = 0; month < 6; month++) {
    const win = MONTH_WINDOWS[month]!;
    const newcomers = customers.slice(
      7 + month * 1998,
      month === 5 ? 12000 : 7 + (month + 1) * 1998,
    );
    for (const c of newcomers) addOrder(c, int(win.start, win.end - 1));
    let count = orders.filter((o) => o.day >= win.start && o.day < win.end).length;
    const pool = customers
      .slice(7)
      .filter((c) => profiles.get(c.id)!.repeat && profiles.get(c.id)!.lastDay < win.end);
    let attempts = 0;
    while (count < MONTHLY_ORDER_TARGETS[month]!) {
      const c = pool[int(0, pool.length - 1)]!;
      const profile = profiles.get(c.id)!;
      const earliest = Math.max(win.start, profile.lastDay + (attempts > 100000 ? 1 : 5));
      if (earliest >= win.end) {
        attempts++;
        continue;
      }
      const desired = profile.lastDay + profile.cadence + int(-12, 14);
      const day = desired >= earliest && desired < win.end ? desired : int(earliest, win.end - 1);
      addOrder(c, day);
      count++;
      attempts++;
    }
  }
  for (const c of customers) {
    const count = int(0, 3);
    for (let n = 0; n < count; n++)
      contacts.push({
        customerId: c.id,
        day: -int(8, 180),
        type: "promotional",
        channel: rnd() < 0.78 ? "whatsapp" : "email",
      });
    if (rnd() < 0.06)
      contacts.push({
        customerId: c.id,
        day: -int(1, 6),
        type: "promotional",
        channel: "whatsapp",
      });
  }
  const fixtureContacts = contacts.filter(
    (x) => !customers.slice(0, 7).some((c) => c.id === x.customerId),
  );
  for (const c of customers.slice(0, 7))
    fixtureContacts.push({ customerId: c.id, day: -40, type: "promotional", channel: "whatsapp" });
  return {
    products: PRODUCTS,
    customers,
    orders: orders.sort((a, b) => a.day - b.day || a.id.localeCompare(b.id)),
    contacts: fixtureContacts,
    signals,
  };
}
let cached: Dataset | null = null;
export function baseDataset(): Dataset {
  return (cached ??= generateDataset());
}
export const orderValue = (o: Order) => o.items.reduce((s, it) => s + it.unitPrice * it.qty, 0);
export const orderContribution = (o: Order) =>
  o.items.reduce((s, it) => s + (it.unitPrice - productById(it.productId).cogs) * it.qty, 0) -
  o.discount -
  85;
