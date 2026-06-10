import { useEffect, useState } from "react";
import type { EnrichedCourse, EnrichedCycle } from "../dashboard.types";
import type { DashboardView } from "../types/dashboard-page.types";
import { getInitialView, getSearchParam } from "./useDashboardBreadcrumbs";

export function useDashboardNavigation({
  scopedCourses,
  scopedCycles,
}: {
  scopedCourses: EnrichedCourse[];
  scopedCycles: EnrichedCycle[];
}) {
  const [view, setView] = useState<DashboardView>(getInitialView);
  const [selectedCycleId, setSelectedCycleId] = useState(() => getSearchParam("cycleId"));
  const [detailCourseId, setDetailCourseId] = useState(() => getSearchParam("courseId"));
  const [detailCompetenceId, setDetailCompetenceId] = useState("");

  useEffect(() => {
    if (selectedCycleId && !scopedCycles.some((cycle) => cycle.id === selectedCycleId)) {
      setSelectedCycleId("");
    }
  }, [scopedCycles, selectedCycleId]);

  useEffect(() => {
    if (detailCourseId && !scopedCourses.some((course) => course.id === detailCourseId)) {
      setDetailCourseId("");
    }
  }, [detailCourseId, scopedCourses]);

  const goToPendingCourses = (cycle: EnrichedCycle) => {
    setSelectedCycleId(cycle.id);
    setDetailCourseId("");
    setDetailCompetenceId("");
    setView("courses");
  };

  const goToCycleResults = (cycle: EnrichedCycle) => {
    setSelectedCycleId(cycle.id);
    setDetailCourseId("");
    setDetailCompetenceId("");
    setView("results");
  };

  const goToCourseDetail = (course: EnrichedCourse) => {
    setSelectedCycleId(course.cycleId);
    setDetailCourseId(course.id);
    setDetailCompetenceId("");
    setView("detail");
  };

  const resetNavigation = () => {
    setSelectedCycleId("");
    setDetailCourseId("");
    setDetailCompetenceId("");
  };

  return {
    view,
    selectedCycleId,
    detailCourseId,
    detailCompetenceId,
    setView,
    setSelectedCycleId,
    setDetailCourseId,
    setDetailCompetenceId,
    goToPendingCourses,
    goToCycleResults,
    goToCourseDetail,
    resetNavigation,
  };
}
