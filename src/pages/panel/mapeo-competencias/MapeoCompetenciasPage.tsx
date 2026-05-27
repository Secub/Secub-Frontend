import { GoDownload, GoPencil, GoPlus, GoTrash } from "react-icons/go";
import { PanelLayout } from "../../../components/panel";
import { Button, ConfirmDialog } from "../../../components/ui";
import {
  MapeoCompetenciasAccessState,
  MapeoCompetenciasFilters,
} from "./components";
import MapeoCompetenciasConsolidatedSection from "./components/MapeoCompetenciasConsolidatedSection";
import { getAccessRestrictedDescription } from "./MapeoCompetencias.permissions";
import { useMapeoCompetenciasPage } from "./hooks/useMapeoCompetenciasPage";

function getNucleoCount(records: ReturnType<typeof useMapeoCompetenciasPage>["filteredRecords"], nucleo: string) {
  return records.reduce((total, record) => {
    return total + record.semestresResumen.filter((semestre) => semestre.nucleo === nucleo).length;
  }, 0);
}

export default function MapeoCompetenciasPage() {
  const page = useMapeoCompetenciasPage();
  const {
    currentUser,
    catalogs,
    permissions,
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
    handleExportExcel,
    handleExportPdf,
    confirmDelete,
  } = page;

  const firstRecordForActions = selectedRecord ?? filteredRecords[0] ?? null;
  const fundamentacionCount = getNucleoCount(filteredRecords, "fundamentacion");
  const profesionalizacionCount = getNucleoCount(filteredRecords, "profesionalizacion");
  const sintesisCount = getNucleoCount(filteredRecords, "sintesis");

  return (
    <PanelLayout
      currentStep="mapeo-competencias"
      title="Mapeo de Competencias"
      description="Asignación I-R-A-NA y visualización de la malla curricular por semestres y cursos."
      breadcrumbItems={[
        { label: "Gestión Académica" },
        { label: "Mapeo de Competencias" },
      ]}
    >
      {!permissions.canRead ? (
        <MapeoCompetenciasAccessState
          title="Acceso restringido"
          description={getAccessRestrictedDescription(currentUser.role)}
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

          <div className="flex flex-wrap justify-end gap-3">
            {permissions.canExportPdf ? (
              <Button variant="outline" leftIcon={<GoDownload />} disabled={filteredRecords.length === 0} onClick={handleExportPdf}>
                Exportar PDF
              </Button>
            ) : null}

            {permissions.canExportExcel ? (
              <Button variant="outline" leftIcon={<GoDownload />} disabled={filteredRecords.length === 0} onClick={handleExportExcel}>
                Exportar Excel
              </Button>
            ) : null}

            {canOpenCreate ? (
              <Button variant="primary" leftIcon={<GoPlus />} onClick={handleCreate}>
                Crear mapeo
              </Button>
            ) : null}

            {canOpenEdit && firstRecordForActions ? (
              <Button variant="primary_soft" leftIcon={<GoPencil />} onClick={() => handleEdit(firstRecordForActions)}>
                Editar mapeo
              </Button>
            ) : null}

            {permissions.canDelete && firstRecordForActions ? (
              <Button variant="danger" leftIcon={<GoTrash />} onClick={() => setRecordToDelete(firstRecordForActions)}>
                Eliminar mapeo
              </Button>
            ) : null}
          </div>

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

          {currentUser.role !== "director" ? (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-info)] bg-[var(--color-surface-soft)] px-5 py-4 text-sm leading-6 text-[var(--color-gray-3)]">
              Puedes consultar la información consolidada según tu alcance. La clasificación de núcleos y el mapeo I-R-A-NA están habilitados funcionalmente solo para Director de Programa.
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
        </div>
      )}
    </PanelLayout>
  );
}
