import { roleLabels } from "./perfil-egreso.permissions";
import type {
  Catalogs,
  CurrentUser,
  Facultad,
  PerfilEgresoRecord,
  PerfilEgresoRole,
  PlanEstudio,
  ProgramaAcademico,
  Seccional,
} from "./perfil-egreso.types";

export const DEFAULT_ROLE: PerfilEgresoRole = "admin";

export const seccionales: Seccional[] = [
  { id: "cali", nombre: "Seccional Cali" },
  { id: "bogota", nombre: "Seccional Bogotá" },
  { id: "medellin", nombre: "Seccional Medellín" },
  { id: "cartagena", nombre: "Seccional Cartagena" },
];

export const facultades: Facultad[] = [
  { id: "ing-cali", nombre: "Facultad de Ingeniería", seccionalId: "cali" },
  { id: "artes-cali", nombre: "Facultad de Artes y Diseño", seccionalId: "cali" },
  { id: "ing-bog", nombre: "Facultad de Ingeniería", seccionalId: "bogota" },
  { id: "salud-bog", nombre: "Facultad de Salud", seccionalId: "bogota" },
  { id: "ing-med", nombre: "Facultad de Ingeniería", seccionalId: "medellin" },
  { id: "ing-ctg", nombre: "Facultad de Ingeniería", seccionalId: "cartagena" },
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
    id: "meca-ctg",
    nombre: "Ingeniería Mecánica",
    facultadId: "ing-ctg",
    seccionalId: "cartagena",
  },
];

export const planes: PlanEstudio[] = [
  { id: "plan-2024-2", nombre: "Plan 2024-2" },
  { id: "plan-2024-1", nombre: "Plan 2024-1" },
  { id: "plan-2018-2", nombre: "Plan 2018-2" },
  { id: "plan-2015-1", nombre: "Plan 2015-1" },
];

export const mockPerfilesEgreso: PerfilEgresoRecord[] = [
  {
    id: "pe-001",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "sis-cali",
    planId: "plan-2024-2",
    estado: "activo",
    descripcion:
      "El egresado será capaz de diseñar, desarrollar e implementar soluciones tecnológicas innovadoras aplicando principios de ingeniería de software, analítica e integración de sistemas.",
    createdAt: "2026-03-20T09:20:00",
    updatedAt: "2026-03-20T09:20:00",
  },
  {
    id: "pe-002",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "ind-cali",
    planId: "plan-2024-2",
    estado: "inactivo",
    descripcion:
      "El egresado será capaz de optimizar procesos, gestionar recursos y liderar iniciativas de mejora continua en entornos productivos y de servicio.",
    createdAt: "2026-03-18T14:10:00",
    updatedAt: "2026-03-25T16:45:00",
  },
  {
    id: "pe-003",
    seccionalId: "cali",
    facultadId: "artes-cali",
    programaId: "danza-cali",
    planId: "plan-2024-1",
    estado: "inactivo",
    descripcion:
      "El egresado integrará creación, investigación y gestión cultural para aportar propuestas escénicas contemporáneas con sentido social y pedagógico.",
    createdAt: "2026-03-14T10:00:00",
    updatedAt: "2026-03-14T10:00:00",
  },
  {
    id: "pe-004",
    seccionalId: "bogota",
    facultadId: "ing-bog",
    programaId: "sis-bog",
    planId: "plan-2024-2",
    estado: "activo",
    descripcion:
      "El egresado será capaz de diseñar, desarrollar e implementar soluciones tecnológicas, integrando ingeniería de software, inteligencia artificial y gestión de proyectos.",
    createdAt: "2026-03-10T08:00:00",
    updatedAt: "2026-03-20T11:30:00",
  },
  {
    id: "pe-005",
    seccionalId: "bogota",
    facultadId: "ing-bog",
    programaId: "multimedia-bog",
    planId: "plan-2024-2",
    estado: "activo",
    descripcion:
      "El egresado será capaz de conceptualizar experiencias digitales y productos multimedia con enfoque en interacción, narrativa y tecnología.",
    createdAt: "2026-03-11T12:00:00",
    updatedAt: "2026-03-21T15:15:00",
  },
  {
    id: "pe-006",
    seccionalId: "bogota",
    facultadId: "salud-bog",
    programaId: "biomedica-bog",
    planId: "plan-2015-1",
    estado: "inactivo",
    descripcion:
      "El egresado integrará principios biomédicos, instrumentación y análisis clínico para desarrollar soluciones aplicadas al contexto sanitario.",
    createdAt: "2026-02-28T09:50:00",
    updatedAt: "2026-03-12T13:00:00",
  },
  {
    id: "pe-007",
    seccionalId: "medellin",
    facultadId: "ing-med",
    programaId: "agro-med",
    planId: "plan-2018-2",
    estado: "activo",
    descripcion:
      "El egresado gestionará cadenas agroindustriales y desarrollará procesos sostenibles con enfoque en calidad, innovación y productividad.",
    createdAt: "2026-03-02T08:10:00",
    updatedAt: "2026-03-17T09:00:00",
  },
  {
    id: "pe-008",
    seccionalId: "cartagena",
    facultadId: "ing-ctg",
    programaId: "meca-ctg",
    planId: "plan-2024-1",
    estado: "activo",
    descripcion:
      "El egresado será capaz de modelar, fabricar y mantener sistemas mecánicos con criterios de eficiencia, seguridad e innovación.",
    createdAt: "2026-03-07T07:30:00",
    updatedAt: "2026-03-19T18:00:00",
  },
];

export const mockUsers: Record<PerfilEgresoRole, CurrentUser> = {
  admin: {
    id: "usr-admin-001",
    nombre: "Camila Restrepo",
    cargo: roleLabels.admin,
    role: "admin",
    scope: {},
  },
  vice: {
    id: "usr-vice-001",
    nombre: "Andrea Londoño",
    cargo: roleLabels.vice,
    role: "vice",
    scope: { seccionalId: "bogota" },
  },
  decano: {
    id: "usr-decano-001",
    nombre: "Carlos Ramírez",
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
): PerfilEgresoRole {
  const normalized = String(rawRole ?? "")
    .trim()
    .toLowerCase();

  const aliases: Record<string, PerfilEgresoRole> = {
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
    programas,
    planes,
  };
}
