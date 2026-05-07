import type {
  MapeoCompetenciasEnriched,
  MapeoCompetenciasRole,
  RolePermissions,
} from "./MapeoCompetencias.types";

export const roleLabels: Record<MapeoCompetenciasRole, string> = {
  admin: "Admin (Empresa)",
  vice: "Vicerrector (Seccional)",
  decano: "Decano",
  director: "Director de programa",
  docente: "Docente",
};

export const rolePermissions: Record<MapeoCompetenciasRole, RolePermissions> = {
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

export function canEditMapeoCompetencias(
  role: MapeoCompetenciasRole,
  mapeo: MapeoCompetenciasEnriched,
) {
  return rolePermissions[role].canUpdate && mapeo.estado === "activo";
}

export function canDeleteMapeoCompetencias(role: MapeoCompetenciasRole) {
  return rolePermissions[role].canDelete;
}

export function getEditDisabledReason(
  role: MapeoCompetenciasRole,
  mapeo: MapeoCompetenciasEnriched,
) {
  if (!rolePermissions[role].canUpdate) {
    return "Tu rol no tiene permiso para editar este mapeo.";
  }

  if (mapeo.estado !== "activo") {
    return "Solo se permite editar mapeos activos.";
  }

  return "";
}
