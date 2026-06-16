import { isCompetenciaRaValidByLearningResults } from "../../../utils/learningResultsRules";
import type {
  Catalogs,
  CompetenciaRaDemoRecord,
  CursoAsis,
  MapeoCompetenciasEnriched,
  MapeoCompetenciasRecord,
  NivelCompromisoCorto,
  NivelCompromisoItem,
  NivelesDraft,
  NucleosDraft,
  PlanEstudio,
  ProgramaAcademico,
  ProgramaEstado,
} from "./MapeoCompetencias.types";
import {
  buildSemestresResumen,
  getMappingKey,
  getNivelShort,
  getNucleoLabel,
  getSemesterId,
  getTotalSemestersForPlan,
  serializeSemestresClasificados,
} from "./MapeoCompetencias.semestres";

export function getMapeoRecordId(programaId: string, planId: string) {
  return `mapeo-${programaId}__${planId}`;
}

export function normalizeCursoAsis(course: CursoAsis): CursoAsis {
  return {
    ...course,
    docente: course.docente ?? "Sin docente asignado",
  };
}

export function getCursosByProgramPlan(
  cursos: CursoAsis[],
  programaId: string,
  planId: string,
) {
  if (!programaId || !planId) return [];

  return cursos
    .filter((course) => course.programaId === programaId && course.planId === planId)
    .map(normalizeCursoAsis)
    .sort((a, b) => a.semestre - b.semestre || a.codigo.localeCompare(b.codigo));
}

export function getCompetenciasByProgramPlan(
  competencias: CompetenciaRaDemoRecord[],
  programaId: string,
  planId: string,
) {
  if (!programaId || !planId) return [];

  return competencias
    .filter((competencia) => {
      const sameProgram = competencia.programaId === programaId;
      const samePlan = competencia.planId === planId;
      const isActive = (competencia.estado ?? "activo") === "activo";
      return sameProgram && samePlan && isActive && isCompetenciaRaValidByLearningResults(competencia);
    })
    .sort((a, b) => (a.numero ?? 0) - (b.numero ?? 0));
}

export function getCompetenciaDisplayName(competencia: CompetenciaRaDemoRecord, index: number) {
  if (competencia.nombre) return competencia.nombre;
  if (competencia.descripcion) return competencia.descripcion;
  return `Competencia ${String(competencia.numero ?? index + 1).padStart(2, "0")}`;
}

export function getProgramaEstado(
  programa: ProgramaAcademico | undefined,
  plan: PlanEstudio | undefined,
): ProgramaEstado {
  if (programa?.estado === "inactivo" || plan?.estado === "inactivo") return "inactivo";
  return "activo";
}

export function enrichMapeoRecords(
  records: MapeoCompetenciasRecord[],
  catalogs: Catalogs,
  cursos: CursoAsis[],
  competencias: CompetenciaRaDemoRecord[],
): MapeoCompetenciasEnriched[] {
  return records.map((record) => {
    const seccional = catalogs.seccionales.find((item) => item.id === record.seccionalId);
    const facultad = catalogs.facultades.find((item) => item.id === record.facultadId);
    const lugar = catalogs.lugares.find((item) => item.id === record.lugarId);
    const programa = catalogs.programas.find((item) => item.id === record.programaId);
    const plan = catalogs.planes.find((item) => item.id === record.planId);
    const programaEstado = getProgramaEstado(programa, plan);
    const cursosPlan = getCursosByProgramPlan(cursos, record.programaId, record.planId);
    const competenciasPlan = getCompetenciasByProgramPlan(competencias, record.programaId, record.planId);

    return {
      ...record,
      competenciaRaIds: record.competenciaRaIds ?? [],
      semestresClasificados: record.semestresClasificados ?? [],
      nivelesCompromiso: record.nivelesCompromiso ?? [],
      cursosMapeados: record.cursosMapeados ?? [],
      seccionalNombre: seccional?.nombre ?? "Sin seccional",
      facultadNombre: facultad?.nombre ?? "Sin facultad",
      lugarNombre: lugar?.nombre ?? "Sin lugar",
      programaNombre: programa?.nombre ?? "Sin programa",
      programaEstado,
      planNombre: plan?.nombre ?? "Sin plan",
      planEstado: plan?.estado ?? programaEstado,
      semestresResumen: buildSemestresResumen(
        record,
        cursosPlan,
        competenciasPlan,
        getTotalSemestersForPlan(plan, cursosPlan, record),
      ),
    };
  });
}

