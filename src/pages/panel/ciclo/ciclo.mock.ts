import { DEMO_DOCENTE_SECUB, getCurrentMockUser } from "../../../services/auth/mockUser";
import {
  secubAcademicCourses,
  secubFacultades,
  secubPlanes,
  secubProgramas,
  secubSeccionales,
} from "../../../data/secubAcademicPrograms";
import { cicloRoleLabels } from "./ciclo.permissions";
import type {
  CicloCatalogs,
  CicloMedicion,
  CicloRole,
  CurrentUser,
  CursoSintesis,
  Facultad,
  PlanEstudio,
  ProgramaAcademico,
  Seccional,
} from "./ciclo.types";

export const DEFAULT_CICLO_ROLE: CicloRole = "direccionPrograma";

export const seccionales: Seccional[] = secubSeccionales;
export const facultades: Facultad[] = secubFacultades;
export const programas: ProgramaAcademico[] = secubProgramas;
export const planes: PlanEstudio[] = secubPlanes.map(({ totalSemestres: _totalSemestres, ...plan }) => plan);

export const cursosSintesis: CursoSintesis[] = secubAcademicCourses.map((course) => ({
  id: course.id,
  nombre: course.name,
  codigo: course.code,
  creditos: course.credits,
  semestre: course.semester,
  nucleo: course.cycle,
  programaId: course.programId,
  planId: course.planId,
  docente: DEMO_DOCENTE_SECUB.nombre,
  tipoVinculacion: "Tiempo completo",
  competenciasAsignadas: course.cycle === "Síntesis" ? 2 : 0,
  nivelCompromiso: course.cycle === "Síntesis" ? "A" : "",
  asignadoANucleoSintesis: course.cycle === "Síntesis",
}));

export const mockCiclos: CicloMedicion[] = [];

const mockUsers: Record<CicloRole, CurrentUser> = {
  admin: {
    id: "usr-admin-001",
    nombre: "Juliana Mejía",
    cargo: cicloRoleLabels.admin,
    role: "admin",
    scope: { seccionalId: "cali" },
  },
  vice: {
    id: "usr-vice-001",
    nombre: "Ana María Restrepo",
    cargo: cicloRoleLabels.vice,
    role: "vice",
    scope: { seccionalId: "cali" },
  },
  decano: {
    id: "usr-decano-001",
    nombre: "Carlos Medina",
    cargo: cicloRoleLabels.decano,
    role: "decano",
    scope: { seccionalId: "cali" },
  },
  direccionPrograma: {
    id: "direccion-programa-secub",
    nombre: "Dirección de programa",
    cargo: cicloRoleLabels["direccionPrograma"],
    role: "direccionPrograma",
    scope: { seccionalId: "cali" },
  },
  docente: {
    id: DEMO_DOCENTE_SECUB.id,
    nombre: DEMO_DOCENTE_SECUB.nombre,
    cargo: cicloRoleLabels.docente,
    role: "docente",
    scope: { seccionalId: "cali" },
  },
};

export function normalizeCicloRole(rawRole: string | null | undefined): CicloRole {
  const normalized = String(rawRole ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const compactRole = normalized.replace(/[^a-z0-9]+/g, "");

  const aliases: Record<string, CicloRole> = {
    admin: "admin",
    administrador: "admin",
    superadmin: "admin",
    vice: "vice",
    vicerrector: "vice",
    vicerrectoria: "vice",
    vicerrectoría: "vice",
    decano: "decano",
    director: "direccionPrograma",
    directorprograma: "direccionPrograma",
    director_de_programa: "direccionPrograma",
    direccionPrograma: "direccionPrograma",
    direccionprograma: "direccionPrograma",
    direccion_de_programa: "direccionPrograma",
    docente: "docente",
    docencia: "docente",
  };

  return aliases[normalized] ?? aliases[compactRole] ?? DEFAULT_CICLO_ROLE;
}

export function getCurrentCicloUser(): CurrentUser {
  const demoUser = getCurrentMockUser();
  const fallbackUser = mockUsers[demoUser.role as keyof typeof mockUsers] ?? mockUsers.admin;

  return {
    ...fallbackUser,
    id: demoUser.id,
    nombre: demoUser.nombre,
    email: demoUser.email,
    cargo: demoUser.cargo || fallbackUser.cargo,
    role: demoUser.role as CurrentUser["role"],
    scope: {
      ...fallbackUser.scope,
      ...demoUser.scope,
    },
  };
}

export function getCicloCatalogs(): CicloCatalogs {
  return {
    seccionales,
    facultades,
    programas,
    planes,
    cursos: cursosSintesis,
  };
}
