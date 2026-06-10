import { useEffect, useMemo, useState } from "react";
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
  const [backendVersion, setBackendVersion] = useState(0);

  useEffect(() => subscribeToMockBackendChanges(() => setBackendVersion((current) => current + 1)), []);

  const user = useMemo(() => getCurrentDashboardUser(), [backendVersion]);
  const dashboardData = useMemo(() => getDashboardData(), [backendVersion]);
  const isTeacher = user.role === "docente";
  const isDirector = user.role === "director";

  const enrichedCycles = useMemo(
    () => enrichCycles(dashboardData.cycles, dashboardData.courses, dashboardData.catalogs),
    [dashboardData],
  );

  const enrichedCourses = useMemo(
    () => enrichCourses(dashboardData.courses, dashboardData.cycles, dashboardData.catalogs),
    [dashboardData],
  );

  const scopedCycles = useMemo(
    () => applyUserScopeToCycles(enrichedCycles, user),
    [enrichedCycles, user],
  );

  const scopedCourses = useMemo(
    () => applyUserScopeToCourses(enrichedCourses, user),
    [enrichedCourses, user],
  );

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
