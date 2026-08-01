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
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";


// ─── Tipado de datos ────────────────────────────────────────────────────────

export interface ExcelColumn<T> {
    header: string;
    width: number;
    accessor: (row:T)=>string;
}

export interface ExcelTemplateProps<T>{

    title:string;

    subtitle?:string;

    logoUrl?:string;

    logoUrl2?:string;

    logoFooter1?:string;

    logoFooter2?:string;

    footerText?:string;

    columns:ExcelColumn<T>[];

    records:T[];

    theme?:Partial<ExcelTheme>;

}

export interface ExcelTheme{

    primary:string;

    headerBg:string;

    rowAlt:string;

    text:string;

    muted:string;

}

// const DEFAULT_THEME={

//     primary:"#1D4ED8",

//     headerBg:"#EFF6FF",

//     rowAlt:"#F8FAFC",

//     text:"#1E293B",

//     muted:"#64748B",

// }

// ─── Componente interno del documento ───────────────────────────────────────

async function buildWorkbook<T>({
    // title,
    // subtitle,
    // logoUrl,
    // logoUrl2,
    // logoFooter1,
    // logoFooter2,
    columns,
    records,
}: ExcelTemplateProps<T>) {

    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet("Exportación");

    const header = sheet.addRow(
    columns.map(c => c.header)
  );

    sheet.pageSetup = {
    orientation: "landscape",
    paperSize: 9,
    fitToPage: true,
    fitToWidth: 1,
    };

    sheet.columns = columns.map(c=>({
    header:c.header,
    key:c.header,
    width:c.width
    }));

    const dateStr = new Date().toLocaleDateString(
    "es-CO",
    {
        year:"numeric",
        month:"long",
        day:"numeric",
    }
    );

    // sheet.mergeCells("C1:H1");
    // sheet.getCell("C1").value = title;

    // sheet.mergeCells("C2:H2");
    // sheet.getCell("C2").value = subtitle;

    // sheet.addRow([]);

    header.eachCell(cell=>{
    cell.font={
        bold:true,
        color:{argb:"FFFFFF"}
    };
    cell.fill={
        type:"pattern",
        pattern:"solid",
        fgColor:{argb:"474747"}
    };
    cell.border={
        bottom:{style:"thin"}
    };
    });

    records.forEach(record=>{
    sheet.addRow(
        columns.map(
            c=>c.accessor(record)
        )
    );
    });

    sheet.eachRow(row=>{
    row.eachCell(cell=>{
        cell.alignment={
            wrapText:true,
            vertical:"top",
            horizontal:"left",
        };
    });
    });

    sheet.eachRow((row,rowNumber)=>{
    if(rowNumber<=4) return;
    if(rowNumber%2===0){
        row.eachCell(cell=>{
            cell.fill={
                type:"pattern",
                pattern:"solid",
                fgColor:{argb:"F8FAFC"}
            };
        });
    }
    });

    sheet.addRow([]);

    sheet.addRow([
        `${records.length} registros exportados`
    ]);

    sheet.addRow([]);

    sheet.addRow([
        `Generado el ${dateStr}`
    ]);
    
    return workbook;
}

// ─── API pública ─────────────────────────────────────────────────────────────

/**
 * Genera y descarga el Excel directamente en el browser.
 *
 * @example
 * await downloadExcel({
 *   title: "Competencias RAs",
 *   subtitle: "Facultad de Ingeniería",
 *   logoUrls: ["/logo.png"],
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
export async function downloadExcel<T>(
    props: ExcelTemplateProps<T>,
    filename?: string,
) {

    const workbook =
        await buildWorkbook(props);

    const buffer =
        await workbook.xlsx.writeBuffer();

    saveAs(
        new Blob([buffer]),
        filename ?? "export.xlsx",
    );
}

/**
 * Devuelve un Blob del PDF (útil si necesitas subirlo a un servidor).
 */
export async function buildExcelBuffer<T>(
    props: ExcelTemplateProps<T>,
) {

    const workbook =
        await buildWorkbook(props);

    return workbook.xlsx.writeBuffer();

}
