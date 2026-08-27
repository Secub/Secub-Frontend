import type { getCurrentMockUser } from "../../../services/auth/mockUser";
import { mockBackend } from "../../../services/mockBackend";
import type { MedicionRaDemoState } from "../../../pages/panel/medicion-ra/types/medicionRA.persistence.types";
import { buildCoursesFromRealAssignments } from "../../../pages/panel/medicion-ra/utils/medicionRA.assignments";
import { buildMedicionRaDemoStateId } from "../../../pages/panel/medicion-ra/utils/medicionRA.persistence";
import type { PanelStepKey } from "../panelNavigation";

export const academicStepKeys: PanelStepKey[] = [
  "perfil-egreso",
  "proposito-formacion",
  "competencias-ra",
  "mapeo-competencias",
  "ciclo",
  "asignar-ra",
];

export const decanoAcademicStepKeys: PanelStepKey[] = [
  "perfil-egreso",
  "proposito-formacion",
  "competencias-ra",
  "mapeo-competencias",
];

export const viceAcademicStepKeys: PanelStepKey[] = [
  "perfil-egreso",
  "proposito-formacion",
  "competencias-ra",
  "mapeo-competencias",
  "ciclo",
  "asignar-ra",
];

export const docenteAcademicStepKeys: PanelStepKey[] = [
  "perfil-egreso",
  "proposito-formacion",
  "competencias-ra",
  "medicion-ra",
];

export function isDocenteProgressStep(stepKey: PanelStepKey) {
  return stepKey === "medicion-ra";
}

export function getDocenteMeasurementProgress(
  user: ReturnType<typeof getCurrentMockUser>,
) {
  const assignedCourses = buildCoursesFromRealAssignments(user);
  const completedCourses = assignedCourses.filter((course) => {
    const stateId = buildMedicionRaDemoStateId({
      userId: user.id,
      cicloId: course.cycleId,
      courseId: course.id,
    });
    const state = mockBackend.getById<MedicionRaDemoState>("medicionesRa", stateId, user);
    const measuredAssignmentIds = new Set(state?.asignacionRaIds ?? []);
    const currentAssignmentIds = course.assignmentIds ?? [];
    const coversCurrentAssignments =
      currentAssignmentIds.length > 0 &&
      currentAssignmentIds.every((assignmentId) => measuredAssignmentIds.has(assignmentId));

    return Boolean((state?.completed || state?.isEvaluationLocked) && coversCurrentAssignments);
  }).length;
  const isCompleted = assignedCourses.length > 0 && completedCourses === assignedCourses.length;

  return {
    completed: isCompleted ? 1 : 0,
    total: 1,
    isCompleted,
  };
}

export function getStepStatusLabel({
  isCurrent,
  isCompleted,
  isInherited,
  isLocked,
}: {
  isCurrent: boolean;
  isCompleted: boolean;
  isInherited: boolean;
  isLocked: boolean;
}) {
  if (isLocked) return "Bloqueado";
  if (isInherited) return "Heredado";
  if (isCompleted) return "Completado";
  if (isCurrent) return "Paso actual";
  return "Pendiente";
}
