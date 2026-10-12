// Node 24+; no spreadsheet authoring dependencies. CSV tables are intermediates for SQLite.
// Modules load through Vite so extensionless imports resolve exactly as in the app and tests.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { runnerImport } from "vite";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "data", "nira");
const temporary = path.join(root, "tmp", "data-export");
await fs.mkdir(output, { recursive: true });
await fs.mkdir(temporary, { recursive: true });
const { module: m } = await runnerImport(path.join(root, "scripts", "export-modules.ts"), {
  configFile: false,
  root,
  logLevel: "error",
  resolve: { alias: { "@": path.join(root, "src") } },
});
const { baseDataset, SEED, MONTHLY_ORDER_TARGETS, databaseTables, csvFor, runBenchmark } = m;
const data = baseDataset();
// Same customer features as the app's Compare strategies page.
const features = m.deriveStudio(data, m.initialStudio()).features;
const tables = databaseTables(data);
const round = (v) => (typeof v === "number" ? Math.round(v * 100) / 100 : v);
tables.benchmark_results = [0, 0.5, 1, 1.5].flatMap((effectiveness) =>
  runBenchmark(data, features, effectiveness).map((r) => ({
    message_influence: effectiveness,
    approach: r.strategy,
    customers: r.audience,
    messaged: r.contacts,
    orders_placed: r.purchases,
    delivered_and_paid_orders: round(r.collectedOrders),
    sales_inr: round(r.netSales),
    profit_inr: round(r.merchantContribution),
    extra_profit_vs_no_message_inr: round(r.incremental),
    extra_profit_vs_flat_20_sale_inr: round(r.vsFlatSale),
    fee_25pct_of_extra_profit_vs_no_message_inr: round(r.successFee),
    merchant_keeps_inr: round(r.merchantRetains),
    messaging_cost_inr: round(r.operatorCost),
  })),
);
const manifest = {
  synthetic: true,
  merchant: "Nira Botanics",
  as_of: "2026-10-12",
  history_start: "2026-04-12",
  history_end: "2026-10-11",
  currency: "INR",
  catalog_prices: "tax-exclusive synthetic assumptions",
  seed: SEED,
  monthly_targets: MONTHLY_ORDER_TARGETS,
  tables: {},
};
for (const [name, rows] of Object.entries(tables)) {
  const csv = csvFor(rows);
  await fs.writeFile(path.join(output, name + ".csv"), csv, "utf8");
  manifest.tables[name] = {
    rows: rows.length,
    sha256: createHash("sha256").update(csv).digest("hex"),
  };
}
const json = path.join(temporary, "tables.json");
await fs.writeFile(json, JSON.stringify(tables));
const python = process.env.NIRA_PYTHON || "python";
execFileSync(python, [path.join(root, "scripts", "build_sqlite.py"), json, output], {
  stdio: "inherit",
});
await fs.writeFile(path.join(output, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(
  JSON.stringify({
    orders: tables.orders.length,
    customers: tables.customers.length,
    line_items: tables.order_items.length,
    monthly: tables.monthly_summary.map((r) => r.orders),
    database: "data/nira/nira.sqlite",
  }),
);
