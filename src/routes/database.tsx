import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@razorpay/blade/components";
import { PageHeader, Pill, Stat, Note } from "@/components/retention/bits";
import { DataTable } from "@/components/retention/DataTable";
import { databaseTables, csvFor, type TableRow } from "@/retention/tables";
import { useDemo } from "@/retention/store";
const TABLE_LABELS: Record<string, string> = {
  monthly_summary: "Monthly summary",
  products: "Products",
  customers: "Customers",
  orders: "Orders",
  order_items: "Order items",
  bundle_components: "Bundle components",
  razorpay_signals: "Razorpay delivery-risk signals",
  contacts: "Past customer contacts",
  refunds: "Refunds",
};
const columnLabel = (key: string) =>
  key
    .replaceAll("_inr", " (₹)")
    .replaceAll("rto", "return to origin")
    .replaceAll("sku", "SKU")
    .replaceAll("id", "ID")
    .replaceAll("_", " ")
    .replace(/^./, (c) => c.toUpperCase());
export const Route = createFileRoute("/database")({
  component: Database,
  head: () => ({ meta: [{ title: "Order data — Nira Botanics" }] }),
});
function Database() {
  const { d, state } = useDemo();
  const [table, setTable] = useState("orders");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const tables = useMemo(
    () => databaseTables({ ...d.data, orders: [...d.data.orders, ...state.studio.arrivals] }),
    [d.data, state.studio.arrivals],
  );
  const rows = tables[table] ?? [];
  const filtered = useMemo(
    () =>
      query
        ? rows.filter((r) =>
            Object.values(r).some((v) =>
              String(v ?? "")
                .toLowerCase()
                .includes(query.toLowerCase()),
            ),
          )
        : rows,
    [rows, query],
  );
  const columns = Object.keys(rows[0] ?? {});
  const pages = Math.max(1, Math.ceil(filtered.length / 40));
  const safePage = Math.min(page, pages - 1);
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([csvFor(filtered)], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "nira-" + table + ".csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-5 animate-enter">
      <PageHeader
        title="Order data"
        subtitle="Historical sample data plus simulated purchases · 12 Apr–11 Oct 2026 · amounts in ₹"
        actions={
          <Button variant="secondary" onClick={download}>
            Download {TABLE_LABELS[table] ?? table} CSV
          </Button>
        }
      />
      <div data-tour="database" className="panel grid gap-5 p-5 sm:grid-cols-4">
        <Stat
          label="Orders, last six months"
          value={d.data.orders.filter((o) => o.source === "seed").length.toLocaleString("en-IN")}
        />
        <Stat label="Customers" value={d.data.customers.length.toLocaleString("en-IN")} />
        <Stat label="Product variants" value={d.data.products.length} />
        <Stat label="Average orders / month" value="5,000" />
      </div>
      <Note>
        Search within the selected table. Use a customer ID across Orders, Customers, Refunds and
        Razorpay delivery-risk signals to trace the inputs used for a recommendation.
      </Note>
      <section className="panel p-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <label className="text-sm font-medium">
            Table
            <select
              aria-label="Database table"
              value={table}
              onChange={(e) => {
                setTable(e.target.value);
                setPage(0);
                setQuery("");
              }}
              className="ml-3 rounded-lg border bg-card px-3 py-2"
            >
              {Object.keys(tables).map((t) => (
                <option key={t} value={t}>
                  {TABLE_LABELS[t] ?? t.replaceAll("_", " ")} · {tables[t]!.length.toLocaleString()}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Search
            <input
              aria-label="Search database"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Customer, order, product…"
              className="ml-3 rounded-lg border bg-card px-3 py-2"
            />
          </label>
        </div>
        <div className="my-4 flex flex-wrap items-center justify-between gap-3">
          <Pill>{filtered.length.toLocaleString()} matching records</Pill>
          <span className="flex items-center gap-3 text-xs">
            <Button
              size="small"
              variant="secondary"
              isDisabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
            >
              Previous
            </Button>
            Page {safePage + 1} of {pages}
            <Button
              size="small"
              variant="secondary"
              isDisabled={safePage >= pages - 1}
              onClick={() => setPage(safePage + 1)}
            >
              Next
            </Button>
          </span>
        </div>
        <DataTable<{ id: string; r: TableRow }>
          rows={filtered
            .slice(safePage * 40, safePage * 40 + 40)
            .map((r, i) => ({ id: String(safePage * 40 + i), r }))}
          rowId={(x) => x.id}
          label="Store records"
          minWidth={Math.max(700, columns.length * 160)}
          columns={columns.map((key) => ({
            key,
            label: columnLabel(key),
            render: (x) =>
              x.r[key] === null
                ? "Pending / n.a."
                : typeof x.r[key] === "boolean"
                  ? x.r[key]
                    ? "Yes"
                    : "No"
                  : String(x.r[key] ?? ""),
          }))}
        />
      </section>
      <p className="text-xs text-muted-foreground">
        Full normalized CSV tables, SQLite database, schema and data dictionary are committed to the
        repository. Simulated imported purchases appear here; campaign reconciliation has its own
        outcome ledger.
      </p>
    </div>
  );
}
