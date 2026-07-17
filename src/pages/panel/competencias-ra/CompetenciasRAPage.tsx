import {
  FlowActionBar,
  PanelLayout,
  WorkflowStateCard,
  getAcademicWorkflowLockedDescription,
} from "../../../components/panel";
import { getAcademicWorkflowState, useAcademicWorkflowProgress } from "../../../components/panel/academicWorkflow";
import { ROUTES, buildRouteWithSearch, navigateToRoute } from "../../../app/appRoutes";
import { ConfirmDialog } from "../../../components/ui";
import CompetenciasRaDetailModal from "./components/CompetenciasRaDetailModal";
import CompetenciasRaExportModal from "./components/CompetenciasRaExportModal";
import CompetenciasRaFiltersPanel from "./components/CompetenciasRaFilters";
import CompetenciasRaFormModal from "./components/CompetenciasRaFormModal";
import CompetenciasRaListSection from "./components/CompetenciasRaListSection";
import CompetenciasRaModalRA from "./components/CompetenciasRaModalRA";
import CompetenciasRaPageActions from "./components/CompetenciasRaPageActions";
import { canEditCompetenciasRa } from "./CompetenciasRa.permissions";
import { INITIAL_FILTERS, MAX_RA_PER_COMPETENCIA } from "./CompetenciasRa.utils";
import { useCompetenciasRAPage } from "./hooks/useCompetenciasRAPage";

export default function CompetenciasRaFormacionPage() {
  const page = useCompetenciasRAPage();
  const {
    currentUser,
    catalogs,
    permissions,
    isStepLocked,
    hasRecords,
    filters,
    sortOrder,
    selectedRecord,
    detailOpen,
    formOpen,
    formMode,
    formValues,
    exportFormat,
    raModalMode,
    selectedRaRecord,
    recordToDelete,
    raDraft,
    raError,
    roleScopedRecords,
    filteredRecords,
    availableFilterOptions,
    invalidCompetencias,
    openCreateModal,
    openViewModal,
    openCreateRaModal,
    openEditRaModal,
    handleSaveRa,
    handleSaveCompetenciaDescription,
    handleDelete,
    confirmDelete,
    handleFilterChange,
    handleFormSubmit,
    closeRaModal,
    setFilters,
    setSortOrder,
    setDetailOpen,
    setFormOpen,
    setExportFormat,
    setRecordToDelete,
    setRaDraft,
    setRaError,
  } = page;

  const workflowProgress = useAcademicWorkflowProgress();
  const isCompetenciasStepComplete = Boolean(workflowProgress["competencias-ra"]) && invalidCompetencias.length === 0;
  const isWorkflowActive = getAcademicWorkflowState(workflowProgress) !== "completed";
  const showFlowActionBar = isWorkflowActive && !isStepLocked && permissions.canRead && hasRecords;
  const handleNextStep = () => {
    if (!isCompetenciasStepComplete) return;

    navigateToRoute(buildRouteWithSearch(ROUTES.panelMapeoCompetencias, { role: currentUser.role }));
  };

  const isCreateRaLimitReached =
    raModalMode === "create" &&
    Boolean(selectedRaRecord && (selectedRaRecord.resultadosAprendizaje?.length ?? 0) >= MAX_RA_PER_COMPETENCIA);

  const pageActions = (
    <CompetenciasRaPageActions
      permissions={permissions}
      filteredRecords={filteredRecords}
      onCreate={openCreateModal}
      onExport={setExportFormat}
    />
  );

  return (
    <PanelLayout
      currentStep="competencias-ra"
      title="Competencias y Resultados de Aprendizaje"
      description="Gestión, consulta y exportación de las competencias y resultados de aprendizaje según el alcance institucional del rol autenticado."
      actions={!isStepLocked && hasRecords ? pageActions : undefined}
    >
      {isStepLocked ? (
        <WorkflowStateCard
          variant="locked"
          title="Este paso aún no está disponible"
          description={getAcademicWorkflowLockedDescription("competencias-ra")}
          helperText="La restricción secuencial se valida solo en Gestión Académica."
        />
      ) : !hasRecords ? (
        <WorkflowStateCard
          title="Aún no hay competencias ni RA creados"
          description="Cuando se cargue la primera competencia, se habilitará la vista completa. Agrega al menos un RA para completar el paso y habilitar Mapeo."
          actionLabel={permissions.canCreate ? "Crear competencia" : undefined}
          onAction={permissions.canCreate ? openCreateModal : undefined}
          helperText="No se muestran datos de prueba ni información precargada."
        />
      ) : (
        <div className="space-y-6 pb-24">
          <CompetenciasRaFiltersPanel
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

          <CompetenciasRaListSection
            data={filteredRecords}
            role={currentUser.role}
            permissions={permissions}
            invalidCount={invalidCompetencias.length}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            onView={openViewModal}
            onAddRa={openCreateRaModal}
            onEditRa={openEditRaModal}
            onCreate={openCreateModal}
          />
        </div>
      )}

      {showFlowActionBar ? (
        <FlowActionBar
          description={
            isCompetenciasStepComplete
              ? "Las competencias y RA ya están guardados. Continúa al siguiente paso cuando las relaciones estén completas."
              : "Completa las competencias y agrega los RA requeridos para habilitar el avance al siguiente paso."
          }
          showNext
          nextLabel="Siguiente paso"
          nextDisabled={!isCompetenciasStepComplete}
          nextTitle={
            isCompetenciasStepComplete
              ? "Avanzar a Mapeo de Competencias"
              : "Completa y guarda las competencias con sus RA antes de avanzar."
          }
          onNext={handleNextStep}
        />
      ) : null}

      <CompetenciasRaDetailModal
        open={detailOpen}
        record={selectedRecord}
        canEdit={Boolean(selectedRecord && canEditCompetenciasRa(currentUser.role, selectedRecord) && permissions.canUpdate)}
        canDelete={Boolean(selectedRecord && permissions.canDelete)}
        onClose={() => setDetailOpen(false)}
        onSaveDescription={handleSaveCompetenciaDescription}
        onDelete={handleDelete}
        onEditRa={openEditRaModal}
      />

      <CompetenciasRaFormModal
        open={formOpen}
        mode={formMode}
        user={currentUser}
        catalogs={catalogs}
        initialValues={formValues}
        record={selectedRecord}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <CompetenciasRaModalRA
        mode={raModalMode}
        record={selectedRaRecord}
        draft={raDraft}
        error={raError}
        onDraftChange={setRaDraft}
        onClearError={() => setRaError("")}
        onClose={closeRaModal}
        onSave={handleSaveRa}
        isCreateLimitReached={isCreateRaLimitReached}
      />

      <ConfirmDialog
        open={Boolean(recordToDelete)}
        title="¿Estás seguro de que deseas eliminar este registro?"
        description={`Se eliminará la competencia de ${recordToDelete?.programaNombre ?? "este programa"}, sus RA asociados y las relaciones demo vinculadas. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onCancel={() => setRecordToDelete(null)}
        onConfirm={confirmDelete}
      />

      <CompetenciasRaExportModal
        open={exportFormat === "pdf"}
        title="Exportación de competencias y RA en PDF"
        format="pdf"
        permissions={permissions}
        catalogs={catalogs}
        baseRecords={roleScopedRecords}
        initialFilters={filters}
        onClose={() => setExportFormat(null)}
      />

      <CompetenciasRaExportModal
        open={exportFormat === "excel"}
        title="Exportación de competencias y RA en Excel"
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
