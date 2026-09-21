import {
  FlowActionBar,
  PanelLayout,
  WorkflowStateCard,
  getAcademicWorkflowLockedDescription,
} from "../../../components/panel";
import {
  getAcademicWorkflowState,
  useAcademicWorkflowProgress,
} from "../../../components/panel/academicWorkflow";
import { ROUTES, buildRouteWithSearch, navigateToRoute } from "../../../app/appRoutes";
import { ConfirmDialog } from "../../../components/ui";
import CicloAccessState from "./components/CicloAccessState";
import CicloFilters from "./components/CicloFilters";
import CicloFormModal from "./components/CicloFormModal";
import CicloListSection from "./components/CicloListSection";
import CicloPageActions from "./components/CicloPageActions";
import CicloSavedMessage from "./components/CicloSavedMessage";
import { useCicloPage } from "./hooks/useCicloPage";
import { INITIAL_CICLO_FILTERS } from "./ciclo.utils";
import { useMemo } from "react";
// TOUR: import del hook y el tipo de pasos
import { useOnboardingTour, type OnboardingTourStep } from "../../../components/OnboardingTour";

export default function CicloPage() {
  const page = useCicloPage();
  const {
    user,
    catalogs,
    permissions,
    isStepLocked,
    hasCycles,
    filters,
    modalMode,
    formOpen,
    selectedCycle,
    formValues,
    cycleToDelete,
    savedMessage,
    roleScopedCycles,
    filteredCycles,
    activeCycle,
    canCreateCycle,
    activeCycleLockMessage,
    handleFilterChange,
    openCreateModal,
    openEditModal,
    openDuplicateModal,
    handleViewDetail,
    handleSubmit,
    confirmDelete,
    setFilters,
    setFormOpen,
    setCycleToDelete,
    setSavedMessage,
  } = page;

  const workflowProgress = useAcademicWorkflowProgress();
  const isWorkflowActive = getAcademicWorkflowState(workflowProgress) !== "completed";
  const showFlowActionBar =
    isWorkflowActive &&
    !isStepLocked &&
    permissions.canConfirmSelection &&
    hasCycles &&
    Boolean(workflowProgress.ciclo);
  const handleNextStep = () => {
    navigateToRoute(buildRouteWithSearch(ROUTES.panelAsignarRa, { role: user.role }));
  };

  const tourSteps = useMemo<OnboardingTourStep[]>(
    () => [
      {
        target: "#ciclo-filters-panel",
        title: "Filtros",
        content: "Filtra los ciclos de medición por programa, estado u otros criterios.",
        order: 1,
      },
      {
        target: "#ciclo-list-section",
        title: "Listado de ciclos",
        content: "Aquí ves todos los ciclos de medición registrados. Puedes ver, editar o eliminar cada uno.",
        order: 2,
      },
      {
        target: "#ciclo-page-actions",
        title: "Acciones",
        content: "Desde aquí puedes crear un nuevo ciclo de medición si no existe uno activo.",
        order: 3,
      },
    ],
    []
  );

  const canShowTour = !isStepLocked && hasCycles && permissions.canCreateCycle;

  const { startTour } = useOnboardingTour({
    steps: tourSteps,
    storageKey: "tour_ciclo_v1",
    autoStart: canShowTour,
    enabled: canShowTour,
  });

  const pageActions = (
    <div id="ciclo-page-actions">
    <CicloPageActions
      canCreate={canCreateCycle}
      disabledReason={activeCycleLockMessage ?? undefined}
      onCreate={openCreateModal}
    />
    </div>
  );

  return (
    <PanelLayout
      currentStep="ciclo"
      title="Creación del ciclo"
      description="Configuración del periodo de 1.5 años y selección de cursos del núcleo de Síntesis para el mapeo curricular."
      actions={!isStepLocked && hasCycles && permissions.canCreateCycle ? pageActions : undefined}
    >
      {/* TOUR: botón para relanzar el tour manualmente */}
      {!isStepLocked && hasCycles ? (
        <button
          type="button"
          onClick={startTour}
          className="mb-3 text-sm text-blue-600 underline"
        >
          Ver guía de esta sección
        </button>
      ) : null}

      {isStepLocked ? (
        <WorkflowStateCard
          variant="locked"
          title="Este paso aún no está disponible"
          description={getAcademicWorkflowLockedDescription("ciclo")}
          helperText="La restricción secuencial se valida solo en Gestión Académica."
        />
      ) : !permissions.canReadSummary ? (
        <CicloAccessState />
      ) : !hasCycles ? (
        <WorkflowStateCard
          title="Aún no hay ciclos de medición creados"
          description="Cuando se cree el primer ciclo, se habilitará el resumen con filtros, cursos seleccionados, periodo, estado y responsable."
          actionLabel={canCreateCycle ? "Crear ciclo de medición" : undefined}
          onAction={canCreateCycle ? openCreateModal : undefined}
        />
      ) : (
        <div className="space-y-6 pb-24">
          <CicloSavedMessage message={savedMessage} onClose={() => setSavedMessage("")} />
        
        <div id="ciclo-filters-panel">
          <CicloFilters
            user={user}
            permissions={permissions}
            catalogs={catalogs}
            filters={filters}
            baseCycles={roleScopedCycles}
            filteredCount={filteredCycles.length}
            totalCount={roleScopedCycles.length}
            onFilterChange={handleFilterChange}
            onReset={() => setFilters(INITIAL_CICLO_FILTERS)}
          />
        </div>

        <CicloListSection
          cycles={filteredCycles}
          user={user}
          onView={handleViewDetail}
          onEdit={openEditModal}
          onDelete={setCycleToDelete}
          onDuplicate={openDuplicateModal}
          activeCycle={activeCycle}
        />
        </div>
      )}

      {showFlowActionBar ? (
        <FlowActionBar
          description="El ciclo de medición ya está guardado. Continúa a Asignar RA cuando hayas revisado la selección de cursos."
          showNext
          nextLabel="Siguiente paso"
          onNext={handleNextStep}
        />
      ) : null}

      <CicloFormModal
        open={formOpen}
        mode={modalMode}
        catalogs={catalogs}
        user={user}
        initialValues={formValues}
        record={selectedCycle}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(cycleToDelete)}
        title={`¿Seguro que deseas eliminar el ciclo "${cycleToDelete?.nombre ?? "seleccionado"}"?`}
        description="Se eliminará el ciclo seleccionado y sus relaciones asociadas. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onCancel={() => setCycleToDelete(null)}
        onConfirm={confirmDelete}
      />
    </PanelLayout>
  );
}
