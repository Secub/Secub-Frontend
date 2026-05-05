import type {
  CompetenciasRaEnriched,
  CompetenciasRaFormacionRole,
  RolePermissions,
} from "./CompetenciasRa.types";

export const roleLabels: Record<CompetenciasRaFormacionRole, string> = {
  admin: "Admin (Empresa)",
  vice: "Vicerrector (Seccional)",
  decano: "Decano",
  director: "Director de programa",
  docente: "Docente",
};

export const rolePermissions: Record<CompetenciasRaFormacionRole, RolePermissions> = {
  admin: {
    canRead: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canExportPdf: true,
    canExportExcel: true,
    canFilterBySeccional: true,
    canFilterByLugar: true,
    canFilterByFacultad: true,
    canFilterByPrograma: true,
    canFilterByPlan: true,
    canFilterByEstado: true,
  },
  vice: {
    canRead: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canExportPdf: true,
    canExportExcel: true,
    canFilterBySeccional: true,
    canFilterByLugar: true,
    canFilterByFacultad: true,
    canFilterByPrograma: true,
    canFilterByPlan: true,
    canFilterByEstado: true,
  },
  decano: {
    canRead: true,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canExportPdf: true,
    canExportExcel: true,
    canFilterBySeccional: false,
    canFilterByLugar: false,
    canFilterByFacultad: false,
    canFilterByPrograma: true,
    canFilterByPlan: true,
    canFilterByEstado: true,
  },
  director: {
    canRead: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canExportPdf: true,
    canExportExcel: true,
    canFilterBySeccional: true,
    canFilterByLugar: true,
    canFilterByFacultad: true,
    canFilterByPrograma: true,
    canFilterByPlan: true,
    canFilterByEstado: true,
  },
  docente: {
    canRead: true,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canExportPdf: true,
    canExportExcel: true,
    canFilterBySeccional: false,
    canFilterByLugar: false,
    canFilterByFacultad: false,
    canFilterByPrograma: true,
    canFilterByPlan: true,
    canFilterByEstado: true,
  },
};

export function canEditCompetenciasRa(
  role: CompetenciasRaFormacionRole,
  CompetenciasRa: CompetenciasRaEnriched,
) {
  return rolePermissions[role].canUpdate && CompetenciasRa.estado === "activo";
}

export function getEditDisabledReason(
  role: CompetenciasRaFormacionRole,
  CompetenciasRa: CompetenciasRaEnriched,
) {
  if (!rolePermissions[role].canUpdate) {
    return "Tu rol no tiene permiso para editar esta competencia Ra.";
  }

  if (CompetenciasRa.estado !== "activo") {
    return "Solo se permite editar competencias Ra asociadas a programas activos.";
  }

  return "";
}