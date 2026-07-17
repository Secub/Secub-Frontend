import { GoPlus } from "react-icons/go";
import { ROUTES, buildRouteWithSearch, navigateToRoute } from "../../../app/appRoutes";
import {
  FlowActionBar,
  PanelLayout,
  WorkflowStateCard,
} from "../../../components/panel";
import {
  getAcademicWorkflowState,
  useAcademicWorkflowProgress,
} from "../../../components/panel/academicWorkflow";
import { Button, ConfirmDialog } from "../../../components/ui";
import {
  MapeoCompetenciasAccessState,
  MapeoCompetenciasFilters,
} from "./components";
import MapeoCompetenciasConsolidatedSection from "./components/MapeoCompetenciasConsolidatedSection";
import { getAccessRestrictedDescription } from "./MapeoCompetencias.permissions";
import type { MapeoCompetenciasEnriched } from "./MapeoCompetencias.types";
import { useMapeoCompetenciasPage } from "./hooks/useMapeoCompetenciasPage";

function getNucleoCount(records: ReturnType<typeof useMapeoCompetenciasPage>["filteredRecords"], nucleo: string) {
  return records.reduce((total, record) => {
    return total + record.semestresResumen.filter((semestre) => semestre.nucleo === nucleo).length;
  }, 0);
}

function isConsolidatedMapeoComplete(record: MapeoCompetenciasEnriched | null) {
  if (!record?.semestresResumen.length) return false;

  const representedNucleos = new Set(record.semestresResumen.map((semestre) => semestre.nucleo).filter(Boolean));
  const classificationComplete =
    record.semestresResumen.every((semestre) => Boolean(semestre.nucleo)) &&
    representedNucleos.has("fundamentacion") &&
    representedNucleos.has("profesionalizacion") &&
    representedNucleos.has("sintesis");
  const hasCoursesToMap = record.semestresResumen.some((semestre) => semestre.totalCeldas > 0);
  const levelMappingComplete = record.semestresResumen.every(
    (semestre) => semestre.totalCeldas === 0 || semestre.totalAsignadas >= semestre.totalCeldas,
  );

  return classificationComplete && hasCoursesToMap && levelMappingComplete;
}

