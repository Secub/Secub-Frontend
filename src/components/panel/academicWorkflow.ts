import { ACADEMIC_WORKFLOW_STORAGE_KEY, ENABLE_ACADEMIC_WORKFLOW_LOCK } from "../../config/workflow.config";
import { panelNavigation, type PanelStepKey } from "./panelNavigation";

export const academicWorkflowSteps: PanelStepKey[] = [
  "perfil-egreso",
  "proposito-formacion",
  "competencias-ra",
  "mapeo-competencias",
  "ciclo",
  "asignar-ra",
];

export type AcademicWorkflowProgress = Partial<Record<PanelStepKey, boolean>>;

export const WORKFLOW_LOCKED_MESSAGE = "Primero completa el paso anterior para continuar.";

function canUseLocalStorage() {
  try {
    return typeof window !== "undefined" && "localStorage" in window;
  } catch {
    return false;
  }
}

function getStepLabel(stepKey: PanelStepKey) {
  return panelNavigation.find((item) => item.key === stepKey)?.label ?? "el paso anterior";
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

export function readAcademicWorkflowProgress(): AcademicWorkflowProgress {
  if (!canUseLocalStorage()) {
    return {};
  }

  try {
    const rawProgress = window.localStorage.getItem(ACADEMIC_WORKFLOW_STORAGE_KEY);

    if (!rawProgress) {
      return {};
    }

    return JSON.parse(rawProgress) as AcademicWorkflowProgress;
  } catch {
    return {};
  }
}

function saveAcademicWorkflowProgress(progress: AcademicWorkflowProgress) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(ACADEMIC_WORKFLOW_STORAGE_KEY, JSON.stringify(progress));
}

export function setAcademicWorkflowStepCompleted(stepKey: PanelStepKey, completed: boolean) {
  if (!isAcademicWorkflowStep(stepKey)) {
    return;
  }

  const progress = readAcademicWorkflowProgress();
  const currentIndex = academicWorkflowSteps.indexOf(stepKey);

  if (completed) {
    progress[stepKey] = true;
    saveAcademicWorkflowProgress(progress);
    return;
  }

  academicWorkflowSteps.slice(currentIndex).forEach((step) => {
    delete progress[step];
  });

  saveAcademicWorkflowProgress(progress);
}

export function isAcademicWorkflowStepCompleted(
  stepKey: PanelStepKey,
  progress: AcademicWorkflowProgress = readAcademicWorkflowProgress(),
) {
  return Boolean(progress[stepKey]);
}

export function isAcademicWorkflowStepLocked(
  stepKey: PanelStepKey,
  progress: AcademicWorkflowProgress = readAcademicWorkflowProgress(),
) {
  if (!ENABLE_ACADEMIC_WORKFLOW_LOCK || !isAcademicWorkflowStep(stepKey)) {
    return false;
  }

  const currentIndex = academicWorkflowSteps.indexOf(stepKey);

  if (currentIndex <= 0) {
    return false;
  }

  return academicWorkflowSteps
    .slice(0, currentIndex)
    .some((previousStep) => !isAcademicWorkflowStepCompleted(previousStep, progress));
}

export function getAcademicWorkflowLockedDescription(stepKey: PanelStepKey) {
  const previousStep = getPreviousAcademicWorkflowStep(stepKey);

  if (!previousStep) {
    return WORKFLOW_LOCKED_MESSAGE;
  }

  return `Primero completa ${getStepLabel(previousStep)} para continuar con ${getStepLabel(stepKey)}.`;
}
