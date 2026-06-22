/**
 * PdfTemplate.tsx
 *
 * Plantilla reutilizable para generar PDFs desde el browser.
 * Usa: @react-pdf/renderer  →  npm install @react-pdf/renderer
 *
 * Uso rápido:
 *   import { downloadPdf } from "./PdfTemplate";
 *   await downloadPdf({ records, title, logoUrl });
 */

// import React from "react";
import {
  pdf,
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  // Font,
} from "@react-pdf/renderer";

// ─── Tipado de datos ────────────────────────────────────────────────────────

export interface PdfColumn<T> {
  /** Encabezado de columna */
  header: string;
  /** Porcentaje de ancho relativo al total de columnas (suma debe ser 100) */
  widthPct: number;
  /** Cómo extraer el valor de una fila */
  accessor: (row: T) => string;
}

export interface PdfTemplateProps<T> {
  /** Título principal del documento */
  title: string;
  /** Subtítulo opcional (ej: nombre de seccional o filtro activo) */
  subtitle?: string;
  /** URL o base64 de un logo (png / jpg). Omitir si no aplica. */
  logoUrl?: string;
  /** Texto de pie de página. Si se omite no se muestra. */
  footerText?: string;
  /** Definición de columnas de la tabla */
  columns: PdfColumn<T>[];
  /** Registros a mostrar */
  records: T[];
  /** Paleta de colores (opcional — tiene defaults) */
  theme?: Partial<PdfTheme>;
}

export interface PdfTheme {
  primary: string;   // color de encabezado de tabla y borde izquierdo
  headerBg: string;  // fondo de fila de encabezado
  rowAlt: string;    // fondo de filas alternadas
  text: string;      // texto principal
  muted: string;     // texto secundario / pie
}

const DEFAULT_THEME: PdfTheme = {
  primary: "#1D4ED8",   // azul institucional
  headerBg: "#EFF6FF",
  rowAlt: "#F8FAFC",
  text: "#1E293B",
  muted: "#64748B",
};

// ─── Estilos ────────────────────────────────────────────────────────────────

const buildStyles = (theme: PdfTheme) =>
  StyleSheet.create({
    page: {
      paddingTop: 40,
      paddingBottom: 50,
      paddingHorizontal: 40,
      fontFamily: "Helvetica",
      fontSize: 9,
      color: theme.text,
    },

    // Encabezado del documento
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      borderBottomWidth: 2,
      borderBottomColor: theme.primary,
      paddingBottom: 10,
    },
    logo: {
      width: 48,
      height: 48,
      marginRight: 12,
      objectFit: "contain",
    },
    headerTexts: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontFamily: "Helvetica-Bold",
      color: theme.primary,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 9,
      color: theme.muted,
    },
    dateText: {
      fontSize: 8,
      color: theme.muted,
      marginTop: 2,
    },

    // Tabla
    table: {
      marginTop: 8,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 0.5,
      borderBottomColor: "#CBD5E1",
      minHeight: 22,
      alignItems: "center",
    },
    tableHeaderRow: {
      flexDirection: "row",
      backgroundColor: theme.headerBg,
      borderLeftWidth: 3,
      borderLeftColor: theme.primary,
      minHeight: 24,
      alignItems: "center",
    },
    tableRowAlt: {
      backgroundColor: theme.rowAlt,
    },
    cell: {
      paddingHorizontal: 6,
      paddingVertical: 4,
    },
    cellHeader: {
      fontFamily: "Helvetica-Bold",
      fontSize: 8,
      color: theme.primary,
      paddingHorizontal: 6,
      paddingVertical: 5,
    },

    // Summary badge
    summary: {
      marginTop: 10,
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    summaryBadge: {
      backgroundColor: theme.headerBg,
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      fontSize: 8,
      color: theme.primary,
    },

    // Pie de página
    footer: {
      position: "absolute",
      bottom: 20,
      left: 40,
      right: 40,
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 0.5,
      borderTopColor: "#CBD5E1",
      paddingTop: 6,
    },
    footerText: {
      fontSize: 7,
      color: theme.muted,
    },
  });

// ─── Componente interno del documento ───────────────────────────────────────

function PdfDocument<T>({
  title,
  subtitle,
  logoUrl,
  footerText,
  columns,
  records,
  theme,
}: PdfTemplateProps<T>) {
  const t: PdfTheme = { ...DEFAULT_THEME, ...theme };
  const styles = buildStyles(t);
  const dateStr = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">

        {/* ── Encabezado ── */}
        <View style={styles.header} fixed>
          {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
          <View style={styles.headerTexts}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            <Text style={styles.dateText}>Generado el {dateStr}</Text>
          </View>
        </View>

        {/* ── Tabla ── */}
        <View style={styles.table}>

          {/* Encabezado de columnas */}
          <View style={styles.tableHeaderRow}>
            {columns.map((col) => (
              <Text
                key={col.header}
                style={[styles.cellHeader, { width: `${col.widthPct}%` }]}
              >
                {col.header}
              </Text>
            ))}
          </View>

          {/* Filas de datos */}
          {records.map((row, rowIdx) => (
            <View
              key={rowIdx}
              style={[
                styles.tableRow,
                rowIdx % 2 !== 0 ? styles.tableRowAlt : {},
              ]}
              wrap={false}
            >
              {columns.map((col) => (
                <Text
                  key={col.header}
                  style={[styles.cell, { width: `${col.widthPct}%` }]}
                >
                  {col.accessor(row)}
                </Text>
              ))}
            </View>
          ))}
        </View>

        {/* ── Conteo de registros ── */}
        <View style={styles.summary}>
          <Text style={styles.summaryBadge}>
            {records.length} registro{records.length === 1 ? "" : "s"}
          </Text>
        </View>

        {/* ── Pie de página (fijo en todas las páginas) ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {footerText ?? title}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

// ─── API pública ─────────────────────────────────────────────────────────────

/**
 * Genera y descarga el PDF directamente en el browser.
 *
 * @example
 * await downloadPdf({
 *   title: "Competencias RAs",
 *   subtitle: "Facultad de Ingeniería",
 *   logoUrl: "/logo.png",
 *   columns: [
 *     { header: "Facultad",  widthPct: 20, accessor: (r) => r.facultadNombre },
 *     { header: "Programa",  widthPct: 30, accessor: (r) => r.programaNombre },
 *     { header: "Plan",      widthPct: 20, accessor: (r) => r.planNombre },
 *     { header: "Descripción", widthPct: 20, accessor: (r) => r.descripcion },
 *     { header: "Estado",    widthPct: 10, accessor: (r) => r.estado },
 *   ],
 *   records: exportRecords,
 * });
 */
export async function downloadPdf<T>(
  props: PdfTemplateProps<T>,
  filename?: string,
): Promise<void> {
  const blob = await pdf(<PdfDocument {...props} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const timestamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = filename ?? `export-${timestamp}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Devuelve un Blob del PDF (útil si necesitas subirlo a un servidor).
 */
export async function buildPdfBlob<T>(
  props: PdfTemplateProps<T>,
): Promise<Blob> {
  return pdf(<PdfDocument {...props} />).toBlob();
}
