import {
  PanelLayout,
  WorkflowStateCard,
  getAcademicWorkflowLockedDescription,
} from "../../../components/panel";
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
    handleFilterChange,
    openCreateModal,
    openEditModal,
    handleViewDetail,
    handleSubmit,
    confirmDelete,
    setFilters,
    setFormOpen,
    setCycleToDelete,
    setSavedMessage,
  } = page;

  const pageActions = (
    <CicloPageActions canCreate={permissions.canCreateCycle} onCreate={openCreateModal} />
  );

  return (
    <PanelLayout
      currentStep="ciclo"
      title="Creación del ciclo de medición"
      description="Configuración del periodo de 1.5 años y selección de cursos del núcleo de Síntesis para el mapeo curricular."
      actions={!isStepLocked && hasCycles ? pageActions : undefined}
      breadcrumbItems={[
        { label: "Dashboard", href: "/panel/dashboard" },
        { label: "Gestión Académica" },
        { label: "Creación del ciclo de medición" },
      ]}
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
          actionLabel={permissions.canCreateCycle ? "Crear ciclo de medición" : undefined}
          onAction={permissions.canCreateCycle ? openCreateModal : undefined}
          helperText="No se muestran datos de prueba ni información precargada."
        />
      ) : (
        <div className="space-y-6">
          <CicloSavedMessage message={savedMessage} onClose={() => setSavedMessage("")} />

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
          />
        </div>
      )}

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
        title="Eliminar ciclo"
        description={`¿Estás segura de que deseas eliminar ${cycleToDelete?.nombre ?? "este ciclo"}? Esta acción solo afectará los datos temporales actuales.`}
        confirmLabel="Aceptar"
        cancelLabel="Declinar"
        variant="danger"
        onCancel={() => setCycleToDelete(null)}
        onConfirm={confirmDelete}
      />
    </PanelLayout>
  );
}
