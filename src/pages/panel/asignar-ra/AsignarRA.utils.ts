import {
  getDescribedLearningResults,
  isCompetenciaRaValidByLearningResults,
} from "../../../utils/learningResultsRules";
import type { CursoSintesis } from "../ciclo/ciclo.types";
import type {
  AsignacionRaRecord,
  MeasurementCycleRecord,
  CompetenceRaRecord,
  DraftSelections,
  CompetencyMappingRecord,
  MedicionRaRecord,
  LearningOutcomeRecord,
  SummaryMetrics,
} from "./AsignarRA.types";

export function getAssignmentId(cicloId: string, cursoId: string, competenciaId: string, raId: string) {
  return `asignacion-${cicloId}-${cursoId}-${competenciaId}-${raId}`;
}

export function resolveCourseDocente(course: CursoSintesis) {
  return {
    id: "docenteId" in course ? String(course.docenteId ?? "") : "",
    nombre: course.docente,
    email: "docenteEmail" in course ? String(course.docenteEmail ?? "") : "",
  };
}

export function getCycleCourses(cycle?: MeasurementCycleRecord) {
  if (!cycle) return [];

  if (cycle.cursos) return cycle.cursos;

  return [];
}

export function getRelatedMapeo(cycle?: MeasurementCycleRecord, mapeos: CompetencyMappingRecord[] = []) {
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
  cycle?: MeasurementCycleRecord,
  mapeos?: CompetencyMappingRecord[],
) {
  const relatedMapeo = getRelatedMapeo(cycle, mapeos ?? []);

  return new Set(
    (relatedMapeo?.cursosMapeados ?? [])
      .filter((item) => item.cursoId === courseId && item.nivel !== "NA" && item.competenciaRaId)
      .map((item) => item.competenciaRaId as string),
  );
}

export function getLearningResults(competencia?: CompetenceRaRecord) {
  return getDescribedLearningResults(competencia ?? {}).slice(0, 4).filter((ra) => Boolean(ra.id));
}

export function getCompetenciaLabel(competencia: CompetenceRaRecord, index: number) {
  const explicitCode = competencia.nombre?.match(/C\d{1,2}/i)?.[0];
  return explicitCode?.toUpperCase() ?? `C${String(index + 1).padStart(2, "0")}`;
}

export function getRaLabel(ra: LearningOutcomeRecord, index: number) {
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

export function getCompetenciasForCycle(competencias: CompetenceRaRecord[], selectedCycle?: MeasurementCycleRecord) {
  if (!selectedCycle) return [];

  return competencias.filter((competencia) => {
    const samePlan = competencia.planId && competencia.planId === selectedCycle.planId;
    const sameProgram = competencia.programaId && competencia.programaId === selectedCycle.programaId;
    return (samePlan || sameProgram) && isCompetenciaRaValidByLearningResults(competencia);
  });
}

export function getCourseCompetencias(
  course: CursoSintesis | undefined,
  cycle: MeasurementCycleRecord | undefined,
  competencias: CompetenceRaRecord[],
  mapeos: CompetencyMappingRecord[],
) {
  if (!course || !cycle) return [];

  const mappedCompetenceIds = getMappedCompetenceIdsForCourse(course.id, cycle, mapeos);

  if (mappedCompetenceIds.size === 0) return [];

  return competencias.filter((competencia) => mappedCompetenceIds.has(competencia.id));
}

export function isCourseAssignmentComplete(
  course: CursoSintesis,
  cycle: MeasurementCycleRecord,
  competencias: CompetenceRaRecord[],
  mapeos: CompetencyMappingRecord[],
  records: AsignacionRaRecord[],
) {
  const mappedCompetenceIds = getMappedCompetenceIdsForCourse(course.id, cycle, mapeos);
  if (mappedCompetenceIds.size === 0) return false;

  const requiredCompetencias = competencias.filter((competencia) => mappedCompetenceIds.has(competencia.id));
  if (!requiredCompetencias.length) return false;

  return requiredCompetencias.every((competencia) =>
    records.some(
      (record) =>
        record.cicloId === cycle.id &&
        getAssignmentCourseId(record) === course.id &&
        getAssignmentCompetenciaId(record) === competencia.id &&
        Boolean(getAssignmentRaId(record)),
    ),
  );
}

export function buildDraftSelections(
  courseCompetencias: CompetenceRaRecord[],
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
