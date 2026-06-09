import type { MapeoCompetenciasEnriched } from "./MapeoCompetencias.types";
import { getNucleoLabel, getSemestreEstadoLabel } from "./MapeoCompetencias.semestres";

export function buildCsvLikeExcel(records: MapeoCompetenciasEnriched[]) {
  const rows = [
    [
      "Programa académico",
      "Plan de estudios",
      "Semestre",
      "Núcleo",
      "Estado semestre",
      "Cursos",
      "Niveles asignados",
    ],
    ...records.flatMap((record) =>
      record.semestresResumen.map((semestre) => [
        record.programaNombre,
        record.planNombre,
        semestre.semestreNumero,
        getNucleoLabel(semestre.nucleo),
        getSemestreEstadoLabel(semestre.estado),
        semestre.cursos.length,
        `${semestre.totalAsignadas}/${semestre.totalCeldas}`,
      ]),
    ),
  ];

  return rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function buildPrintablePdfHtml(records: MapeoCompetenciasEnriched[]) {
  const rows = records.flatMap((record) =>
    record.semestresResumen.map((semestre) => `
      <tr>
        <td>${escapeHtml(record.programaNombre)}</td>
        <td>${escapeHtml(record.planNombre)}</td>
        <td>${escapeHtml(semestre.semestreNumero)}</td>
        <td>${escapeHtml(getNucleoLabel(semestre.nucleo))}</td>
        <td>${escapeHtml(getSemestreEstadoLabel(semestre.estado))}</td>
        <td>${escapeHtml(semestre.cursos.length)}</td>
        <td>${escapeHtml(`${semestre.totalAsignadas}/${semestre.totalCeldas}`)}</td>
      </tr>`),
  );

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Mapeo de Competencias</title>
  <style>
    body { font-family: Arial, sans-serif; color: #1f2933; margin: 32px; }
    h1 { margin-bottom: 8px; }
    p { color: #52606d; }
    table { border-collapse: collapse; width: 100%; margin-top: 24px; }
    th, td { border: 1px solid #d9e2ec; padding: 8px 10px; font-size: 12px; text-align: left; }
    th { background: #f0f4f8; }
  </style>
</head>
<body>
  <h1>RF05 — Mapeo de Competencias</h1>
  <p>Reporte consolidado de núcleos y niveles de compromiso I-R-A-NA por programa, plan y semestre.</p>
  <table>
    <thead>
      <tr>
        <th>Programa académico</th>
        <th>Plan de estudios</th>
        <th>Semestre</th>
        <th>Núcleo</th>
        <th>Estado semestre</th>
        <th>Cursos</th>
        <th>Niveles asignados</th>
      </tr>
    </thead>
    <tbody>${rows.join("")}</tbody>
  </table>
</body>
</html>`;
}

export function printMapeoCompetenciasPdf(records: MapeoCompetenciasEnriched[]) {
  const html = buildPrintablePdfHtml(records);
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    downloadTextFile("mapeo-competencias.html", html, "text/html;charset=utf-8");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export function downloadTextFile(filename: string, content: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
