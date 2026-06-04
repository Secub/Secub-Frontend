import type { ReactNode } from "react";

export interface TableColumn<T> {
  key: string;
  title: string;
  render: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface TableAction<T> {
  key: string;
  label: string;
  onClick: (row: T) => void;
  icon?: ReactNode;
  show?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
  disabledReason?: (row: T) => string;
  variant?: "default" | "danger";
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string;
  actions?: TableAction<T>[];
  emptyMessage?: string;
  caption?: string;
  ariaLabel?: string;
}

export function Table<T>({
  columns,
  data,
  rowKey,
  actions = [],
  emptyMessage = "No hay datos disponibles.",
  caption,
  ariaLabel,
}: TableProps<T>) {
  const hasActions = actions.length > 0;

  return (
    <div className="overflow-hidden rounded-[20px] border border-[var(--color-gray-6)] bg-white shadow-sm">
      <div className="w-full overflow-x-auto">
        <table className="w-full table-fixed border-separate border-spacing-0" aria-label={caption ? undefined : ariaLabel}>
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead className="bg-[var(--color-surface-soft)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={[
                    "border-b border-[var(--color-gray-6)] px-5 py-4 text-left text-sm font-semibold text-[var(--color-secondary-4)]",
                    column.headerClassName ?? "",
                  ].join(" ")}
                >
                  {column.title}
                </th>
              ))}

              {hasActions ? (
                <th scope="col" className="w-[110px] border-b border-[var(--color-gray-6)] px-5 py-4 text-left text-sm font-semibold text-[var(--color-secondary-4)]">
                  Acciones
                </th>
              ) : null}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="px-5 py-10 text-center text-sm text-[var(--color-gray-4)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={rowKey(row, index)} className="bg-white">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={[
                        "border-b border-[var(--color-gray-6)] px-5 py-4 align-top text-sm text-[var(--color-gray-2)]",
                        column.className ?? "",
                      ].join(" ")}
                    >
                      {column.render(row)}
                    </td>
                  ))}

                  {hasActions ? (
                    <td className="w-[110px] border-b border-[var(--color-gray-6)] px-5 py-4 align-middle">
                      <div className="flex items-center gap-2">
                        {actions.map((action) => {
                          const isVisible = action.show ? action.show(row) : true;

                          if (!isVisible) return null;

                          const isDisabled = action.disabled
                            ? action.disabled(row)
                            : false;

                          const title = isDisabled
                            ? action.disabledReason?.(row) ?? action.label
                            : action.label;

                          return (
                            <button
                              key={action.key}
                              type="button"
                              onClick={() => {
                                if (!isDisabled) {
                                  action.onClick(row);
                                }
                              }}
                              disabled={isDisabled}
                              className={[
                                "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.22)]",
                                "disabled:cursor-not-allowed disabled:opacity-45",
                                action.variant === "danger"
                                  ? "text-[var(--color-error)] hover:bg-[color:rgba(235,87,87,0.10)]"
                                  : "text-[var(--color-gray-4)] hover:bg-[var(--color-surface-soft)]",
                              ].join(" ")}
                              aria-label={title}
                              title={title}
                            >
                              {action.icon ? (
                                <span aria-hidden="true">{action.icon}</span>
                              ) : (
                                <span className="text-xs font-medium">
                                  {action.label}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
