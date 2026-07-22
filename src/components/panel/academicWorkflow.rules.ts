import { ENABLE_ACADEMIC_WORKFLOW_LOCK } from "../../config/workflow.config";
import { isCompetenciaRaValidByLearningResults } from "../../utils/learningResultsRules";
import { panelNavigation, type PanelStepKey } from "./panelNavigation";

export const academicWorkflowSteps: PanelStepKey[] = [
  "perfil-egreso",
  "proposito-formacion",
  "competencias-ra",
  "mapeo-competencias",
  "ciclo",
  "asignar-ra",
];

export const inheritedAcademicBaseSteps: PanelStepKey[] = [
  "perfil-egreso",
  "proposito-formacion",
];

export const newAcademicPlanStartStep: PanelStepKey = "competencias-ra";

export type AcademicWorkflowProgress = Partial<Record<PanelStepKey, boolean>>;
export type AcademicWorkflowState = "inProgress" | "completed" | "newAcademicPlan";

export const WORKFLOW_LOCKED_MESSAGE = "Primero completa el paso anterior para continuar.";

export type AcademicRecord = {
  id: string;
  estado?: string;
  seccionalId?: string;
  facultadId?: string;
  lugarId?: string;
  programaId?: string;
  academicProgramId?: string;
  planId?: string;
  descripcion?: string;
  nombre?: string;
  perfilEgresoId?: string;
  propositoFormacionId?: string;
  competenciaRaId?: string;
  competenciaRaIds?: string[];
  resultadoAprendizajeId?: string;
  resultadoAprendizajeIds?: string[];
  mapeoCompetenciasId?: string;
  cicloId?: string;
  asignacionRaId?: string;
  asignacionRaIds?: string[];
  inheritedFromAcademicPlanInstanceId?: string;
  inheritedFromRecordId?: string;
  isInheritedAcademicBase?: boolean;
  readonlyInherited?: boolean;
  academicPlanInstanceId?: string;
  cursoId?: string;
  cursoIds?: string[];
  cursosMapeados?: Array<{ cursoId?: string; competenciaRaId?: string; nivel?: string }>;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  completed?: boolean;
  isEvaluationLocked?: boolean;
  resultadosAprendizaje?: Array<{ id?: string; descripcion?: string }>;
};

export type WorkflowSnapshot = {
  perfiles: AcademicRecord[];
  propositos: AcademicRecord[];
  competencias: AcademicRecord[];
  mapeos: AcademicRecord[];
  ciclos: AcademicRecord[];
  asignaciones: AcademicRecord[];
  cursos: AcademicCourse[];
};

export type AcademicCourse = {
  id: string;
  nucleo?: string;
  asignadoANucleoSintesis?: boolean;
};

function getStepLabel(stepKey: PanelStepKey) {
  return panelNavigation.find((item) => item.key === stepKey)?.label ?? "el paso anterior";
}

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasValue(value: unknown) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

export function isActiveAcademicRecord(record: AcademicRecord) {
  return (
    !record.estado ||
    record.estado === "activo" ||
    record.estado === "activa" ||
    record.estado === "borrador" ||
    record.estado === "finalizado"
  );
}

function getProgramId(record: AcademicRecord) {
  return record.programaId ?? record.academicProgramId ?? "";
}

function isSameAcademicScope(record: AcademicRecord, relatedRecord: AcademicRecord) {
  const recordProgramId = getProgramId(record);
  const relatedProgramId = getProgramId(relatedRecord);

  if (record.planId && relatedRecord.planId && record.planId === relatedRecord.planId) {
    return true;
  }

  if (recordProgramId && relatedProgramId && recordProgramId === relatedProgramId) {
    return true;
  }

  return false;
}

function hasMatchingId(id: string | undefined, relatedRecords: AcademicRecord[]) {
  return Boolean(id && relatedRecords.some((record) => record.id === id));
}

