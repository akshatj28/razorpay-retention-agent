import type { Dataset } from "./data";
export type Cell = string | number | boolean | null;
export type TableRow = Record<string, Cell>;
export type DataTables = Record<string, TableRow[]>;
export function databaseTables(data: Dataset): DataTables {
  const dayISO = (d: number) => new Date(Date.UTC(2026, 9, 12) + d * 86400000).toISOString();
  const productMap = new Map(data.products.map((p) => [p.id, p]));
  const products = data.products.map((p) => ({
    product_id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category,
    size: p.size,
    price_inr: p.price,
    cogs_inr: p.cogs,
    assumed_fulfilment_payment_cost_inr: 85,
    stock: p.stock,
    default_interval_days: p.defaultIntervalDays,
  }));
  const customers = data.customers.map((c) => ({
    customer_id: c.id,
    shopify_customer_id: c.shopifyId,
    name: c.name,
    city: c.city,
    demo_phone: c.phone,
    demo_email: c.email,
    whatsapp_consent: c.consent,
    voice_consent: c.callConsent,
  }));
  const orders = data.orders.map((o) => {
    const subtotal = o.items.reduce((t, it) => t + it.qty * it.unitPrice, 0);
    const retained = o.status === "completed" || o.status === "refund_pending";
    return {
      order_id: o.id,
      shopify_order_id: o.shopifyId ?? "demo://" + o.id,
      customer_id: o.customerId,
      created_at: o.createdAt ?? dayISO(o.day),
      day_offset: o.day,
      payment_method: o.paymentMethod ?? "upi",
      financial_status: o.financialStatus ?? "paid",
      fulfilment_status: o.fulfillmentStatus ?? "delivered",
      order_status: o.status,
      subtotal_inr: subtotal,
      discount_inr: o.discount,
      shipping_inr: o.shipping ?? 0,
      tax_inr: o.tax ?? 0,
      order_total_inr: subtotal - o.discount + (o.shipping ?? 0) + (o.tax ?? 0),
      collected_inr: o.collected ?? subtotal - o.discount,
      refunded_inr: o.refund ?? 0,
      retained_net_sales_inr: retained ? subtotal - o.discount : 0,
      contribution_inr:
        o.status === "refund_pending" || o.status === "pending_delivery"
          ? null
          : o.status === "rto"
            ? -170
            : o.status === "returned"
              ? -85
              : o.status === "cancelled"
                ? 0
                : subtotal -
                  o.discount -
                  o.items.reduce((t, it) => t + productMap.get(it.productId)!.cogs * it.qty, 0) -
                  85,
      source: o.source,
      attributed_campaign: o.attributedCampaign ?? null,
    };
  });
  const order_items = data.orders.flatMap((o) =>
    o.items.map((it, i) => ({
      line_item_id: o.id + "-L" + (i + 1),
      order_id: o.id,
      product_id: it.productId,
      quantity: it.qty,
      unit_price_inr: it.unitPrice,
      line_subtotal_inr: it.qty * it.unitPrice,
    })),
  );
  const bundle_components = data.products.flatMap((p) =>
    [...new Set(p.components ?? [])].map((componentId) => ({
      bundle_product_id: p.id,
      component_product_id: componentId,
      quantity: p.components!.filter((id) => id === componentId).length,
    })),
  );
  const contacts = data.contacts.map((c, i) => ({
    contact_id: "CONTACT-" + (i + 1),
    customer_id: c.customerId,
    contacted_at: dayISO(c.day),
    day_offset: c.day,
    channel: c.channel,
    type: c.type,
    source: "synthetic_history",
  }));
  const razorpay_signals = data.signals.map((s) => ({
    customer_id: s.customerId,
    source: s.source,
    matched: s.matched,
    risk_tier: s.riskTier,
    payment_preference: s.paymentPreference,
    confidence: s.confidence,
    as_of: dayISO(s.asOfDay),
    risk_reason: s.riskReason,
  }));
  const refunds = data.orders
    .filter((o) => o.status === "returned" || o.status === "refund_pending")
    .map((o) => ({
      refund_id: "REF-" + o.id,
      order_id: o.id,
      customer_id: o.customerId,
      status: o.status === "refund_pending" ? "pending" : "succeeded",
      amount_inr:
        o.refund ||
        o.items.reduce((t, it) => t + it.qty * it.unitPrice, 0) -
          o.discount +
          (o.shipping ?? 0) +
          (o.tax ?? 0),
      reason: "Synthetic product return/refund",
      source: "synthetic",
    }));
  const monthly_summary = Array.from({ length: 6 }, (_, i) => {
    const start = Date.UTC(2026, 3 + i, 12);
    const end = Date.UTC(2026, 4 + i, 12);
    const rows = orders.filter((o) => {
      const date = Date.parse(o.created_at);
      return date >= start && date < end;
    });
    return {
      period_start: new Date(start).toISOString().slice(0, 10),
      period_end: new Date(end - 86400000).toISOString().slice(0, 10),
      orders: rows.length,
      customers: new Set(rows.map((o) => o.customer_id)).size,
      retained_net_sales_inr: rows.reduce((t, o) => t + o.retained_net_sales_inr, 0),
      cod_orders: rows.filter((o) => o.payment_method === "cod").length,
      rto_orders: rows.filter((o) => o.order_status === "rto").length,
      returned_orders: rows.filter((o) => o.order_status === "returned").length,
    };
  });
  return {
    monthly_summary,
    products,
    customers,
    orders,
    order_items,
    bundle_components,
    razorpay_signals,
    contacts,
    refunds,
  };
}
export const csvFor = (rows: TableRow[]) => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]!);
  const escape = (v: Cell) => '"' + String(v ?? "").replaceAll('"', '""') + '"';
  return (
    [
      headers.map(escape).join(","),
      ...rows.map((r) => headers.map((h) => escape(r[h] ?? null)).join(",")),
    ].join("\r\n") + "\r\n"
  );
};
