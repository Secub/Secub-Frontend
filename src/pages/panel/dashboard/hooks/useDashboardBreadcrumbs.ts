import type { DashboardFiltersState, EnrichedCycle } from "../dashboard.types";
import type { DashboardView } from "../types/dashboard-page.types";

const DASHBOARD_PATH = "/panel/dashboard";

function getCycleLabel(cycle: EnrichedCycle | null) {
  return cycle?.name ?? "el ciclo seleccionado";
}

export function getSearchParam(name: string) {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

export function getInitialView(): DashboardView {
  const view = getSearchParam("view");

  if (view === "courses" || view === "detail" || view === "results") {
    return view;
  }

  return "control";
}

export function buildDashboardHref(userRole: string, params?: {
  view?: DashboardView;
  cycleId?: string;
  courseId?: string;
  status?: string;
}) {
  const currentParams = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
  const nextParams = new URLSearchParams();

  nextParams.set("role", currentParams.get("role") ?? userRole);

  const scenario = currentParams.get("scenario");
  if (scenario) nextParams.set("scenario", scenario);

  if (params?.view && params.view !== "control") nextParams.set("view", params.view);
  if (params?.cycleId) nextParams.set("cycleId", params.cycleId);
  if (params?.courseId) nextParams.set("courseId", params.courseId);
  if (params?.status) nextParams.set("status", params.status);

  return `${DASHBOARD_PATH}?${nextParams.toString()}`;
}

export function useDashboardBreadcrumbs({
  filters,
  isTeacher,
  selectedCycle,
  selectedCycleId,
  userLabel,
  userRole,
  view,
}: {
  filters: DashboardFiltersState;
  isTeacher: boolean;
  selectedCycle: EnrichedCycle | null;
  selectedCycleId: string;
  userLabel: string;
  userRole: string;
  view: DashboardView;
}) {
  const layoutTitle =
    view === "courses"
      ? isTeacher
        ? "Mis Cursos"
        : "Ciclos"
      : view === "detail"
        ? "Ver Detalle"
        : view === "results"
          ? "Resultados de Medición"
          : "Panel de Control";

  const layoutDescription =
    view === "control"
      ? `${userLabel} - Usuario`
      : view === "courses"
        ? "Panel de Medición"
        : `Panel de Medición · ${getCycleLabel(selectedCycle)}`;

  const controlBreadcrumbHref = buildDashboardHref(userRole, { view: "control" });
  const coursesBreadcrumbHref = buildDashboardHref(userRole, {
    view: "courses",
    cycleId: selectedCycleId || filters.cycleId,
    status: "pendiente",
  });
  const coursesBreadcrumbLabel = isTeacher ? "Mis cursos" : "Cursos pendientes";

  const breadcrumbItems =
    view === "control"
      ? [{ label: "Panel de control" }]
      : view === "courses"
        ? [
            { label: "Panel de control", href: controlBreadcrumbHref },
            { label: coursesBreadcrumbLabel },
          ]
        : view === "detail"
          ? [
              { label: "Panel de control", href: controlBreadcrumbHref },
              { label: coursesBreadcrumbLabel, href: coursesBreadcrumbHref },
              { label: "Ver detalle" },
            ]
          : [
              { label: "Panel de control", href: controlBreadcrumbHref },
              { label: "Resultados de medición" },
            ];

  return {
    layoutTitle,
    layoutDescription,
    breadcrumbItems,
    coursesBreadcrumbLabel,
  };
}
