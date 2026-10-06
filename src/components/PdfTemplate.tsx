import { API_BASE_URL } from "../config/api.config";
import { downloadFile } from "../shared/browser";

export interface PdfColumn<T> {
  header: string;
  widthPct: number;
  accessor: (row: T) => string;
}

export interface PdfTheme { primary: string; headerBg: string; rowAlt: string; text: string; muted: string }

export interface PdfTemplateProps<T> {
  title: string;
  subtitle?: string;
  logoUrl?: string;
  logoUrl2?: string;
  logoUrlfoot1?: string;
  logoUrlfoot2?: string;
  footerText?: string;
  columns: PdfColumn<T>[];
  records: T[];
  theme?: Partial<PdfTheme>;
}

async function requestPdf(body: unknown) {
  const response = await fetch(`${API_BASE_URL}/reports/pdf`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(error?.message ?? "No fue posible generar el reporte PDF.");
  }
  return response.blob();
}

function reportBody<T>(props: PdfTemplateProps<T>) {
  const columns = props.columns.map((column, index) => ({ header: column.header, key: `column_${index}`, width: Math.max(8, Math.round(column.widthPct / 2)) }));
  const records = props.records.map((record) => Object.fromEntries(props.columns.map((column, index) => [`column_${index}`, column.accessor(record)])));
  return { title: props.title, subtitle: props.subtitle, footerText: props.footerText, columns, records };
}

export async function buildPdfBlob<T>(props: PdfTemplateProps<T>): Promise<Blob> {
  return requestPdf(reportBody(props));
}

export async function downloadPdf<T>(props: PdfTemplateProps<T>, filename?: string): Promise<void> {
  const blob = await buildPdfBlob(props);
  downloadFile(blob, filename ?? `export-${new Date().toISOString().slice(0, 10)}.pdf`, "application/pdf");
}

export async function downloadLetterPdf(params: {
  title: string;
  subtitle?: string;
  logoUrl?: string;
  logoUrl2?: string;
  logoUrlfoot1?: string;
  logoUrlfoot2?: string;
  improvementTitle: string;
  improvementDraft: string;
  theme?: Partial<PdfTheme>;
}, filename?: string): Promise<void> {
  const blob = await requestPdf({ title: params.title, subtitle: params.subtitle, letterBody: `${params.improvementTitle}\n\n${params.improvementDraft}` });
  downloadFile(blob, filename ?? `plan-mejora-${new Date().toISOString().slice(0, 10)}.pdf`, "application/pdf");
}
