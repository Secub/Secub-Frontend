import type {
  MapeoCompetenciasRole,
  ProgramaEstado,
  RolePermissions,
} from "./MapeoCompetencias.types";

export const roleLabels: Record<MapeoCompetenciasRole, string> = {
  admin: "Admin (Empresa)",
  vice: "Vicerrectoría (Seccional)",
  decano: "Decanatura",
  director: "Jefatura de programa",
  docente: "Docencia",
};

/**
 * Regla visual RF05.
 * - "matrix-readonly": conserva la matriz CRUD: Admin/Vice/Decano consultan y Jefatura de programa edita.
 * - "director-only": solo Jefatura de programa visualiza RF05; los demás roles ven acceso restringido.
 */
export const RF05_ACCESS_POLICY = "matrix-readonly" as "matrix-readonly" | "director-only";

const matrixReadOnlyPermissions: Record<MapeoCompetenciasRole, RolePermissions> = {
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

const directorOnlyPermissions: Record<MapeoCompetenciasRole, RolePermissions> = {
  admin: {
    ...matrixReadOnlyPermissions.admin,
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canExportPdf: false,
    canExportExcel: false,
  },
  vice: {
    ...matrixReadOnlyPermissions.vice,
    canRead: false,
    canExportPdf: false,
    canExportExcel: false,
  },
  decano: {
    ...matrixReadOnlyPermissions.decano,
    canRead: false,
    canExportPdf: false,
    canExportExcel: false,
  },
  director: matrixReadOnlyPermissions.director,
  docente: matrixReadOnlyPermissions.docente,
};

export const rolePermissions: Record<MapeoCompetenciasRole, RolePermissions> =
  RF05_ACCESS_POLICY === "director-only" ? directorOnlyPermissions : matrixReadOnlyPermissions;

export function getAccessRestrictedDescription(role: MapeoCompetenciasRole) {
  if (RF05_ACCESS_POLICY === "director-only") {
    return "La regla visual activa permite que solo Jefatura de programa visualice RF05 — Mapeo de Competencias.";
  }

  return "Tu rol no tiene permisos de lectura para RF05 — Mapeo de Competencias.";
}

export function canManageMapeo(
  role: MapeoCompetenciasRole,
  programaEstado?: ProgramaEstado,
) {
  return role === "director" && programaEstado === "activo";
}

export function canCreateAcademicMapeo(
  role: MapeoCompetenciasRole,
  programaEstado?: ProgramaEstado,
) {
  return rolePermissions[role].canCreate && canManageMapeo(role, programaEstado);
}

export function canUpdateAcademicMapeo(
  role: MapeoCompetenciasRole,
  programaEstado?: ProgramaEstado,
) {
  return rolePermissions[role].canUpdate && canManageMapeo(role, programaEstado);
}

export function canDeleteMapeo(role: MapeoCompetenciasRole) {
  return rolePermissions[role].canDelete;
}

export function getManageDisabledReason(
  role: MapeoCompetenciasRole,
  programaEstado?: ProgramaEstado,
) {
  if (role !== "director") {
    return "La clasificación de núcleos y el mapeo I-R-A-NA son responsabilidad de Jefatura de programa.";
  }

  if (programaEstado !== "activo") {
    return "Este programa académico está inactivo. Solo puedes visualizar la información.";
  }

  return "";
}