function hasMatchingIdInList(ids: string[] | undefined, relatedRecords: AcademicRecord[]) {
  if (!ids?.length) return false;
  const relatedIds = new Set(relatedRecords.map((record) => record.id));
  return ids.some((id) => relatedIds.has(id));
}

function hasRelatedRecord(record: AcademicRecord, relatedRecords: AcademicRecord[], relationField?: keyof AcademicRecord) {
  if (!relatedRecords.length) return false;

  if (relationField) {
    const relationValue = record[relationField];

    if (typeof relationValue === "string" && hasMatchingId(relationValue, relatedRecords)) {
      return true;
    }

    if (Array.isArray(relationValue)) {
      const relationIds = relationValue.filter((value): value is string => typeof value === "string");

      if (hasMatchingIdInList(relationIds, relatedRecords)) {
        return true;
      }
    }
  }

  return relatedRecords.some((relatedRecord) => isSameAcademicScope(record, relatedRecord));
}

export function isPerfilEgresoComplete(record: AcademicRecord) {
  return (
    isActiveAcademicRecord(record) &&
    hasValue(record.seccionalId) &&
    hasValue(record.programaId) &&
    hasValue(record.planId) &&
    hasText(record.descripcion)
  );
}

export function isPropositoFormacionLinkedToPerfil(record: AcademicRecord, perfilesCompletos: AcademicRecord[]) {
  return (
    isActiveAcademicRecord(record) &&
    hasValue(record.seccionalId) &&
    hasValue(record.programaId) &&
    hasValue(record.planId) &&
    hasText(record.descripcion) &&
    hasRelatedRecord(record, perfilesCompletos, "perfilEgresoId")
  );
}

export function isCompetenciasRaLinkedToProposito(record: AcademicRecord, propositosCompletos: AcademicRecord[]) {
  return (
    isActiveAcademicRecord(record) &&
    hasValue(record.seccionalId) &&
    hasValue(record.programaId) &&
    hasValue(record.planId) &&
    (hasText(record.nombre) || hasText(record.descripcion)) &&
    isCompetenciaRaValidByLearningResults(record) &&
    hasRelatedRecord(record, propositosCompletos, "propositoFormacionId")
  );
}

export function isMapeoCompetenciasLinkedToCompetencias(record: AcademicRecord, competenciasCompletas: AcademicRecord[]) {
  return (
    isActiveAcademicRecord(record) &&
    hasValue(record.programaId) &&
    hasValue(record.planId) &&
    (hasMatchingId(record.competenciaRaId, competenciasCompletas) ||
      hasMatchingIdInList(record.competenciaRaIds, competenciasCompletas) ||
      hasRelatedRecord(record, competenciasCompletas))
  );
}

export function isCicloLinkedToMapeo(record: AcademicRecord, mapeosCompletos: AcademicRecord[]) {
  return (
    isActiveAcademicRecord(record) &&
    hasText(record.nombre) &&
    hasValue(record.programaId) &&
    hasValue(record.planId) &&
    Boolean(record.cursoIds?.length) &&
    hasRelatedRecord(record, mapeosCompletos, "mapeoCompetenciasId")
  );
}

export function isAsignacionRaLinkedToCiclo(record: AcademicRecord, ciclosCompletos: AcademicRecord[]) {
  const hasValidCourse = hasValue(record.cursoId) || Boolean(record.cursoIds?.length);
  const hasValidCompetence = hasValue(record.competenciaRaId) || Boolean(record.competenciaRaIds?.length);
  const hasValidRa = hasValue(record.resultadoAprendizajeId) || Boolean(record.resultadoAprendizajeIds?.length);
  const relatedCompletedCycle = ciclosCompletos.find((cycle) => cycle.id === record.cicloId);
  const hasValidCycleReference = hasValue(record.cicloId) &&
    (!relatedCompletedCycle || isSameAcademicScope(record, relatedCompletedCycle));

  return (
    isActiveAcademicRecord(record) &&
    hasValidCycleReference &&
    hasValue(record.programaId) &&
    hasValue(record.planId) &&
    hasValidCourse &&
    hasValidCompetence &&
    hasValidRa
  );
}

