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
import type {
  CicloCatalogs,
  CicloMedicion,
  CurrentUser,
  CursoSintesis,
  Facultad,
  PlanEstudio,
  ProgramaAcademico,
  Seccional,
} from "./ciclo.types";

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

export function getCurrentCicloUser(): CurrentUser {
  const demoUser = getCurrentMockUser();

  return {
    id: demoUser.id,
    nombre: demoUser.nombre,
    email: demoUser.email,
    cargo: demoUser.cargo,
    role: demoUser.role,
    scope: { ...demoUser.scope },
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
