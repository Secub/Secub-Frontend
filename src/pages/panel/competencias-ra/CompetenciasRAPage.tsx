import {
  PanelLayout,
  WorkflowStateCard,
  getAcademicWorkflowLockedDescription,
} from "../../../components/panel";
import CompetenciasRaDetailModal from "./components/CompetenciasRaDetailModal";
import CompetenciasRaExportModal from "./components/CompetenciasRaExportModal";
import CompetenciasRaFiltersPanel from "./components/CompetenciasRaFilters";
import CompetenciasRaFormModal from "./components/CompetenciasRaFormModal";
import CompetenciasRaListSection from "./components/CompetenciasRaListSection";
import CompetenciasRaModalRA from "./components/CompetenciasRaModalRA";
import CompetenciasRaPageActions from "./components/CompetenciasRaPageActions";
import { canEditCompetenciasRa } from "./CompetenciasRa.permissions";
import { INITIAL_FILTERS } from "./CompetenciasRa.utils";
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
    handleFilterChange,
    handleFormSubmit,
    closeRaModal,
    setFilters,
    setSortOrder,
    setDetailOpen,
    setFormOpen,
    setExportFormat,
    setRaDraft,
    setRaError,
  } = page;

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
        <div className="space-y-6">
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
          />
        </div>
      )}

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
