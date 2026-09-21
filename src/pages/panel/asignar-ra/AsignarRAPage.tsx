import { BackButton, FlowActionBar, PanelLayout, WorkflowStateCard } from "../../../components/panel";
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
import { useMemo } from "react";
// TOUR: import del hook y el tipo de pasos
import { useOnboardingTour, type OnboardingTourStep } from "../../../components/OnboardingTour";

export default function AsignarRAPage() {
  const asignarRA = useAsignarRA();
  const workflowProgress = useAcademicWorkflowProgress();
  const isWorkflowActive = getAcademicWorkflowState(workflowProgress) !== "completed";
  const {
    access,
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
        target: "#asignar-ra-filters-panel",
        title: "Filtros",
        content: "Filtra los resultados de aprendizaje por programa, estado u otros criterios.",
        order: 1,
      },
      {
        target: "#asignar-ra-courses-panel",
        title: "Cursos de Síntesis",
        content: "Selecciona un curso para revisar y asignar sus resultados de aprendizaje.",
        order: 2,
      },
    ],
    []
  );

  const canShowTour = !isCourseDetailView && !access.isStepLocked && access.canRead;

  const { startTour } = useOnboardingTour({
    steps: tourSteps,
    storageKey: "tour_asignar_ra_v1",
    autoStart: canShowTour,
    enabled: canShowTour,
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
        content: "Estas casillas representan las aplicaciones de los Resultados de Aprendizaje. Selecciona entre 1 y 4 RA para asignarlos a la competencia.",
        order: 2,
      },
    ],
    []
  );

  const canShowDetailTour =
    isCourseDetailView &&
    !access.isStepLocked &&
    access.canRead &&
    courseCompetencias.length > 0;

  const { startTour: startDetailTour } = useOnboardingTour({
    steps: detailTourSteps,
    storageKey: "tour_asignar_ra_detalle_v1",
    autoStart: canShowDetailTour,
    enabled: canShowDetailTour,
  });

  return (
    <PanelLayout
      currentStep="asignar-ra"
      title="Asignar Resultados de Aprendizaje"
      description="Seleccione un curso de Síntesis y asigne los RA que serán medidos."
      breadcrumbItems={courseDetailBreadcrumbItems}
    >
      {access.isStepLocked ? (
        <AsignarRAAccessState variant="locked-step" />
      ) : !access.canRead ? (
        <AsignarRAAccessState variant="docente" />
      ) : (
        <div className="space-y-6 pb-24">
          {feedback ? (
            <div className="rounded-[var(--radius-lg)] border border-[color:rgba(118,202,102,0.55)] bg-[color:rgba(118,202,102,0.12)] px-5 py-4 text-sm font-medium text-[var(--color-secondary-4)]">
              {feedback}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-[var(--radius-lg)] border border-[color:rgba(235,87,87,0.45)] bg-[color:rgba(235,87,87,0.08)] px-5 py-4 text-sm font-medium text-[var(--color-error)]">
              {errorMessage}
            </div>
          ) : null}

          
          
          {isCourseDetailView ? (
            <div ref={refs.assignmentPanelRef}>
              <BackButton label="Volver a cursos" onClick={handleBackToCourses} />
              {canShowDetailTour ? (
                <button
                  type="button"
                  onClick={startDetailTour}
                  className="mb-3 mt-3 text-sm text-blue-600 underline"
                >
                  Ver guía del detalle
                </button>
              ) : null}
              <div id="asignar_ra-detalle-curso-panel">
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
             {/* TOUR: botón para relanzar el tour manualmente */}
            {canShowTour ? (
              <button
                type="button"
                onClick={startTour}
                className="mb-3 text-sm text-blue-600 underline"
              >
                Ver guía de esta sección
              </button>
              ) : null}
              <div id="asignar-ra-filters-panel" ref={refs.filtersRef}>
                
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
                    isFiltered={Boolean(filters.courseFilterId || filters.courseSearchTerm)}
                    canManage={access.canManage}
                    onSelectCourse={handleSelectCourse}
                  />
                )}
              </div>
            </>
          )}

          {isWorkflowActive && access.canManage && isCourseDetailView ? (
            <FlowActionBar
              description={
                hasOtherPendingCourses
                  ? "Valida y guarda la asignación actual para abrir automáticamente el siguiente curso pendiente."
                  : "Valida y guarda la asignación del último curso antes de finalizar el flujo."
              }
              actionsBefore={[
                {
                  label: "Volver a cursos",
                  onClick: handleBackToCourses,
                  variant: "outline",
                },
              ]}
              showNext={hasOtherPendingCourses}
              nextLabel="Siguiente curso"
              onNext={handleSaveAndOpenNextCourse}
              showFinish={!hasOtherPendingCourses}
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
