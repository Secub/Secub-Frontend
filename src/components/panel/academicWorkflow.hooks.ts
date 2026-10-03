import { useEffect, useState } from "react";
import { getWorkflowStatus } from "../../services/workflow";
import type { AcademicWorkflowProgress } from "./academicWorkflow.rules";
import { rememberAcademicWorkflowProgress } from "./academicWorkflow.repository";

const EMPTY_PROGRESS: AcademicWorkflowProgress = {};

export function useAcademicWorkflowProgress() {
  const [progress, setProgress] = useState<AcademicWorkflowProgress>(EMPTY_PROGRESS);

  useEffect(() => {
    let controller = new AbortController();
    const refresh = () => {
      controller.abort();
      controller = new AbortController();
      void getWorkflowStatus(controller.signal)
        .then((nextProgress) => {
          rememberAcademicWorkflowProgress(nextProgress);
          setProgress(nextProgress);
        })
        .catch(() => {
          if (!controller.signal.aborted) setProgress(EMPTY_PROGRESS);
        });
    };
    refresh();
    window.addEventListener("secub:workflow-changed", refresh);
    return () => {
      controller.abort();
      window.removeEventListener("secub:workflow-changed", refresh);
    };
  }, []);

  return progress;
}
