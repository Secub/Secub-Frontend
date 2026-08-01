import {
  FlowActionBar,
  PanelLayout,
  WorkflowStateCard,
  getAcademicWorkflowLockedDescription,
} from "../../../components/panel";
import { getAcademicWorkflowState, useAcademicWorkflowProgress } from "../../../components/panel/academicWorkflow";
import { ROUTES, buildRouteWithSearch, navigateToRoute } from "../../../app/appRoutes";
import { ConfirmDialog } from "../../../components/ui";
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
  const isPerfilStepComplete = Boolean(workflowProgress["perfil-egreso"]);
  const isWorkflowActive = getAcademicWorkflowState(workflowProgress) !== "completed";
  const showFlowActionBar = isWorkflowActive && !isStepLocked && permissions.canRead && hasRecords;
  const handleNextStep = () => {
    if (!isPerfilStepComplete) return;

    navigateToRoute(buildRouteWithSearch(ROUTES.panelPropositoFormacion, { role: currentUser.role }));
  };

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
      description="Consulta y gestión de la información institucional del perfil de egreso."
      actions={!isStepLocked && hasRecords && !isInheritedBaseStep ? pageActions : undefined}
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
          actionLabel={permissions.canCreate && !isInheritedBaseStep ? "Crear perfil de egreso" : undefined}
          onAction={permissions.canCreate && !isInheritedBaseStep ? openCreateModal : undefined}
          helperText="No se muestran datos de prueba ni información precargada."
        />
      ) : (
        <div className="space-y-6 pb-24">
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

      {showFlowActionBar ? (
        <FlowActionBar
          description={
            isPerfilStepComplete
              ? "El perfil de egreso ya está guardado. Continúa al siguiente paso cuando hayas revisado la información."
              : "Crea y guarda el perfil de egreso requerido para habilitar el avance al siguiente paso."
          }
          showNext
          nextLabel="Siguiente paso"
          nextDisabled={!isPerfilStepComplete}
          nextTitle={
            isPerfilStepComplete
              ? "Avanzar a Propósito de Formación"
              : "Completa y guarda el perfil de egreso antes de avanzar."
          }
          onNext={handleNextStep}
        />
      ) : null}

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
        records={roleScopedRecords} 
        record={selectedRecord}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={Boolean(recordToDelete)}
        title="¿Estás seguro de que deseas eliminar este registro?"
        description={`Se eliminará el perfil de egreso de ${recordToDelete?.programaNombre ?? "este programa"}. Esta acción no se puede deshacer en los datos temporales actuales.`}
        confirmLabel="Eliminar"
        variant="danger"
        onCancel={() => setRecordToDelete(null)}
        onConfirm={confirmDelete}
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
