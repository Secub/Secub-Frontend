import type { ReactNode } from "react";
import { IconButton } from "./IconButton";

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
  variant?: "default" | "danger" | "danger-hover";
  className?: string;
}

export interface TableActionsLayout {
  columnWidthClassName?: string;
  horizontalPaddingClassName?: string;
  alignment?: "left" | "center" | "right";
  groupClassName?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string;
  actions?: TableAction<T>[];
  actionsLayout?: TableActionsLayout;
  emptyMessage?: string;
  caption?: string;
  ariaLabel?: string;
}

const actionAlignmentClasses: Record<NonNullable<TableActionsLayout["alignment"]>, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function Table<T>({
  columns,
  data,
  rowKey,
  actions = [],
  actionsLayout,
  emptyMessage = "No hay datos disponibles.",
  caption,
  ariaLabel,
}: TableProps<T>) {
  const hasActions = actions.length > 0;
  const actionsColumnWidthClassName = actionsLayout?.columnWidthClassName ?? "w-[110px]";
  const actionsHorizontalPaddingClassName = actionsLayout?.horizontalPaddingClassName ?? "px-5";
  const actionsAlignmentClassName = actionAlignmentClasses[actionsLayout?.alignment ?? "left"];
  const actionsGroupClassName = actionsLayout?.groupClassName ?? "gap-2";

  return (
    <div className="overflow-hidden rounded-[20px] border border-[var(--secub-border)] bg-[var(--secub-surface)] shadow-sm">
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
                    "border-b border-[var(--secub-border)] px-5 py-4 text-left text-sm font-semibold text-[var(--color-secondary-4)]",
                    column.headerClassName ?? "",
                  ].join(" ")}
                >
                  {column.title}
                </th>
              ))}

              {hasActions ? (
                <th
                  scope="col"
                  className={[
                    actionsColumnWidthClassName,
                    actionsHorizontalPaddingClassName,
                    actionsAlignmentClassName,
                    "border-b border-[var(--secub-border)] py-4 text-sm font-semibold text-[var(--color-secondary-4)]",
                  ].join(" ")}
                >
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
                <tr key={rowKey(row, index)} className="bg-[var(--secub-surface)]">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={[
                        "border-b border-[var(--secub-border)] px-5 py-4 align-top text-sm text-[var(--color-gray-2)]",
                        column.className ?? "",
                      ].join(" ")}
                    >
                      {column.render(row)}
                    </td>
                  ))}

                  {hasActions ? (
                    <td
                      className={[
                        actionsColumnWidthClassName,
                        actionsHorizontalPaddingClassName,
                        "border-b border-[var(--secub-border)] py-4 align-middle",
                      ].join(" ")}
                    >
                      <div className={["flex items-center", actionsGroupClassName].join(" ")}>
                        {actions.map((action) => {
                          const isVisible = action.show ? action.show(row) : true;

                          if (!isVisible) return null;

                          const isDisabled = action.disabled
                            ? action.disabled(row)
                            : false;

                          const title = isDisabled
                            ? action.disabledReason?.(row) ?? action.label
                            : action.label;

                          if (action.icon) {
                            const iconVariant =
                              action.variant === "danger"
                                ? "danger"
                                : action.variant === "danger-hover"
                                  ? "danger_hover"
                                  : "outline";

                            return (
                              <IconButton
                                key={action.key}
                                icon={action.icon}
                                label={action.label}
                                title={title}
                                variant={iconVariant}
                                disabled={isDisabled}
                                className={action.className}
                                onClick={() => action.onClick(row)}
                              />
                            );
                          }

                          return (
                            <button
                              key={action.key}
                              type="button"
                              onClick={() => {
                                if (!isDisabled) action.onClick(row);
                              }}
                              disabled={isDisabled}
                              className={[
                                "text-xs font-medium text-[var(--color-gray-4)] transition-colors hover:text-[var(--color-secondary-1)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45",
                                action.className ?? "",
                              ].join(" ")}
                              aria-label={title}
                              title={title}
                            >
                              {action.label}
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
