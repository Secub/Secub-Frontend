import { getSelectedProgram, getSelectedProgramScope } from "../programSelection";
import { getRoleScopedProgramSelection } from "../../config/access/permissions";
import { getBrowserSearchParams } from "../../shared/browser";
import {
  DEFAULT_SECUB_ROLE,
  SECUB_ROLE_LABELS,
  normalizeSecubRole,
  type SecubRole,
} from "../../config/access/roles";

export interface CentralMockUser {
  id: string;
  nombre: string;
  email: string;
  cargo: string;
  role: SecubRole;
  seccionalId?: string;
  lugarId?: string;
  facultadId?: string;
  programaId?: string;
  academicProgramId?: string;
  planId?: string;
  scope: {
    seccionalId?: string;
    lugarId?: string;
    facultadId?: string;
    programaId?: string;
    academicProgramId?: string;
    planId?: string;
  };
}

export const DEFAULT_DEMO_ROLE: SecubRole = DEFAULT_SECUB_ROLE;

export const DEMO_DOCENTE_SECUB = {
  id: "docente-secub",
  nombre: "Docente SECUB",
  email: "",
} as const;

export const LEGACY_DEMO_DOCENTE_IDS = [] as const;

export const centralMockUsers: Record<SecubRole, CentralMockUser> = {
  administrador: {
    id: "usr-admin",
    nombre: "Usuario administrador",
    email: "",
    cargo: SECUB_ROLE_LABELS.administrador,
    role: "administrador",
    scope: {},
  },
  vicerrector: {
    id: "usr-vice",
    nombre: "Usuario Vicerrector",
    email: "",
    cargo: SECUB_ROLE_LABELS.vicerrector,
    role: "vicerrector",
    scope: {},
  },
  decano: {
    id: "usr-decano",
    nombre: "Usuario Decano",
    email: "",
    cargo: SECUB_ROLE_LABELS.decano,
    role: "decano",
    scope: {},
  },
  director: {
    id: "usr-director",
    nombre: "Usuario Director",
    email: "",
    cargo: SECUB_ROLE_LABELS.director,
    role: "director",
    scope: {},
  },
  docente: {
    id: DEMO_DOCENTE_SECUB.id,
    nombre: DEMO_DOCENTE_SECUB.nombre,
    email: "",
    cargo: SECUB_ROLE_LABELS.docente,
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


export function getCurrentMockUser(): CentralMockUser {
  const params =
    typeof window !== "undefined"
      ? getBrowserSearchParams()
      : new URLSearchParams();

  const role = normalizeSecubRole(params.get("role"));
  const fallbackUser = centralMockUsers[role];
  const selectedProgram = getSelectedProgram();
  const selectedScope = getRoleScopedProgramSelection(role, getSelectedProgramScope());
  const programRoleLabel = selectedProgram?.directorRoleLabel ?? fallbackUser.nombre;

  return {
    ...fallbackUser,
    nombre: role === "director" && selectedProgram ? programRoleLabel : fallbackUser.nombre,
    email:
      role === "director" && selectedProgram
        ? `direccion.${selectedProgram.id}@usb.edu.co`
        : fallbackUser.email,
    cargo: role === "director" && selectedProgram ? programRoleLabel : fallbackUser.cargo,
    seccionalId: selectedScope.seccionalId ?? fallbackUser.seccionalId,
    lugarId: selectedScope.lugarId ?? fallbackUser.lugarId,
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
  return user.role === "administrador";
}
