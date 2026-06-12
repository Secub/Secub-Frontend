import type {
  MapeoCompetenciasEnriched,
  MapeoCompetenciasRole,
  RolePermissions,
} from "./MapeoCompetencias.types";

export const roleLabels: Record<MapeoCompetenciasRole, string> = {
  admin: "Admin (Empresa)",
  vice: "Vicerrectoría (Seccional)",
  decano: "Decanatura",
  director: "Jefatura de programa",
  docente: "Docencia",
};

// Regla funcional RF05: la Jefatura de programa define la Gestión Académica.
// Admin, Vicerrector y Decano consultan/exportan según alcance; Docente visualiza el módulo en modo consulta.
export const rolePermissions: Record<MapeoCompetenciasRole, RolePermissions> = {
  admin: {
    canRead: true,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
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
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canExportPdf: true,
    canExportExcel: true,
    canFilterBySeccional: false,
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
    canFilterBySeccional: false,
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
  role: MapeoCompetenciasRole,
  CompetenciasRa: MapeoCompetenciasEnriched,
) {
  return rolePermissions[role].canUpdate && CompetenciasRa.estado === "activo";
}

export function getEditDisabledReason(
  role: MapeoCompetenciasRole,
  CompetenciasRa: MapeoCompetenciasEnriched,
) {
  if (!rolePermissions[role].canUpdate) {
    return "Tu rol no tiene permiso para editar esta competencia Ra.";
  }

  if (CompetenciasRa.estado !== "activo") {
    return "Solo se permite editar competencias Ra asociadas a programas activos.";
  }

  return "";
}