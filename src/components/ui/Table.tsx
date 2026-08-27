import MuiTable from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { IconButton } from "./IconButton";
import { Input } from "./Input";
import { SecubIcon } from "./SecubIcon";

export type TableSortValue = string | number | Date | null | undefined;

export interface TableColumn<T> {
  key: string;
  title: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  sortValue?: (row: T) => TableSortValue;
  searchValue?: (row: T) => string | number | null | undefined;
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
  noMatchesMessage?: string;
  caption?: string;
  ariaLabel?: string;
  searchPlaceholder?: string;
  initialRowsPerPage?: number;
  rowsPerPageOptions?: number[];
  minWidth?: number | string;
}

type SortDirection = "asc" | "desc";

const actionAlignmentClasses: Record<NonNullable<TableActionsLayout["alignment"]>, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

function flattenSearchableValues(value: unknown): string[] {
  if (value === null || value === undefined || typeof value === "function") return [];
  if (value instanceof Date) return [value.toISOString()];
  if (Array.isArray(value)) return value.flatMap(flattenSearchableValues);
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap(flattenSearchableValues);
  }
  if (typeof value === "string") return [value];
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return [value.toString()];
  }
  if (typeof value === "symbol") return [value.description ?? ""];
  return [];
}

function toComparable(value: TableSortValue): string | number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;

  const text = String(value ?? "").trim();
  const numericText = text.replace(/%$/, "").replace(/\s/g, "").replace(",", ".");
  if (/^-?\d+(?:\.\d+)?%?$/.test(numericText)) return Number.parseFloat(numericText);

  if (/^\d{4}-\d{2}-\d{2}(?:[T\s].*)?$/.test(text)) {
    const timestamp = Date.parse(text);
    if (!Number.isNaN(timestamp)) return timestamp;
  }

  return normalizeText(text);
}

function compareValues(left: TableSortValue, right: TableSortValue) {
  const comparableLeft = toComparable(left);
  const comparableRight = toComparable(right);
  if (typeof comparableLeft === "number" && typeof comparableRight === "number") {
    return comparableLeft - comparableRight;
  }
  return String(comparableLeft).localeCompare(String(comparableRight), "es", {
    numeric: true,
    sensitivity: "base",
  });
}

function getDefaultColumnValue<T>(row: T, key: string): TableSortValue {
  if (!row || typeof row !== "object") return "";
  return (row as Record<string, TableSortValue>)[key];
}

