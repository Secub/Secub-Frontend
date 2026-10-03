import { getCurrentUser } from "../../services/auth/currentUser";
import type { PanelStepKey } from "./panelNavigation";
import {
  isAcademicWorkflowDataComplete,
  isAcademicWorkflowStepLockedForProgress,
  type AcademicWorkflowProgress,
  type AcademicWorkflowState,
} from "./academicWorkflow.rules";

let latestProgress: AcademicWorkflowProgress = {};

export function readAcademicWorkflowProgress() {
  return latestProgress;
}

export function rememberAcademicWorkflowProgress(progress: AcademicWorkflowProgress) {
  latestProgress = progress;
}

export function isAcademicWorkflowCompleted(progress: AcademicWorkflowProgress = latestProgress) {
  return isAcademicWorkflowDataComplete(progress);
}

export function getAcademicWorkflowState(
  progress: AcademicWorkflowProgress = latestProgress,
): AcademicWorkflowState {
  return isAcademicWorkflowDataComplete(progress) ? "completed" : "inProgress";
}

export function completeAcademicWorkflowFromCurrentProgress(
  progress: AcademicWorkflowProgress = latestProgress,
) {
  if (getCurrentUser().role !== "director" || !isAcademicWorkflowDataComplete(progress)) return null;
  return { completed: true };
}

export function isAcademicWorkflowBaseStepInherited(_stepKey: PanelStepKey) {
  return false;
}

export function getNewAcademicPlanRenewalAvailability() {
  return {
    isAvailable: false,
    lockedMessage: "La renovación del plan académico se habilitará desde el servicio institucional.",
  };
}

export function startNewAcademicPlanFromCurrentProgress() {
  throw new Error("La renovación del plan académico se habilitará desde el servicio institucional.");
}

export function setAcademicWorkflowStepCompleted(_stepKey: PanelStepKey, _completed: boolean) {}

export function isAcademicWorkflowStepCompleted(
  stepKey: PanelStepKey,
  progress: AcademicWorkflowProgress = latestProgress,
) {
  return Boolean(progress[stepKey]);
}

export function canBypassAcademicWorkflowLock() {
  return getCurrentUser().role === "administrador";
}

export function isAcademicWorkflowStepLocked(
  stepKey: PanelStepKey,
  progress: AcademicWorkflowProgress = latestProgress,
) {
  return isAcademicWorkflowStepLockedForProgress(stepKey, progress, canBypassAcademicWorkflowLock());
}
