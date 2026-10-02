import { useEffect, useState } from "react";
import { subscribeToMockBackendChanges } from "../../../../services/mockBackend";
import { getMeasurementContext, type MeasurementContext } from "../../../../services/measurements";
import { getCurrentDashboardUser, getDashboardData } from "../dashboard.mock";
import { buildDashboardDataFromApi } from "../dashboard.api";
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
  const [measurementContext, setMeasurementContext] = useState<MeasurementContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => subscribeToMockBackendChanges(() => setBackendVersion((current) => current + 1)), []);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError("");
    void getMeasurementContext(controller.signal)
      .then(setMeasurementContext)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLoadError(error instanceof Error ? error.message : "No fue posible cargar el estado del ciclo.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const user = getCurrentDashboardUser();
  void backendVersion;
  const localData = getDashboardData();
  const dashboardData = measurementContext
    ? buildDashboardDataFromApi(measurementContext, localData)
    : localData;
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
    isLoading,
    loadError,
  };
}
