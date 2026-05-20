import {
  PanelLayout,
  WorkflowStateCard,
  getAcademicWorkflowLockedDescription,
} from "../../../components/panel";
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
    hasRecords,
    filters,
    selectedRecord,
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
    handleFilterChange,
    handleFormSubmit,
    setFilters,
    setDetailOpen,
    setFormOpen,
    setExportFormat,
  } = page;

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
      description="Gestión, consulta y exportación del propósito de formación según el alcance institucional del rol autenticado."
      actions={!isStepLocked && hasRecords ? pageActions : undefined}
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
          actionLabel={permissions.canCreate ? "Crear propósito de formación" : undefined}
          onAction={permissions.canCreate ? openCreateModal : undefined}
          helperText="No se muestran datos de prueba ni información precargada."
        />
      ) : (
        <div className="space-y-6">
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
        record={selectedRecord}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
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
