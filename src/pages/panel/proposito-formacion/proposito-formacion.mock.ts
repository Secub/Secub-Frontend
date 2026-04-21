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

export const mockPropositos: PropositoFormacionRecord[] = [
  {
    id: "pf-001",
    seccionalId: "cali",
    facultadId: "ing-cali",
    lugarId: "cali",
    programaId: "sis-cali",
    planId: "plan-2024-2",
    estado: "activo",
    descripcion:
      "El egresado será capaz de analizar, diseñar e implementar soluciones de software con enfoque ético, analítico y orientado a resultados.",
    createdAt: "2026-03-20T09:20:00",
    updatedAt: "2026-03-20T09:20:00",
  },
  {
    id: "pf-002",
    seccionalId: "cali",
    facultadId: "ing-cali",
    lugarId: "cali",
    programaId: "ind-cali",
    planId: "plan-2024-2",
    estado: "inactivo",
    descripcion:
      "El egresado será capaz de optimizar procesos, gestionar recursos y liderar decisiones de mejora continua en entornos productivos.",
    createdAt: "2026-03-18T14:10:00",
    updatedAt: "2026-03-25T16:45:00",
  },
  {
    id: "pf-003",
    seccionalId: "cali",
    facultadId: "artes-cali",
    lugarId: "cali",
    programaId: "danza-cali",
    planId: "plan-2024-1",
    estado: "activo",
    descripcion:
      "El egresado integrará creación, investigación y gestión cultural para aportar propuestas escénicas contemporáneas con sentido social.",
    createdAt: "2026-03-14T10:00:00",
    updatedAt: "2026-03-14T10:00:00",
  },
  {
    id: "pf-004",
    seccionalId: "bogota",
    facultadId: "ing-bog",
    lugarId: "bogota",
    programaId: "sis-bog",
    planId: "plan-2024-2",
    estado: "activo",
    descripcion:
      "El egresado desarrollará soluciones tecnológicas innovadoras, integrando ingeniería de software, inteligencia artificial y gestión de proyectos.",
    createdAt: "2026-03-10T08:00:00",
    updatedAt: "2026-03-19T11:30:00",
  },
  {
    id: "pf-005",
    seccionalId: "bogota",
    facultadId: "ing-bog",
    lugarId: "bogota",
    programaId: "multimedia-bog",
    planId: "plan-2024-2",
    estado: "activo",
    descripcion:
      "El egresado será capaz de conceptualizar experiencias digitales, integrando narrativa, diseño, interacción y tecnología multimedia.",
    createdAt: "2026-03-11T12:00:00",
    updatedAt: "2026-03-21T15:15:00",
  },
  {
    id: "pf-006",
    seccionalId: "bogota",
    facultadId: "salud-bog",
    lugarId: "bogota",
    programaId: "biomedica-bog",
    planId: "plan-2015-1",
    estado: "inactivo",
    descripcion:
      "El egresado integrará principios biomédicos, instrumentación y análisis clínico para desarrollar soluciones aplicadas al contexto sanitario.",
    createdAt: "2026-02-28T09:50:00",
    updatedAt: "2026-03-12T13:00:00",
  },
  {
    id: "pf-007",
    seccionalId: "medellin",
    facultadId: "ing-med",
    lugarId: "medellin",
    programaId: "agro-med",
    planId: "plan-2015-2",
    estado: "activo",
    descripcion:
      "El egresado gestionará procesos agroindustriales con visión sostenible, articulando producción, innovación y calidad.",
    createdAt: "2026-03-09T07:45:00",
    updatedAt: "2026-03-15T09:10:00",
  },
  {
    id: "pf-008",
    seccionalId: "medellin",
    facultadId: "ing-med",
    lugarId: "bello",
    programaId: "agro-med",
    planId: "plan-2024-1",
    estado: "activo",
    descripcion:
      "El egresado aplicará herramientas de innovación, logística y sostenibilidad para fortalecer procesos agroindustriales en contextos regionales.",
    createdAt: "2026-03-12T09:00:00",
    updatedAt: "2026-03-19T09:40:00",
  },
  {
    id: "pf-009",
    seccionalId: "medellin",
    facultadId: "ing-med",
    lugarId: "armenia",
    programaId: "agro-med",
    planId: "plan-2024-2",
    estado: "inactivo",
    descripcion:
      "El egresado podrá liderar proyectos de transformación productiva y de gestión de calidad con enfoque territorial y visión de cadena de valor.",
    createdAt: "2026-03-16T08:20:00",
    updatedAt: "2026-03-22T10:00:00",
  },
  {
    id: "pf-010",
    seccionalId: "cartagena",
    facultadId: "ing-cart",
    lugarId: "cartagena",
    programaId: "sis-cart",
    planId: "plan-2024-2",
    estado: "activo",
    descripcion:
      "El egresado será capaz de diseñar, implementar y evaluar soluciones tecnológicas orientadas a la transformación digital y al desarrollo regional.",
    createdAt: "2026-03-22T09:00:00",
    updatedAt: "2026-03-22T09:00:00",
  },
];

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