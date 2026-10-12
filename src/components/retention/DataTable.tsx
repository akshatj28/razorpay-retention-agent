import { Table, TableHeader, TableHeaderRow, TableHeaderCell, TableBody, TableRow, TableCell } from "@razorpay/blade/components";
import type { ReactNode } from "react";

export type Column<T> = { key: string; label: string; align?: "left" | "center" | "right"; width?: string; render: (row: T) => ReactNode };

export function CellTable({ rows, headings, label, minWidth, empty }: {
  rows: { id: string; cells: ReactNode[] }[];
  headings: { label: string; align?: "left" | "center" | "right"; width?: string }[];
  label: string;
  minWidth?: number | undefined;
  empty?: string | undefined;
}) {
  return <DataTable<{ id: string; cells: ReactNode[] }> rows={rows} rowId={(row) => row.id} label={label} minWidth={minWidth} empty={empty}
    columns={headings.map((heading, index) => ({ ...heading, key: String(index), render: (row) => row.cells[index] }))} />;
}

/** Shared presentation only: callers continue to derive all data from the campaign store. */
export function DataTable<T>({ rows, columns, rowId, label, minWidth = 640, empty = "No records in this view." }: {
  rows: T[];
  columns: Column<T>[];
  rowId: (row: T) => string;
  label: string;
  minWidth?: number | undefined;
  empty?: string | undefined;
}) {
  const nodes = rows.map((row) => ({ id: rowId(row), row }));
  return <div className="blade-table overflow-x-auto" role="region" aria-label={label} tabIndex={0}>
    <div style={{ minWidth }}>
      <Table data={{ nodes }} selectionType="none" rowDensity="compact" height="auto" isHeaderSticky
        gridTemplateColumns={columns.map((column) => column.width ?? "minmax(100px, 1fr)").join(" ")}>
        {(data) => <>
          <TableHeader><TableHeaderRow>{columns.map((column) =>
            <TableHeaderCell key={column.key} headerKey={column.key} textAlign={column.align ?? "left"}>{column.label}</TableHeaderCell>
          )}</TableHeaderRow></TableHeader>
          <TableBody>{data.map((node) => <TableRow key={node.id} item={node}>{columns.map((column) =>
            <TableCell key={column.key} textAlign={column.align ?? "left"}>{column.render(node.row)}</TableCell>
          )}</TableRow>)}</TableBody>
        </>}
      </Table>
    </div>
    {rows.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">{empty}</p>}
  </div>;
}
