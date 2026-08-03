import type {
  CompetenciasRaEnriched,
  CompetenciasRaFormacionRole,
  RolePermissions,
} from "./CompetenciasRa.types";

export const roleLabels: Record<CompetenciasRaFormacionRole, string> = {
  admin: "Admin (Empresa)",
  vice: "Vicerrectoría (Seccional)",
  decano: "Decanatura",
  direccionPrograma: "Dirección de programa",
  docente: "Docencia",
};

// Decisión funcional aplicada: solo la Dirección de programa gestiona contenido académico.
// Admin, Vicerrectoría y Decanatura son roles estrictamente de consulta: lectura y filtros, sin CRUD, exportación ni acciones de flujo.
export const rolePermissions: Record<CompetenciasRaFormacionRole, RolePermissions> = {
  admin: {
    canRead: true,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canExportPdf: false,
    canExportExcel: false,
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
    canExportPdf: false,
    canExportExcel: false,
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
    canExportPdf: false,
    canExportExcel: false,
    canFilterBySeccional: false,
    canFilterByLugar: false,
    canFilterByFacultad: false,
    canFilterByPrograma: true,
    canFilterByPlan: true,
    canFilterByEstado: true,
  },
  direccionPrograma: {
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
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canExportPdf: false,
    canExportExcel: false,
    canFilterBySeccional: false,
    canFilterByLugar: false,
    canFilterByFacultad: false,
    canFilterByPrograma: false,
    canFilterByPlan: false,
    canFilterByEstado: false,
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
    return "La edición no está disponible.";
  }

  if (CompetenciasRa.estado !== "activo") {
    return "Solo se permite editar competencias Ra asociadas a programas activos.";
  }

  return "";
}