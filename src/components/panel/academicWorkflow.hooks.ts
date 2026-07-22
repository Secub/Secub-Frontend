import { useEffect, useState } from "react";
import {
  getActiveAcademicPlanInstance,
  listArchivedAcademicPlanInstances,
  subscribeToMockBackendChanges,
  type AcademicPlanInstance,
} from "../../services/mockBackend";
import {
  readAcademicWorkflowProgress,
  type AcademicWorkflowProgress,
} from "./academicWorkflow.data";

export function useAcademicPlanInfo() {
  const [activePlan, setActivePlan] = useState<AcademicPlanInstance>(() => getActiveAcademicPlanInstance());
  const [archivedPlans, setArchivedPlans] = useState<AcademicPlanInstance[]>(() =>
    listArchivedAcademicPlanInstances(),
  );

  useEffect(() => {
    const refreshPlanInfo = () => {
      setActivePlan(getActiveAcademicPlanInstance());
      setArchivedPlans(listArchivedAcademicPlanInstances());
    };

    refreshPlanInfo();
    return subscribeToMockBackendChanges(refreshPlanInfo);
  }, []);

  return { activePlan, archivedPlans };
}


export function useAcademicWorkflowProgress() {
  const [progress, setProgress] = useState<AcademicWorkflowProgress>(() =>
    readAcademicWorkflowProgress(),
  );

  useEffect(() => {
    const refreshProgress = () => {
      const nextProgress = readAcademicWorkflowProgress();
      setProgress(nextProgress);

    };

    refreshProgress();
    return subscribeToMockBackendChanges(refreshProgress);
  }, []);

  return progress;
}
