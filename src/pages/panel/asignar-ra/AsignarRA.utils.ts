import {
  buildDemoDocenteIdFromName,
  resolveDemoDocenteByName,
} from "../../../services/auth/mockUser";
import {
  getDescribedLearningResults,
  isCompetenciaRaValidByLearningResults,
} from "../../../utils/learningResultsRules";
import { getCicloCatalogs } from "../ciclo/ciclo.mock";
import type { CursoSintesis } from "../ciclo/ciclo.types";
import type {
  AsignacionRaRecord,
  CicloDemoRecord,
  CompetenciaRaDemoRecord,
  DraftSelections,
  MapeoDemoRecord,
  MedicionRaRecord,
  ResultadoAprendizajeDemoRecord,
  SummaryMetrics,
} from "./AsignarRA.types";

const cicloCatalogs = getCicloCatalogs();

export function getAssignmentId(cicloId: string, cursoId: string, competenciaId: string, raId: string) {
  return `asignacion-${cicloId}-${cursoId}-${competenciaId}-${raId}`;
}

export function resolveCourseDocente(course: CursoSintesis) {
  const docente = resolveDemoDocenteByName(course.docente);

  return {
    id: docente?.id ?? buildDemoDocenteIdFromName(course.docente),
    nombre: docente?.nombre ?? course.docente,
    email: docente?.email ?? "",
  };
}

export function getCycleCourses(cycle?: CicloDemoRecord) {
  if (!cycle) return [];

  const courseIds = new Set(cycle.cursoIds ?? []);

  return cicloCatalogs.cursos.filter((course) => {
    if (!courseIds.has(course.id)) return false;
    return course.nucleo === "Síntesis" && course.asignadoANucleoSintesis !== false;
  });
}

export function getRelatedMapeo(cycle?: CicloDemoRecord, mapeos: MapeoDemoRecord[] = []) {
  if (!cycle) return undefined;

  return mapeos.find((mapeo) => {
    if (cycle.mapeoCompetenciasId && mapeo.id === cycle.mapeoCompetenciasId) return true;
    if (mapeo.planId && mapeo.planId === cycle.planId) return true;
    if (mapeo.programaId && mapeo.programaId === cycle.programaId) return true;
    return false;
  });
}

export function getMappedCompetenceIdsForCourse(
  courseId: string,
  cycle?: CicloDemoRecord,
  mapeos?: MapeoDemoRecord[],
) {
  const relatedMapeo = getRelatedMapeo(cycle, mapeos ?? []);

  return new Set(
    (relatedMapeo?.cursosMapeados ?? [])
      .filter((item) => item.cursoId === courseId && item.nivel !== "NA" && item.competenciaRaId)
      .map((item) => item.competenciaRaId as string),
  );
}

export function getLearningResults(competencia?: CompetenciaRaDemoRecord) {
  return getDescribedLearningResults(competencia ?? {}).slice(0, 4).filter((ra) => Boolean(ra.id));
}

export function getCompetenciaLabel(competencia: CompetenciaRaDemoRecord, index: number) {
  const explicitCode = competencia.nombre?.match(/C\d{1,2}/i)?.[0];
  return explicitCode?.toUpperCase() ?? `C${String(index + 1).padStart(2, "0")}`;
}

export function getRaLabel(ra: ResultadoAprendizajeDemoRecord, index: number) {
  return `RA ${String(ra.numero ?? index + 1).padStart(2, "0")}`;
}

export function getAssignmentCourseId(record: AsignacionRaRecord) {
  return record.cursoId ?? record.cursoIds?.[0] ?? "";
}

export function getAssignmentRaId(record: AsignacionRaRecord) {
  return record.resultadoAprendizajeId ?? record.resultadoAprendizajeIds?.[0] ?? "";
}

export function getAssignmentCompetenciaId(record: AsignacionRaRecord) {
  return record.competenciaRaId ?? record.competenciaRaIds?.[0] ?? "";
}

export function hasMeasurementForAssignment(measurements: MedicionRaRecord[], assignmentId: string) {
  return measurements.some(
    (measurement) =>
      (measurement.asignacionRaId === assignmentId || measurement.asignacionRaIds?.includes(assignmentId)) &&
      Boolean(measurement.completed || measurement.isEvaluationLocked),
  );
}

export function getUniqueAssignmentCount(records: AsignacionRaRecord[]) {
  return new Set(
    records
      .map((record) => `${getAssignmentCompetenciaId(record)}-${getAssignmentRaId(record)}`)
      .filter((key) => !key.endsWith("-")),
  ).size;
}

export function areArraysEqual(first: string[], second: string[]) {
  if (first.length !== second.length) return false;

  const normalizedFirst = [...first].sort();
  const normalizedSecond = [...second].sort();
  return normalizedFirst.every((value, index) => value === normalizedSecond[index]);
}

export function getCompetenciasForCycle(competencias: CompetenciaRaDemoRecord[], selectedCycle?: CicloDemoRecord) {
  if (!selectedCycle) return [];

  return competencias.filter((competencia) => {
    const samePlan = competencia.planId && competencia.planId === selectedCycle.planId;
    const sameProgram = competencia.programaId && competencia.programaId === selectedCycle.programaId;
    return (samePlan || sameProgram) && isCompetenciaRaValidByLearningResults(competencia);
  });
}

export function getCourseCompetencias(
  course: CursoSintesis | undefined,
  cycle: CicloDemoRecord | undefined,
  competencias: CompetenciaRaDemoRecord[],
  mapeos: MapeoDemoRecord[],
) {
  if (!course || !cycle) return [];

  const mappedCompetenceIds = getMappedCompetenceIdsForCourse(course.id, cycle, mapeos);

  if (mappedCompetenceIds.size === 0) return [];

  return competencias.filter((competencia) => mappedCompetenceIds.has(competencia.id));
}

export function buildDraftSelections(
  courseCompetencias: CompetenciaRaDemoRecord[],
  selectedCourseAssignments: AsignacionRaRecord[],
): DraftSelections {
  const nextDraft: DraftSelections = {};

  courseCompetencias.forEach((competencia) => {
    const allowedRaIds = new Set(getLearningResults(competencia).map((ra) => ra.id).filter(Boolean));
    const assignedRaIds = selectedCourseAssignments
      .filter((record) => getAssignmentCompetenciaId(record) === competencia.id)
      .map(getAssignmentRaId)
      .filter((raId) => raId && allowedRaIds.has(raId));

    nextDraft[competencia.id] = Array.from(new Set(assignedRaIds));
  });

  return nextDraft;
}

export function buildSummaryMetrics(
  courses: CursoSintesis[],
  records: AsignacionRaRecord[],
  selectedCycleId: string,
): SummaryMetrics {
  const assignedCourseIds = new Set(
    records
      .filter((record) => record.cicloId === selectedCycleId && Boolean(getAssignmentCourseId(record)))
      .map(getAssignmentCourseId),
  );

  const totalAssignedRa = records.filter(
    (record) => record.cicloId === selectedCycleId && Boolean(getAssignmentRaId(record)),
  ).length;

  return {
    totalCourses: courses.length,
    assignedCourses: courses.filter((course) => assignedCourseIds.has(course.id)).length,
    pendingCourses: courses.filter((course) => !assignedCourseIds.has(course.id)).length,
    totalAssignedRa,
  };
}
