import {
  BackButton,
  FlowActionBar,
  PanelLayout,
  WorkflowStateCard,
} from "../../../components/panel";
import {
  getAcademicWorkflowState,
  useAcademicWorkflowProgress,
} from "../../../components/panel/academicWorkflow";
import { ConfirmDialog } from "../../../components/ui";
import { useAsignarRA } from "./hooks/useAsignarRA";
import { AsignarRAAccessState } from "./components/AsignarRAAccessState";
import { AsignarRACourseDetail } from "./components/AsignarRACourseDetail";
import { AsignarRACoursesTable } from "./components/AsignarRACoursesTable";
import { AsignarRAFilters } from "./components/AsignarRAFilters";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useOnboardingTour, type OnboardingTourStep } from "../../../components/OnboardingTour";

export default function AsignarRAPage() {
  const asignarRA = useAsignarRA();
  const workflowProgress = useAcademicWorkflowProgress();
  const isWorkflowActive = getAcademicWorkflowState(workflowProgress) !== "completed";
  const {
    access,
    loading,
    loadError,
    refresh,
    filters,
    filterOptions,
    filterLocks,
    refs,
    cycles,
    courses,
    courseRows,
    selectedCycle,
    selectedCourse,
    selectedCourseAssignments,
    courseCompetencias,
    draftSelections,
    expandedCompetenciaIds,
    measurements,
    feedback,
    errorMessage,
    showMeasuredConfirm,
    showDeleteConfirm,
    showLeaveCourseConfirm,
    showFinishAcademicFlowConfirm,
    pendingCourseIds,
    handleSeccionalChange,
    handleFacultadChange,
    handleProgramChange,
    handlePlanChange,
    handleCycleChange,
    handleCourseFilterChange,
    handleResetFilters,
    handleSelectCourse,
    handleBackToCourses,
    handleSaveCourseAssignments,
    handleSaveAndOpenNextCourse,
    handleSaveAndRequestFinish,
    handleConfirmMeasuredPrimaryAction,
    handleCancelMeasuredPrimaryAction,
    handleDeleteCourseAssignments,
    handleConfirmFinishAcademicFlow,
    discardDraftAndReturnToCourses,
    setShowDeleteConfirm,
    setShowLeaveCourseConfirm,
    setShowFinishAcademicFlowConfirm,
    toggleCompetenciaAccordion,
    expandCompetencia,
    toggleRaSelection,
    getRaAssignment,
    isRaSelected,
    hasUnsavedChanges,
    getCourseStatus,
  } = asignarRA;

  const isCourseDetailView = Boolean(selectedCourse);
  const hasOtherPendingCourses = selectedCourse
    ? pendingCourseIds.some((courseId) => courseId !== selectedCourse.id)
    : false;
  const courseDetailBreadcrumbItems = isCourseDetailView
    ? [
      { label: "Asignar RA", onClick: handleBackToCourses },
      { label: selectedCourse?.nombre ?? "Detalle del curso" },
    ]
    : undefined;

  const tourSteps = useMemo<OnboardingTourStep[]>(
    () => [
      {
        target: "#asignar-ra-courses-panel",
        title: "Cursos de Síntesis",
        content: "Selecciona un curso para revisar y asignar sus resultados de aprendizaje.",
        order: 1,
      },
      {
        target: '[data-tour="asignar-ra-course-action"]',
        title: "Abrir el curso",
        content: "Haz clic en este botón para abrir el detalle del curso y asignar sus Resultados de Aprendizaje.",
        order: 2,
      },
    ],
    []
  );

  const isPageReady = !loading && !loadError && !access.isStepLocked && access.canRead;
  const canShowTour = isPageReady && !isCourseDetailView;

  const { startTour } = useOnboardingTour({
    steps: tourSteps,
    storageKey: "tour_asignar_ra_v1",
    autoStart: canShowTour && courseRows.length > 0,
    enabled: canShowTour,
    allowPartialTargets: true,
  });

  const detailTourSteps = useMemo<OnboardingTourStep[]>(
    () => [
      {
        target: "#asignar-ra-competencias-section",
        title: "Competencias del curso",
        content: "Aquí encontrarás las competencias asociadas al curso. Abre cada una para revisar sus Resultados de Aprendizaje.",
        order: 1,
      },
      {
        target: "#asignar-ra-application-selector",
        title: "Aplicaciones de RA",
        content: access.canManage
          ? "Estas casillas representan las aplicaciones de los Resultados de Aprendizaje. Selecciona entre 1 y 4 RA para asignarlos a la competencia."
          : "Estas casillas muestran los Resultados de Aprendizaje asignados a cada competencia.",
        order: 2,
      },
    ],
    [access.canManage]
  );

  const canShowDetailTour = isPageReady && isCourseDetailView && courseCompetencias.length > 0;

  const firstCompetenciaId = courseCompetencias[0]?.id;
  const isDetailTourTargetReady =
    Boolean(firstCompetenciaId) && expandedCompetenciaIds.includes(firstCompetenciaId ?? "");

  const { startTour: startDetailTour } = useOnboardingTour({
    steps: detailTourSteps,
    storageKey: "tour_asignar_ra_detalle_v1",
    autoStart: canShowDetailTour && isDetailTourTargetReady,
    enabled: canShowDetailTour && isDetailTourTargetReady,
    allowPartialTargets: true,
  });

  const [isDetailTourReplayPending, setIsDetailTourReplayPending] = useState(false);
  const replayDetailTour = useCallback(() => {
    if (!firstCompetenciaId || isDetailTourTargetReady) {
      startDetailTour();
      return;
    }
    setIsDetailTourReplayPending(true);
    expandCompetencia(firstCompetenciaId);
  }, [firstCompetenciaId, isDetailTourTargetReady, startDetailTour, expandCompetencia]);

  useEffect(() => {
    if (!isDetailTourReplayPending || !isDetailTourTargetReady) return;
    setIsDetailTourReplayPending(false);
    startDetailTour();
  }, [isDetailTourReplayPending, isDetailTourTargetReady, startDetailTour]);

  return (
    <PanelLayout
      currentStep="asignar-ra"
      title="Asignar Resultados de Aprendizaje"
      description="Seleccione un curso de Síntesis y asigne los RA que serán medidos."
      breadcrumbItems={courseDetailBreadcrumbItems}
      onReplayTour={canShowDetailTour ? replayDetailTour : canShowTour ? startTour : undefined}
      tourLabel={canShowDetailTour ? "Ver guía del detalle" : undefined}
    >
      {loading ? (
        <WorkflowStateCard
          title="Cargando asignación de RA"
          description="Estamos consultando los ciclos, cursos, competencias y resultados de aprendizaje guardados."
        />
      ) : loadError ? (
        <WorkflowStateCard
          title="No fue posible cargar la asignación de RA"
          description={loadError}
          actionLabel="Reintentar"
          onAction={() => void refresh()}
        />
      ) : access.isStepLocked ? (
        <AsignarRAAccessState variant="locked-step" />
      ) : !access.canRead ? (
        <AsignarRAAccessState variant="docente" />
      ) : (
        <div className="space-y-6 pb-24">
          {feedback ? (
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-success)] bg-[color:var(--color-tint-success)] px-5 py-4 text-sm font-medium text-[var(--color-secondary-4)]">
              {feedback}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-danger)] bg-[color:var(--color-tint-danger)] px-5 py-4 text-sm font-medium text-[var(--color-error)]">
              {errorMessage}
            </div>
          ) : null}

          {isCourseDetailView ? (
            <div ref={refs.assignmentPanelRef}>
              <BackButton label="Volver a cursos" onClick={handleBackToCourses} />
              <div className="mt-3">
                <AsignarRACourseDetail
                  selectedCourse={selectedCourse}
                  selectedCycle={selectedCycle}
                  selectedCourseAssignments={selectedCourseAssignments}
                  courseCompetencias={courseCompetencias}
                  draftSelections={draftSelections}
                  expandedCompetenciaIds={expandedCompetenciaIds}
                  measurements={measurements}
                  canManage={access.canManage}
                  canDelete={access.canDelete}
                  hasUnsavedChanges={hasUnsavedChanges()}
                  status={selectedCourse ? getCourseStatus(selectedCourse.id) : undefined}
                  onBackToCourses={handleBackToCourses}
                  onDelete={() => setShowDeleteConfirm(true)}
                  onToggleAccordion={toggleCompetenciaAccordion}
                  onToggleRa={toggleRaSelection}
                  getRaAssignment={getRaAssignment}
                  isRaSelected={isRaSelected}
                />
              </div>
            </div>
          ) : (
            <>
              <div id="asignar-ra-filters-panel">
                <AsignarRAFilters
                  filters={filters}
                  options={filterOptions}
                  locks={filterLocks}
                  coursesLength={courses.length}
                  cyclesLength={cycles.length}
                  onSeccionalChange={handleSeccionalChange}
                  onFacultadChange={handleFacultadChange}
                  onProgramChange={handleProgramChange}
                  onPlanChange={handlePlanChange}
                  onCycleChange={handleCycleChange}
                  onCourseFilterChange={handleCourseFilterChange}
                  onReset={handleResetFilters}
                />
              </div>

              <div id="asignar-ra-courses-panel" ref={refs.coursesRef}>
                {!selectedCycle ? (
                  <WorkflowStateCard
                    title="Selecciona el ciclo de medición"
                    description="El módulo no toma el primer ciclo en silencio cuando existen varios. Elige el periodo académico para cargar cursos, competencias y asignaciones."
                  />
                ) : !courses.length ? (
                  <WorkflowStateCard
                    title="No hay cursos de Síntesis disponibles"
                    description="El ciclo seleccionado no tiene cursos de Síntesis asociados. Revisa Creación del ciclo antes de asignar RA."
                  />
                ) : (
                  <AsignarRACoursesTable
                    rows={courseRows}
                    totalCourses={courses.length}
                    isFiltered={Boolean(filters.courseFilterId)}
                    canManage={access.canManage}
                    onSelectCourse={handleSelectCourse}
                  />
                )}
              </div>
            </>
          )}

          {access.canManage && isCourseDetailView ? (
            <FlowActionBar
              description={
                hasOtherPendingCourses
                  ? "Valida y guarda la asignación actual para abrir automáticamente el siguiente curso pendiente."
                  : "Guarda los cambios de la asignación antes de volver a cursos."
              }
              actionsBefore={[
                {
                  label: "Volver a cursos",
                  onClick: handleBackToCourses,
                  variant: "outline",
                },
              ]}
              showSaveProgress
              saveLabel="Guardar cambios"
              onSaveProgress={handleSaveCourseAssignments}
              showNext={hasOtherPendingCourses}
              nextLabel="Siguiente curso"
              onNext={handleSaveAndOpenNextCourse}
              showFinish={isWorkflowActive && !hasOtherPendingCourses}
              finishLabel="Finalizar"
              onFinish={handleSaveAndRequestFinish}
            />
          ) : null}

          <ConfirmDialog
            open={showMeasuredConfirm}
            title="Confirmar cambio sobre RA medido"
            description="Este curso tiene RA con medición registrada. Cambiar la asignación puede afectar los resultados visibles en Dashboard y Medición RA."
            confirmLabel="Guardar cambios"
            variant="warning"
            onCancel={handleCancelMeasuredPrimaryAction}
            onConfirm={handleConfirmMeasuredPrimaryAction}
          />

          <ConfirmDialog
            open={showLeaveCourseConfirm}
            title="Cambios sin guardar"
            description="Tienes cambios sin guardar. ¿Deseas salir sin guardar la asignación?"
            confirmLabel="Salir sin guardar"
            cancelLabel="Seguir editando"
            variant="warning"
            onCancel={() => setShowLeaveCourseConfirm(false)}
            onConfirm={discardDraftAndReturnToCourses}
          />

          <ConfirmDialog
            open={showFinishAcademicFlowConfirm}
            title="¿Deseas finalizar este flujo?"
            description="Una vez finalizado el flujo de Gestión Académica, los pasos quedarán disponibles para consulta y seguimiento. Esta acción no se ejecuta automáticamente al asignar RA."
            confirmLabel="Finalizar"
            variant="warning"
            onCancel={() => setShowFinishAcademicFlowConfirm(false)}
            onConfirm={handleConfirmFinishAcademicFlow}
          />

          <ConfirmDialog
            open={showDeleteConfirm}
            title={`¿Seguro que deseas eliminar las asignaciones de "${selectedCourse?.nombre ?? "este curso"}"?`}
            description={`Se eliminarán ${selectedCourseAssignments.length} asignación(es) RA de ${selectedCourse?.nombre ?? "este curso"} y sus mediciones relacionadas. Esta acción no se puede deshacer.`}
            confirmLabel="Sí, eliminar"
            variant="danger"
            onCancel={() => setShowDeleteConfirm(false)}
            onConfirm={handleDeleteCourseAssignments}
          />
        </div>
      )}
    </PanelLayout>
  );
}
