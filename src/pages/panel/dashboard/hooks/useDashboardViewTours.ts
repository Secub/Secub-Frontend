import { useOnboardingTour, type OnboardingTourStep } from "../../../../components/OnboardingTour";
import { DASHBOARD_TOUR_IDS, DASHBOARD_TOUR_MARKERS, tourMarkerSelector } from "../dashboard.tour";
import type { DashboardView } from "../types/dashboard-page.types";

export const coursesViewTourSteps: OnboardingTourStep[] = [
  {
    target: `#${DASHBOARD_TOUR_IDS.coursesFilters}`,
    title: "Filtros",
    content: "Filtra los cursos por ciclo, programa, plan, estado y los criterios disponibles para tu perfil.",
    order: 1,
  },
  {
    target: `#${DASHBOARD_TOUR_IDS.coursesTable}`,
    title: "Cursos",
    content:
      "Consulta el docente titular, el ciclo, los RA pendientes y el estado de cada curso. Puedes ordenar las columnas y buscar desde la tabla.",
    order: 2,
  },
  {
    target: `#${DASHBOARD_TOUR_IDS.coursesTable} ${tourMarkerSelector(DASHBOARD_TOUR_MARKERS.courseAction)}`,
    title: "Acciones del curso",
    content:
      "Escribe al docente de un curso pendiente con el ícono de correo o abre el detalle del curso con el ícono del ojo.",
    order: 3,
  },
];

export const detailViewTourSteps: OnboardingTourStep[] = [
  {
    target: `#${DASHBOARD_TOUR_IDS.detailFilters}`,
    title: "Filtros",
    content: "Filtra los resultados por competencia y por curso.",
    order: 1,
  },
  {
    target: `#${DASHBOARD_TOUR_IDS.detailCharts}`,
    title: "Gráficos por RA",
    content: "Compara, para cada resultado de aprendizaje medido, el porcentaje de estudiantes que aprobó y el que no.",
    order: 2,
  },
  {
    target: `#${DASHBOARD_TOUR_IDS.detailTable}`,
    title: "Resultados por RA",
    content:
      "Revisa los estudiantes, aprobados, no aprobados, cumplimiento y estado de cada RA. Haz clic en el código del RA para ver su detalle.",
    order: 3,
  },
  {
    target: `#${DASHBOARD_TOUR_IDS.detailSupport}`,
    title: "Soportes de la competencia",
    content: "Consulta el instrumento de evaluación, la evidencia y el plan de mejora, agrupados por competencia.",
    order: 4,
  },
  {
    target: `#${DASHBOARD_TOUR_IDS.detailImprovement}`,
    title: "Plan de mejora",
    content: "Muestra el análisis de resultados y las acciones propuestas para el RA seleccionado en la tabla.",
    order: 5,
  },
];

export const resultsViewTourSteps: OnboardingTourStep[] = [
  {
    target: `#${DASHBOARD_TOUR_IDS.resultsSummary}`,
    title: "Cumplimiento por competencia",
    content: "Cada gráfico muestra el porcentaje de cumplimiento de una competencia en el ciclo.",
    order: 1,
  },
  {
    target: `#${DASHBOARD_TOUR_IDS.resultsCompetence}`,
    title: "Competencias",
    content: "Abre o cierra cada competencia para ver el cumplimiento de sus resultados de aprendizaje (RA).",
    order: 2,
  },
  {
    target: tourMarkerSelector(DASHBOARD_TOUR_MARKERS.resultsRaTable),
    title: "Resultados de cada RA",
    content:
      "Consulta los cursos asociados a cada RA con su docente titular, estado y cumplimiento. Usa el ícono del ojo para abrir su detalle.",
    order: 3,
  },
  {
    target: tourMarkerSelector(DASHBOARD_TOUR_MARKERS.resultsSupport),
    title: "Soportes de la competencia",
    content:
      "Aquí encuentras el instrumento de evaluación, la evidencia y el plan de mejora, agrupados una sola vez por competencia.",
    order: 4,
  },
];

interface UseDashboardViewToursOptions {
  view: DashboardView;
  isTeacher: boolean;
  hasConsolidatedResults: boolean;
}

// Un tour por vista secundaria del dashboard (cursos, detalle y resultados). Solo el de la
// vista actual está habilitado; la vista "control" tiene sus propios tours en DashboardPage.
export function useDashboardViewTours({
  view,
  isTeacher,
  hasConsolidatedResults,
}: UseDashboardViewToursOptions) {
  // Sin datos no se renderiza ningún destino: no se ofrece el tour.
  const canShowCoursesTour = view === "courses" && !isTeacher;
  const canShowDetailTour = view === "detail";
  const canShowResultsTour = view === "results" && hasConsolidatedResults;

  // allowPartialTargets: filtros o tablas vacías no dejan al tour sin poder iniciar.
  const courses = useOnboardingTour({
    steps: coursesViewTourSteps,
    storageKey: "tour_dashboard_courses_v1",
    autoStart: canShowCoursesTour,
    enabled: canShowCoursesTour,
    allowPartialTargets: true,
  });

  const detail = useOnboardingTour({
    steps: detailViewTourSteps,
    storageKey: "tour_dashboard_detail_v1",
    autoStart: canShowDetailTour,
    enabled: canShowDetailTour,
    allowPartialTargets: true,
  });

  const results = useOnboardingTour({
    steps: resultsViewTourSteps,
    storageKey: "tour_dashboard_results_v1",
    autoStart: canShowResultsTour,
    enabled: canShowResultsTour,
    allowPartialTargets: true,
  });

  return {
    canShowViewTour: canShowCoursesTour || canShowDetailTour || canShowResultsTour,
    startViewTour: view === "courses" ? courses.startTour : view === "detail" ? detail.startTour : results.startTour,
  };
}
