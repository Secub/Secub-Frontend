import { SECUB_ROLE_ORDER, normalizeSecubRole, type SecubRole } from "./roles";

export type FilterPolicyModule =
  | "perfilEgreso"
  | "propositoFormacion"
  | "competenciasRa"
  | "mapeoCompetencias"
  | "ciclo"
  | "asignarRa"
  | "dashboard";

export interface SecubFilterPermissions {
  canFilterBySeccional: boolean;
  canFilterByLugar: boolean;
  canFilterByFacultad: boolean;
  canFilterByPrograma: boolean;
  canFilterByPlan: boolean;
  canFilterByPeriodo: boolean;
  canFilterByEstado: boolean;
}

const noFilters: SecubFilterPermissions = {
  canFilterBySeccional: false,
  canFilterByLugar: false,
  canFilterByFacultad: false,
  canFilterByPrograma: false,
  canFilterByPlan: false,
  canFilterByPeriodo: false,
  canFilterByEstado: false,
};

/**
 * Fuente única de verdad para filtros por módulo y rol.
 * Esta política controla UX/alcance visual; la autorización real debe validarse
 * también en backend cuando se conecte la API.
 */
export const FILTER_POLICY: Record<
  FilterPolicyModule,
  Record<SecubRole, SecubFilterPermissions>
> = {
  perfilEgreso: {
    administrador: { ...noFilters, canFilterBySeccional: true, canFilterByFacultad: true, canFilterByPrograma: true, canFilterByPlan: true, canFilterByEstado: true },
    vicerrector: { ...noFilters, canFilterByFacultad: true, canFilterByPrograma: true, canFilterByPlan: true, canFilterByEstado: true },
    decano: { ...noFilters, canFilterByPrograma: true, canFilterByPlan: true, canFilterByEstado: true },
    director: { ...noFilters, canFilterByPrograma: true, canFilterByPlan: true, canFilterByEstado: true },
    docente: { ...noFilters, canFilterByPrograma: true },
  },
  propositoFormacion: {
    administrador: { ...noFilters, canFilterBySeccional: true, canFilterByFacultad: true, canFilterByPrograma: true, canFilterByPlan: true, canFilterByEstado: true },
    vicerrector: { ...noFilters, canFilterByFacultad: true, canFilterByPrograma: true, canFilterByPlan: true, canFilterByEstado: true },
    decano: { ...noFilters, canFilterByPrograma: true, canFilterByPlan: true, canFilterByEstado: true },
    director: { ...noFilters, canFilterByPrograma: true, canFilterByPlan: true, canFilterByEstado: true },
    docente: { ...noFilters, canFilterByPrograma: true },
  },
  competenciasRa: {
    administrador: { ...noFilters, canFilterBySeccional: true, canFilterByLugar: true, canFilterByFacultad: true, canFilterByPrograma: true, canFilterByPlan: true, canFilterByEstado: true },
    vicerrector: { ...noFilters, canFilterByLugar: true, canFilterByFacultad: true, canFilterByPrograma: true, canFilterByPlan: true, canFilterByEstado: true },
    decano: { ...noFilters, canFilterByPrograma: true, canFilterByPlan: true, canFilterByEstado: true },
    director: { ...noFilters, canFilterByLugar: true, canFilterByPrograma: true, canFilterByPlan: true, canFilterByEstado: true },
    docente: { ...noFilters, canFilterByPrograma: true },
  },
  mapeoCompetencias: {
    administrador: { ...noFilters, canFilterBySeccional: true, canFilterByLugar: true, canFilterByPrograma: true, canFilterByPlan: true, canFilterByEstado: true },
    vicerrector: { ...noFilters, canFilterByLugar: true, canFilterByFacultad: true, canFilterByPrograma: true, canFilterByPlan: true, canFilterByEstado: true },
    decano: { ...noFilters, canFilterByPrograma: true, canFilterByPlan: true, canFilterByEstado: true },
    director: { ...noFilters, canFilterByPrograma: true, canFilterByPlan: true, canFilterByEstado: true },
    docente: { ...noFilters, canFilterByPrograma: true },
  },
  ciclo: {
    administrador: { ...noFilters, canFilterBySeccional: true, canFilterByFacultad: true, canFilterByPrograma: true, canFilterByPeriodo: true, canFilterByEstado: true },
    vicerrector: { ...noFilters, canFilterByFacultad: true, canFilterByPrograma: true, canFilterByPeriodo: true, canFilterByEstado: true },
    decano: { ...noFilters, canFilterByPrograma: true, canFilterByPeriodo: true, canFilterByEstado: true },
    director: { ...noFilters, canFilterByPrograma: true, canFilterByPeriodo: true, canFilterByEstado: true },
    docente: { ...noFilters },
  },
  asignarRa: {
    administrador: { ...noFilters, canFilterBySeccional: true, canFilterByFacultad: true },
    vicerrector: { ...noFilters, canFilterByFacultad: true },
    decano: { ...noFilters },
    director: { ...noFilters },
    docente: { ...noFilters },
  },
  dashboard: {
    administrador: { ...noFilters, canFilterBySeccional: true, canFilterByFacultad: true, canFilterByPrograma: true, canFilterByPlan: true, canFilterByEstado: true },
    vicerrector: { ...noFilters, canFilterByFacultad: true, canFilterByPrograma: true, canFilterByPlan: true, canFilterByEstado: true },
    decano: { ...noFilters, canFilterByFacultad: true, canFilterByPrograma: true, canFilterByPlan: true, canFilterByEstado: true },
    director: { ...noFilters, canFilterByPrograma: true, canFilterByPlan: true, canFilterByEstado: true },
    docente: { ...noFilters, canFilterByPrograma: true, canFilterByPlan: true, canFilterByEstado: true },
  },
};

