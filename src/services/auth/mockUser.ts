import { getSelectedProgram, getSelectedProgramScope } from "../programSelection";

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
  direccionPrograma: "Jefatura de programa",
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
  email: "docente.cali@usb.edu.co",
} as const;

export const LEGACY_DEMO_DOCENTE_IDS = [
  "usr-docente-001",
  "usr-docente-psicologia",
  "usr-docente-derecho",
] as const;

export const centralMockUsers: Record<MockUserRole, CentralMockUser> = {
  admin: {
    id: "usr-admin-001",
    nombre: "Camila Restrepo",
    email: "admin.cali@usb.edu.co",
    cargo: "Administrador SECUB",
    role: "admin",
    seccionalId: "cali",
    scope: { seccionalId: "cali" },
  },
  vice: {
    id: "usr-vice-001",
    nombre: "Andrea Londoño",
    email: "vice.cali@usb.edu.co",
    cargo: "Vicerrectoría Académica",
    role: "vice",
    seccionalId: "cali",
    scope: { seccionalId: "cali" },
  },
  decano: {
    id: "usr-decano-001",
    nombre: "Carlos Ramírez",
    email: "decano.cali@usb.edu.co",
    cargo: "Decanatura",
    role: "decano",
    seccionalId: "cali",
    scope: { seccionalId: "cali" },
  },
  direccionPrograma: {
    id: "direccion-programa-secub",
    nombre: "Jefatura de programa",
    email: "jefatura.programa.cali@usb.edu.co",
    cargo: "Jefatura de programa",
    role: "direccionPrograma",
    seccionalId: "cali",
    scope: { seccionalId: "cali" },
  },
  docente: {
    id: DEMO_DOCENTE_SECUB.id,
    nombre: DEMO_DOCENTE_SECUB.nombre,
    email: DEMO_DOCENTE_SECUB.email,
    cargo: "Docencia",
    role: "docente",
    seccionalId: "cali",
    scope: { seccionalId: "cali" },
  },
};

export interface DemoDocenteInstitucional {
  id: string;
  nombre: string;
  email: string;
}

export const demoDocentesInstitucionales: DemoDocenteInstitucional[] = [
  DEMO_DOCENTE_SECUB,
  {
    id: "usr-docente-psicologia",
    nombre: "Docente Psicología",
    email: "docente.psicologia@usb.edu.co",
  },
  {
    id: "usr-docente-derecho",
    nombre: "Docente Derecho",
    email: "docente.derecho@usb.edu.co",
  },
  {
    id: "usr-docente-investigacion",
    nombre: "Docente Investigación",
    email: "docente.investigacion@usb.edu.co",
  },
  {
    id: "usr-docente-practica",
    nombre: "Docente Práctica",
    email: "docente.practica@usb.edu.co",
  },
];

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
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  const role = normalizeMockRole(params.get("role"));
  const fallbackUser = centralMockUsers[role];
  const selectedProgram = getSelectedProgram();
  const selectedScope = getSelectedProgramScope();
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

export function getSeccionalFromEmail(email: string) {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();

  return normalizedEmail ? "cali" : "";
}

export function canUserSelectSeccional(user: Pick<CentralMockUser, "role">) {
  return user.role === "admin";
}