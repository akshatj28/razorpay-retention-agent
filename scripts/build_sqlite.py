"""Build an offline relational demo database from the same normalized records as the app."""
import json
import os
import sqlite3
import sys
from pathlib import Path

tables = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
output = Path(sys.argv[2]).resolve()
temporary = output / "nira.build.sqlite"
if temporary.exists():
    temporary.unlink()
db = sqlite3.connect(temporary)
db.execute("PRAGMA foreign_keys=ON")
primary = {"products": ["product_id"], "customers": ["customer_id"], "orders": ["order_id"],
           "order_items": ["line_item_id"], "bundle_components": ["bundle_product_id", "component_product_id"],
           "contacts": ["contact_id"], "razorpay_signals": ["customer_id"], "refunds": ["refund_id"],
           "monthly_summary": ["period_start"]}
foreign = {"orders": [("customer_id", "customers", "customer_id")],
           "order_items": [("order_id", "orders", "order_id"), ("product_id", "products", "product_id")],
           "bundle_components": [("bundle_product_id", "products", "product_id"), ("component_product_id", "products", "product_id")],
           "contacts": [("customer_id", "customers", "customer_id")],
           "razorpay_signals": [("customer_id", "customers", "customer_id")],
           "refunds": [("order_id", "orders", "order_id"), ("customer_id", "customers", "customer_id")]}
schema = ["PRAGMA foreign_keys=ON;"]
# Dependencies precede referenced rows; summaries are independent.
sequence = ["products", "customers", "orders", "order_items", "bundle_components", "razorpay_signals", "contacts", "refunds", "monthly_summary", "benchmark_results"]
for name in sequence:
    rows = tables[name]
    columns = list(rows[0])
    definitions = []
    for column in columns:
        values = [r[column] for r in rows if r[column] is not None]
        kind = "INTEGER" if values and all(isinstance(v, (int, bool)) for v in values) else "REAL" if values and all(isinstance(v, (int, float)) for v in values) else "TEXT"
        definitions.append('"' + column + '" ' + kind)
    if name in primary:
        definitions.append("PRIMARY KEY (" + ",".join('"' + c + '"' for c in primary[name]) + ")")
    for column, parent, key in foreign.get(name, []):
        definitions.append('FOREIGN KEY ("' + column + '") REFERENCES "' + parent + '"("' + key + '")')
    sql = 'CREATE TABLE "' + name + '" (' + ", ".join(definitions) + ");"
    db.execute(sql)
    schema.append(sql)
    placeholders = ",".join("?" for _ in columns)
    db.executemany('INSERT INTO "' + name + '" VALUES (' + placeholders + ')', [[r[c] for c in columns] for r in rows])
for name, field in [("orders", "customer_id"), ("order_items", "order_id"), ("contacts", "customer_id")]:
    sql = 'CREATE INDEX "idx_' + name + "_" + field + '" ON "' + name + '"("' + field + '");'
    db.execute(sql)
    schema.append(sql)
db.commit()
assert db.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
assert not db.execute("PRAGMA foreign_key_check").fetchall()
assert db.execute("SELECT COUNT(*) FROM orders").fetchone()[0] == 30000
assert db.execute("SELECT SUM(orders) FROM monthly_summary").fetchone()[0] == 30000
assert db.execute("SELECT COUNT(*) FROM (SELECT o.order_id FROM orders o JOIN order_items i ON o.order_id=i.order_id GROUP BY o.order_id HAVING SUM(i.line_subtotal_inr)<>o.subtotal_inr)").fetchone()[0] == 0
db.close()
os.replace(temporary, output / "nira.sqlite")
(output / "schema.sql").write_text("\n".join(schema) + "\n", encoding="utf-8")
print("SQLite integrity, foreign keys, order counts and line-item reconciliation passed.")