function getAssignmentCourseId(record: AcademicRecord) {
  return record.cursoId ?? record.cursoIds?.[0] ?? "";
}

function hasAssignmentForCourseCompetencia(
  asignacionesCompletas: AcademicRecord[],
  cycle: AcademicRecord,
  cursoId: string,
  competencia: AcademicRecord,
) {
  return asignacionesCompletas.some(
    (record) =>
      record.cicloId === cycle.id &&
      getAssignmentCourseId(record) === cursoId &&
      record.competenciaRaId === competencia.id &&
      Boolean(record.resultadoAprendizajeId || record.resultadoAprendizajeIds?.length) &&
      isSameAcademicScope(record, cycle),
  );
}

function getRequiredCompetenciasForCourse(
  cycle: AcademicRecord,
  cursoId: string,
  mapeosCompletos: AcademicRecord[],
  competenciasCompletas: AcademicRecord[],
) {
  const relatedMapeo = mapeosCompletos.find((mapeo) => {
    if (cycle.mapeoCompetenciasId && mapeo.id === cycle.mapeoCompetenciasId) return true;
    return isSameAcademicScope(mapeo, cycle);
  });
  const mappedCompetenceIds = new Set(
    (relatedMapeo?.cursosMapeados ?? [])
      .filter((item) => item.cursoId === cursoId && item.nivel !== "NA" && item.competenciaRaId)
      .map((item) => item.competenciaRaId as string),
  );
  const scopedCompetencias = competenciasCompletas.filter((competencia) => isSameAcademicScope(competencia, cycle));

  if (!mappedCompetenceIds.size) return scopedCompetencias;

  return scopedCompetencias.filter((competencia) => mappedCompetenceIds.has(competencia.id));
}

function getSynthesisCourseIdsForCycle(
  cycle: AcademicRecord,
  cursos: AcademicCourse[],
) {
  const cycleCourseIds = new Set(cycle.cursoIds ?? []);
  const synthesisCourseIds = cursos
    .filter(
      (course) =>
        cycleCourseIds.has(course.id) &&
        course.nucleo === "Síntesis" &&
        course.asignadoANucleoSintesis !== false,
    )
    .map((course) => course.id);

  return synthesisCourseIds.length ? synthesisCourseIds : cycle.cursoIds ?? [];
}

function isAsignarRaCycleComplete(
  cycle: AcademicRecord,
  mapeosCompletos: AcademicRecord[],
  competenciasCompletas: AcademicRecord[],
  asignacionesCompletas: AcademicRecord[],
  cursos: AcademicCourse[],
) {
  const courseIds = getSynthesisCourseIdsForCycle(cycle, cursos);
  if (!courseIds.length) return false;

  return courseIds.every((cursoId) => {
    const requiredCompetencias = getRequiredCompetenciasForCourse(
      cycle,
      cursoId,
      mapeosCompletos,
      competenciasCompletas,
    );

    if (!requiredCompetencias.length) return false;

    return requiredCompetencias.every((competencia) =>
      hasAssignmentForCourseCompetencia(asignacionesCompletas, cycle, cursoId, competencia),
    );
  });
}

export function hasCompleteAsignarRaWorkflow(
  ciclosCompletos: AcademicRecord[],
  mapeosCompletos: AcademicRecord[],
  competenciasCompletas: AcademicRecord[],
  asignacionesCompletas: AcademicRecord[],
  cursos: AcademicCourse[],
) {
  // Regla RF07 centrada en curso de Síntesis: un ciclo queda completo cuando cada curso
  // del ciclo tiene al menos 1 RA asignado por cada competencia asociada al curso.
  // TODO: cuando exista backend real, mover esta validación al servicio de workflow.
  return ciclosCompletos.some((cycle) =>
    isAsignarRaCycleComplete(
      cycle,
      mapeosCompletos,
      competenciasCompletas,
      asignacionesCompletas,
      cursos,
    ),
  );
}

