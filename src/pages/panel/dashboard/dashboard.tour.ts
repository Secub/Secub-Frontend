// Destinos del tour guiado del dashboard. Los componentes los renderizan y los hooks de
// tour los apuntan: ambos lados importan de aca para que no se desincronicen.

// Elementos que aparecen una sola vez por vista: se apuntan por id.
export const DASHBOARD_TOUR_IDS = {
  coursesFilters: "dashboard-courses-filters",
  coursesTable: "dashboard-courses-view-table",
  detailFilters: "dashboard-detail-filters",
  detailCharts: "dashboard-detail-charts",
  detailTable: "dashboard-detail-table",
  detailSupport: "dashboard-detail-support",
  detailImprovement: "dashboard-detail-improvement",
  resultsSummary: "dashboard-results-summary",
  resultsCompetence: "dashboard-results-competence",
} as const;

// Elementos que se repiten (una fila, un bloque por RA): se marcan con un atributo y el
// tour apunta al primero renderizado, sin generar ids duplicados.
const TOUR_MARKER_ATTRIBUTE = "data-dashboard-tour";

export const DASHBOARD_TOUR_MARKERS = {
  courseAction: "course-action",
  resultsRaTable: "results-ra-table",
  resultsSupport: "results-support",
} as const;

type DashboardTourMarker = (typeof DASHBOARD_TOUR_MARKERS)[keyof typeof DASHBOARD_TOUR_MARKERS];

export function tourMarker(marker: DashboardTourMarker) {
  return { [TOUR_MARKER_ATTRIBUTE]: marker };
}

export function tourMarkerSelector(marker: DashboardTourMarker) {
  return `[${TOUR_MARKER_ATTRIBUTE}="${marker}"]`;
}
