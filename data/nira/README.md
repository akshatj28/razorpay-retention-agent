# Nira Botanics tabular database

Fictional skincare/haircare brand, inspired by the breadth of Indian personal-care D2C catalogs. Not Mamaearth data. The generator uses seed 20261012 and is the same source used by the offline app.

History: 12 April–11 October 2026. Six rolling calendar-month windows contain 4,600 / 4,900 / 4,750 / 5,200 / 4,950 / 5,600 orders: exactly 30,000 and an average of 5,000/month. There are 12,000 customer records and 18 purchasable variants, including bundles.

## Files and joins

- nira.sqlite: ready-to-query relational database with indexes, primary keys and enforced foreign keys.
- schema.sql: database definition. Each CSV maps directly to a database table.
- manifest.json: row counts, fixed reporting date, seed and SHA-256 checksums.
- customers: customer_id joins orders, contacts, refunds and razorpay_signals. IDs, phone placeholders and example.invalid emails cannot reach real people. WhatsApp and voice permission are distinct synthetic fields.
- products: product_id joins order_items; size/SKU distinguish variants. Prices are tax-exclusive INR assumptions. COGS is per unit; assumed fulfilment/payment cost is INR85 per order, never multiplied for every line item.
- orders: order_id joins order_items and refunds; customer_id identifies the buyer. Payment and fulfilment statuses are separate. collected_inr is gross money collected before refunds; refunded_inr is subtracted to derive retained collections. Returned orders can have both a full collection and a full refund. COD RTO has zero collected revenue and an assumed INR170 logistics loss.
- order_items: one row per product line, with quantity, unit price and line subtotal. Sum line subtotals equals the order subtotal. An order-level discount is not duplicated on each line.
- bundle_components: bundle product, component product and component quantity. Bundle contents count towards product purchase evidence; they do not double-count invoice revenue.
- refunds: pending and succeeded refunds. Unresolved refund contribution is null, not zero; affected customers are suppressed from promotional outreach.
- contacts: historical synthetic channel exposure. Email history exists, while email execution is coming soon.
- razorpay_signals: explicitly simulated network match, risk tier, preference, confidence, timestamp and reason. No actual Vulcan features or merchant API access is asserted. Signals older than seven demo days use merchant-only fallback.
- monthly_summary: counts and retained revenue calculated from orders, not separately seeded headline metrics.
- benchmark_results: the same 2,500 customers under four approaches (Do nothing; Flat 20% off at day 30; Agent, store data only; Agent + Razorpay RTO score) at message_influence 0 / 0.5 / 1 / 1.5, matching the app's Compare strategies page. Agent rows use the Campaign Studio decision logic. extra_profit_vs_no_message_inr is the fee base (same comparison as the in-app control group); extra_profit_vs_flat_20_sale_inr compares with the typical campaign. Delivery and return outcomes are expected values. Hidden behaviour is simulated separately from the agent's forecasts, so results can favour a baseline.

## Reproduce

Node 24+ and Python 3: run npm run data:export. Set NIRA_PYTHON to a Python executable when needed. CSV is the transparent interchange format; the script verifies SQLite integrity, joins, monthly counts and line-item sums. No external service is contacted.

## Query examples

    SELECT o.order_id, o.created_at, o.payment_method, p.name, i.quantity
    FROM orders o JOIN order_items i USING(order_id) JOIN products p USING(product_id)
    WHERE o.customer_id='CUS-0001' ORDER BY o.created_at;

    SELECT * FROM monthly_summary ORDER BY period_start;

    SELECT risk_tier, COUNT(*) FROM razorpay_signals GROUP BY risk_tier;

Purchase cadence, prices, margins, channel costs, tax treatment and intervention response are synthetic modeling assumptions. They are not calibrated company benchmarks. Promotions, additional units and uneven purchasing intentionally introduce irregularity; do not treat this generator as evidence of real customer behaviour.