export function getFilterPermissions(module: FilterPolicyModule, role: SecubRole) {
  return FILTER_POLICY[module][role];
}

export type AcademicPermissionModule =
  | "perfilEgreso"
  | "propositoFormacion"
  | "competenciasRa"
  | "mapeoCompetencias";

export interface AcademicActionPermissions {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExportPdf: boolean;
  canExportExcel: boolean;
}

export type AcademicModulePermissions = AcademicActionPermissions & SecubFilterPermissions;

const readOnlyAcademicActions: AcademicActionPermissions = {
  canRead: true,
  canCreate: false,
  canUpdate: false,
  canDelete: false,
  canExportPdf: false,
  canExportExcel: false,
};

const directorAcademicActions: AcademicActionPermissions = {
  canRead: true,
  canCreate: true,
  canUpdate: true,
  canDelete: true,
  canExportPdf: true,
  canExportExcel: true,
};

const noAcademicAccess: AcademicActionPermissions = {
  canRead: false,
  canCreate: false,
  canUpdate: false,
  canDelete: false,
  canExportPdf: false,
  canExportExcel: false,
};

const ACADEMIC_ACTION_POLICY: Record<
  AcademicPermissionModule,
  Record<SecubRole, AcademicActionPermissions>
> = {
  perfilEgreso: {
    administrador: readOnlyAcademicActions,
    vicerrector: readOnlyAcademicActions,
    decano: readOnlyAcademicActions,
    director: directorAcademicActions,
    docente: readOnlyAcademicActions,
  },
  propositoFormacion: {
    administrador: readOnlyAcademicActions,
    vicerrector: readOnlyAcademicActions,
    decano: readOnlyAcademicActions,
    director: directorAcademicActions,
    docente: readOnlyAcademicActions,
  },
  competenciasRa: {
    administrador: readOnlyAcademicActions,
    vicerrector: readOnlyAcademicActions,
    decano: readOnlyAcademicActions,
    director: directorAcademicActions,
    docente: readOnlyAcademicActions,
  },
  mapeoCompetencias: {
    administrador: readOnlyAcademicActions,
    vicerrector: readOnlyAcademicActions,
    decano: readOnlyAcademicActions,
    director: directorAcademicActions,
    docente: noAcademicAccess,
  },
};

/** RF05: lectura matricial para roles académicos, gestión solo para Dirección. */
export const MAPEO_ACCESS_POLICY = "matrix-readonly" as const;

export function getAcademicModulePermissions(
  module: AcademicPermissionModule,
  role: SecubRole,
): AcademicModulePermissions {
  return {
    ...ACADEMIC_ACTION_POLICY[module][role],
    ...getFilterPermissions(module, role),
  };
}

export function getAcademicPermissionMatrix(
  module: AcademicPermissionModule,
): Record<SecubRole, AcademicModulePermissions> {
  return Object.fromEntries(
    SECUB_ROLE_ORDER.map((role) => [role, getAcademicModulePermissions(module, role)]),
  ) as Record<SecubRole, AcademicModulePermissions>;
}

export function canEditAcademicRecord(
  module: AcademicPermissionModule,
  role: SecubRole,
  estado: "activo" | "inactivo",
) {
  return getAcademicModulePermissions(module, role).canUpdate && estado === "activo";
}

export function getAcademicEditDisabledReason(
  module: AcademicPermissionModule,
  role: SecubRole,
  estado: "activo" | "inactivo",
  inactiveMessage: string,
) {
  if (!getAcademicModulePermissions(module, role).canUpdate) {
    return "La edición no está disponible.";
  }
  return estado === "activo" ? "" : inactiveMessage;
}

