import {
  FlowActionBar,
  PanelLayout,
  WorkflowStateCard,
  getAcademicWorkflowLockedDescription,
} from "../../../components/panel";
import { getAcademicWorkflowState, useAcademicWorkflowProgress } from "../../../components/panel/academicWorkflow";
import { ROUTES, buildRouteWithSearch, navigateToRoute } from "../../../app/appRoutes";
import { ConfirmDialog } from "../../../components/ui";
import PropositoDetailModal from "./components/PropositoDetailModal";
import PropositoExportModal from "./components/PropositoExportModal";
import PropositoFiltersPanel from "./components/PropositoFilters";
import PropositoFormModal from "./components/PropositoFormModal";
import PropositoListSection from "./components/PropositoListSection";
import PropositoPageActions from "./components/PropositoPageActions";
import { usePropositoFormacionPage } from "./hooks/usePropositoFormacionPage";
import { INITIAL_FILTERS } from "./proposito-formacion.utils";

export default function PropositoFormacionPage() {
  const page = usePropositoFormacionPage();
  const {
    currentUser,
    catalogs,
    permissions,
    isStepLocked,
    isInheritedBaseStep,
    hasRecords,
    filters,
    selectedRecord,
    recordToDelete,
    detailOpen,
    formOpen,
    formMode,
    formValues,
    exportFormat,
    roleScopedRecords,
    filteredRecords,
    availableFilterOptions,
    openCreateModal,
    openEditModal,
    openDetailModal,
    handleDelete,
    confirmDelete,
    handleFilterChange,
    handleFormSubmit,
    setFilters,
    setRecordToDelete,
    setDetailOpen,
    setFormOpen,
    setExportFormat,
  } = page;

  const workflowProgress = useAcademicWorkflowProgress();
  const isPropositoStepComplete = Boolean(workflowProgress["proposito-formacion"]);
  const isWorkflowActive = getAcademicWorkflowState(workflowProgress) !== "completed";
  const showFlowActionBar =
    isWorkflowActive && !isStepLocked && permissions.canUpdate && hasRecords;
  const handleNextStep = () => {
    if (!isPropositoStepComplete) return;

    navigateToRoute(buildRouteWithSearch(ROUTES.panelCompetenciasRa, { role: currentUser.role }));
  };

  const pageActions = (
    <PropositoPageActions
      permissions={permissions}
      filteredRecords={filteredRecords}
      onCreate={openCreateModal}
      onExport={setExportFormat}
    />
  );

  return (
    <PanelLayout
      currentStep="proposito-formacion"
      title="Propósito de Formación"
      description="Consulta y gestión del propósito de formación institucional."
      actions={!isStepLocked && hasRecords && !isInheritedBaseStep ? pageActions : undefined}
    >
      {isStepLocked ? (
        <WorkflowStateCard
          variant="locked"
          title="Este paso aún no está disponible"
          description={getAcademicWorkflowLockedDescription("proposito-formacion")}
          helperText="La restricción secuencial se valida solo en Gestión Académica."
        />
      ) : !hasRecords ? (
        <WorkflowStateCard
          title="Aún no hay propósitos de formación creados"
          description="Cuando se cargue el primer propósito de formación, se habilitará la vista completa con filtros, tabla, acciones y exportación."
          actionLabel={permissions.canCreate && !isInheritedBaseStep ? "Crear propósito de formación" : undefined}
          onAction={permissions.canCreate && !isInheritedBaseStep ? openCreateModal : undefined}
        />
      ) : (
        <div className="space-y-6 pb-24">
          <PropositoFiltersPanel
            user={currentUser}
            permissions={permissions}
            filters={filters}
            filterOptions={availableFilterOptions}
            filteredCount={filteredRecords.length}
            totalCount={roleScopedRecords.length}
            onFilterChange={handleFilterChange}
            onReset={() => setFilters(INITIAL_FILTERS)}
            activeRecords={filteredRecords}
          />

          <PropositoListSection
            data={filteredRecords}
            role={currentUser.role}
            permissions={permissions}
            onView={openDetailModal}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        </div>
      )}

      {showFlowActionBar ? (
        <FlowActionBar
          description={
            isPropositoStepComplete
              ? "El propósito de formación ya está guardado. Continúa al siguiente paso cuando hayas revisado la información."
              : "Crea y guarda el propósito de formación requerido para habilitar el avance al siguiente paso."
          }
          showNext
          nextLabel="Siguiente paso"
          nextDisabled={!isPropositoStepComplete}
          nextTitle={
            isPropositoStepComplete
              ? "Avanzar a Competencias y RA"
              : "Completa y guarda el propósito de formación antes de avanzar."
          }
          onNext={handleNextStep}
        />
      ) : null}

      <PropositoDetailModal
        open={detailOpen}
        record={selectedRecord}
        onClose={() => setDetailOpen(false)}
      />

      <PropositoFormModal
        open={formOpen}
        mode={formMode}
        user={currentUser}
        catalogs={catalogs}
        initialValues={formValues}
        records={roleScopedRecords}
        record={selectedRecord}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={Boolean(recordToDelete)}
        title={`¿Seguro que deseas eliminar el propósito de formación de "${recordToDelete?.programaNombre ?? "este programa"}"?`}
        description="Se eliminará el propósito de formación seleccionado. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
        onCancel={() => setRecordToDelete(null)}
        onConfirm={confirmDelete}
      />

      <PropositoExportModal
        open={exportFormat === "pdf"}
        title="Exportación de propósitos de formación en PDF"
        format="pdf"
        permissions={permissions}
        catalogs={catalogs}
        baseRecords={roleScopedRecords}
        initialFilters={filters}
        onClose={() => setExportFormat(null)}
      />

      <PropositoExportModal
        open={exportFormat === "excel"}
        title="Exportación de propósitos de formación en Excel"
        format="excel"
        permissions={permissions}
        catalogs={catalogs}
        baseRecords={roleScopedRecords}
        initialFilters={filters}
        onClose={() => setExportFormat(null)}
      />
    </PanelLayout>
  );
}
