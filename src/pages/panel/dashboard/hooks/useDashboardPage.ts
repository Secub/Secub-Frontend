import { useState } from "react";
import { ROUTES, buildRouteWithSearch } from "../../../../app/appRoutes";
import type { EnrichedCourse, EnrichedCycle, EnrichedRaResult } from "../dashboard.types";
import { useDashboardBreadcrumbs } from "./useDashboardBreadcrumbs";
import { useDashboardData } from "./useDashboardData";
import { useDashboardFilters } from "./useDashboardFilters";
import { useDashboardImprovementPlan } from "./useDashboardImprovementPlan";
import { useDashboardMetrics } from "./useDashboardMetrics";
import { useDashboardNavigation } from "./useDashboardNavigation";
import { useDashboardNotifications } from "./useDashboardNotifications";
import { useDashboardReports } from "./useDashboardReports";

export function useDashboardPage() {
  const data = useDashboardData();
  const navigation = useDashboardNavigation({
    scopedCourses: data.scopedCourses,
    scopedCycles: data.scopedCycles,
  });
  const filtersState = useDashboardFilters({
    catalogs: data.dashboardData.catalogs,
    scopedCycles: data.scopedCycles,
    onCycleSelected: (cycleId) => {
      navigation.setSelectedCycleId(cycleId);
      navigation.setDetailCourseId("");
      navigation.setDetailCompetenceId("");
    },
    onResetNavigation: navigation.resetNavigation,
  });
  const metricsState = useDashboardMetrics({
    catalogs: data.dashboardData.catalogs,
    detailCourseId: navigation.detailCourseId,
    filters: filtersState.filters,
    scopedCourses: data.scopedCourses,
    scopedCycles: data.scopedCycles,
    selectedCycleId: navigation.selectedCycleId,
  });
  const reports = useDashboardReports({
    catalogs: data.dashboardData.catalogs,
    isTeacher: data.isTeacher,
    scopedCourses: data.scopedCourses,
  });
  const improvementPlan = useDashboardImprovementPlan({
    isDirector: data.isDirector,
    user: data.user,
  });
  const notifications = useDashboardNotifications();
  const breadcrumbs = useDashboardBreadcrumbs({
    filters: filtersState.filters,
    isTeacher: data.isTeacher,
    selectedCycle: metricsState.selectedCycle,
    selectedCycleId: navigation.selectedCycleId,
    userLabel: data.user.label,
    userRole: data.user.role,
    view: navigation.view,
  });
  const [selectedRa, setSelectedRa] = useState<EnrichedRaResult | null>(null);

  const handleViewPending = (cycle: EnrichedCycle) => {
    navigation.goToPendingCourses(cycle);
    filtersState.setPendingCycleFilter(cycle);
  };

  const handleViewResultsFromCycle = (cycle: EnrichedCycle) => {
    navigation.goToCycleResults(cycle);
    filtersState.setResultsCycleFilter(cycle);
  };

  const handleViewCourseDetail = (course: EnrichedCourse) => {
    navigation.goToCourseDetail(course);
    filtersState.setCourseDetailFilter(course.cycleId);
  };

  const handleMeasureCourse = (course: EnrichedCourse) => {
    window.location.href = buildRouteWithSearch(ROUTES.panelMedicionRa, {
      role: "docente",
      courseId: course.id,
    });
  };

  return {
    ...data,
    ...navigation,
    ...filtersState,
    ...metricsState,
    ...reports,
    ...improvementPlan,
    ...notifications,
    ...breadcrumbs,
    selectedRa,
    setSelectedRa,
    handleViewPending,
    handleViewResultsFromCycle,
    handleViewCourseDetail,
    handleMeasureCourse,
  };
}