export function buildNivelItemsFromDraft(params: {
  programaId: string;
  planId: string;
  nucleosDraft: NucleosDraft;
  nivelesDraft: NivelesDraft;
  cursos: CursoAsis[];
  competencias: CompetenciaRaDemoRecord[];
  totalSemestres?: number;
}) {
  const { programaId, planId, nucleosDraft, nivelesDraft, cursos, competencias } = params;

  return cursos.flatMap<NivelCompromisoItem>((curso) => {
    const nucleo = nucleosDraft[curso.semestre];
    if (!nucleo) return [];

    return competencias.flatMap((competencia, index) => {
      const nivel = nivelesDraft[getMappingKey(curso.id, competencia.id)];
      if (!nivel) return [];

      return {
        programaId,
        planId,
        semestreId: getSemesterId(planId, curso.semestre),
        semestreNumero: curso.semestre,
        nucleo,
        cursoId: curso.id,
        cursoNombre: curso.nombre,
        cursoCodigo: curso.codigo,
        competenciaId: competencia.id,
        competenciaNombre: getCompetenciaDisplayName(competencia, index),
        nivelCompromiso: nivel,
      };
    });
  });
}

export function buildCompatCursosMapeados(niveles: NivelCompromisoItem[]) {
  return niveles.map((item) => ({
    cursoId: item.cursoId,
    cursoNombre: item.cursoNombre,
    cursoCodigo: item.cursoCodigo,
    semestre: item.semestreNumero,
    nucleo: getNucleoLabel(item.nucleo),
    competenciaRaId: item.competenciaId,
    competenciaRaIds: [item.competenciaId],
    competenciaNombre: item.competenciaNombre,
    nivel: getNivelShort(item.nivelCompromiso) as NivelCompromisoCorto,
  }));
}

export function buildMapeoRecord(params: {
  existingRecord?: MapeoCompetenciasRecord | null;
  seccionalId: string;
  facultadId: string;
  lugarId: string;
  programaId: string;
  planId: string;
  descripcion?: string;
  nucleosDraft: NucleosDraft;
  nivelesDraft: NivelesDraft;
  cursos: CursoAsis[];
  competencias: CompetenciaRaDemoRecord[];
  totalSemestres?: number;
}) {
  const now = new Date().toISOString();
  const nivelesCompromiso = buildNivelItemsFromDraft({
    programaId: params.programaId,
    planId: params.planId,
    nucleosDraft: params.nucleosDraft,
    nivelesDraft: params.nivelesDraft,
    cursos: params.cursos,
    competencias: params.competencias,
  });

  return {
    id: params.existingRecord?.id ?? getMapeoRecordId(params.programaId, params.planId),
    seccionalId: params.seccionalId,
    facultadId: params.facultadId,
    lugarId: params.lugarId,
    programaId: params.programaId,
    planId: params.planId,
    estado: "activo" as const,
    descripcion:
      params.descripcion ??
      "Clasificación de núcleos y mapeo de niveles de compromiso I-R-A-NA por curso y competencia.",
    competenciaRaIds: params.competencias.map((competencia) => competencia.id),
    semestresClasificados: serializeSemestresClasificados(params.nucleosDraft, params.planId, params.totalSemestres),
    nivelesCompromiso,
    cursosMapeados: buildCompatCursosMapeados(nivelesCompromiso),
    createdAt: params.existingRecord?.createdAt ?? now,
    updatedAt: now,
  } satisfies MapeoCompetenciasRecord;
}
