import type { MockUserRole } from "./mockUser";

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

const commonModules = new Set<PanelModuleKey>([
  "dashboard",
  "settings",
  "accessibility",
]);

const academicReadModules = new Set<PanelModuleKey>([
  "perfilEgreso",
  "propositoFormacion",
  "competenciasRa",
  "mapeoCompetencias",
  "ciclo",
  "asignarRa",
]);

/**
 * Política funcional central de navegación.
 * - Admin, Vicerrectoría y Decanatura consultan y hacen seguimiento.
 * - Dirección de programa administra el flujo académico.
 * - Docencia solo usa Dashboard y Medición RA.
 */
export function canAccessPanelModule(role: MockUserRole, module: PanelModuleKey) {
  if (commonModules.has(module)) return true;
  if (module === "medicionRa") return role === "docente";
  if (module === "mapeoCompetenciasManage") return role === "direccionPrograma";
  if (academicReadModules.has(module)) return role !== "docente";
  return false;
}

export function canStartNewAcademicPlan(role: MockUserRole) {
  return role === "direccionPrograma";
}

const direccionProgramaCrudEntities = new Set<SecubEntityKey>([
  "perfilEgreso",
  "propositosFormacion",
  "competenciasRa",
  "mapeosCompetencias",
  "ciclosMedicion",
  "asignacionesRa",
  "planesMejora",
]);

/**
 * Autorización defensiva para la persistencia simulada.
 * Esta misma política debe replicarse en el backend real; el frontend nunca
 * debe considerarse la única barrera de seguridad.
 */
export function canWriteSecubEntity(
  role: MockUserRole | string | null | undefined,
  entityKey: SecubEntityKey,
  action: SecubWriteAction,
) {
  if (role === "direccionPrograma") {
    if (direccionProgramaCrudEntities.has(entityKey)) return true;

    // Al retirar una asignación, Dirección puede limpiar mediciones que hayan
    // quedado asociadas. No puede crear ni editar mediciones docentes.
    return entityKey === "medicionesRa" && action === "delete";
  }

  if (role === "docente") {
    return entityKey === "medicionesRa" && action !== "delete";
  }

  return false;
}

export function getWriteAccessDeniedMessage(entityKey: SecubEntityKey) {
  if (entityKey === "medicionesRa") {
    return "La operación solicitada no está disponible.";
  }

  return "La operación solicitada no está disponible.";
}

export interface ProgramSelectionScope {
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
  academicProgramId?: string;
  planId?: string;
}

/**
 * Reduce el alcance del programa seleccionado según la jerarquía institucional.
 * Evita que un rol superior quede limitado accidentalmente a un programa.
 */
export function getRoleScopedProgramSelection(
  role: MockUserRole,
  selectedScope: ProgramSelectionScope,
): ProgramSelectionScope {
  switch (role) {
    case "admin":
      return {};
    case "vice":
      return {
        seccionalId: selectedScope.seccionalId,
      };
    case "decano":
      return {
        seccionalId: selectedScope.seccionalId,
        facultadId: selectedScope.facultadId,
      };
    case "direccionPrograma":
    case "docente":
      return selectedScope;
    default:
      return {};
  }
}
