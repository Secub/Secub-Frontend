import type {
  PropositoEnriched,
  PropositoFormacionRole,
  RolePermissions,
} from "./proposito-formacion.types";

export const roleLabels: Record<PropositoFormacionRole, string> = {
  admin: "Admin (Empresa)",
  vice: "Vicerrector (Seccional)",
  decano: "Decano",
  director: "Director de programa",
  docente: "Docente",
};

// Decisión funcional aplicada: solo el Director define contenido académico.
// Admin/Vicerrectoría conservan lectura, filtros y exportación; CRUD queda bloqueado hasta confirmación de negocio.
export const rolePermissions: Record<PropositoFormacionRole, RolePermissions> = {
  admin: {
    canRead: true,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
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
    canDelete: true,
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

export function canEditProposito(
  role: PropositoFormacionRole,
  proposito: PropositoEnriched,
) {
  return rolePermissions[role].canUpdate && proposito.estado === "activo";
}

export function getEditDisabledReason(
  role: PropositoFormacionRole,
  proposito: PropositoEnriched,
) {
  if (!rolePermissions[role].canUpdate) {
    return "Tu rol no tiene permiso para editar este propósito.";
  }

  if (proposito.estado !== "activo") {
    return "Solo se permite editar propósitos asociados a programas activos.";
  }

  return "";
}