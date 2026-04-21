import type {
  Catalogs,
  CurrentUser,
  FormState,
  PerfilEgresoEnriched,
  PerfilEgresoEstado,
  PerfilEgresoFilters,
  PerfilEgresoRecord,
} from "./perfil-egreso.types";

export const INITIAL_FILTERS: PerfilEgresoFilters = {
  seccionalId: "",
  facultadId: "",
  programaId: "",
  planId: "",
  estado: "",
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function enrichPerfilesEgreso(
  records: PerfilEgresoRecord[],
  catalogs: Catalogs,
): PerfilEgresoEnriched[] {
  return records.map((record) => {
    const seccional = catalogs.seccionales.find(
      (item) => item.id === record.seccionalId,
    );
    const facultad = catalogs.facultades.find(
      (item) => item.id === record.facultadId,
    );
    const programa = catalogs.programas.find(
      (item) => item.id === record.programaId,
    );
    const plan = catalogs.planes.find((item) => item.id === record.planId);

    return {
      ...record,
      seccionalNombre: seccional?.nombre ?? "Sin seccional",
      facultadNombre: facultad?.nombre ?? "Sin facultad",
      programaNombre: programa?.nombre ?? "Sin programa",
      planNombre: plan?.nombre ?? "Sin plan",
    };
  });
}

export function applyRoleScope(
  records: PerfilEgresoEnriched[],
  user: CurrentUser,
): PerfilEgresoEnriched[] {
  return records.filter((record) => {
    if (user.scope.seccionalId && record.seccionalId !== user.scope.seccionalId) {
      return false;
    }

    if (user.scope.facultadId && record.facultadId !== user.scope.facultadId) {
      return false;
    }

    if (user.scope.programaId && record.programaId !== user.scope.programaId) {
      return false;
    }

    return true;
  });
}

export function applyFilters(
  records: PerfilEgresoEnriched[],
  filters: PerfilEgresoFilters,
): PerfilEgresoEnriched[] {
  return records.filter((record) => {
    const matchesSeccional =
      !filters.seccionalId || record.seccionalId === filters.seccionalId;
    const matchesFacultad =
      !filters.facultadId || record.facultadId === filters.facultadId;
    const matchesPrograma =
      !filters.programaId || record.programaId === filters.programaId;
    const matchesPlan = !filters.planId || record.planId === filters.planId;
    const matchesEstado = !filters.estado || record.estado === filters.estado;

    return (
      matchesSeccional &&
      matchesFacultad &&
      matchesPrograma &&
      matchesPlan &&
      matchesEstado
    );
  });
}

export function buildAvailableFilters(
  records: PerfilEgresoEnriched[],
  catalogs: Catalogs,
  filters: PerfilEgresoFilters,
) {
  const seccionales = catalogs.seccionales.filter((item) =>
    records.some((record) => record.seccionalId === item.id),
  );

  const facultades = catalogs.facultades.filter((item) => {
    if (filters.seccionalId && item.seccionalId !== filters.seccionalId) {
      return false;
    }

    return records.some((record) => record.facultadId === item.id);
  });

  const programas = catalogs.programas.filter((item) => {
    if (filters.seccionalId && item.seccionalId !== filters.seccionalId) {
      return false;
    }

    if (filters.facultadId && item.facultadId !== filters.facultadId) {
      return false;
    }

    return records.some((record) => record.programaId === item.id);
  });

  const planes = catalogs.planes.filter((item) => {
    return records.some((record) => {
      if (filters.seccionalId && record.seccionalId !== filters.seccionalId) {
        return false;
      }

      if (filters.facultadId && record.facultadId !== filters.facultadId) {
        return false;
      }

      if (filters.programaId && record.programaId !== filters.programaId) {
        return false;
      }

      return record.planId === item.id;
    });
  });

  return {
    seccionales,
    facultades,
    programas,
    planes,
  };
}

export function sanitizeFilters(
  filters: PerfilEgresoFilters,
  available: ReturnType<typeof buildAvailableFilters>,
): PerfilEgresoFilters {
  const hasSeccional = available.seccionales.some(
    (item) => item.id === filters.seccionalId,
  );
  const hasFacultad = available.facultades.some(
    (item) => item.id === filters.facultadId,
  );
  const hasPrograma = available.programas.some(
    (item) => item.id === filters.programaId,
  );
  const hasPlan = available.planes.some((item) => item.id === filters.planId);

  return {
    ...filters,
    seccionalId: hasSeccional ? filters.seccionalId : "",
    facultadId: hasFacultad ? filters.facultadId : "",
    programaId: hasPrograma ? filters.programaId : "",
    planId: hasPlan ? filters.planId : "",
  };
}

export function getEmptyFormState(user: CurrentUser): FormState {
  return {
    seccionalId: user.scope.seccionalId ?? "",
    facultadId: user.scope.facultadId ?? "",
    programaId: user.scope.programaId ?? "",
    planId: "",
    estado: "activo",
    descripcion: "",
  };
}

export function mapRecordToForm(record: PerfilEgresoEnriched): FormState {
  return {
    seccionalId: record.seccionalId,
    facultadId: record.facultadId,
    programaId: record.programaId,
    planId: record.planId,
    estado: record.estado,
    descripcion: record.descripcion,
  };
}

export function buildRecordFromForm(
  form: FormState,
  original: PerfilEgresoEnriched | null,
): PerfilEgresoRecord {
  const now = new Date().toISOString();

  return {
    id: original?.id ?? `pe-${Math.random().toString(36).slice(2, 8)}`,
    seccionalId: form.seccionalId,
    facultadId: form.facultadId,
    programaId: form.programaId,
    planId: form.planId,
    estado: form.estado,
    descripcion: form.descripcion.trim(),
    createdAt: original?.createdAt ?? now,
    updatedAt: now,
  };
}

export function getEstadoBadgeVariant(estado: PerfilEgresoEstado) {
  return estado === "activo" ? "success" : "neutral";
}

export function buildCsvLikeExcel(records: PerfilEgresoEnriched[]) {
  const rows = [
    [
      "Seccional",
      "Facultad",
      "Programa académico",
      "Plan de estudio",
      "Estado",
      "Descripción",
    ],
    ...records.map((record) => [
      record.seccionalNombre,
      record.facultadNombre,
      record.programaNombre,
      record.planNombre,
      record.estado,
      record.descripcion.replace(/\n/g, " "),
    ]),
  ];

  return rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
}

function escapePdfText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export function buildSimplePdf(records: PerfilEgresoEnriched[], title: string) {
  const lines = [title, " "];

  records.forEach((record, index) => {
    lines.push(`${index + 1}. ${record.programaNombre} - ${record.planNombre}`);
    lines.push(`Estado: ${record.estado}`);
    lines.push(record.descripcion.slice(0, 90));
    lines.push(" ");
  });

  const pdfLines = lines.slice(0, 32);
  const textOperations = pdfLines
    .map(
      (line, index) =>
        `1 0 0 1 40 ${780 - index * 20} Tm (${escapePdfText(line)}) Tj`,
    )
    .join("\n");

  const stream = `BT\n/F1 11 Tf\n${textOperations}\nET`;

  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.forEach((offset) => {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

export function triggerBrowserDownload(
  content: BlobPart,
  fileName: string,
  type: string,
) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
