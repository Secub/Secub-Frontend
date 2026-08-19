import { getCurrentMockUser } from "../../services/auth/mockUser";
import { canStartAcademicPlan } from "../../config/access/permissions";
import {
  createNewAcademicPlanInstance,
  getAcademicPlanRenewalAvailability,
  getActiveAcademicPlanInstance,
  markActiveAcademicPlanCompleted,
  mockBackend,
  type AcademicPlanInstance,
} from "../../services/mockBackend";
import { getCicloCatalogs } from "../../pages/panel/ciclo/ciclo.mock";
import { isCompetenciaRaValidByLearningResults } from "../../utils/learningResultsRules";
import type { PanelStepKey } from "./panelNavigation";
import {
  academicWorkflowSteps,
  calculateAcademicWorkflowProgress,
  getCompletedAcademicWorkflowStepsCount,
  inheritedAcademicBaseSteps,
  isAcademicWorkflowDataComplete,
  isAcademicWorkflowStepLockedForProgress,
  isActiveAcademicRecord,
  isAsignacionRaLinkedToCiclo,
  isCompetenciasRaLinkedToProposito,
  isCicloLinkedToMapeo,
  isMapeoCompetenciasLinkedToCompetencias,
  isPerfilEgresoComplete,
  isPropositoFormacionLinkedToPerfil,
  type AcademicRecord,
  type AcademicWorkflowProgress,
  type AcademicWorkflowState,
  type WorkflowSnapshot,
} from "./academicWorkflow.rules";

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasValue(value: unknown) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
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

  return Boolean(recordProgramId && relatedProgramId && recordProgramId === relatedProgramId);
}

function hasRelatedRecord(
  record: AcademicRecord,
  relatedRecords: AcademicRecord[],
  relationField?: keyof AcademicRecord,
) {
  if (!relatedRecords.length) return false;

  if (relationField) {
    const relationValue = record[relationField];
    const relatedIds = new Set(relatedRecords.map((relatedRecord) => relatedRecord.id));

    if (typeof relationValue === "string" && relatedIds.has(relationValue)) return true;
    if (Array.isArray(relationValue) && relationValue.some((value) => typeof value === "string" && relatedIds.has(value))) {
      return true;
    }
  }

  return relatedRecords.some((relatedRecord) => isSameAcademicScope(record, relatedRecord));
}

export function readWorkflowSnapshot(): WorkflowSnapshot {
  const user = getCurrentMockUser();
  const perfiles = mockBackend.list<AcademicRecord>("perfilEgreso", user).filter(isPerfilEgresoComplete);
  const propositos = mockBackend
    .list<AcademicRecord>("propositosFormacion", user)
    .filter((record) => isPropositoFormacionLinkedToPerfil(record, perfiles));
  const competenciasCandidatas = mockBackend
    .list<AcademicRecord>("competenciasRa", user)
    .filter(
      (record) =>
        isActiveAcademicRecord(record) &&
        hasValue(record.seccionalId) &&
        hasValue(record.programaId) &&
        hasValue(record.planId) &&
        (hasText(record.nombre) || hasText(record.descripcion)) &&
        hasRelatedRecord(record, propositos, "propositoFormacionId"),
    );
  const hasInvalidCompetencia = competenciasCandidatas.some(
    (record) => !isCompetenciaRaValidByLearningResults(record),
  );
  const competencias = hasInvalidCompetencia
    ? []
    : competenciasCandidatas.filter((record) =>
        isCompetenciasRaLinkedToProposito(record, propositos),
      );
  const mapeos = mockBackend
    .list<AcademicRecord>("mapeosCompetencias", user)
    .filter((record) => isMapeoCompetenciasLinkedToCompetencias(record, competencias));
  const ciclos = mockBackend
    .list<AcademicRecord>("ciclosMedicion", user)
    .filter((record) => isCicloLinkedToMapeo(record, mapeos));
  const asignaciones = mockBackend
    .list<AcademicRecord>("asignacionesRa", user)
    .filter((record) => isAsignacionRaLinkedToCiclo(record, ciclos));
  const cursos = getCicloCatalogs(user).cursos.map((curso) => ({
    id: curso.id,
    nucleo: curso.nucleo,
    asignadoANucleoSintesis: curso.asignadoANucleoSintesis,
  }));

  return { perfiles, propositos, competencias, mapeos, ciclos, asignaciones, cursos };
}

export function readAcademicWorkflowProgress(): AcademicWorkflowProgress {
  return calculateAcademicWorkflowProgress(readWorkflowSnapshot());
}

export function isAcademicWorkflowCompleted(
  progress: AcademicWorkflowProgress = readAcademicWorkflowProgress(),
) {
  const activePlan = getActiveAcademicPlanInstance();
  return activePlan.status === "completed" && isAcademicWorkflowDataComplete(progress);
}

export function getAcademicWorkflowState(
  progress: AcademicWorkflowProgress = readAcademicWorkflowProgress(),
): AcademicWorkflowState {
  const activePlan = getActiveAcademicPlanInstance();

  if (activePlan.status === "completed" && isAcademicWorkflowDataComplete(progress)) {
    return "completed";
  }

  return activePlan.status === "newAcademicPlan" ? "newAcademicPlan" : "inProgress";
}

