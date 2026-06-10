import { useMemo } from "react";
import type {
  DashboardCatalogs,
  DashboardFiltersState,
  EnrichedCourse,
  EnrichedCycle,
} from "../dashboard.types";
import {
  applyDashboardFiltersToCourses,
  applyDashboardFiltersToCycles,
  getDashboardMetrics,
  getRaResultsForCourses,
} from "../dashboard.utils";

export function useDashboardMetrics({
  catalogs,
  detailCourseId,
  filters,
  scopedCourses,
  scopedCycles,
  selectedCycleId,
}: {
  catalogs: DashboardCatalogs;
  detailCourseId: string;
  filters: DashboardFiltersState;
  scopedCourses: EnrichedCourse[];
  scopedCycles: EnrichedCycle[];
  selectedCycleId: string;
}) {
  const filteredCycles = useMemo(
    () => applyDashboardFiltersToCycles(scopedCycles, filters),
    [filters, scopedCycles],
  );

  const filteredCourses = useMemo(
    () => applyDashboardFiltersToCourses(scopedCourses, filters),
    [filters, scopedCourses],
  );

  const selectedCycle = useMemo(() => {
    const requestedCycleId = selectedCycleId || filters.cycleId;
    if (!requestedCycleId) return null;
    return scopedCycles.find((cycle) => cycle.id === requestedCycleId) ?? null;
  }, [filters.cycleId, scopedCycles, selectedCycleId]);

  const coursesForSelectedView = useMemo(() => {
    if (!selectedCycle) return filteredCourses;
    return filteredCourses.filter((course) => course.cycleId === selectedCycle.id);
  }, [filteredCourses, selectedCycle]);

  const detailSourceCourses = useMemo(() => {
    if (detailCourseId) return scopedCourses.filter((course) => course.id === detailCourseId);
    if (selectedCycle) return scopedCourses.filter((course) => course.cycleId === selectedCycle.id);
    return scopedCourses;
  }, [detailCourseId, scopedCourses, selectedCycle]);

  const detailCoursesForSelect = useMemo(() => {
    if (selectedCycle) return scopedCourses.filter((course) => course.cycleId === selectedCycle.id);
    return scopedCourses;
  }, [scopedCourses, selectedCycle]);

  const detailResults = useMemo(
    () => getRaResultsForCourses(detailSourceCourses, catalogs),
    [detailSourceCourses, catalogs],
  );

  const consolidatedSourceCourses = useMemo(() => {
    if (selectedCycle) return scopedCourses.filter((course) => course.cycleId === selectedCycle.id);
    return filteredCourses;
  }, [filteredCourses, scopedCourses, selectedCycle]);

  const consolidatedResults = useMemo(
    () => getRaResultsForCourses(consolidatedSourceCourses, catalogs),
    [consolidatedSourceCourses, catalogs],
  );

  const metrics = useMemo(() => getDashboardMetrics(scopedCourses, scopedCycles), [scopedCourses, scopedCycles]);

  return {
    filteredCycles,
    filteredCourses,
    selectedCycle,
    coursesForSelectedView,
    detailCoursesForSelect,
    detailResults,
    consolidatedResults,
    metrics,
  };
}
