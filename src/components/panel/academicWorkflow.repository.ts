import { getCurrentUser } from "../../services/auth/currentUser";
import { getStoredAuthSession } from "../../services/auth/session";
import type { PanelStepKey } from "./panelNavigation";
import {
  isAcademicWorkflowDataComplete,
  isAcademicWorkflowStepLockedForProgress,
  type AcademicWorkflowProgress,
  type AcademicWorkflowState,
} from "./academicWorkflow.rules";

let latestProgress: AcademicWorkflowProgress = {};
let latestContextKey = '';

export function getAcademicWorkflowContextKey(): string {
  const session = getStoredAuthSession();
  return JSON.stringify([session?.user_id ?? '', session?.selected_context_id ?? '']);
}

export function readAcademicWorkflowProgress() {
  return latestContextKey === getAcademicWorkflowContextKey() ? latestProgress : {};
}

export function rememberAcademicWorkflowProgress(progress: AcademicWorkflowProgress, contextKey = getAcademicWorkflowContextKey()) {
  if (contextKey !== getAcademicWorkflowContextKey()) return;
  latestProgress = progress;
  latestContextKey = contextKey;
}

export function isAcademicWorkflowCompleted(progress: AcademicWorkflowProgress = readAcademicWorkflowProgress()) {
  return isAcademicWorkflowDataComplete(progress);
}

export function getAcademicWorkflowState(
  progress: AcademicWorkflowProgress = readAcademicWorkflowProgress(),
): AcademicWorkflowState {
  return isAcademicWorkflowDataComplete(progress) ? "completed" : "inProgress";
}

export function completeAcademicWorkflowFromCurrentProgress(
  progress: AcademicWorkflowProgress = readAcademicWorkflowProgress(),
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
  progress: AcademicWorkflowProgress = readAcademicWorkflowProgress(),
) {
  return Boolean(progress[stepKey]);
}

export function canBypassAcademicWorkflowLock() {
  return getCurrentUser().role === "administrador";
}

export function isAcademicWorkflowStepLocked(
  stepKey: PanelStepKey,
  progress: AcademicWorkflowProgress = readAcademicWorkflowProgress(),
) {
  return isAcademicWorkflowStepLockedForProgress(stepKey, progress, canBypassAcademicWorkflowLock());
}