export function isMedicionRaCompleteOrLocked(record: AcademicRecord, asignacionesCompletas: AcademicRecord[], ciclosCompletos: AcademicRecord[]) {
  const hasCompletionState = Boolean(record.completed || record.isEvaluationLocked);
  const isLinkedToAsignacion = hasRelatedRecord(record, asignacionesCompletas, "asignacionRaId") ||
    hasMatchingIdInList(record.asignacionRaIds, asignacionesCompletas);
  const isLinkedToCiclo = hasRelatedRecord(record, ciclosCompletos, "cicloId");

  return hasCompletionState && (isLinkedToAsignacion || isLinkedToCiclo || asignacionesCompletas.length === 0);
}

export function isAcademicWorkflowStep(stepKey: PanelStepKey) {
  return academicWorkflowSteps.includes(stepKey);
}

export function getAcademicWorkflowStepLabel(stepKey: PanelStepKey) {
  return getStepLabel(stepKey);
}

export function getPreviousAcademicWorkflowStep(stepKey: PanelStepKey) {
  const currentIndex = academicWorkflowSteps.indexOf(stepKey);

  if (currentIndex <= 0) {
    return null;
  }

  return academicWorkflowSteps[currentIndex - 1];
}

export function calculateAcademicWorkflowProgress(
  snapshot: WorkflowSnapshot,
): AcademicWorkflowProgress {
  return {
    "perfil-egreso": snapshot.perfiles.length > 0,
    "proposito-formacion": snapshot.propositos.length > 0,
    "competencias-ra": snapshot.competencias.length > 0,
    "mapeo-competencias": snapshot.mapeos.length > 0,
    ciclo: snapshot.ciclos.length > 0,
    "asignar-ra": hasCompleteAsignarRaWorkflow(
      snapshot.ciclos,
      snapshot.mapeos,
      snapshot.competencias,
      snapshot.asignaciones,
      snapshot.cursos,
    ),
  };
}

export function getCompletedAcademicWorkflowStepsCount(
  progress: AcademicWorkflowProgress,
) {
  return academicWorkflowSteps.filter((stepKey) => Boolean(progress[stepKey])).length;
}

export function isAcademicWorkflowDataComplete(
  progress: AcademicWorkflowProgress,
) {
  return academicWorkflowSteps.every((stepKey) => Boolean(progress[stepKey]));
}

export function isWorkflowStepCompleted(
  stepKey: PanelStepKey,
  progress: AcademicWorkflowProgress,
) {
  return Boolean(progress[stepKey]);
}

export function isAcademicWorkflowStepLockedForProgress(
  stepKey: PanelStepKey,
  progress: AcademicWorkflowProgress,
  bypassLock = false,
) {
  if (
    !ENABLE_ACADEMIC_WORKFLOW_LOCK ||
    !isAcademicWorkflowStep(stepKey) ||
    bypassLock
  ) {
    return false;
  }

  const currentIndex = academicWorkflowSteps.indexOf(stepKey);

  if (currentIndex <= 0) {
    return false;
  }

  return academicWorkflowSteps
    .slice(0, currentIndex)
    .some((previousStep) => !isWorkflowStepCompleted(previousStep, progress));
}

export function getAcademicWorkflowLockedDescription(stepKey: PanelStepKey) {
  const previousStep = getPreviousAcademicWorkflowStep(stepKey);

  if (!previousStep) {
    return WORKFLOW_LOCKED_MESSAGE;
  }

  return `Primero completa ${getStepLabel(previousStep)} para continuar con ${getStepLabel(stepKey)}.`;
}
