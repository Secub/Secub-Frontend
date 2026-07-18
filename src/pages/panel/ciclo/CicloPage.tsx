import {
  FlowActionBar,
  PanelLayout,
  WorkflowStateCard,
  getAcademicWorkflowLockedDescription,
  isAcademicWorkflowStepCompleted,
} from "../../../components/panel";
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

  const showFlowActionBar = !isStepLocked && isAcademicWorkflowStepCompleted("ciclo");
  const handleNextStep = () => {
    navigateToRoute(buildRouteWithSearch(ROUTES.panelAsignarRa, { role: user.role }));
  };

  const pageActions = (
    <CicloPageActions
      canCreate={canCreateCycle}
      disabledReason={activeCycleLockMessage ?? undefined}
      onCreate={openCreateModal}
    />
  );

  return (
    <PanelLayout
      currentStep="ciclo"
      title="Creación del ciclo"
      description="Configuración del periodo de 1.5 años y selección de cursos del núcleo de Síntesis para el mapeo curricular."
      actions={!isStepLocked && hasCycles ? pageActions : undefined}
    >
      {isStepLocked ? (
        <WorkflowStateCard
          variant="locked"
          title="Este paso aún no está disponible"
          description={getAcademicWorkflowLockedDescription("ciclo")}
          helperText="La restricción secuencial se valida solo en Gestión Académica."
        />
      ) : !permissions.canReadSummary ? (
        <CicloAccessState user={user} />
      ) : !hasCycles ? (
        <WorkflowStateCard
          title="Aún no hay ciclos de medición creados"
          description="Cuando se cree el primer ciclo, se habilitará el resumen con filtros, cursos seleccionados, periodo, estado y responsable."
          actionLabel={canCreateCycle ? "Crear ciclo de medición" : undefined}
          onAction={canCreateCycle ? openCreateModal : undefined}
          helperText="No se muestran datos de prueba ni información precargada."
        />
      ) : (
        <div className="space-y-6 pb-24">
          <CicloSavedMessage message={savedMessage} onClose={() => setSavedMessage("")} />
          {activeCycleLockMessage ? (
            <CicloSavedMessage message={activeCycleLockMessage} variant="warning" />
          ) : null}

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
        title="¿Estás seguro de que deseas eliminar este registro?"
        description={`Se eliminará ${cycleToDelete?.nombre ?? "este ciclo"}. Esta acción no se puede deshacer en los datos temporales actuales.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onCancel={() => setCycleToDelete(null)}
        onConfirm={confirmDelete}
      />
    </PanelLayout>
  );
}
