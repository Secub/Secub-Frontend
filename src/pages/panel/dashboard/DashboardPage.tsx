import { useMemo } from "react";
import { BackButton, PanelLayout } from "../../../components/panel";
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

export default function DashboardPage() {
  const dashboard = useDashboardPage();

  const tourSteps = useMemo<OnboardingTourStep[]>(
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
        target: "#dashboard-course-first-action",
        title: "Medir resultados",
        content: "Haz clic en Medir para registrar los Resultados de Aprendizaje pendientes de este curso.",
        order: 4,
      },
    ],
    []
  );

  const canShowTour = dashboard.isTeacher && dashboard.view === "control";

  const { startTour } = useOnboardingTour({
    steps: tourSteps,
    storageKey: "tour_dashboard_docente_v1",
    autoStart: canShowTour,
    enabled: canShowTour,
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
          {canShowTour ? (
            <button
              type="button"
              onClick={startTour}
              className="text-sm text-blue-600 underline"
            >
              Ver guía de esta sección
            </button>
          ) : null}

          <div id="dashboard-summary-cards">
            <MeasurementSummaryCards
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
                firstRowActionId="dashboard-course-first-action"
              />
            </>
          ) : (
            <>
              <DashboardFilters
                user={dashboard.user}
                catalogs={dashboard.dashboardData.catalogs}
                cycles={dashboard.scopedCycles}
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

          <DashboardFilters
            user={dashboard.user}
            catalogs={dashboard.dashboardData.catalogs}
            cycles={dashboard.scopedCycles}
            filters={dashboard.filters}
            onFilterChange={dashboard.handleFilterChange}
            onReset={dashboard.handleResetFilters}
          />

          <CoursesMeasurementTable
            courses={dashboard.coursesForSelectedView}
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
