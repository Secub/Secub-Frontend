import { DEMO_DOCENTE_SECUB, getCurrentMockUser } from "../../../services/auth/mockUser";
import { mockBackend } from "../../../services/mockBackend";
import {
  secubAcademicCourses,
  secubFacultades,
  secubPlanes,
  secubProgramas,
  secubSeccionales,
} from "../../../data/secubAcademicPrograms";
import type {
  MapeoCompetenciasRecord,
  NivelCompromiso,
  NivelCompromisoItem,
  NucleoFormacion,
} from "../mapeo-competencias/MapeoCompetencias.types";
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

const NUCLEO_LABELS: Record<NucleoFormacion, CursoSintesis["nucleo"]> = {
  fundamentacion: "Fundamentación",
  profesionalizacion: "Profesionalización",
  sintesis: "Síntesis",
};

const NIVEL_TO_SHORT: Record<NivelCompromiso, CursoSintesis["nivelCompromiso"]> = {
  introduce: "I",
  refuerza: "R",
  afianza: "A",
  "no-aplica": "",
};

const NIVEL_PRIORITY: Record<CursoSintesis["nivelCompromiso"], number> = {
  A: 3,
  R: 2,
  I: 1,
  "": 0,
};

function getLatestMapeoForCourse(
  mapeos: MapeoCompetenciasRecord[],
  programId: string,
  planId: string,
) {
  return mapeos
    .filter((mapeo) => mapeo.programaId === programId && mapeo.planId === planId)
    .sort((a, b) => Date.parse(b.updatedAt || b.createdAt) - Date.parse(a.updatedAt || a.createdAt))[0];
}

function getCourseLevelSummary(niveles: NivelCompromisoItem[], courseId: string) {
  const courseLevels = niveles.filter((item) => item.cursoId === courseId);
  const competenciaIds = new Set(
    courseLevels
      .filter((item) => item.nivelCompromiso !== "no-aplica")
      .map((item) => item.competenciaId),
  );
  const nivelCompromiso = courseLevels.reduce<CursoSintesis["nivelCompromiso"]>((highest, item) => {
    const short = NIVEL_TO_SHORT[item.nivelCompromiso] ?? "";
    return NIVEL_PRIORITY[short] > NIVEL_PRIORITY[highest] ? short : highest;
  }, "");

  return {
    competenciasAsignadas: competenciaIds.size,
    nivelCompromiso,
  };
}

function buildCursosFromMapeos(mapeos: MapeoCompetenciasRecord[]): CursoSintesis[] {
  return secubAcademicCourses.map((course) => {
    const mapeo = getLatestMapeoForCourse(mapeos, course.programId, course.planId);
    const semestreClasificado = mapeo?.semestresClasificados?.find(
      (semestre) => semestre.semestreNumero === course.semester,
    );
    const nucleo = semestreClasificado?.nucleo ?? null;
    const levelSummary = getCourseLevelSummary(mapeo?.nivelesCompromiso ?? [], course.id);

    return {
      id: course.id,
      nombre: course.name,
      codigo: course.code,
      creditos: course.credits,
      semestre: course.semester,
      nucleo: nucleo ? NUCLEO_LABELS[nucleo] : "Fundamentación",
      programaId: course.programId,
      planId: course.planId,
      docente: DEMO_DOCENTE_SECUB.nombre,
      tipoVinculacion: "Tiempo completo",
      competenciasAsignadas: levelSummary.competenciasAsignadas,
      nivelCompromiso: levelSummary.nivelCompromiso,
      asignadoANucleoSintesis: nucleo === "sintesis",
    };
  });
}

export const cursosSintesis: CursoSintesis[] = buildCursosFromMapeos([]);

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

export function getCicloCatalogs(user: CurrentUser = getCurrentCicloUser()): CicloCatalogs {
  const mapeos = mockBackend.list<MapeoCompetenciasRecord>("mapeosCompetencias", user);

  return {
    seccionales,
    facultades,
    programas,
    planes,
    cursos: buildCursosFromMapeos(mapeos),
  };
}
