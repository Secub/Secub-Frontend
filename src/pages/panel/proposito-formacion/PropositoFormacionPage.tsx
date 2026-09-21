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
import { useMemo } from "react";
// TOUR: import del hook y el tipo de pasos
import { useOnboardingTour, type OnboardingTourStep } from "../../../components/OnboardingTour";

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

  const tourSteps = useMemo<OnboardingTourStep[]>(
    () => [
      {
        target: "#proposito-filters-panel",
        title: "Filtros",
        content: "Filtra los propósitos de formación por programa, estado u otros criterios.",
        order: 1,
      },
      {
        target: "#proposito-list-section",
        title: "Listado de propósitos",
        content: "Aquí ves todos los propósitos de formación registrados. Puedes ver, editar o eliminar cada uno.",
        order: 2,
      },
      {
        target: "#proposito-page-actions",
        title: "Acciones",
        content: "Desde aquí puedes crear un nuevo propósito o exportarlos en PDF/Excel.",
        order: 3,
      },
    ],
    []
  );

  const canShowTour = !isStepLocked && hasRecords && !isInheritedBaseStep;

  const { startTour } = useOnboardingTour({
    steps: tourSteps,
    storageKey: "tour_proposito_formacion_v1",
    autoStart: canShowTour,
    enabled: canShowTour,
  });


  const hasPageActions =
    permissions.canCreate || permissions.canExportPdf || permissions.canExportExcel;
  // TOUR: envuelto en <div id="proposito-page-actions"> para poder resaltarlo
  const pageActions = hasPageActions ? (
    <div id="proposito-page-actions">
      <PropositoPageActions
        permissions={permissions}
        filteredRecords={filteredRecords}
        onCreate={openCreateModal}
        onExport={setExportFormat}
      />
    </div>
  ) : undefined;

  return (
    <PanelLayout
      currentStep="proposito-formacion"
      title="Propósito de Formación"
      description={
        permissions.canUpdate
          ? "Consulta y gestión del propósito de formación institucional."
          : "Consulta el propósito de formación institucional."
      }
      actions={!isStepLocked && hasRecords && !isInheritedBaseStep ? pageActions : undefined}
    >
      {/* TOUR: botón para relanzar el tour manualmente */}
      {!isStepLocked && hasRecords ? (
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
          description={getAcademicWorkflowLockedDescription("proposito-formacion")}
          helperText="La restricción secuencial se valida solo en Gestión Académica."
        />
      ) : !hasRecords ? (
        <WorkflowStateCard
          title="Aún no hay propósitos de formación creados"
          description={
            permissions.canCreate
              ? "Cuando se cargue el primer propósito de formación, se habilitará la vista completa con filtros, tabla, acciones y exportación."
              : "Todavía no hay propósitos de formación disponibles para consulta."
          }
          actionLabel={permissions.canCreate && !isInheritedBaseStep ? "Crear propósito de formación" : undefined}
          onAction={permissions.canCreate && !isInheritedBaseStep ? openCreateModal : undefined}
        />
      ) : (
        <div className={showFlowActionBar ? "space-y-6 pb-24" : "space-y-6"}>
          {/* TOUR: id agregado para el paso 1 */}
          <div id="proposito-filters-panel">
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
          </div>

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

      {permissions.canCreate || permissions.canUpdate ? (
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
      ) : null}

      {permissions.canDelete ? (
        <ConfirmDialog
          open={Boolean(recordToDelete)}
          title={`¿Seguro que deseas eliminar el propósito de formación de "${recordToDelete?.programaNombre ?? "este programa"}"?`}
          description="Se eliminará el propósito de formación seleccionado. Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          variant="danger"
          onCancel={() => setRecordToDelete(null)}
          onConfirm={confirmDelete}
        />
      ) : null}

      {permissions.canExportPdf ? (
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
      ) : null}

      {permissions.canExportExcel ? (
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
      ) : null}
    </PanelLayout>
  );
}