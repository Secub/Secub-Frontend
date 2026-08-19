import { GoArrowLeft } from "react-icons/go";
import { PanelLayout } from "../../../components/panel";
import { Button } from "../../../components/ui";
import CompetenceResultsPanel from "./components/CompetenceResultsPanel";
import CoursesMeasurementTable from "./components/CoursesMeasurementTable";
import DashboardEmptyState from "./components/DashboardEmptyState";
import DashboardFilters from "./components/DashboardFilters";
import DashboardModals from "./components/DashboardModals";
import MeasurementCycleCard from "./components/MeasurementCycleCard";
import TeacherCourseMeasurementCards from "./components/TeacherCourseMeasurementCards";
import MeasurementSummaryCards, {
  buildSupervisorSummaryItems,
  buildTeacherSummaryItems,
} from "./components/MeasurementSummaryCards";
import ResultsMeasurementPanel from "./components/ResultsMeasurementPanel";
import { useDashboardPage } from "./hooks/useDashboardPage";
import { simulateEvidenceDownload } from "./dashboard.utils";
import { getCurrentMockUser } from "../../../services/auth/mockUser";
import { getDocenteMeasurementOverview } from "../medicion-ra/utils/medicionRA.overview";

function DashboardBackButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="mb-5">
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<GoArrowLeft className="text-lg" />}
        onClick={onClick}
      >
        {label}
      </Button>
    </div>
  );
}

export default function DashboardPage() {
  const dashboard = useDashboardPage();
  const docenteMeasurementOverview = dashboard.isTeacher
    ? getDocenteMeasurementOverview(getCurrentMockUser())
    : { courses: [], summaries: [] };

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
          <MeasurementSummaryCards
            items={
              dashboard.isTeacher
                ? buildTeacherSummaryItems(dashboard.metrics)
                : buildSupervisorSummaryItems(dashboard.metrics)
            }
          />

          {dashboard.isTeacher ? (
            <>
              <TeacherCourseMeasurementCards
                courses={docenteMeasurementOverview.courses}
                courseSummaries={docenteMeasurementOverview.summaries}
                onCourseSelect={(courseId, cycleId) => {
                  const selectedCourse = dashboard.scopedCourses.find(
                    (course) =>
                      course.id === courseId &&
                      (!cycleId || course.cycleId === cycleId),
                  );
                  if (selectedCourse) dashboard.handleMeasureCourse(selectedCourse);
                }}
              />

              {/*
                VISTA DOCENTE — BLOQUE OCULTO INTENCIONALMENTE

                Los filtros y las cards de progreso global del ciclo se conservan comentados
                para poder recuperarlos fácilmente si el flujo cambia en el futuro.

                Para Docencia, esa información no aporta al trabajo que debe realizar en esta
                pantalla: el docente necesita consultar el avance de SUS CURSOS y entrar desde
                cada curso a Medición RA. El seguimiento global del ciclo (estado del ciclo,
                avance general, resultados consolidados y plan de mejora) corresponde al rol de
                Dirección de programa.

                Por ese motivo, el Estado del ciclo de Docencia muestra únicamente:
                1. Las cuatro cards informativas de sus cursos.
                2. Las cards de los cursos asignados con su progreso de Medición RA.

                Código anterior conservado como referencia:

                <DashboardFilters
                  user={dashboard.user}
                  catalogs={dashboard.dashboardData.catalogs}
                  cycles={dashboard.scopedCycles}
                  filters={dashboard.filters}
                  onFilterChange={dashboard.handleFilterChange}
                  onReset={dashboard.handleResetFilters}
                />

                <section className="space-y-5">
                  <h2>Ciclos de Medición</h2>
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
                </section>
              */}
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
          <DashboardBackButton
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
          <DashboardBackButton
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
          <DashboardBackButton
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
