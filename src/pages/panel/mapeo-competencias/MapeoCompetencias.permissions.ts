import type {
  MapeoCompetenciasRole,
  ProgramaEstado,
  RolePermissions,
} from "./MapeoCompetencias.types";

export const roleLabels: Record<MapeoCompetenciasRole, string> = {
  admin: "Admin (Empresa)",
  vice: "Vicerrectoría (Seccional)",
  decano: "Decanatura",
  direccionPrograma: "Dirección de programa",
  docente: "Docencia",
};

/**
 * Regla visual RF05.
 * - "matrix-readonly": Admin/Vice/Decano solo consultan; Dirección de programa gestiona y exporta.
 * - "director-only": solo Dirección de programa visualiza RF05; los demás roles ven acceso restringido.
 */
export const RF05_ACCESS_POLICY = "matrix-readonly" as "matrix-readonly" | "director-only";

const matrixReadOnlyPermissions: Record<MapeoCompetenciasRole, RolePermissions> = {
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
    canFilterByLugar: false,
    canFilterByFacultad: false,
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
  direccionPrograma: matrixReadOnlyPermissions.direccionPrograma,
  docente: {
    ...matrixReadOnlyPermissions.docente,
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canExportPdf: false,
    canExportExcel: false,
  },
};

export const rolePermissions: Record<MapeoCompetenciasRole, RolePermissions> =
  RF05_ACCESS_POLICY === "director-only" ? directorOnlyPermissions : matrixReadOnlyPermissions;

export function getAccessRestrictedDescription(_role: MapeoCompetenciasRole) {
  return "Regresa al Estado del ciclo para continuar.";
}

export function canManageMapeo(
  role: MapeoCompetenciasRole,
  programaEstado?: ProgramaEstado,
) {
  return role === "direccionPrograma" && programaEstado === "activo";
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

export function canDeleteMapeo(
  role: MapeoCompetenciasRole,
  programaEstado?: ProgramaEstado,
) {
  return rolePermissions[role].canDelete && canManageMapeo(role, programaEstado);
}

export function getManageDisabledReason(
  role: MapeoCompetenciasRole,
  programaEstado?: ProgramaEstado,
) {
  if (role !== "direccionPrograma") {
    return "";
  }

  if (programaEstado !== "activo") {
    return "Este programa académico está inactivo. Solo puedes visualizar la información.";
  }

  return "";
}