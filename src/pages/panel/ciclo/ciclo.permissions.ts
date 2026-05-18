import type {
  CicloEnriched,
  CicloRole,
  CicloRolePermissions,
  CurrentUser,
} from "./ciclo.types";

export const cicloRoleLabels: Record<CicloRole, string> = {
  admin: "Super Admin",
  vice: "Vicerrector",
  decano: "Decano",
  director: "Director de programa",
  docente: "Docente",
};

export const cicloRolePermissions: Record<CicloRole, CicloRolePermissions> = {
  admin: {
    canReadSummary: true,
    canCreateCycle: false,
    canEditCycle: false,
    canDeleteCycle: false,
    canConfirmSelection: false,
    canFilterBySeccional: true,
    canFilterByFacultad: true,
    canFilterByPrograma: true,
    canFilterByPeriodo: true,
    canFilterByEstado: true,
  },
  vice: {
    canReadSummary: true,
    canCreateCycle: false,
    canEditCycle: false,
    canDeleteCycle: false,
    canConfirmSelection: false,
    canFilterBySeccional: false,
    canFilterByFacultad: true,
    canFilterByPrograma: true,
    canFilterByPeriodo: true,
    canFilterByEstado: true,
  },
  decano: {
    canReadSummary: true,
    canCreateCycle: false,
    canEditCycle: false,
    canDeleteCycle: false,
    canConfirmSelection: false,
    canFilterBySeccional: false,
    canFilterByFacultad: false,
    canFilterByPrograma: true,
    canFilterByPeriodo: true,
    canFilterByEstado: true,
  },
  director: {
    canReadSummary: true,
    canCreateCycle: true,
    canEditCycle: true,
    canDeleteCycle: true,
    canConfirmSelection: true,
    canFilterBySeccional: false,
    canFilterByFacultad: false,
    canFilterByPrograma: true,
    canFilterByPeriodo: true,
    canFilterByEstado: true,
  },
  docente: {
    canReadSummary: true,
    canCreateCycle: false,
    canEditCycle: false,
    canDeleteCycle: false,
    canConfirmSelection: false,
    canFilterBySeccional: false,
    canFilterByFacultad: false,
    canFilterByPrograma: true,
    canFilterByPeriodo: true,
    canFilterByEstado: true,
  },
};

export function canManageCycle(user: CurrentUser, ciclo: CicloEnriched) {
  const permissions = cicloRolePermissions[user.role];

  if (!permissions.canEditCycle) return false;
  if (ciclo.estado === "finalizado") return false;

  if (user.role === "director") {
    return user.scope.programaId === ciclo.programaId && ciclo.planEstado === "activo";
  }

  return permissions.canEditCycle;
}

export function getCycleActionDisabledReason(user: CurrentUser, ciclo: CicloEnriched) {
  if (!cicloRolePermissions[user.role].canEditCycle) {
    return "Tu rol actual solo permite consultar el resumen del ciclo.";
  }

  if (ciclo.estado === "finalizado") {
    return "Los ciclos finalizados no se pueden editar ni eliminar.";
  }

  if (user.role === "director" && user.scope.programaId !== ciclo.programaId) {
    return "Solo puedes editar ciclos asociados a tu programa académico.";
  }

  if (ciclo.planEstado !== "activo") {
    return "Solo se permite editar ciclos asociados a planes de estudio activos.";
  }

  return "";
}
