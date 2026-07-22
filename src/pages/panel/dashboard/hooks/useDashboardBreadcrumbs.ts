import { ROUTES } from "../../../../app/appRoutes";
import type { DashboardFiltersState, EnrichedCycle } from "../dashboard.types";
import type { DashboardView } from "../types/dashboard-page.types";
import { getBrowserSearchParams } from "../../../../shared/browser";

function getCycleLabel(cycle: EnrichedCycle | null) {
  return cycle?.name ?? "el ciclo seleccionado";
}

export function getSearchParam(name: string) {
  if (typeof window === "undefined") return "";
  return getBrowserSearchParams().get(name) ?? "";
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
  const currentParams = typeof window === "undefined" ? new URLSearchParams() : getBrowserSearchParams();
  const nextParams = new URLSearchParams();

  nextParams.set("role", currentParams.get("role") ?? userRole);

  const scenario = currentParams.get("scenario");
  if (scenario) nextParams.set("scenario", scenario);

  if (params?.view && params.view !== "control") nextParams.set("view", params.view);
  if (params?.cycleId) nextParams.set("cycleId", params.cycleId);
  if (params?.courseId) nextParams.set("courseId", params.courseId);
  if (params?.status) nextParams.set("status", params.status);

  return `${ROUTES.panelDashboard}?${nextParams.toString()}`;
}

export function useDashboardBreadcrumbs({
  filters,
  isTeacher,
  selectedCycle,
  selectedCycleId,
  userRole,
  view,
}: {
  filters: DashboardFiltersState;
  isTeacher: boolean;
  selectedCycle: EnrichedCycle | null;
  selectedCycleId: string;
  userRole: string;
  view: DashboardView;
}) {
  const layoutTitle =
    view === "courses"
      ? isTeacher
        ? "Mis cursos"
        : "Pendientes"
      : view === "detail"
        ? "Detalle"
        : view === "results"
          ? "Resultados de medición"
          : "Estado del ciclo";

  const layoutDescription =
    view === "control"
      ? "Seguimiento de ciclos, cursos y resultados de aprendizaje."
      : view === "courses"
        ? "Panel de Medición"
        : `Panel de Medición · ${getCycleLabel(selectedCycle)}`;

  const controlBreadcrumbHref = buildDashboardHref(userRole, { view: "control" });
  const coursesBreadcrumbHref = buildDashboardHref(userRole, {
    view: "courses",
    cycleId: selectedCycleId || filters.cycleId,
    status: "pendiente",
  });
  const coursesBreadcrumbLabel = isTeacher ? "Mis cursos" : "Pendientes";

  const breadcrumbItems =
    view === "control"
      ? undefined
      : view === "courses"
        ? [
            { label: "Estado del ciclo", href: controlBreadcrumbHref },
            { label: coursesBreadcrumbLabel },
          ]
        : view === "detail"
          ? [
              { label: "Estado del ciclo", href: controlBreadcrumbHref },
              { label: coursesBreadcrumbLabel, href: coursesBreadcrumbHref },
              { label: "Detalle" },
            ]
          : [
              { label: "Estado del ciclo", href: controlBreadcrumbHref },
              { label: "Resultados de medición" },
            ];

  return {
    layoutTitle,
    layoutDescription,
    breadcrumbItems,
    coursesBreadcrumbLabel,
  };
}