export function canManageMapeo(role: SecubRole, programaEstado?: "activo" | "inactivo") {
  return role === "director" && programaEstado === "activo";
}

export function getMapeoAccessRestrictedDescription() {
  return "Regresa al Estado del ciclo para continuar.";
}

export function getMapeoManageDisabledReason(
  role: SecubRole,
  programaEstado?: "activo" | "inactivo",
) {
  if (role !== "director") return "";
  return programaEstado === "activo"
    ? ""
    : "Este programa académico está inactivo. Solo puedes visualizar la información.";
}

export interface CyclePermissions {
  canReadSummary: boolean;
  canCreateCycle: boolean;
  canEditCycle: boolean;
  canDeleteCycle: boolean;
  canDuplicateCycle: boolean;
  canConfirmSelection: boolean;
  canFilterBySeccional: boolean;
  canFilterByFacultad: boolean;
  canFilterByPrograma: boolean;
  canFilterByPeriodo: boolean;
  canFilterByEstado: boolean;
}

const CYCLE_ACTION_POLICY: Record<
  SecubRole,
  Omit<CyclePermissions, "canFilterBySeccional" | "canFilterByFacultad" | "canFilterByPrograma" | "canFilterByPeriodo" | "canFilterByEstado">
> = {
  administrador: { canReadSummary: true, canCreateCycle: false, canEditCycle: false, canDeleteCycle: false, canDuplicateCycle: false, canConfirmSelection: false },
  vicerrector: { canReadSummary: true, canCreateCycle: false, canEditCycle: false, canDeleteCycle: false, canDuplicateCycle: false, canConfirmSelection: false },
  decano: { canReadSummary: true, canCreateCycle: false, canEditCycle: false, canDeleteCycle: false, canDuplicateCycle: false, canConfirmSelection: false },
  director: { canReadSummary: true, canCreateCycle: true, canEditCycle: true, canDeleteCycle: true, canDuplicateCycle: true, canConfirmSelection: true },
  docente: { canReadSummary: false, canCreateCycle: false, canEditCycle: false, canDeleteCycle: false, canDuplicateCycle: false, canConfirmSelection: false },
};

export function getCyclePermissions(role: SecubRole): CyclePermissions {
  const filters = FILTER_POLICY.ciclo[role];
  return {
    ...CYCLE_ACTION_POLICY[role],
    canFilterBySeccional: filters.canFilterBySeccional,
    canFilterByFacultad: filters.canFilterByFacultad,
    canFilterByPrograma: filters.canFilterByPrograma,
    canFilterByPeriodo: filters.canFilterByPeriodo,
    canFilterByEstado: filters.canFilterByEstado,
  };
}

export interface CycleAccessUser {
  role: SecubRole;
  scope: { programaId?: string };
}

export interface CycleAccessRecord {
  programaId: string;
  estado: "borrador" | "activo" | "finalizado" | "pendiente";
  planEstado: "activo" | "inactivo";
}

export function canManageCycle(user: CycleAccessUser, ciclo: CycleAccessRecord) {
  const permissions = getCyclePermissions(user.role);
  if (!permissions.canEditCycle || ciclo.estado === "finalizado") return false;
  if (user.role === "director") {
    return user.scope.programaId === ciclo.programaId && ciclo.planEstado === "activo";
  }
  return permissions.canEditCycle;
}

export function getCycleActionDisabledReason(user: CycleAccessUser, ciclo: CycleAccessRecord) {
  if (!getCyclePermissions(user.role).canEditCycle) return "La edición no está disponible.";
  if (ciclo.estado === "finalizado") return "Los ciclos finalizados no se pueden editar ni eliminar.";
  if (user.role === "director" && user.scope.programaId !== ciclo.programaId) return "Este ciclo pertenece a otro programa académico.";
  if (ciclo.planEstado !== "activo") return "Solo se permite editar ciclos asociados a planes de estudio activos.";
  return "";
}

export function canDuplicateCycle(user: CycleAccessUser, ciclo: CycleAccessRecord) {
  const permissions = getCyclePermissions(user.role);
  if (!permissions.canDuplicateCycle || ciclo.estado !== "finalizado") return false;
  return user.role !== "director" || user.scope.programaId === ciclo.programaId;
}

export function getDuplicateCycleDisabledReason(user: CycleAccessUser, ciclo: CycleAccessRecord) {
  if (!getCyclePermissions(user.role).canDuplicateCycle) return "La duplicación no está disponible.";
  if (ciclo.estado !== "finalizado") return "Solo se pueden duplicar ciclos que están finalizados.";
  if (user.role === "director" && user.scope.programaId !== ciclo.programaId) return "Este ciclo pertenece a otro programa académico.";
  return "";
}

