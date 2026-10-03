import { httpClient } from "../infrastructure/api";
import type { AcademicWorkflowProgress } from "../components/panel/academicWorkflow.rules";

export function getWorkflowStatus(signal?: AbortSignal) {
  return httpClient.get<AcademicWorkflowProgress>("/workflow/status", { signal });
}
