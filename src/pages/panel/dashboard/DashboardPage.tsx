import { PanelLayout } from "../../../components/panel";
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

  if (dashboard.isTeacher && dashboard.scopedCourses.length === 0) {
    return (
      <PanelLayout
        currentStep="dashboard"
        title="Panel de Control"
        description={`${dashboard.user.label} - Usuario`}
        breadcrumbItems={[{ label: "Panel de control" }]}
      >
        <DashboardEmptyState
          title="No tienes cursos asignados a ciclos de medición"
          description="Cuando tengas cursos de Síntesis vinculados a un ciclo de medición, aquí verás el avance, los pendientes y los reportes individuales disponibles."
          helperText="Este estado cubre el escenario en el que el docente no tiene cursos de Síntesis asignados a ningún ciclo activo o finalizado."
        />
      </PanelLayout>
    );
  }

  if (!dashboard.isTeacher && dashboard.scopedCycles.length === 0) {
    return (
      <PanelLayout
        currentStep="dashboard"
        title="Panel de Control"
        description={`${dashboard.user.label} - Usuario`}
        breadcrumbItems={[{ label: "Panel de control" }]}
      >
        <DashboardEmptyState
          title="Aún no se han creado ciclos de medición"
          description="Para visualizar avances, pendientes y reportes consolidados primero se debe crear un ciclo de medición desde el módulo Creación del ciclo."
          helperText="La creación del ciclo es exclusiva de Jefatura de programa. Los demás roles solo consultan la información disponible."
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
          <MeasurementSummaryCards
            items={
              dashboard.isTeacher
                ? buildTeacherSummaryItems(dashboard.metrics)
                : buildSupervisorSummaryItems(dashboard.metrics)
            }
          />

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
        </div>
      ) : null}

      {dashboard.view === "courses" ? (
        <div className="space-y-6">
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
            onViewResults={dashboard.handleViewCourseDetail}
            onNotifyTeacher={dashboard.setNotifyCourse}
          />
        </div>
      ) : null}

      {dashboard.view === "detail" ? (
        <ResultsMeasurementPanel
          results={dashboard.detailResults}
          courses={dashboard.detailCoursesForSelect}
          selectedCourseId={dashboard.detailCourseId}
          selectedCompetenceId={dashboard.detailCompetenceId}
          onCourseChange={(courseId) => {
            dashboard.setDetailCourseId(courseId);
            dashboard.setDetailCompetenceId("");
          }}
          onCompetenceChange={dashboard.setDetailCompetenceId}
          onDownloadFile={simulateEvidenceDownload}
          onOpenRaDetail={dashboard.setSelectedRa}
        />
      ) : null}

      {dashboard.view === "results" ? (
        <CompetenceResultsPanel
          results={dashboard.consolidatedResults}
          onDownloadFile={simulateEvidenceDownload}
          onOpenRaDetail={dashboard.setSelectedRa}
        />
      ) : null}

      <DashboardModals
        selectedRa={dashboard.selectedRa}
        notifyCourse={dashboard.notifyCourse}
        reportCycle={dashboard.reportCycle}
        availableReportCompetences={dashboard.availableReportCompetences}
        selectedReportCompetences={dashboard.selectedReportCompetences}
        improvementCycle={dashboard.improvementCycle}
        improvementDraft={dashboard.improvementDraft}
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
      />
    </PanelLayout>
  );
}
