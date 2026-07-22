import { getSelectedProgram, getSelectedProgramScope } from "../programSelection";
import { getRoleScopedProgramSelection } from "./roleAccess";
import { getBrowserSearchParams } from "../../shared/browser";

export type MockUserRole = "admin" | "vice" | "decano" | "direccionPrograma" | "docente";

export interface CentralMockUser {
  id: string;
  nombre: string;
  email: string;
  cargo: string;
  role: MockUserRole;
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
  academicProgramId?: string;
  planId?: string;
  scope: {
    seccionalId?: string;
    facultadId?: string;
    programaId?: string;
    academicProgramId?: string;
    planId?: string;
  };
}

export const DEFAULT_DEMO_ROLE: MockUserRole = "admin";

const neutralRoleLabels: Record<MockUserRole, string> = {
  admin: "Administrador SECUB",
  vice: "Vicerrectoría",
  decano: "Decanatura",
  direccionPrograma: "Dirección de programa",
  docente: "Docencia",
};

export function getNeutralRoleLabel(role: MockUserRole) {
  return neutralRoleLabels[role];
}

export function getNeutralUserCargo(user: Pick<CentralMockUser, "role" | "cargo">) {
  return neutralRoleLabels[user.role] ?? user.cargo;
}

export const DEMO_DOCENTE_SECUB = {
  id: "docente-secub",
  nombre: "Docente SECUB",
  email: "",
} as const;

export const LEGACY_DEMO_DOCENTE_IDS = [] as const;

export const centralMockUsers: Record<MockUserRole, CentralMockUser> = {
  admin: {
    id: "usr-admin",
    nombre: "Usuario administrador",
    email: "",
    cargo: "Administrador SECUB",
    role: "admin",
    scope: {},
  },
  vice: {
    id: "usr-vice",
    nombre: "Usuario Vicerrectoría",
    email: "",
    cargo: "Vicerrectoría",
    role: "vice",
    scope: {},
  },
  decano: {
    id: "usr-decano",
    nombre: "Usuario Decanatura",
    email: "",
    cargo: "Decanatura",
    role: "decano",
    scope: {},
  },
  direccionPrograma: {
    id: "usr-direccion-programa",
    nombre: "Dirección de programa",
    email: "",
    cargo: "Dirección de programa",
    role: "direccionPrograma",
    scope: {},
  },
  docente: {
    id: DEMO_DOCENTE_SECUB.id,
    nombre: DEMO_DOCENTE_SECUB.nombre,
    email: "",
    cargo: "Docencia",
    role: "docente",
    scope: {},
  },
};

export interface DemoDocenteInstitucional {
  id: string;
  nombre: string;
  email: string;
}

export const demoDocentesInstitucionales: DemoDocenteInstitucional[] = [DEMO_DOCENTE_SECUB];

export function normalizeDemoDocenteName(value?: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function resolveDemoDocenteByName(nombre?: string) {
  const normalizedName = normalizeDemoDocenteName(nombre);

  if (!normalizedName) return undefined;

  return demoDocentesInstitucionales.find(
    (docente) => normalizeDemoDocenteName(docente.nombre) === normalizedName,
  );
}

export function buildDemoDocenteIdFromName(nombre?: string) {
  const normalizedName = normalizeDemoDocenteName(nombre).replace(/\s+/g, "-");

  return normalizedName ? `usr-docente-${normalizedName}` : "usr-docente-sin-asignar";
}

export function normalizeMockRole(rawRole: string | null | undefined): MockUserRole {
  const normalizedRole = String(rawRole ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const compactRole = normalizedRole.replace(/[^a-z0-9]+/g, "");

  const aliases: Record<string, MockUserRole> = {
    admin: "admin",
    administrador: "admin",
    superadmin: "admin",

    vice: "vice",
    vicerrector: "vice",
    vicerrectoria: "vice",

    decano: "decano",

    director: "direccionPrograma",
    directorprograma: "direccionPrograma",
    direccion: "direccionPrograma",
    direccionprograma: "direccionPrograma",
    jefatura: "direccionPrograma",
    jefaturaprograma: "direccionPrograma",

    docente: "docente",
    docencia: "docente",
    teacher: "docente",
  };

  return aliases[normalizedRole] ?? aliases[compactRole] ?? DEFAULT_DEMO_ROLE;
}

export function getCurrentMockUser(): CentralMockUser {
  const params =
    typeof window !== "undefined"
      ? getBrowserSearchParams()
      : new URLSearchParams();

  const role = normalizeMockRole(params.get("role"));
  const fallbackUser = centralMockUsers[role];
  const selectedProgram = getSelectedProgram();
  const selectedScope = getRoleScopedProgramSelection(role, getSelectedProgramScope());
  const programRoleLabel = selectedProgram?.directorRoleLabel ?? fallbackUser.nombre;

  return {
    ...fallbackUser,
    nombre: role === "direccionPrograma" && selectedProgram ? programRoleLabel : fallbackUser.nombre,
    email:
      role === "direccionPrograma" && selectedProgram
        ? `jefatura.${selectedProgram.id}@usb.edu.co`
        : fallbackUser.email,
    cargo: role === "direccionPrograma" && selectedProgram ? programRoleLabel : fallbackUser.cargo,
    seccionalId: selectedScope.seccionalId ?? fallbackUser.seccionalId,
    facultadId: selectedScope.facultadId ?? fallbackUser.facultadId,
    programaId: selectedScope.programaId ?? fallbackUser.programaId,
    academicProgramId: selectedScope.academicProgramId ?? fallbackUser.academicProgramId,
    planId: selectedScope.planId ?? fallbackUser.planId,
    scope: {
      ...fallbackUser.scope,
      ...selectedScope,
    },
  };
}

export function getSeccionalFromUser(user: Pick<CentralMockUser, "seccionalId" | "scope" | "email">) {
  return user.seccionalId ?? user.scope?.seccionalId ?? getSeccionalFromEmail(user.email);
}

export function getSeccionalFromEmail(_email: string) {
  return "";
}

export function canUserSelectSeccional(user: Pick<CentralMockUser, "role">) {
  return user.role === "admin";
}