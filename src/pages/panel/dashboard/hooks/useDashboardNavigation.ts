import { useCallback, useEffect, useState } from "react";
import { APP_NAVIGATION_EVENT, navigateToRoute } from "../../../../app/appRoutes";
import type { EnrichedCourse, EnrichedCycle } from "../dashboard.types";
import type { DashboardView } from "../types/dashboard-page.types";
import { buildDashboardHref, getInitialView, getSearchParam } from "./useDashboardBreadcrumbs";

function getUrlNavigationState() {
  return {
    view: getInitialView(),
    selectedCycleId: getSearchParam("cycleId"),
    detailCourseId: getSearchParam("courseId"),
  };
}

export function useDashboardNavigation({
  scopedCourses,
  scopedCycles,
  userRole,
}: {
  scopedCourses: EnrichedCourse[];
  scopedCycles: EnrichedCycle[];
  userRole: string;
}) {
  const initialNavigation = getUrlNavigationState();
  const [view, setView] = useState<DashboardView>(initialNavigation.view);
  const [selectedCycleId, setSelectedCycleId] = useState(initialNavigation.selectedCycleId);
  const [detailCourseId, setDetailCourseId] = useState(initialNavigation.detailCourseId);
  const [detailCompetenceId, setDetailCompetenceId] = useState("");

  const syncNavigationWithUrl = useCallback(() => {
    const nextNavigation = getUrlNavigationState();
    setView(nextNavigation.view);
    setSelectedCycleId(nextNavigation.selectedCycleId);
    setDetailCourseId(nextNavigation.detailCourseId);
    setDetailCompetenceId("");
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", syncNavigationWithUrl);
    window.addEventListener(APP_NAVIGATION_EVENT, syncNavigationWithUrl);

    return () => {
      window.removeEventListener("popstate", syncNavigationWithUrl);
      window.removeEventListener(APP_NAVIGATION_EVENT, syncNavigationWithUrl);
    };
  }, [syncNavigationWithUrl]);

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

  const navigateToDashboardView = useCallback(
    (params?: { view?: DashboardView; cycleId?: string; courseId?: string; status?: string }) => {
      navigateToRoute(buildDashboardHref(userRole, params));
    },
    [userRole],
  );

  const goToPendingCourses = (cycle: EnrichedCycle) => {
    setSelectedCycleId(cycle.id);
    setDetailCourseId("");
    setDetailCompetenceId("");
    setView("courses");
    navigateToDashboardView({ view: "courses", cycleId: cycle.id, status: "pendiente" });
  };

  const goToCycleResults = (cycle: EnrichedCycle) => {
    setSelectedCycleId(cycle.id);
    setDetailCourseId("");
    setDetailCompetenceId("");
    setView("results");
    navigateToDashboardView({ view: "results", cycleId: cycle.id });
  };

  const goToCourseDetail = (course: EnrichedCourse) => {
    setSelectedCycleId(course.cycleId);
    setDetailCourseId(course.id);
    setDetailCompetenceId("");
    setView("detail");
    navigateToDashboardView({ view: "detail", cycleId: course.cycleId, courseId: course.id });
  };

  const selectDetailCourse = (courseId: string) => {
    setDetailCourseId(courseId);
    setDetailCompetenceId("");
    navigateToDashboardView({ view: "detail", cycleId: selectedCycleId, courseId });
  };

  const goBackToControl = () => {
    setDetailCourseId("");
    setDetailCompetenceId("");
    setView("control");
    navigateToDashboardView({ view: "control" });
  };

  const goBackToCourses = () => {
    setDetailCourseId("");
    setDetailCompetenceId("");
    setView("courses");
    navigateToDashboardView({ view: "courses", cycleId: selectedCycleId, status: "pendiente" });
  };

  const resetNavigation = () => {
    setSelectedCycleId("");
    setDetailCourseId("");
    setDetailCompetenceId("");
    setView("control");
    navigateToDashboardView({ view: "control" });
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
    selectDetailCourse,
    goBackToControl,
    goBackToCourses,
    resetNavigation,
  };
}
