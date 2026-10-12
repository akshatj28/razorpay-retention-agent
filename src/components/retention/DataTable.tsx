import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  width?: string;
  render: (row: T) => ReactNode;
};

export function CellTable({
  rows,
  headings,
  label,
  minWidth,
  empty,
}: {
  rows: { id: string; cells: ReactNode[] }[];
  headings: { label: string; align?: "left" | "center" | "right"; width?: string }[];
  label: string;
  minWidth?: number | undefined;
  empty?: string | undefined;
}) {
  return (
    <DataTable<{ id: string; cells: ReactNode[] }>
      rows={rows}
      rowId={(row) => row.id}
      label={label}
      minWidth={minWidth}
      empty={empty}
      columns={headings.map((heading, index) => ({
        ...heading,
        key: String(index),
        render: (row) => row.cells[index],
      }))}
    />
  );
}

/** Semantic tables use the shared Blade theme variables. Callers paginate large datasets. */
export function DataTable<T>({
  rows,
  columns,
  rowId,
  label,
  minWidth = 640,
  empty = "No records in this view.",
}: {
  rows: T[];
  columns: Column<T>[];
  rowId: (row: T) => string;
  label: string;
  minWidth?: number | undefined;
  empty?: string | undefined;
}) {
  const align = (column: Column<T>) =>
    column.align === "right"
      ? "text-right"
      : column.align === "center"
        ? "text-center"
        : "text-left";
  return (
    <div
      className="blade-table max-w-full overflow-x-auto"
      role="region"
      aria-label={label}
      tabIndex={0}
    >
      <table aria-label={label} className="w-full border-collapse text-sm" style={{ minWidth }}>
        <thead className="sticky top-0 z-10 bg-muted">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={
                  "border-b px-3 py-3 text-xs font-semibold text-muted-foreground " + align(column)
                }
                style={{ minWidth: Number(column.width?.match(/(\d+)px/)?.[1] ?? 110) }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr key={rowId(row)} className="border-b last:border-0 hover:bg-muted/30">
                {columns.map((column) => (
                  <td key={column.key} className={"px-3 py-3 align-top " + align(column)}>
                    <div className="max-w-sm break-words">{column.render(row)}</div>
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length || 1}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
