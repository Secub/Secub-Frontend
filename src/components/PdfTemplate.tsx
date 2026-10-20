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

async function imageToDataUrl(imageUrl?: string): Promise<string | undefined> {
  if (!imageUrl || imageUrl.startsWith("data:")) return imageUrl;

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`No fue posible cargar la imagen de la plantilla: ${imageUrl}`);
  }
  const image = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("No fue posible procesar una imagen de la plantilla PDF."));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("No fue posible procesar una imagen de la plantilla PDF."));
    reader.readAsDataURL(image);
  });
}

async function reportBody<T>(props: PdfTemplateProps<T>) {
  const columns = props.columns.map((column, index) => ({ header: column.header, key: `column_${index}`, width: Math.max(8, Math.round(column.widthPct / 2)) }));
  const records = props.records.map((record) => Object.fromEntries(props.columns.map((column, index) => [`column_${index}`, column.accessor(record)])));
  const [logoUrl, logoUrl2, logoUrlfoot1, logoUrlfoot2] = await Promise.all([
    imageToDataUrl(props.logoUrl),
    imageToDataUrl(props.logoUrl2),
    imageToDataUrl(props.logoUrlfoot1),
    imageToDataUrl(props.logoUrlfoot2),
  ]);
  return {
    title: props.title,
    subtitle: props.subtitle,
    logoUrl,
    logoUrl2,
    logoUrlfoot1,
    logoUrlfoot2,
    footerText: props.footerText,
    theme: props.theme,
    columns,
    records,
  };
}

export async function buildPdfBlob<T>(props: PdfTemplateProps<T>): Promise<Blob> {
  return requestPdf(await reportBody(props));
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
  footerText?: string;
  improvementTitle: string;
  improvementDraft: string;
  theme?: Partial<PdfTheme>;
}, filename?: string): Promise<void> {
  const [logoUrl, logoUrl2, logoUrlfoot1, logoUrlfoot2] = await Promise.all([
    imageToDataUrl(params.logoUrl),
    imageToDataUrl(params.logoUrl2),
    imageToDataUrl(params.logoUrlfoot1),
    imageToDataUrl(params.logoUrlfoot2),
  ]);
  const blob = await requestPdf({
    title: params.title,
    subtitle: params.subtitle,
    logoUrl,
    logoUrl2,
    logoUrlfoot1,
    logoUrlfoot2,
    footerText: params.footerText,
    theme: params.theme,
    letterBody: `${params.improvementTitle}\n\n${params.improvementDraft}`,
  });
  downloadFile(blob, filename ?? `plan-mejora-${new Date().toISOString().slice(0, 10)}.pdf`, "application/pdf");
}