export function completeAcademicWorkflowFromCurrentProgress(
  progress: AcademicWorkflowProgress = readAcademicWorkflowProgress(),
) {
  if (getCurrentMockUser().role !== "director") return null;
  if (!isAcademicWorkflowDataComplete(progress)) return null;

  return markActiveAcademicPlanCompleted({
    completedStepCount: academicWorkflowSteps.length,
    totalStepCount: academicWorkflowSteps.length,
  });
}

function buildInheritedRecordId(entityKey: string, newPlanId: string, sourceRecordId: string) {
  return `${entityKey}-heredado-${newPlanId}-${sourceRecordId}`;
}

function cloneInheritedAcademicBaseRecords(
  newPlan: AcademicPlanInstance,
  snapshot: WorkflowSnapshot,
) {
  const user = getCurrentMockUser();
  const now = newPlan.createdAt ?? new Date().toISOString();
  const sourcePlanId = newPlan.inheritedBaseFromPlanId ?? newPlan.sourcePlanId;
  const clonedPerfilIds = new Map<string, string>();

  snapshot.perfiles.forEach((record) => {
    const inheritedRecordId = buildInheritedRecordId("perfil-egreso", newPlan.id, record.id);
    clonedPerfilIds.set(record.id, inheritedRecordId);

    mockBackend.create<AcademicRecord>(
      "perfilEgreso",
      {
        ...record,
        id: inheritedRecordId,
        academicPlanInstanceId: newPlan.id,
        inheritedFromAcademicPlanInstanceId: sourcePlanId,
        inheritedFromRecordId: record.id,
        isInheritedAcademicBase: true,
        readonlyInherited: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: undefined,
      },
      user,
    );
  });

  snapshot.propositos.forEach((record) => {
    const inheritedRecordId = buildInheritedRecordId("proposito-formacion", newPlan.id, record.id);
    const inheritedPerfilId = record.perfilEgresoId
      ? clonedPerfilIds.get(record.perfilEgresoId)
      : undefined;

    mockBackend.create<AcademicRecord>(
      "propositosFormacion",
      {
        ...record,
        id: inheritedRecordId,
        perfilEgresoId: inheritedPerfilId ?? record.perfilEgresoId,
        academicPlanInstanceId: newPlan.id,
        inheritedFromAcademicPlanInstanceId: sourcePlanId,
        inheritedFromRecordId: record.id,
        isInheritedAcademicBase: true,
        readonlyInherited: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: undefined,
      },
      user,
    );
  });
}

export function getNewAcademicPlanRenewalAvailability(
  progress: AcademicWorkflowProgress = readAcademicWorkflowProgress(),
) {
  const activePlan = getActiveAcademicPlanInstance();
  const planForValidation: AcademicPlanInstance = {
    ...activePlan,
    status: isAcademicWorkflowCompleted(progress)
      ? "completed"
      : activePlan.status === "completed"
        ? "inProgress"
        : activePlan.status,
  };

  return getAcademicPlanRenewalAvailability(planForValidation);
}

export function isAcademicWorkflowBaseStepInherited(
  stepKey: PanelStepKey,
  activePlan: AcademicPlanInstance = getActiveAcademicPlanInstance(),
) {
  return Boolean(
    activePlan.inheritedBaseFromPlanId &&
      activePlan.inheritedStepKeys?.includes(stepKey) &&
      inheritedAcademicBaseSteps.includes(stepKey),
  );
}

export function startNewAcademicPlanFromCurrentProgress(
  progress: AcademicWorkflowProgress = readAcademicWorkflowProgress(),
) {
  const user = getCurrentMockUser();

  if (!canStartAcademicPlan(user.role)) {
    throw new Error("La operación solicitada no está disponible.");
  }

  const snapshot = readWorkflowSnapshot();
  const completedStepCount = getCompletedAcademicWorkflowStepsCount(progress);
  const isCompleted = isAcademicWorkflowCompleted(progress);
  const newPlan = createNewAcademicPlanInstance({
    status: isCompleted ? "completed" : "inProgress",
    completedStepCount,
    totalStepCount: academicWorkflowSteps.length,
    completedAt: isCompleted ? new Date().toISOString() : undefined,
  });

  cloneInheritedAcademicBaseRecords(newPlan, snapshot);
  return newPlan;
}

export function setAcademicWorkflowStepCompleted(_stepKey: PanelStepKey, _completed: boolean) {
  // Compatibilidad temporal: el progreso se calcula desde los datos relacionados.
}

export function isAcademicWorkflowStepCompleted(
  stepKey: PanelStepKey,
  progress: AcademicWorkflowProgress = readAcademicWorkflowProgress(),
) {
  return Boolean(progress[stepKey]);
}

export function canBypassAcademicWorkflowLock(user = getCurrentMockUser()) {
  return user.role === "administrador";
}

export function isAcademicWorkflowStepLocked(
  stepKey: PanelStepKey,
  progress: AcademicWorkflowProgress = readAcademicWorkflowProgress(),
) {
  return isAcademicWorkflowStepLockedForProgress(
    stepKey,
    progress,
    canBypassAcademicWorkflowLock(),
  );
}
