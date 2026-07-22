import type {
  PropositoEnriched,
  PropositoFormacionRole,
  RolePermissions,
} from "./proposito-formacion.types";

export const roleLabels: Record<PropositoFormacionRole, string> = {
  admin: "Admin (Empresa)",
  vice: "Vicerrectoría (Seccional)",
  decano: "Decanatura",
  direccionPrograma: "Dirección de programa",
  docente: "Docencia",
};

// Decisión funcional aplicada: solo la Dirección de programa define contenido académico.
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
  direccionPrograma: {
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
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canExportPdf: false,
    canExportExcel: false,
    canFilterBySeccional: false,
    canFilterByFacultad: false,
    canFilterByPrograma: false,
    canFilterByPlan: false,
    canFilterByEstado: false,
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
    return "La edición no está disponible.";
  }

  if (proposito.estado !== "activo") {
    return "Solo se permite editar propósitos asociados a programas activos.";
  }

  return "";
}