export default function MapeoCompetenciasPage() {
  const page = useMapeoCompetenciasPage();
  const {
    currentUser,
    catalogs,
    permissions,
    hasRecords,
    filters,
    filteredRecords,
    selectedPrograma,
    selectedPlan,
    selectedRecord,
    canOpenCreate,
    canOpenEdit,
    recordToDelete,
    setFilters,
    setRecordToDelete,
    handleCreate,
    handleEdit,
    // handleExportExcel,
    // handleExportPdf,
    confirmDelete,
  } = page;

  const workflowProgress = useAcademicWorkflowProgress();
  const isWorkflowActive = getAcademicWorkflowState(workflowProgress) !== "completed";
  const activeConsolidatedRecord = selectedRecord ?? filteredRecords[0] ?? null;
  const isMapeoComplete = isConsolidatedMapeoComplete(activeConsolidatedRecord);
  const fundamentacionCount = getNucleoCount(filteredRecords, "fundamentacion");
  const profesionalizacionCount = getNucleoCount(filteredRecords, "profesionalizacion");
  const sintesisCount = getNucleoCount(filteredRecords, "sintesis");
  // const exportActions = hasRecords ? (
  //   <>
  //     {permissions.canExportPdf ? (
  //       <Button variant="outline" leftIcon={<GoDownload />} disabled={filteredRecords.length === 0} onClick={handleExportPdf}>
  //         Exportar PDF
  //       </Button>
  //     ) : null}

  //     {permissions.canExportExcel ? (
  //       <Button variant="outline" leftIcon={<GoDownload />} disabled={filteredRecords.length === 0} onClick={handleExportExcel}>
  //         Exportar Excel
  //       </Button>
  //     ) : null}
  //   </>
  // ) : undefined;

  const handleNextStep = () => {
    if (!isMapeoComplete) return;
    navigateToRoute(buildRouteWithSearch(ROUTES.panelCiclo, { role: currentUser.role }));
  };

  return (
    <PanelLayout
      currentStep="mapeo-competencias"
      title="Mapeo de Competencias"
      description="Asignación I-R-A-NA y visualización de la malla curricular por semestres y cursos."
      // actions={exportActions}
    >
      {!permissions.canRead ? (
        <MapeoCompetenciasAccessState
          title="Acceso restringido"
          description={getAccessRestrictedDescription(currentUser.role)}
        />
      ) : !hasRecords ? (
        <WorkflowStateCard
          title="Aún no hay mapeos de competencias específicas creados"
          description="Cuando se cargue el primer mapeo de competencias específicas, se habilitará la vista completa con filtros, consolidado, acciones y exportación."
          actionLabel={canOpenCreate ? "Crear mapeo" : undefined}
          onAction={canOpenCreate ? handleCreate : undefined}
          helperText="No se muestran datos de prueba ni información precargada."
        />
      ) : (
        <div className="space-y-6">
          {filteredRecords.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              <article className="surface-card rounded-lg p-5 text-center">
                <p className="text-sm font-semibold text-[var(--color-gray-3)]">Fundamentación</p>
                <p className="mt-3 text-3xl font-bold text-[var(--color-secondary-4)]">{fundamentacionCount}</p>
                <p className="mt-1 text-xs text-[var(--color-gray-4)]">Semestres iniciales</p>
              </article>

              <article className="surface-card rounded-lg p-5 text-center">
                <p className="text-sm font-semibold text-[var(--color-gray-3)]">Profesionalización</p>
                <p className="mt-3 text-3xl font-bold text-[var(--color-secondary-4)]">{profesionalizacionCount}</p>
                <p className="mt-1 text-xs text-[var(--color-gray-4)]">Semestres avanzados</p>
              </article>

              <article className="surface-card rounded-lg p-5 text-center">
                <p className="text-sm font-semibold text-[var(--color-gray-3)]">Síntesis</p>
                <p className="mt-3 text-3xl font-bold text-[var(--color-secondary-4)]">{sintesisCount}</p>
                <p className="mt-1 text-xs text-[var(--color-gray-4)]">Semestres de cierre</p>
              </article>
            </div>
          ) : null}

          {canOpenCreate ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="primary" leftIcon={<GoPlus />} onClick={handleCreate}>
                Crear mapeo
              </Button>
            </div>
          ) : null}

          <MapeoCompetenciasFilters
            filters={filters}
            catalogs={catalogs}
            permissions={permissions}
            currentUser={currentUser}
            onChange={setFilters}
          />

          {selectedPrograma?.estado === "inactivo" || selectedPlan?.estado === "inactivo" ? (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-warning)] bg-[var(--color-surface-soft)] px-5 py-4 text-sm leading-6 text-[var(--color-gray-3)]">
              Este programa académico está inactivo. Solo puedes visualizar la información.
            </div>
          ) : null}

          {currentUser.role !== "direccionPrograma" ? (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-info)] bg-[var(--color-surface-soft)] px-5 py-4 text-sm leading-6 text-[var(--color-gray-3)]">
              Puedes consultar la información consolidada según tu alcance. La clasificación de núcleos y el mapeo I-R-A-NA están habilitados funcionalmente solo para Dirección de programa.
            </div>
          ) : null}

          <MapeoCompetenciasConsolidatedSection
            records={filteredRecords}
            hasRequiredFilters={Boolean(filters.programaId && filters.planId)}
            canOpenCreate={canOpenCreate}
            canOpenEdit={canOpenEdit}
            selectedRecord={selectedRecord}
            canDelete={permissions.canDelete}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={setRecordToDelete}
          />

          <ConfirmDialog
            open={Boolean(recordToDelete)}
            title="Eliminar mapeo"
            description="Esta acción marcará el registro como eliminado en mockBackend."
            confirmLabel="Eliminar"
            variant="danger"
            onCancel={() => setRecordToDelete(null)}
            onConfirm={confirmDelete}
          />

          {isWorkflowActive && filteredRecords.length > 0 ? (
            <FlowActionBar
              description={
                isMapeoComplete
                  ? "El mapeo de competencias está completo y guardado. Continúa al siguiente módulo cuando hayas revisado la información consolidada."
                  : "Completa y guarda la configuración de núcleos y todos los niveles de compromiso antes de continuar."
              }
              showNext
              nextLabel="Siguiente paso"
              nextDisabled={!isMapeoComplete}
              nextTitle={
                isMapeoComplete
                  ? "Avanzar a Creación del ciclo"
                  : "Completa y guarda el mapeo de competencias antes de avanzar."
              }
              onNext={handleNextStep}
            />
          ) : null}
        </div>
      )}
    </PanelLayout>
  );
}
