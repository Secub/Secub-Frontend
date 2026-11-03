import { SECUB_SECTIONS } from "../../../services/sectionSelection";

export type SectionStatus = "activa" | "inactiva";
export type ManagedRole = "decano" | "vicerrector";

export interface SeccionalRecord {
  id: string;
  name: string;
  status: SectionStatus;
  administrator: string;
  createdAt: string;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  roles: ManagedRole[];
  seccionalId: string;
  status: "activo" | "inactivo";
  enabled: boolean;
  facultadId: string;
  programaId: string;
}

export interface CycleSettings {
  durationYears: number;
  minimumCompliance: number;
  minimumRaPerCompetence: number;
  maximumRaPerCompetence: number;
}

export interface SeccionalesWorkspace {
  users: ManagedUser[];
  cycleSettings: Record<string, CycleSettings>;
}

export const SECCIONAL_RECORDS: SeccionalRecord[] = SECUB_SECTIONS.map((section) => ({
  id: section.id,
  name: section.label,
  status: section.id === "medellin" ? "inactiva" : "activa",
  administrator: "Sin asignar",
  createdAt: "Sin registro",
}));

const STORAGE_KEY = "secub:super-admin:seccionales:v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isManagedUser(value: unknown): value is ManagedUser {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    Array.isArray(value.roles) &&
    value.roles.length > 0 &&
    value.roles.every((role) => role === "decano" || role === "vicerrector") &&
    typeof value.seccionalId === "string" &&
    (value.status === "activo" || value.status === "inactivo") &&
    typeof value.enabled === "boolean" &&
    typeof value.facultadId === "string" &&
    typeof value.programaId === "string"
  );
}

function isCycleSettings(value: unknown): value is CycleSettings {
  return (
    isRecord(value) &&
    typeof value.durationYears === "number" &&
    Number.isFinite(value.durationYears) &&
    typeof value.minimumCompliance === "number" &&
    Number.isFinite(value.minimumCompliance) &&
    typeof value.minimumRaPerCompetence === "number" &&
    Number.isFinite(value.minimumRaPerCompetence) &&
    typeof value.maximumRaPerCompetence === "number" &&
    Number.isFinite(value.maximumRaPerCompetence)
  );
}

export function getCycleSettingsKey(
  seccionalId: string,
  facultadId: string,
  programaId: string,
) {
  return [seccionalId, facultadId || "todas", programaId || "todos"].join(":");
}

export function readSeccionalesWorkspace(): SeccionalesWorkspace {
  const rawData = window.localStorage.getItem(STORAGE_KEY);
  if (!rawData) return { users: [], cycleSettings: {} };

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawData);
  } catch (error) {
    throw new Error("No se pudieron leer los datos locales de seccionales.", { cause: error });
  }

  if (!isRecord(parsed) || !Array.isArray(parsed.users) || !isRecord(parsed.cycleSettings)) {
    throw new Error("Los datos locales de seccionales tienen un formato inválido.");
  }

  const users = parsed.users;
  if (!users.every(isManagedUser)) {
    throw new Error("La lista local de usuarios de seccionales tiene un formato inválido.");
  }
  const cycleSettings: Record<string, CycleSettings> = {};
  for (const [key, value] of Object.entries(parsed.cycleSettings)) {
    if (!isCycleSettings(value)) {
      throw new Error("La configuración local de ciclos tiene un formato inválido.");
    }
    cycleSettings[key] = value;
  }

  return { users, cycleSettings };
}

export function writeSeccionalesWorkspace(workspace: SeccionalesWorkspace) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}

export function filterManagedUsers(
  users: ManagedUser[],
  filters: { seccionalId: string; facultadId: string; programaId: string; role: string },
) {
  return users.filter((user) => {
    if (user.seccionalId !== filters.seccionalId) return false;
    if (filters.facultadId && user.facultadId !== filters.facultadId) return false;
    if (filters.programaId && user.programaId !== filters.programaId) return false;
    if (
      filters.role &&
      (filters.role !== "decano" && filters.role !== "vicerrector" ||
        !user.roles.includes(filters.role))
    ) return false;
    return true;
  });
}
