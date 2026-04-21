import type {
  PerfilEgresoEnriched,
  PerfilEgresoRole,
  RolePermissions,
} from "./perfil-egreso.types";

export const roleLabels: Record<PerfilEgresoRole, string> = {
  admin: "Admin (Empresa)",
  vice: "Vicerrector (Seccional)",
  decano: "Decano",
  director: "Director de programa",
  docente: "Docente",
};

export const rolePermissions: Record<PerfilEgresoRole, RolePermissions> = {
  admin: {
    canRead: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canExportPdf: true,
    canExportExcel: true,
    canFilterBySeccional: true,
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
    canFilterByFacultad: false,
    canFilterByPrograma: true,
    canFilterByPlan: true,
    canFilterByEstado: true,
  },
};

export function canEditPerfil(
  role: PerfilEgresoRole,
  perfil: PerfilEgresoEnriched,
) {
  return rolePermissions[role].canUpdate && perfil.estado === "activo";
}

export function getEditDisabledReason(
  role: PerfilEgresoRole,
  perfil: PerfilEgresoEnriched,
) {
  if (!rolePermissions[role].canUpdate) {
    return "Tu rol no tiene permiso para editar este perfil de egreso.";
  }

  if (perfil.estado !== "activo") {
    return "Solo se permite actualizar perfiles asociados a programas activos.";
  }

  return "";
}

export function canDeletePerfil(role: PerfilEgresoRole) {
  return rolePermissions[role].canDelete;
}
