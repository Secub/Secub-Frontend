import type {
  Catalogs,
  CurrentUser,
  FormState,
  CompetenciasRaEnriched,
  CompetenciasRaEstado,
  CompetenciasRaFilters,
  CompetenciasRaFormacionRecord,
} from "./CompetenciasRa.types";

export const INITIAL_FILTERS: CompetenciasRaFilters = {
  seccionalId: "",
  facultadId: "",
  lugarId: "",
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

export function getDefaultLugarBySeccional(seccionalId: string) {
  if (!seccionalId) return "";
  if (seccionalId === "medellin") return "medellin";
  return seccionalId;
}

export function enrichCompetenciasRa(
  records: CompetenciasRaFormacionRecord[],
  catalogs: Catalogs,
): CompetenciasRaEnriched[] {
  return records.map((record) => {
    const seccional = catalogs.seccionales.find(
      (item) => item.id === record.seccionalId,
    );
    const facultad = catalogs.facultades.find(
      (item) => item.id === record.facultadId,
    );
    const lugar = catalogs.lugares.find((item) => item.id === record.lugarId);
    const programa = catalogs.programas.find(
      (item) => item.id === record.programaId,
    );
    const plan = catalogs.planes.find((item) => item.id === record.planId);

    return {
      ...record,
      seccionalNombre: seccional?.nombre ?? "Sin seccional",
      facultadNombre: facultad?.nombre ?? "Sin facultad",
      lugarNombre: lugar?.nombre ?? "Sin lugar",
      programaNombre: programa?.nombre ?? "Sin programa",
      planNombre: plan?.nombre ?? "Sin plan",
    };
  });
}

export function applyRoleScope(
  records: CompetenciasRaEnriched[],
  user: CurrentUser,
): CompetenciasRaEnriched[] {
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
  records: CompetenciasRaEnriched[],
  filters: CompetenciasRaFilters,
): CompetenciasRaEnriched[] {
  return records.filter((record) => {
    const matchesSeccional =
      !filters.seccionalId || record.seccionalId === filters.seccionalId;
    const matchesFacultad =
      !filters.facultadId || record.facultadId === filters.facultadId;
    const matchesLugar = !filters.lugarId || record.lugarId === filters.lugarId;
    const matchesPrograma =
      !filters.programaId || record.programaId === filters.programaId;
    const matchesPlan = !filters.planId || record.planId === filters.planId;
    const matchesEstado = !filters.estado || record.estado === filters.estado;

    return (
      matchesSeccional &&
      matchesFacultad &&
      matchesLugar &&
      matchesPrograma &&
      matchesPlan &&
      matchesEstado
    );
  });
}

export function buildAvailableFilters(
  records: CompetenciasRaEnriched[],
  catalogs: Catalogs,
  filters: CompetenciasRaFilters,
) {
  const seccionales = catalogs.seccionales.filter((item) =>
    records.some((record) => record.seccionalId === item.id),
  );

  const lugares = catalogs.lugares.filter((item) => {
    if (filters.seccionalId && item.seccionalId !== filters.seccionalId) {
      return false;
    }

    return records.some((record) => record.lugarId === item.id);
  });

  const facultades = catalogs.facultades.filter((item) => {
    if (filters.seccionalId && item.seccionalId !== filters.seccionalId) {
      return false;
    }

    if (filters.lugarId) {
      const hasLugar = records.some(
        (record) =>
          record.lugarId === filters.lugarId && record.facultadId === item.id,
      );

      if (!hasLugar) return false;
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

    return records.some((record) => {
      if (filters.lugarId && record.lugarId !== filters.lugarId) {
        return false;
      }

      return record.programaId === item.id;
    });
  });

  const planes = catalogs.planes.filter((item) => {
    return records.some((record) => {
      if (filters.seccionalId && record.seccionalId !== filters.seccionalId) {
        return false;
      }

      if (filters.lugarId && record.lugarId !== filters.lugarId) {
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
    lugares,
    programas,
    planes,
  };
}

export function sanitizeFilters(
  filters: CompetenciasRaFilters,
  available: ReturnType<typeof buildAvailableFilters>,
): CompetenciasRaFilters {
  const hasSeccional = available.seccionales.some(
    (item) => item.id === filters.seccionalId,
  );
  const hasLugar = available.lugares.some((item) => item.id === filters.lugarId);
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
    lugarId: hasLugar
      ? filters.lugarId
      : hasSeccional
        ? getDefaultLugarBySeccional(filters.seccionalId)
        : "",
    facultadId: hasFacultad ? filters.facultadId : "",
    programaId: hasPrograma ? filters.programaId : "",
    planId: hasPlan ? filters.planId : "",
  };
}

export function getEmptyFormState(user: CurrentUser): FormState {
  const seccionalId = user.scope.seccionalId ?? "";

  return {
    seccionalId,
    facultadId: user.scope.facultadId ?? "",
    lugarId: getDefaultLugarBySeccional(seccionalId),
    programaId: user.scope.programaId ?? "",
    planId: "",
    estado: "activo",
    numeroRA: 0,
    descripcion: "",
    raDescripciones: [],
  };
}

export function mapRecordToForm(record: CompetenciasRaEnriched): FormState {
  const raDescripciones = (record.resultadosAprendizaje || []).map(
    (ra) => ra.descripcion,
  );

  return {
    seccionalId: record.seccionalId,
    facultadId: record.facultadId,
    lugarId: record.lugarId,
    programaId: record.programaId,
    planId: record.planId,
    estado: record.estado,
    numeroRA: record.resultadosAprendizaje?.length || 0,
    descripcion: record.descripcion,
    raDescripciones,
  };
}

export function buildRecordFromForm(
  form: FormState,
  original: CompetenciasRaEnriched | null,
  existingRecords?: CompetenciasRaFormacionRecord[],
): CompetenciasRaFormacionRecord {
  const now = new Date().toISOString();

  const resultadosAprendizaje = form.raDescripciones
    .filter((desc) => desc.trim().length > 0)
    .map((desc, index) => ({
      id: `ra-${Math.random().toString(36).slice(2, 8)}`,
      numero: index + 1,
      descripcion: desc.trim(),
    }));

  // Calcular número automáticamente para registros nuevos
  let numero = 1;
  if (original?.numero) {
    // Si estamos editando, mantener el número actual
    numero = original.numero;
  } else if (existingRecords && existingRecords.length > 0) {
    // Si estamos creando, buscar el número máximo y sumar 1
    const maxNumero = Math.max(...existingRecords.map((r) => r.numero || 0));
    numero = maxNumero + 1;
  }

  return {
    id: original?.id ?? `pf-${Math.random().toString(36).slice(2, 8)}`,
    seccionalId: form.seccionalId,
    facultadId: form.facultadId,
    lugarId: form.lugarId,
    programaId: form.programaId,
    planId: form.planId,
    estado: form.estado,
    nombre: `Competencia ${numero}`,
    numero,
    descripcion: form.descripcion.trim(),
    resultadosAprendizaje,
    createdAt: original?.createdAt ?? now,
    updatedAt: now,
  };
}

export function getEstadoBadgeVariant(estado: CompetenciasRaEstado) {
  return estado === "activo" ? "success" : "neutral";
}

export function buildCsvLikeExcel(records: CompetenciasRaEnriched[]) {
  const rows = [
    [
      "Seccional / Sede",
      "Lugar de desarrollo",
      "Facultad",
      "Programa académico",
      "Plan de estudio",
      "Estado",
      "Descripción",
    ],
    ...records.map((record) => [
      record.seccionalNombre,
      record.lugarNombre,
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

export function buildSimplePdf(records: CompetenciasRaEnriched[], title: string) {
  const lines = [title, " "];

  records.forEach((record, index) => {
    lines.push(
      `${index + 1}. ${record.programaNombre} - ${record.planNombre} - ${record.lugarNombre}`,
    );
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