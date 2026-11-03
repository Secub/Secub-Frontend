import { useCallback, useSyncExternalStore } from "react";
import { getAcademicWorkflowContextKey } from "./academicWorkflow.repository";
import { EMPTY_WORKFLOW_PROGRESS, readWorkflowSnapshot, subscribeWorkflowProgress } from "./academicWorkflow.store";

export function useAcademicWorkflowProgress() {
  const key = getAcademicWorkflowContextKey();
  const subscribe = useCallback((listener: () => void) => subscribeWorkflowProgress(key, listener), [key]);
  const snapshot = useCallback(() => readWorkflowSnapshot(key), [key]);
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY_WORKFLOW_PROGRESS);
}
