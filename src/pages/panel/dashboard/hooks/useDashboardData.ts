import { useEffect, useState } from "react";
import { subscribeToMockBackendChanges } from "../../../../services/mockBackend";
import { getCurrentDashboardUser, getDashboardData } from "../dashboard.mock";
import {
  applyUserScopeToCourses,
  applyUserScopeToCycles,
  enrichCourses,
  enrichCycles,
  requestDirectorCycleCompletionNotification,
  shouldNotifyDirectorCycleCompletion,
} from "../dashboard.utils";

export function useDashboardData() {
  const [, setBackendVersion] = useState(0);

  useEffect(() => subscribeToMockBackendChanges(() => setBackendVersion((current) => current + 1)), []);

  const user = getCurrentDashboardUser();
  const dashboardData = getDashboardData();
  const isTeacher = user.role === "docente";
  const isDirector = user.role === "director";

  const enrichedCycles = enrichCycles(
    dashboardData.cycles,
    dashboardData.courses,
    dashboardData.catalogs,
  );
  const enrichedCourses = enrichCourses(
    dashboardData.courses,
    dashboardData.cycles,
    dashboardData.catalogs,
  );
  const scopedCycles = applyUserScopeToCycles(enrichedCycles, user);
  const scopedCourses = applyUserScopeToCourses(enrichedCourses, user);

  useEffect(() => {
    scopedCycles.forEach((cycle) => {
      if (shouldNotifyDirectorCycleCompletion(cycle)) {
        requestDirectorCycleCompletionNotification(cycle);
      }
    });
  }, [scopedCycles]);

  return {
    user,
    dashboardData,
    isTeacher,
    isDirector,
    scopedCycles,
    scopedCourses,
  };
}
