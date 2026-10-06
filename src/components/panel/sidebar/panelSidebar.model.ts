import type { PanelStepKey } from "../panelNavigation";
import type { AcademicWorkflowProgress } from "../academicWorkflow.rules";

export const academicStepKeys: PanelStepKey[] = [
  "perfil-egreso", "proposito-formacion", "competencias-ra",
  "mapeo-competencias", "ciclo", "asignar-ra",
];

export const decanoAcademicStepKeys: PanelStepKey[] = [
  "perfil-egreso", "proposito-formacion", "competencias-ra", "mapeo-competencias",
];

export const viceAcademicStepKeys: PanelStepKey[] = [...academicStepKeys];

export const docenteAcademicStepKeys: PanelStepKey[] = [
  "perfil-egreso", "proposito-formacion", "competencias-ra", "medicion-ra",
];

export function isDocenteProgressStep(stepKey: PanelStepKey) {
  return stepKey === "medicion-ra";
}

export function getDocenteMeasurementProgress(progress: AcademicWorkflowProgress) {
  const isCompleted = Boolean(progress["medicion-ra"]);
  return { completed: isCompleted ? 1 : 0, total: 1, isCompleted };
}

export function getStepStatusLabel({ isCurrent, isCompleted, isInherited, isLocked }: {
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
