import { roleLabels } from "./proposito-formacion.permissions";
import type {
  Catalogs,
  CurrentUser,
  Facultad,
  LugarDesarrollo,
  PlanEstudio,
  ProgramaAcademico,
  PropositoFormacionRecord,
  PropositoFormacionRole,
  Seccional,
} from "./proposito-formacion.types";

export const DEFAULT_ROLE: PropositoFormacionRole = "admin";

export const seccionales: Seccional[] = [
  { id: "cali", nombre: "Seccional Cali" },
  { id: "bogota", nombre: "Sede Bogotá" },
  { id: "medellin", nombre: "Seccional Medellín" },
  { id: "cartagena", nombre: "Seccional Cartagena" },
];

export const lugares: LugarDesarrollo[] = [
  { id: "cali", nombre: "Cali", seccionalId: "cali" },
  { id: "bogota", nombre: "Bogotá", seccionalId: "bogota" },
  { id: "medellin", nombre: "Medellín", seccionalId: "medellin" },
  { id: "bello", nombre: "Bello", seccionalId: "medellin" },
  { id: "armenia", nombre: "Armenia", seccionalId: "medellin" },
  { id: "cartagena", nombre: "Cartagena", seccionalId: "cartagena" },
];

export const facultades: Facultad[] = [
  { id: "ing-cali", nombre: "Facultad de Ingeniería", seccionalId: "cali" },
  { id: "artes-cali", nombre: "Facultad de Artes y Diseño", seccionalId: "cali" },
  { id: "ing-bog", nombre: "Facultad de Ingeniería", seccionalId: "bogota" },
  { id: "salud-bog", nombre: "Facultad de Salud", seccionalId: "bogota" },
  { id: "ing-med", nombre: "Facultad de Ingeniería", seccionalId: "medellin" },
  { id: "ing-cart", nombre: "Facultad de Ingeniería", seccionalId: "cartagena" },
];

export const programas: ProgramaAcademico[] = [
  {
    id: "sis-cali",
    nombre: "Ingeniería de Sistemas",
    facultadId: "ing-cali",
    seccionalId: "cali",
  },
  {
    id: "ind-cali",
    nombre: "Ingeniería Industrial",
    facultadId: "ing-cali",
    seccionalId: "cali",
  },
  {
    id: "danza-cali",
    nombre: "Licenciatura en Danza y Performance",
    facultadId: "artes-cali",
    seccionalId: "cali",
  },
  {
    id: "sis-bog",
    nombre: "Ingeniería de Sistemas",
    facultadId: "ing-bog",
    seccionalId: "bogota",
  },
  {
    id: "multimedia-bog",
    nombre: "Ingeniería Multimedia",
    facultadId: "ing-bog",
    seccionalId: "bogota",
  },
  {
    id: "biomedica-bog",
    nombre: "Ingeniería Biomédica",
    facultadId: "salud-bog",
    seccionalId: "bogota",
  },
  {
    id: "agro-med",
    nombre: "Ingeniería Agroindustrial",
    facultadId: "ing-med",
    seccionalId: "medellin",
  },
  {
    id: "sis-cart",
    nombre: "Ingeniería de Sistemas",
    facultadId: "ing-cart",
    seccionalId: "cartagena",
  },
];

export const planes: PlanEstudio[] = [
  { id: "plan-2024-2", nombre: "Plan 2024-2" },
  { id: "plan-2024-1", nombre: "Plan 2024-1" },
  { id: "plan-2015-1", nombre: "Plan 2015-1" },
  { id: "plan-2015-2", nombre: "Plan 2015-2" },
];

export const mockPropositos: PropositoFormacionRecord[] = [];

const mockUsers: Record<PropositoFormacionRole, CurrentUser> = {
  admin: {
    id: "usr-admin-001",
    nombre: "Juliana Mejía",
    cargo: roleLabels.admin,
    role: "admin",
    scope: {},
  },
  vice: {
    id: "usr-vice-001",
    nombre: "Ana María Restrepo",
    cargo: roleLabels.vice,
    role: "vice",
    scope: { seccionalId: "bogota" },
  },
  decano: {
    id: "usr-decano-001",
    nombre: "Carlos Medina",
    cargo: roleLabels.decano,
    role: "decano",
    scope: { facultadId: "ing-bog", seccionalId: "bogota" },
  },
  director: {
    id: "usr-director-001",
    nombre: "Laura Gómez",
    cargo: roleLabels.director,
    role: "director",
    scope: {
      seccionalId: "bogota",
      facultadId: "ing-bog",
      programaId: "sis-bog",
    },
  },
  docente: {
    id: "usr-docente-001",
    nombre: "Santiago Torres",
    cargo: roleLabels.docente,
    role: "docente",
    scope: {
      seccionalId: "bogota",
      facultadId: "ing-bog",
      programaId: "sis-bog",
    },
  },
};

export function normalizeRole(
  rawRole: string | null | undefined,
): PropositoFormacionRole {
  const normalized = String(rawRole ?? "").trim().toLowerCase();

  const aliases: Record<string, PropositoFormacionRole> = {
    admin: "admin",
    administrador: "admin",
    administrative: "admin",
    vice: "vice",
    vicerrector: "vice",
    vicerrectoría: "vice",
    vicerrectoria: "vice",
    decano: "decano",
    director: "director",
    directorprograma: "director",
    director_de_programa: "director",
    docente: "docente",
    teacher: "docente",
  };

  return aliases[normalized] ?? DEFAULT_ROLE;
}

export function getCurrentUser(): CurrentUser {
  const params = new URLSearchParams(window.location.search);
  const role = normalizeRole(params.get("role"));
  return mockUsers[role];
}

export function getCatalogs(): Catalogs {
  return {
    seccionales,
    facultades,
    lugares,
    programas,
    planes,
  };
}