export function Table<T>({
  columns,
  data,
  rowKey,
  actions = [],
  actionsLayout,
  emptyMessage = "No hay datos disponibles.",
  noMatchesMessage = "No hay coincidencias para la búsqueda.",
  caption,
  ariaLabel,
  searchPlaceholder = "Buscar en la tabla…",
  initialRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25],
  minWidth = 760,
}: TableProps<T>) {
  const firstSortableColumn = columns.find((column) => column.sortable !== false);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState(firstSortableColumn?.key ?? "");
  const [order, setOrder] = useState<SortDirection>("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const hasActions = actions.length > 0;
  const actionsColumnWidthClassName = actionsLayout?.columnWidthClassName ?? "w-[110px]";
  const actionsHorizontalPaddingClassName = actionsLayout?.horizontalPaddingClassName ?? "px-5";
  const actionsAlignmentClassName = actionAlignmentClasses[actionsLayout?.alignment ?? "left"];
  const actionsGroupClassName = actionsLayout?.groupClassName ?? "gap-2";

  const filteredRows = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm.trim());
    if (!normalizedSearch) return data;

    return data.filter((row) => {
      const configuredValues = columns.flatMap((column) =>
        column.searchValue ? [column.searchValue(row)] : [],
      );
      const sourceValues = [
        ...configuredValues,
        ...flattenSearchableValues(row),
      ];
      return normalizeText(sourceValues.join(" ")).includes(normalizedSearch);
    });
  }, [columns, data, searchTerm]);

  const sortedRows = useMemo(() => {
    const activeColumn = columns.find((column) => column.key === orderBy);
    if (!activeColumn || activeColumn.sortable === false) return filteredRows;

    return filteredRows
      .map((row, index) => ({ row, index }))
      .sort((left, right) => {
        const leftValue = activeColumn.sortValue
          ? activeColumn.sortValue(left.row)
          : getDefaultColumnValue(left.row, activeColumn.key);
        const rightValue = activeColumn.sortValue
          ? activeColumn.sortValue(right.row)
          : getDefaultColumnValue(right.row, activeColumn.key);
        const comparison = compareValues(leftValue, rightValue);
        return comparison === 0
          ? left.index - right.index
          : order === "asc"
            ? comparison
            : -comparison;
      })
      .map(({ row }) => row);
  }, [columns, filteredRows, order, orderBy]);

  const visibleRows = useMemo(
    () => sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [page, rowsPerPage, sortedRows],
  );

  useEffect(() => {
    const lastPage = Math.max(0, Math.ceil(filteredRows.length / rowsPerPage) - 1);
    if (page > lastPage) setPage(lastPage);
  }, [filteredRows.length, page, rowsPerPage]);

  useEffect(() => {
    setPage(0);
  }, [data]);

  const handleSort = (column: TableColumn<T>) => {
    if (column.sortable === false) return;
    const isSameColumn = orderBy === column.key;
    setOrder(isSameColumn && order === "asc" ? "desc" : "asc");
    setOrderBy(column.key);
    setPage(0);
  };

  return (
    <div className="overflow-hidden rounded-[20px] border border-[var(--secub-border)] bg-[var(--secub-surface)] shadow-sm">
      <Toolbar disableGutters className="border-b border-[var(--secub-border)] px-4 py-3 sm:px-5">
        <Input
          hideLabel
          label="Buscar en la tabla"
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setPage(0);
          }}
          leftIcon={<SecubIcon name="search" weight="bold" size={19} />}
          placeholder={searchPlaceholder}
          className="min-h-11"
        />
      </Toolbar>

      <TableContainer className="w-full overflow-x-auto">
        <MuiTable
          aria-label={caption ? undefined : ariaLabel}
          sx={{ minWidth, tableLayout: "fixed", borderCollapse: "separate", borderSpacing: 0 }}
        >
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <TableHead className="bg-[var(--color-surface-soft)]">
            <TableRow>
              {columns.map((column) => {
                const sortable = column.sortable !== false;
                return (
                  <TableCell
                    key={column.key}
                    scope="col"
                    sortDirection={orderBy === column.key ? order : false}
                    className={[
                      "border-b border-[var(--secub-border)] px-5 py-4 text-left text-sm font-semibold text-[var(--color-secondary-4)]",
                      column.headerClassName ?? "",
                    ].join(" ")}
                    sx={{ fontFamily: "inherit" }}
                  >
                    {sortable ? (
                      <TableSortLabel
                        active={orderBy === column.key}
                        direction={orderBy === column.key ? order : "asc"}
                        onClick={() => handleSort(column)}
                      >
                        {column.title}
                      </TableSortLabel>
                    ) : column.title}
                  </TableCell>
                );
              })}

              {hasActions ? (
                <TableCell
                  scope="col"
                  className={[
                    actionsColumnWidthClassName,
                    actionsHorizontalPaddingClassName,
                    actionsAlignmentClassName,
                    "border-b border-[var(--secub-border)] py-4 text-sm font-semibold text-[var(--color-secondary-4)]",
                  ].join(" ")}
                  sx={{ fontFamily: "inherit" }}
                >
                  Acciones
                </TableCell>
              ) : null}
            </TableRow>
          </TableHead>

          <TableBody>
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="px-5 py-10 text-center text-sm text-[var(--color-gray-4)]"
                  sx={{ fontFamily: "inherit" }}
                >
                  {searchTerm.trim() ? noMatchesMessage : emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row, index) => (
                <TableRow
                  key={rowKey(row, page * rowsPerPage + index)}
                  className="bg-[var(--secub-surface)] transition-colors hover:bg-[var(--color-surface-soft)]"
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={[
                        "border-b border-[var(--secub-border)] px-5 py-4 align-top text-sm text-[var(--color-gray-2)]",
                        column.className ?? "",
                      ].join(" ")}
                      sx={{ fontFamily: "inherit" }}
                    >
                      {column.render(row)}
                    </TableCell>
                  ))}

                  {hasActions ? (
                    <TableCell
                      className={[
                        actionsColumnWidthClassName,
                        actionsHorizontalPaddingClassName,
                        "border-b border-[var(--secub-border)] py-4 align-middle",
                      ].join(" ")}
                      sx={{ fontFamily: "inherit" }}
                    >
                      <div className={["flex items-center", actionsGroupClassName].join(" ")}>
                        {actions.map((action) => {
                          const isVisible = action.show ? action.show(row) : true;
                          if (!isVisible) return null;
                          const isDisabled = action.disabled ? action.disabled(row) : false;
                          const title = isDisabled
                            ? action.disabledReason?.(row) ?? action.label
                            : action.label;

                          if (action.icon) {
                            const iconVariant = action.variant === "danger"
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
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredRows.length}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        onPageChange={(_event, nextPage) => setPage(nextPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number.parseInt(event.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        className="border-t border-[var(--secub-border)] text-[var(--color-gray-3)]"
        sx={{ fontFamily: "inherit", overflow: "visible" }}
      />
    </div>
  );
}

export default Table;
