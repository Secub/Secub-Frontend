import { API_BASE_URL } from "../config/api.config";
import { downloadFile } from "../shared/browser";

export interface ExcelColumn<T> { header: string; width: number; accessor: (row: T) => string }
export interface ExcelTheme { primary: string; headerBg: string; rowAlt: string; text: string; muted: string }
export interface ExcelTemplateProps<T> {
  title: string;
  subtitle?: string;
  logoUrl?: string;
  logoUrl2?: string;
  logoFooter1?: string;
  logoFooter2?: string;
  footerText?: string;
  columns: ExcelColumn<T>[];
  records: T[];
  theme?: Partial<ExcelTheme>;
}

async function requestExcel<T>(props: ExcelTemplateProps<T>) {
  const columns = props.columns.map((column, index) => ({ header: column.header, key: `column_${index}`, width: column.width }));
  const records = props.records.map((record) => Object.fromEntries(props.columns.map((column, index) => [`column_${index}`, column.accessor(record)])));
  const response = await fetch(`${API_BASE_URL}/reports/excel`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: props.title, subtitle: props.subtitle, footerText: props.footerText, columns, records }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(error?.message ?? "No fue posible generar el reporte Excel.");
  }
  return response.arrayBuffer();
}

export async function buildExcelBuffer<T>(props: ExcelTemplateProps<T>) {
  return requestExcel(props);
}

export async function downloadExcel<T>(props: ExcelTemplateProps<T>, filename?: string) {
  const buffer = await requestExcel(props);
  downloadFile(buffer, filename ?? "export.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
}
