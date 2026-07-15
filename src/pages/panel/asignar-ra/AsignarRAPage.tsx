import { GoArrowLeft } from "react-icons/go";
import {
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
    hasNextPendingCourse,
    handleSeccionalChange,
    handleFacultadChange,
    handleProgramChange,
    handlePlanChange,
    handleCycleChange,
    handleCourseFilterChange,
    handleSelectCourse,
    handleBackToCourses,
    handleNextCourse,
    handleDeleteCourseAssignments,
    handleRequestFinishAcademicFlow,
    handleConfirmFinishAcademicFlow,
    handleConfirmMeasuredAssignment,
    handleCancelMeasuredAssignment,
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
  const courseDetailBreadcrumbItems = isCourseDetailView
    ? [
        { label: "Asignar RA", onClick: handleBackToCourses },
        { label: selectedCourse?.nombre ?? "Detalle del curso" },
      ]
    : undefined;

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
                onDelete={() => setShowDeleteConfirm(true)}
                onToggleAccordion={toggleCompetenciaAccordion}
                onToggleRa={toggleRaSelection}
                getRaAssignment={getRaAssignment}
                isRaSelected={isRaSelected}
              />
            </div>
          ) : (
            <>
              <div ref={refs.filtersRef}>
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
                />
              </div>

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
                <div ref={refs.coursesRef}>
                  <AsignarRACoursesTable
                    rows={courseRows}
                    totalCourses={courses.length}
                    isFiltered={Boolean(filters.courseFilterId || filters.courseSearchTerm)}
                    canManage={access.canManage}
                    onSelectCourse={handleSelectCourse}
                  />
                </div>
              )}
            </>
          )}

          {isWorkflowActive && access.canManage && isCourseDetailView ? (
            <FlowActionBar
              description={
                hasNextPendingCourse
                  ? "La acción principal valida y guarda el curso actual antes de abrir el siguiente curso pendiente."
                  : "Este es el último curso pendiente. Finaliza para guardar su asignación y validar todos los cursos del ciclo."
              }
              actionsBefore={[
                {
                  label: "Volver a cursos",
                  onClick: handleBackToCourses,
                  variant: "outline",
                  leftIcon: <GoArrowLeft className="text-lg" />,
                },
              ]}
              showNext={hasNextPendingCourse}
              nextLabel="Siguiente curso"
              onNext={handleNextCourse}
              showFinish={!hasNextPendingCourse}
              finishLabel="Finalizar"
              onFinish={handleRequestFinishAcademicFlow}
            />
          ) : null}

          <ConfirmDialog
            open={showMeasuredConfirm}
            title="Confirmar cambio sobre RA medido"
            description="Este curso tiene RA con medición registrada. Cambiar la asignación puede afectar los resultados visibles en Dashboard y Medición RA."
            confirmLabel="Guardar cambios"
            variant="warning"
            onCancel={handleCancelMeasuredAssignment}
            onConfirm={handleConfirmMeasuredAssignment}
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
            title="¿Estás seguro de finalizar todo el flujo?"
            description="Al confirmar, se guardará la asignación del último curso y se finalizará el flujo de Gestión Académica. Después de completarlo, los pasos quedarán disponibles únicamente para consulta y seguimiento."
            confirmLabel="Finalizar"
            variant="warning"
            onCancel={() => setShowFinishAcademicFlowConfirm(false)}
            onConfirm={handleConfirmFinishAcademicFlow}
          />

          <ConfirmDialog
            open={showDeleteConfirm}
            title="Eliminar asignación del curso"
            description={`Se eliminarán ${selectedCourseAssignments.length} asignación(es) RA del curso seleccionado y sus mediciones relacionadas para evitar relaciones huérfanas.`}
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
