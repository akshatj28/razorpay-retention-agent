// Node 24+; no spreadsheet authoring dependencies. CSV tables are intermediates for SQLite.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { stripTypeScriptTypes } from "node:module";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { baseDataset, SEED, MONTHLY_ORDER_TARGETS } from "../src/retention/data.ts";
import { databaseTables, csvFor } from "../src/retention/tables.ts";
import { runBenchmark } from "../src/retention/benchmark.ts";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "data", "nira");
const temporary = path.join(root, "tmp", "data-export");
await fs.mkdir(output, { recursive: true });
await fs.mkdir(temporary, { recursive: true });
const featureSource = (
  await fs.readFile(path.join(root, "src/retention/features.ts"), "utf8")
).replaceAll(
  'from "./data"',
  'from "' + pathToFileURL(path.join(root, "src/retention/data.ts")).href + '"',
);
await fs.writeFile(path.join(temporary, "features.mjs"), stripTypeScriptTypes(featureSource));
const { deriveFeatures } = await import(pathToFileURL(path.join(temporary, "features.mjs")).href);
const data = baseDataset();
const features = deriveFeatures(
  data,
  { tolerancePct: 25, freqDays: 7 },
  { excluded: new Set(), resolved: new Set(), optOuts: new Set() },
);
const tables = databaseTables(data);
tables.benchmark_results = [0, 0.5, 1, 1.5].flatMap((effectiveness) =>
  runBenchmark(data, features, effectiveness).map((r) => ({
    assumed_response_multiplier: effectiveness,
    ...r,
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
