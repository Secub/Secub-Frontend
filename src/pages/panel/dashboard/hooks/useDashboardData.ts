import { useEffect, useState } from "react";
import { getMeasurementContext, type MeasurementContext } from "../../../../services/measurements";
import { getCurrentUser } from "../../../../services/auth/currentUser";
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
  const [measurementContext, setMeasurementContext] = useState<MeasurementContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

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

  const currentUser = getCurrentUser();
  const user = {
    id: currentUser.id,
    name: currentUser.nombre,
    email: currentUser.email,
    role: currentUser.role,
    label: currentUser.cargo,
    scope: {
      seccionalId: currentUser.scope.seccionalId,
      facultadId: currentUser.scope.facultadId,
      programaId: currentUser.scope.programaId,
      planId: currentUser.scope.planId,
      docenteId: currentUser.role === "docente" ? currentUser.id : undefined,
    },
  };
  const dashboardData = measurementContext
    ? buildDashboardDataFromApi(measurementContext)
    : { catalogs: { seccionales: [], facultades: [], programas: [], planes: [], teachers: [], competences: [] }, cycles: [], courses: [] };
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
        void requestDirectorCycleCompletionNotification(cycle).catch(() => undefined);
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