export interface AsignarRaPermissions {
  canRead: boolean;
  canManage: boolean;
  canDelete: boolean;
  canFilterBySeccional: boolean;
  canFilterByFacultad: boolean;
}

export function getAsignarRaPermissions(role: SecubRole): AsignarRaPermissions {
  const filters = FILTER_POLICY.asignarRa[role];
  const canManage = role === "director";
  return {
    canRead: role !== "docente",
    canManage,
    canDelete: canManage,
    canFilterBySeccional: filters.canFilterBySeccional,
    canFilterByFacultad: filters.canFilterByFacultad,
  };
}

export type PanelModuleKey =
  | "dashboard"
  | "settings"
  | "accessibility"
  | "perfilEgreso"
  | "propositoFormacion"
  | "competenciasRa"
  | "mapeoCompetencias"
  | "mapeoCompetenciasManage"
  | "ciclo"
  | "asignarRa"
  | "medicionRa";

const ALL_ROLES = SECUB_ROLE_ORDER;
const NON_DOCENTE_ROLES: readonly SecubRole[] = SECUB_ROLE_ORDER.filter((role) => role !== "docente");

export const PANEL_MODULE_ACCESS: Record<PanelModuleKey, readonly SecubRole[]> = {
  dashboard: ALL_ROLES,
  settings: ALL_ROLES,
  accessibility: ALL_ROLES,
  perfilEgreso: ALL_ROLES,
  propositoFormacion: ALL_ROLES,
  competenciasRa: ALL_ROLES,
  mapeoCompetencias: NON_DOCENTE_ROLES,
  mapeoCompetenciasManage: ["director"],
  ciclo: NON_DOCENTE_ROLES,
  asignarRa: NON_DOCENTE_ROLES,
  medicionRa: ["docente"],
};

/**
 * El Docente consulta los módulos académicos como biblioteca de referencia,
 * por fuera del bloqueo secuencial del flujo de edición. Los demás roles
 * conservan la lógica actual del workflow.
 */
export function shouldEnforceAcademicWorkflowLock(role: SecubRole) {
  return role !== "docente";
}

export function canAccessModule(role: SecubRole, module: PanelModuleKey) {
  return PANEL_MODULE_ACCESS[module].includes(role);
}

export type SecubEntityKey =
  | "perfilEgreso"
  | "propositosFormacion"
  | "competenciasRa"
  | "mapeosCompetencias"
  | "ciclosMedicion"
  | "asignacionesRa"
  | "medicionesRa"
  | "planesMejora";

export type SecubWriteAction = "create" | "update" | "upsert" | "delete";

const DIRECTOR_CRUD_ENTITIES = new Set<SecubEntityKey>([
  "perfilEgreso",
  "propositosFormacion",
  "competenciasRa",
  "mapeosCompetencias",
  "ciclosMedicion",
  "asignacionesRa",
  "planesMejora",
]);

export function canWriteEntity(
  rawRole: string | null | undefined,
  entityKey: SecubEntityKey,
  action: SecubWriteAction,
) {
  const role = normalizeSecubRole(rawRole);
  if (role === "director") {
    if (DIRECTOR_CRUD_ENTITIES.has(entityKey)) return true;
    return entityKey === "medicionesRa" && action === "delete";
  }
  if (role === "docente") {
    return entityKey === "medicionesRa" && action !== "delete";
  }
  return false;
}

export function canStartAcademicPlan(role: SecubRole) {
  return role === "director";
}

export function getWriteAccessDeniedMessage(_entityKey: SecubEntityKey) {
  return "La operación solicitada no está disponible.";
}

export interface ProgramSelectionScope {
  seccionalId?: string;
  lugarId?: string;
  facultadId?: string;
  programaId?: string;
  academicProgramId?: string;
  planId?: string;
}

/**
 * Reduce el alcance del programa seleccionado según la jerarquía institucional.
 * El backend podrá reemplazar el origen del scope sin cambiar los consumidores.
 */
export function getRoleScopedProgramSelection(
  role: SecubRole,
  selectedScope: ProgramSelectionScope,
): ProgramSelectionScope {
  switch (role) {
    case "administrador":
      return {};
    case "vicerrector":
      return { seccionalId: selectedScope.seccionalId };
    case "decano":
      return {
        seccionalId: selectedScope.seccionalId,
        facultadId: selectedScope.facultadId,
      };
    case "director":
    case "docente":
      return selectedScope;
  }
}
