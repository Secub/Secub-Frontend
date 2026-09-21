import { useMemo } from "react";
import { BackButton, PanelLayout, TourReplayButton } from "../../../components/panel";
import { useOnboardingTour, type OnboardingTourStep } from "../../../components/OnboardingTour";
import CompetenceResultsPanel from "./components/CompetenceResultsPanel";
import CoursesMeasurementTable from "./components/CoursesMeasurementTable";
import DashboardEmptyState from "./components/DashboardEmptyState";
import DashboardFilters from "./components/DashboardFilters";
import DashboardModals from "./components/DashboardModals";
import MeasurementCycleCard from "./components/MeasurementCycleCard";
import MeasurementSummaryCards, {
  buildSupervisorSummaryItems,
  buildTeacherSummaryItems,
} from "./components/MeasurementSummaryCards";
import ResultsMeasurementPanel from "./components/ResultsMeasurementPanel";
import { useDashboardPage } from "./hooks/useDashboardPage";
import { simulateEvidenceDownload } from "./dashboard.utils";
import { DASHBOARD_TOUR_IDS, DASHBOARD_TOUR_MARKERS, tourMarkerSelector } from "./dashboard.tour";
import { useDashboardViewTours } from "./hooks/useDashboardViewTours";

export default function DashboardPage() {
  const dashboard = useDashboardPage();

  const teacherTourSteps = useMemo<OnboardingTourStep[]>(
    () => [
      {
        target: "#dashboard-summary-cards",
        title: "Resumen del ciclo",
        content: "Aquí ves el resumen de tus cursos: totales, completados, pendientes y tu avance general.",
        order: 1,
      },
      {
        target: "#dashboard-filters-panel",
        title: "Filtros",
        content: "Ajusta la información visible por ciclo y estado.",
        order: 2,
      },
      {
        target: "#dashboard-courses-table",
        title: "Cursos asignados",
        content: "Consulta el avance de tus cursos, mide los pendientes y abre el detalle de los completados.",
        order: 3,
      },
      {
        target: `#dashboard-courses-table ${tourMarkerSelector(DASHBOARD_TOUR_MARKERS.courseAction)}`,
        title: "Acción del curso",
        content:
          "Usa este botón para medir los Resultados de Aprendizaje pendientes de un curso o abrir su detalle si ya está completo.",
        order: 4,
      },
    ],
    []
  );

  const canShowTeacherTour = dashboard.isTeacher && dashboard.view === "control";

  const { startTour: startTeacherTour } = useOnboardingTour({
    steps: teacherTourSteps,
    storageKey: "tour_dashboard_docente_v1",
    autoStart: canShowTeacherTour,
    enabled: canShowTeacherTour,
    // Sin cursos para los filtros actuales no hay tabla ni acciones: el tour sigue con lo visible.
    allowPartialTargets: true,
  });

  const tourCyclesSnapshot = JSON.stringify(
    dashboard.filteredCycles.map(({ id, name }) => ({ id, name })),
  );
  const tourCycles = useMemo(
    () => JSON.parse(tourCyclesSnapshot) as Array<{ id: string; name: string }>,
    [tourCyclesSnapshot],
  );
  const supervisorTourSteps = useMemo<OnboardingTourStep[]>(() => {
    if (dashboard.isTeacher || dashboard.view !== "control") return [];

    const steps: OnboardingTourStep[] = [
      {
        target: "#dashboard-summary-card-1",
        title: "Ciclo activo",
        content: "Consulta cuántos ciclos tienen mediciones pendientes.",
        order: 1,
      },
      {
        target: "#dashboard-summary-card-2",
        title: "Ciclos finalizados",
        content: "Consulta cuántos ciclos completaron la medición y el plan de mejora.",
        order: 2,
      },
      {
        target: "#dashboard-summary-card-3",
        title: "Cursos pendientes",
        content: "Consulta cuántos cursos todavía tienen resultados de aprendizaje por medir.",
        order: 3,
      },
      {
        target: "#dashboard-summary-card-4",
        title: "Cursos finalizados",
        content: "Consulta cuántos cursos completaron su medición.",
        order: 4,
      },
      {
        target: "#dashboard-filters",
        title: "Filtros",
        content: "Filtra la información visible por ciclo, programa, plan, estado y los criterios disponibles para tu perfil.",
        order: 5,
      },
      ...tourCycles.map((cycle, index) => ({
        target: `#dashboard-cycle-card-${index}`,
        title: cycle.name,
        content: "Consulta el avance, el estado y las acciones disponibles para este ciclo de medición.",
        order: index + 6,
      })),
    ];

    const lastCycleIndex = tourCycles.length - 1;
    if (lastCycleIndex >= 0) {
      const actionSteps = [
        ["pending", "Ver pendientes", "Revisa los cursos que aún tienen mediciones de RA pendientes."],
        ["results", "Ver resultados", "Consulta los resultados consolidados por competencia y resultado de aprendizaje."],
        // El plan de mejora y el reporte consolidado solo existen para el director.
        ...(dashboard.isDirector
          ? ([
              ["improvement", "Plan de mejora", "Carga o actualiza el plan de mejora del ciclo cuando la medición esté completa."],
              ["report", "Descargar reporte", "Descarga el reporte consolidado cuando el ciclo y su plan de mejora estén completos."],
            ] as const)
          : []),
      ] as const;

      actionSteps.forEach(([action, title, content], index) => {
        steps.push({
          target: `#dashboard-last-cycle-${action}`,
          title,
          content,
          order: lastCycleIndex + index + 7,
        });
      });
    }

    return steps;
  }, [dashboard.isTeacher, dashboard.isDirector, dashboard.view, tourCycles]);

  const canShowSupervisorTour =
    !dashboard.isTeacher && dashboard.view === "control" && dashboard.filteredCycles.length > 0;

  const { startTour: startSupervisorTour } = useOnboardingTour({
    steps: supervisorTourSteps,
    storageKey: dashboard.isDirector ? "tour_dashboard_director_v2" : "tour_dashboard_supervisor_v1",
    autoStart: canShowSupervisorTour,
    enabled: canShowSupervisorTour,
    allowPartialTargets: true,
  });

  const { canShowViewTour, startViewTour } = useDashboardViewTours({
    view: dashboard.view,
    isTeacher: dashboard.isTeacher,
    hasConsolidatedResults: dashboard.consolidatedResults.length > 0,
  });

  if (dashboard.isTeacher && dashboard.scopedCourses.length === 0) {
    return (
      <PanelLayout
        currentStep="dashboard"
        title="Estado del ciclo"
        description="Seguimiento de ciclos, cursos y resultados de aprendizaje."
      >
        <DashboardEmptyState
          title="No tienes cursos asignados a ciclos de medición"
          description="Cuando tengas cursos de Síntesis vinculados a un ciclo de medición, aquí verás el avance, los pendientes y los reportes individuales disponibles."
        />
      </PanelLayout>
    );
  }

  if (!dashboard.isTeacher && dashboard.scopedCycles.length === 0) {
    return (
      <PanelLayout
        currentStep="dashboard"
        title="Estado del ciclo"
        description="Seguimiento de ciclos, cursos y resultados de aprendizaje."
      >
        <DashboardEmptyState
          title="Aún no se han creado ciclos de medición"
          description="Para visualizar avances, pendientes y reportes consolidados primero se debe crear un ciclo de medición desde el módulo Creación del ciclo."
        />
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      currentStep="dashboard"
      title={dashboard.layoutTitle}
      description={dashboard.layoutDescription}
      breadcrumbItems={dashboard.breadcrumbItems}
    >
      {dashboard.view === "control" ? (
        <div className="space-y-6">
          {canShowTeacherTour || canShowSupervisorTour ? (
            <TourReplayButton onClick={dashboard.isTeacher ? startTeacherTour : startSupervisorTour} />
          ) : null}

          <div id="dashboard-summary-cards">
            <MeasurementSummaryCards
              tourId={canShowSupervisorTour ? "dashboard-summary" : undefined}
              items={
                dashboard.isTeacher
                  ? buildTeacherSummaryItems(dashboard.metrics)
                  : buildSupervisorSummaryItems(dashboard.metrics)
              }
            />
          </div>

          {dashboard.isTeacher ? (
            <>
              <div id="dashboard-filters-panel">
                <DashboardFilters
                  user={dashboard.user}
                  catalogs={dashboard.dashboardData.catalogs}
                  cycles={dashboard.scopedCycles}
                  tourId={canShowSupervisorTour ? "dashboard-filters" : undefined}
                  filters={dashboard.filters}
                  onFilterChange={dashboard.handleFilterChange}
                  onReset={dashboard.handleResetFilters}
                />
              </div>

              <CoursesMeasurementTable
                title="Cursos asignados"
                description="Consulta el avance de tus cursos, mide los pendientes y abre el detalle de los completados."
                courses={dashboard.filteredCourses}
                mode="teacher"
                onMeasureCourse={dashboard.handleMeasureCourse}
                onViewResults={dashboard.handleViewCourseDetail}
                tableId="dashboard-courses-table"
              />
            </>
          ) : (
            <>
              <DashboardFilters
                user={dashboard.user}
                catalogs={dashboard.dashboardData.catalogs}
                cycles={dashboard.scopedCycles}
                tourId={canShowSupervisorTour ? "dashboard-filters" : undefined}
                filters={dashboard.filters}
                onFilterChange={dashboard.handleFilterChange}
                onReset={dashboard.handleResetFilters}
              />

              <section className="space-y-5">
                <div>
                  <h2 className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
                    Ciclos de Medición
                  </h2>
                </div>

                {dashboard.filteredCycles.length > 0 ? (
                  <div className="grid gap-5">
                    {dashboard.filteredCycles.map((cycle) => (
                      <MeasurementCycleCard
                        key={cycle.id}
                        cycle={cycle}
                        isTeacher={dashboard.isTeacher}
                        isDirector={dashboard.isDirector}
                        tourCardId={`dashboard-cycle-card-${dashboard.filteredCycles.indexOf(cycle)}`}
                        tourActionIds={
                          dashboard.filteredCycles.indexOf(cycle) === dashboard.filteredCycles.length - 1
                            ? {
                                pending: "dashboard-last-cycle-pending",
                                results: "dashboard-last-cycle-results",
                                improvement: "dashboard-last-cycle-improvement",
                                report: "dashboard-last-cycle-report",
                              }
                            : undefined
                        }
                        onViewPending={dashboard.handleViewPending}
                        onViewResults={dashboard.handleViewResultsFromCycle}
                        onDownloadReport={dashboard.handleDownloadCycleReport}
                        onImprovementPlan={dashboard.handleImprovementPlan}
                      />
                    ))}
                  </div>
                ) : (
                  <DashboardEmptyState
                    title="No hay ciclos para los filtros seleccionados"
                    description="Ajusta los filtros para consultar otros periodos, programas o estados de medición."
                  />
                )}
              </section>
            </>
          )}
        </div>
      ) : null}

      {dashboard.view === "courses" && !dashboard.isTeacher ? (
        <div className="space-y-6">
          <BackButton
            label="Volver al Estado del ciclo"
            onClick={dashboard.goBackToControl}
          />

          {canShowViewTour ? <TourReplayButton onClick={startViewTour} className="block" /> : null}

          <DashboardFilters
            user={dashboard.user}
            catalogs={dashboard.dashboardData.catalogs}
            cycles={dashboard.scopedCycles}
            tourId={DASHBOARD_TOUR_IDS.coursesFilters}
            filters={dashboard.filters}
            onFilterChange={dashboard.handleFilterChange}
            onReset={dashboard.handleResetFilters}
          />

          <CoursesMeasurementTable
            courses={dashboard.coursesForSelectedView}
            tableId={DASHBOARD_TOUR_IDS.coursesTable}
            mode={dashboard.isTeacher ? "teacher" : "supervisor"}
            onMeasureCourse={dashboard.handleMeasureCourse}
            onNotifyTeacher={dashboard.setNotifyCourse}
            onViewResults={dashboard.handleViewCourseDetail}
            canNotifyTeacher={dashboard.isDirector}
          />
        </div>
      ) : null}

      {dashboard.view === "detail" ? (
        <div className="space-y-6">
          <BackButton
            label={`Volver a ${dashboard.coursesBreadcrumbLabel.toLowerCase()}`}
            onClick={dashboard.goBackToCourses}
          />

          {canShowViewTour ? <TourReplayButton onClick={startViewTour} className="block" /> : null}

          <ResultsMeasurementPanel
            results={dashboard.detailResults}
            courses={dashboard.detailCoursesForSelect}
            selectedCourseId={dashboard.detailCourseId}
            selectedCompetenceId={dashboard.detailCompetenceId}
            onCourseChange={dashboard.selectDetailCourse}
            onCompetenceChange={dashboard.setDetailCompetenceId}
            onDownloadFile={simulateEvidenceDownload}
            onOpenRaDetail={dashboard.setSelectedRa}
          />
        </div>
      ) : null}

      {dashboard.view === "results" ? (
        <div className="space-y-6">
          <BackButton
            label="Volver al Estado del ciclo"
            onClick={dashboard.goBackToControl}
          />

          {canShowViewTour ? <TourReplayButton onClick={startViewTour} className="block" /> : null}

          <CompetenceResultsPanel
            results={dashboard.consolidatedResults}
            onDownloadFile={simulateEvidenceDownload}
            onOpenRaDetail={dashboard.setSelectedRa}
          />
        </div>
      ) : null}

      <DashboardModals
        selectedRa={dashboard.selectedRa}
        notifyCourse={dashboard.notifyCourse}
        reportCycle={dashboard.reportCycle}
        availableReportCompetences={dashboard.availableReportCompetences}
        selectedReportCompetences={dashboard.selectedReportCompetences}
        improvementCycle={dashboard.improvementCycle}
        improvementDraft={dashboard.improvementDraft}
        improvementTitle={dashboard.improvementTitle}
        improvementError={dashboard.improvementError}
        onCloseSelectedRa={() => dashboard.setSelectedRa(null)}
        onCloseNotifyCourse={() => dashboard.setNotifyCourse(null)}
        onConfirmNotifyTeacher={dashboard.handleConfirmNotifyTeacher}
        onCloseReportCycle={() => dashboard.setReportCycle(null)}
        onToggleReportCompetence={dashboard.handleToggleReportCompetence}
        onDownloadConsolidatedReport={dashboard.handleDownloadConsolidatedReport}
        onCloseImprovementPlan={dashboard.handleCloseImprovementPlan}
        onSaveImprovementPlan={dashboard.handleSaveImprovementPlan}
        onImprovementDraftChange={(value) => {
          dashboard.setImprovementDraft(value);
          dashboard.setImprovementError("");
        }}
        setImprovementTitle={(value) => {
          dashboard.setImprovementTitle(value);
        }}
      />
    </PanelLayout>
  );
}
