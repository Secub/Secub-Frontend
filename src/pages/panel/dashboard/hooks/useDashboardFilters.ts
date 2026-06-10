import { useState } from "react";
import type { DashboardCatalogs, DashboardFiltersState, EnrichedCycle } from "../dashboard.types";
import {
  INITIAL_DASHBOARD_FILTERS,
  syncDashboardFiltersByCycle,
  syncDashboardFiltersByPlan,
} from "../dashboard.utils";
import { getSearchParam } from "./useDashboardBreadcrumbs";

export function getInitialFilters(): DashboardFiltersState {
  return {
    ...INITIAL_DASHBOARD_FILTERS,
    cycleId: getSearchParam("cycleId"),
    status: getSearchParam("status"),
  };
}

export function useDashboardFilters({
  catalogs,
  scopedCycles,
  onCycleSelected,
  onResetNavigation,
}: {
  catalogs: DashboardCatalogs;
  scopedCycles: EnrichedCycle[];
  onCycleSelected: (cycleId: string) => void;
  onResetNavigation: () => void;
}) {
  const [filters, setFilters] = useState<DashboardFiltersState>(getInitialFilters);

  const handleFilterChange = <K extends keyof DashboardFiltersState>(key: K, value: DashboardFiltersState[K]) => {
    setFilters((current) => {
      const next = { ...current, [key]: value };

      if (key === "seccionalId") {
        next.facultadId = "";
        next.programaId = "";
        next.planId = "";
        next.cycleId = "";
      }

      if (key === "facultadId") {
        next.programaId = "";
        next.planId = "";
        next.cycleId = "";
      }

      if (key === "programaId") {
        next.planId = "";
        next.cycleId = "";
      }

      if (key === "planId") return syncDashboardFiltersByPlan(next, String(value), catalogs);

      if (key === "cycleId") {
        const cycle = scopedCycles.find((item) => item.id === String(value));
        if (cycle) return syncDashboardFiltersByCycle(next, cycle);
      }

      return next;
    });

    if (key === "cycleId") {
      onCycleSelected(String(value));
    }
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_DASHBOARD_FILTERS);
    onResetNavigation();
  };

  const setPendingCycleFilter = (cycle: EnrichedCycle) => {
    setFilters((current) => ({
      ...current,
      cycleId: cycle.id,
      status: "pendiente",
      competenceId: "",
      teacherId: "",
    }));
  };

  const setResultsCycleFilter = (cycle: EnrichedCycle) => {
    setCourseDetailFilter(cycle.id);
  };

  const setCourseDetailFilter = (cycleId: string) => {
    setFilters((current) => ({
      ...current,
      cycleId,
      status: "",
      competenceId: "",
      teacherId: "",
    }));
  };

  return {
    filters,
    setFilters,
    handleFilterChange,
    handleResetFilters,
    setPendingCycleFilter,
    setResultsCycleFilter,
    setCourseDetailFilter,
  };
}
