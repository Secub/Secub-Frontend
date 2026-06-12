import { getCurrentMockUser } from "../../../services/auth/mockUser";
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

export const DEFAULT_CICLO_ROLE: CicloRole = "director";

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
  docente: course.programId === "psicologia" ? "Docente Psicología" : "Docente Derecho",
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
  director: {
    id: "usr-director-001",
    nombre: "Jefatura SECUB",
    cargo: cicloRoleLabels.director,
    role: "director",
    scope: { seccionalId: "cali" },
  },
  docente: {
    id: "usr-docente-001",
    nombre: "Docente SECUB",
    cargo: cicloRoleLabels.docente,
    role: "docente",
    scope: { seccionalId: "cali" },
  },
};

export function normalizeCicloRole(rawRole: string | null | undefined): CicloRole {
  const normalized = String(rawRole ?? "").trim().toLowerCase();

  const aliases: Record<string, CicloRole> = {
    admin: "admin",
    administrador: "admin",
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
  };

  return aliases[normalized] ?? DEFAULT_CICLO_ROLE;
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
