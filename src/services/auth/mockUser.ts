export type MockUserRole = "admin" | "vice" | "decano" | "director" | "docente";

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
  admin: "Administración",
  vice: "Vicerrectoría",
  decano: "Decanatura",
  director: "Dirección de programa",
  docente: "Docencia",
};

export function getNeutralRoleLabel(role: MockUserRole) {
  return neutralRoleLabels[role];
}

export function getNeutralUserCargo(user: Pick<CentralMockUser, "role" | "cargo">) {
  return neutralRoleLabels[user.role] ?? user.cargo;
}

export const centralMockUsers: Record<MockUserRole, CentralMockUser> = {
  admin: {
    id: "usr-admin-001",
    nombre: "Camila Restrepo",
    email: "admin.demo@usb.edu.co",
    cargo: "Administración",
    role: "admin",
    scope: {},
  },
  vice: {
    id: "usr-vice-001",
    nombre: "Andrea Londoño",
    email: "vice.bogota@usb.edu.co",
    cargo: "Vicerrectoría Académica",
    role: "vice",
    seccionalId: "bogota",
    scope: { seccionalId: "bogota" },
  },
  decano: {
    id: "usr-decano-001",
    nombre: "Carlos Ramírez",
    email: "decano.ingenieria.bogota@usb.edu.co",
    cargo: "Decanatura",
    role: "decano",
    seccionalId: "bogota",
    facultadId: "ing-bog",
    scope: { seccionalId: "bogota", facultadId: "ing-bog" },
  },
  director: {
    id: "usr-director-001",
    nombre: "Laura Gómez",
    email: "directora.sistemas.bogota@usb.edu.co",
    cargo: "Dirección de programa",
    role: "director",
    seccionalId: "bogota",
    facultadId: "ing-bog",
    programaId: "sis-bog",
    academicProgramId: "sis-bog",
    planId: "sis-bog-2024-2",
    scope: {
      seccionalId: "bogota",
      facultadId: "ing-bog",
      programaId: "sis-bog",
      academicProgramId: "sis-bog",
      planId: "sis-bog-2024-2",
    },
  },
  docente: {
    id: "usr-docente-001",
    nombre: "Antonio Rodríguez",
    email: "antonio.rodriguez@usb.edu.co",
    cargo: "Docencia",
    role: "docente",
    seccionalId: "bogota",
    facultadId: "ing-bog",
    programaId: "sis-bog",
    academicProgramId: "sis-bog",
    planId: "sis-bog-2024-2",
    scope: {
      seccionalId: "bogota",
      facultadId: "ing-bog",
      programaId: "sis-bog",
      academicProgramId: "sis-bog",
      planId: "sis-bog-2024-2",
    },
  },
};

export interface DemoDocenteInstitucional {
  id: string;
  nombre: string;
  email: string;
}

export const demoDocentesInstitucionales: DemoDocenteInstitucional[] = [
  { id: "usr-docente-001", nombre: "Antonio Rodríguez", email: "antonio.rodriguez@usb.edu.co" },
  { id: "usr-docente-nelly", nombre: "Nelly Torres", email: "nelly.torres@usb.edu.co" },
  { id: "usr-docente-camilo", nombre: "Camilo Castro", email: "camilo.castro@usb.edu.co" },
  { id: "usr-docente-juliana", nombre: "Juliana Mejía", email: "juliana.mejia@usb.edu.co" },
  { id: "usr-docente-santiago-fonseca", nombre: "Santiago Fonseca", email: "santiago.fonseca@usb.edu.co" },
  { id: "usr-docente-laura", nombre: "Laura Ramírez", email: "laura.ramirez@usb.edu.co" },
  { id: "usr-docente-marcela", nombre: "Marcela Ruiz", email: "marcela.ruiz@usb.edu.co" },
  { id: "usr-docente-paula", nombre: "Paula Ríos", email: "paula.rios@usb.edu.co" },
  { id: "usr-docente-diana", nombre: "Diana Cardona", email: "diana.cardona@usb.edu.co" },
  { id: "usr-docente-hernando", nombre: "Hernando Díaz", email: "hernando.diaz@usb.edu.co" },
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
  const normalized = String(rawRole ?? "").trim().toLowerCase();
  const aliases: Record<string, MockUserRole> = {
    admin: "admin",
    administrador: "admin",
    "super-admin": "admin",
    superadmin: "admin",
    vice: "vice",
    vicerrector: "vice",
    vicerrectoria: "vice",
    vicerrectoría: "vice",
    decano: "decano",
    director: "director",
    directorprograma: "director",
    director_de_programa: "director",
    docente: "docente",
    teacher: "docente",
  };

  return aliases[normalized] ?? DEFAULT_DEMO_ROLE;
}

export function getCurrentMockUser(): CentralMockUser {
  if (typeof window === "undefined") return centralMockUsers[DEFAULT_DEMO_ROLE];

  const params = new URLSearchParams(window.location.search);
  const role = normalizeMockRole(params.get("role"));
  return centralMockUsers[role];
}

export function getSeccionalFromUser(user: Pick<CentralMockUser, "seccionalId" | "scope" | "email">) {
  return user.seccionalId ?? user.scope?.seccionalId ?? getSeccionalFromEmail(user.email);
}

export function getSeccionalFromEmail(email: string) {
  const normalizedEmail = String(email ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const compactEmail = normalizedEmail.replace(/[^a-z0-9]/g, "");
  const tokens = normalizedEmail.split(/[^a-z0-9]+/).filter(Boolean);
  const hasToken = (...values: string[]) => values.some((value) => tokens.includes(value));

  // TODO: reemplazar esta inferencia demo por la seccional institucional entregada desde Microsoft/Auth o backend.
  // Esta lógica solo soporta abreviaciones y dominios comunes mientras llega la fuente real de identidad.
  if (compactEmail.includes("usbcali") || hasToken("cali") || compactEmail.endsWith("cali")) {
    return "cali";
  }

  if (hasToken("med", "medellin") || compactEmail.includes("usbmed") || compactEmail.includes("medellin")) {
    return "medellin";
  }

  if (hasToken("bog", "bogota") || compactEmail.includes("usbbog") || compactEmail.includes("bogota")) {
    return "bogota";
  }

  if (hasToken("ctg", "cartagena") || compactEmail.includes("usbctg") || compactEmail.includes("cartagena")) {
    return "cartagena";
  }

  return "";
}

export function canUserSelectSeccional(user: Pick<CentralMockUser, "role">) {
  return user.role === "admin";
}
