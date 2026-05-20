import {
  PanelLayout,
  WorkflowStateCard,
  getAcademicWorkflowLockedDescription,
} from "../../../components/panel";
import PerfilEgresoDetailModal from "./components/PerfilEgresoDetailModal";
import PerfilEgresoExportModal from "./components/PerfilEgresoExportModal";
import PerfilEgresoFilters from "./components/PerfilEgresoFilters";
import PerfilEgresoFormModal from "./components/PerfilEgresoFormModal";
import PerfilEgresoListSection from "./components/PerfilEgresoListSection";
import PerfilEgresoPageActions from "./components/PerfilEgresoPageActions";
import { INITIAL_FILTERS } from "./perfil-egreso.utils";
import { usePerfilEgresoPage } from "./hooks/usePerfilEgresoPage";

export default function PerfilEgresoPage() {
  const page = usePerfilEgresoPage();
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
    <PerfilEgresoPageActions
      permissions={permissions}
      filteredRecords={filteredRecords}
      onCreate={openCreateModal}
      onExport={setExportFormat}
    />
  );

  return (
    <PanelLayout
      currentStep="perfil-egreso"
      title="Perfil de Egreso"
      description="Visualización, filtrado, creación, actualización, eliminación y exportación del perfil de egreso según el alcance institucional del rol autenticado."
      actions={!isStepLocked && hasRecords ? pageActions : undefined}
    >
      {isStepLocked ? (
        <WorkflowStateCard
          variant="locked"
          title="Este paso aún no está disponible"
          description={getAcademicWorkflowLockedDescription("perfil-egreso")}
          helperText="La restricción secuencial se valida solo en Gestión Académica."
        />
      ) : !hasRecords ? (
        <WorkflowStateCard
          title="Aún no hay perfiles de egreso creados"
          description="Cuando se cargue el primer perfil de egreso, se habilitará la vista completa con filtros, tabla, acciones y exportación."
          actionLabel={permissions.canCreate ? "Crear perfil de egreso" : undefined}
          onAction={permissions.canCreate ? openCreateModal : undefined}
          helperText="No se muestran datos de prueba ni información precargada."
        />
      ) : (
        <div className="space-y-6">
          <PerfilEgresoFilters
            user={currentUser}
            permissions={permissions}
            filters={filters}
            filterOptions={availableFilterOptions}
            onFilterChange={handleFilterChange}
            onReset={() => setFilters(INITIAL_FILTERS)}
          />

          <PerfilEgresoListSection
            data={filteredRecords}
            role={currentUser.role}
            permissions={permissions}
            onView={openDetailModal}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        </div>
      )}

      <PerfilEgresoDetailModal
        open={detailOpen}
        record={selectedRecord}
        onClose={() => setDetailOpen(false)}
      />

      <PerfilEgresoFormModal
        open={formOpen}
        mode={formMode}
        user={currentUser}
        catalogs={catalogs}
        initialValues={formValues}
        record={selectedRecord}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <PerfilEgresoExportModal
        open={exportFormat === "pdf"}
        title="Exportación de perfiles de egreso en PDF"
        format="pdf"
        permissions={permissions}
        catalogs={catalogs}
        baseRecords={roleScopedRecords}
        initialFilters={filters}
        onClose={() => setExportFormat(null)}
      />

      <PerfilEgresoExportModal
        open={exportFormat === "excel"}
        title="Exportación de perfiles de egreso en Excel"
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
