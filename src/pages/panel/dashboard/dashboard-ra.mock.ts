import type {
  CourseMeasurement,
  DashboardCatalogs,
  DashboardRole,
  DashboardUser,
  MeasurementCycle,
  RaResultRecord,
} from "./dashboard-ra.types";
import { getBrowserSearchParams } from "../../../shared/browser";

export const TARGET_RA_PERCENTAGE = 70;
export const DEFAULT_DASHBOARD_ROLE: DashboardRole = "admin";

export const dashboardRoleLabels: Record<DashboardRole, string> = {
  admin: "Admin / Empresa",
  vice: "Vice / Seccional",
  decano: "Decanatura",
  direccionPrograma: "Dirección de programa",
  docente: "Docencia",
};

export const dashboardUsers: Record<DashboardRole, DashboardUser> = {
  admin: { id: "user-admin", nombre: "Usuario administrador", cargo: dashboardRoleLabels.admin, role: "admin", scope: {} },
  vice: { id: "user-vice", nombre: "Usuario Vicerrectoría", cargo: dashboardRoleLabels.vice, role: "vice", scope: {} },
  decano: { id: "user-decano", nombre: "Usuario Decanatura", cargo: dashboardRoleLabels.decano, role: "decano", scope: {} },
  direccionPrograma: { id: "user-direccion-programa", nombre: "Dirección de programa", cargo: dashboardRoleLabels.direccionPrograma, role: "direccionPrograma", scope: {} },
  docente: { id: "user-docente", nombre: "Docente", cargo: dashboardRoleLabels.docente, role: "docente", scope: {} },
};

export const dashboardCatalogs: DashboardCatalogs = {
  seccionales: [],
  facultades: [],
  programas: [],
  teachers: [],
  competences: [],
  learningResults: [],
};

export const measurementCycles: MeasurementCycle[] = [];
export const courseMeasurements: CourseMeasurement[] = [];
export const raResultRecords: RaResultRecord[] = [];

export function normalizeDashboardRole(rawRole: string | null | undefined): DashboardRole {
  const normalized = String(rawRole ?? "").trim().toLowerCase();
  const aliases: Record<string, DashboardRole> = {
    admin: "admin",
    administrador: "admin",
    empresa: "admin",
    superadmin: "admin",
    vice: "vice",
    vicerrector: "vice",
    vicerrectoria: "vice",
    vicerrectoría: "vice",
    decano: "decano",
    director: "direccionPrograma",
    directorprograma: "direccionPrograma",
    director_de_programa: "direccionPrograma",
    direccionprograma: "direccionPrograma",
    direccion_de_programa: "direccionPrograma",
    docente: "docente",
    docencia: "docente",
    teacher: "docente",
  };

  return aliases[normalized] ?? DEFAULT_DASHBOARD_ROLE;
}

export function getCurrentDashboardUser(): DashboardUser {
  const params = getBrowserSearchParams();
  const role = normalizeDashboardRole(params.get("role"));
  return dashboardUsers[role];
}
