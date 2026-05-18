import { useEffect, useMemo, useState } from "react";
import { GoDownload, GoEye, GoFile, GoPlus } from "react-icons/go";
import {
  PanelLayout,
  WorkflowStateCard,
  getAcademicWorkflowLockedDescription,
  isAcademicWorkflowStepLocked,
} from "../../../components/panel";
import { mockBackend } from "../../../services/mockBackend";
import { scrollToFirstValidationError } from "../../../utils/validationScroll";
import { Button, Modal, Textarea } from "../../../components/ui";
import CompetenciasRaDetailModal from "./components/CompetenciasRaDetailModal";
import CompetenciasRaExportModal from "./components/CompetenciasRaExportModal";
import CompetenciasRaFiltersPanel from "./components/CompetenciasRaFilters";
import CompetenciasRaFormModal from "./components/CompetenciasRaFormModal";
import CompetenciasRaCardGrid from "./components/CompetenciasRaCardGrid";
import { getCurrentUser, getCatalogs } from "./CompetenciasRa.mock";
import { canEditCompetenciasRa, rolePermissions } from "./CompetenciasRa.permissions";
import {
  INITIAL_FILTERS,
  applyFilters,
  applyRoleScope,
  buildAvailableFilters,
  buildRecordFromForm,
  enrichCompetenciasRa,
  MAX_RA_PER_COMPETENCIA,
  canAddLearningResult,
  getDefaultLugarBySeccional,
  getEmptyFormState,
  getLearningResultsValidationMessage,
  sanitizeFilters,
  syncFiltersByActivePlan,
} from "./CompetenciasRa.utils";
import type {
  FormState,
  CompetenciasRaEnriched,
  CompetenciasRaFilters as FiltersState,
  CompetenciasRaFormacionRecord,
  ResultadoAprendizaje,
} from "./CompetenciasRa.types";

const currentUser = getCurrentUser();
const catalogs = getCatalogs();

export default function CompetenciasRaFormacionPage() {
  const [records, setRecords] = useState<CompetenciasRaFormacionRecord[]>(() =>
    mockBackend.list<CompetenciasRaFormacionRecord>("competenciasRa", currentUser),
  );
  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedRecord, setSelectedRecord] =
    useState<CompetenciasRaEnriched | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formValues, setFormValues] = useState<FormState>(
    getEmptyFormState(currentUser),
  );
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | null>(
    null,
  );
  const [raModalMode, setRaModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedRaRecord, setSelectedRaRecord] = useState<CompetenciasRaEnriched | null>(null);
  const [selectedRa, setSelectedRa] = useState<ResultadoAprendizaje | null>(null);
  const [raDraft, setRaDraft] = useState("");
  const [raError, setRaError] = useState("");

  const permissions = rolePermissions[currentUser.role];
  const isStepLocked = isAcademicWorkflowStepLocked("competencias-ra");
  const hasRecords = records.length > 0;


  const enrichedRecords = useMemo(
    () => enrichCompetenciasRa(records, catalogs),
    [records],
  );

  const roleScopedRecords = useMemo(() => {
    return applyRoleScope(enrichedRecords, currentUser);
  }, [enrichedRecords]);

  const availableFilterOptions = useMemo(() => {
    return buildAvailableFilters(roleScopedRecords, catalogs, filters);
  }, [filters, roleScopedRecords]);

  useEffect(() => {
    setFilters((current) => {
      const sanitized = sanitizeFilters(current, availableFilterOptions);

      if (
        sanitized.seccionalId === current.seccionalId &&
        sanitized.lugarId === current.lugarId &&
        sanitized.facultadId === current.facultadId &&
        sanitized.programaId === current.programaId &&
        sanitized.planId === current.planId &&
        sanitized.estado === current.estado
      ) {
        return current;
      }

      return sanitized;
    });
  }, [availableFilterOptions]);

  const filteredRecords = useMemo(() => {
    const filtered = applyFilters(roleScopedRecords, filters);

    return filtered.sort((a, b) => {
      if (sortOrder === "asc") {
        return (a.numero || 0) - (b.numero || 0);
      }

      return (b.numero || 0) - (a.numero || 0);
    });
  }, [filters, roleScopedRecords, sortOrder]);

  const refreshRecordsState = (nextRecords: CompetenciasRaFormacionRecord[], selectedId?: string) => {
    setRecords(nextRecords);

    if (!selectedId) return;

    const refreshedRecord = enrichCompetenciasRa(nextRecords, catalogs).find(
      (record) => record.id === selectedId,
    );

    setSelectedRecord(refreshedRecord ?? null);
    setSelectedRaRecord(refreshedRecord ?? null);
  };

  const openCreateModal = () => {
    setFormMode("create");
    setFormValues(getEmptyFormState(currentUser));
    setSelectedRecord(null);
    setFormOpen(true);
  };

  const openViewModal = (record: CompetenciasRaEnriched) => {
    setSelectedRecord(record);
    setDetailOpen(true);
  };

  const closeRaModal = () => {
    setRaModalMode(null);
    setSelectedRaRecord(null);
    setSelectedRa(null);
    setRaDraft("");
    setRaError("");
  };

  const openCreateRaModal = (record: CompetenciasRaEnriched) => {
    if (!canAddLearningResult(record)) {
      window.alert("Máximo 4 Resultados de Aprendizaje por competencia.");
      return;
    }

    setSelectedRaRecord(record);
    setSelectedRa(null);
    setRaDraft("");
    setRaError("");
    setRaModalMode("create");
  };

  const openEditRaModal = (record: CompetenciasRaEnriched, ra: ResultadoAprendizaje) => {
    setSelectedRaRecord(record);
    setSelectedRa(ra);
    setRaDraft(ra.descripcion);
    setRaError("");
    setRaModalMode("edit");
  };

  const handleSaveRa = () => {
    if (!selectedRaRecord) return;

    const description = raDraft.trim();

    if (!description) {
      setRaError("Escribe la descripción del RA.");
      scrollToFirstValidationError({ fieldOrder: ["raDescripcion"] });
      return;
    }

    const currentRas = selectedRaRecord.resultadosAprendizaje ?? [];

    if (raModalMode === "create" && currentRas.length >= MAX_RA_PER_COMPETENCIA) {
      setRaError("Máximo 4 Resultados de Aprendizaje por competencia.");
      scrollToFirstValidationError({ fieldOrder: ["raDescripcion"] });
      return;
    }

    const nextRas =
      raModalMode === "edit" && selectedRa
        ? currentRas.map((ra) =>
            ra.id === selectedRa.id ? { ...ra, descripcion: description } : ra,
          )
        : [
            ...currentRas,
            {
              id: `ra-${selectedRaRecord.id}-${Date.now()}`,
              numero: currentRas.length + 1,
              descripcion: description,
            },
          ];

    const nextRecord: CompetenciasRaFormacionRecord = {
      ...selectedRaRecord,
      resultadosAprendizaje: nextRas.map((ra, index) => ({
        ...ra,
        numero: index + 1,
      })),
      updatedAt: new Date().toISOString(),
    };

    const validationMessage = getLearningResultsValidationMessage(nextRecord);

    if (nextRecord.resultadosAprendizaje.length > MAX_RA_PER_COMPETENCIA) {
      setRaError(validationMessage || "Máximo 4 Resultados de Aprendizaje por competencia.");
      scrollToFirstValidationError({ fieldOrder: ["raDescripcion"] });
      return;
    }

    try {
      const nextRecords = mockBackend.update<CompetenciasRaFormacionRecord>("competenciasRa", nextRecord, currentUser);
      refreshRecordsState(nextRecords, nextRecord.id);
      closeRaModal();
    } catch (error) {
      setRaError(error instanceof Error ? error.message : "No fue posible guardar el RA.");
      scrollToFirstValidationError({ fieldOrder: ["raDescripcion"] });
    }
  };

  const handleSaveCompetenciaDescription = (record: CompetenciasRaEnriched, descripcion: string) => {
    const nextRecord: CompetenciasRaFormacionRecord = {
      ...record,
      descripcion,
      nombre: record.nombre,
      updatedAt: new Date().toISOString(),
    };

    try {
      const nextRecords = mockBackend.update<CompetenciasRaFormacionRecord>("competenciasRa", nextRecord, currentUser);
      refreshRecordsState(nextRecords, record.id);
      return true;
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No fue posible actualizar la competencia.");
      return false;
    }
  };

  const handleDelete = (record: CompetenciasRaEnriched) => {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar la competencia de ${record.programaNombre}? También se eliminarán sus RA asociados y se limpiarán relaciones demo vinculadas.`,
    );

    if (!confirmed) return;

    const nextRecords = mockBackend.remove<CompetenciasRaFormacionRecord>("competenciasRa", record.id, currentUser);
    setRecords(nextRecords);

    if (selectedRecord?.id === record.id) {
      setSelectedRecord(null);
      setDetailOpen(false);
      setFormOpen(false);
      closeRaModal();
    }
  };

  const handleFilterChange = <K extends keyof FiltersState>(
    key: K,
    value: FiltersState[K],
  ) => {
    setFilters((current) => {
      const next = { ...current, [key]: value };

      if (key === "seccionalId") {
        next.lugarId = getDefaultLugarBySeccional(String(value));
        next.facultadId = "";
        next.programaId = "";
        next.planId = "";
      }

      if (key === "lugarId") {
        next.facultadId = "";
        next.programaId = "";
        next.planId = "";
      }

      if (key === "facultadId") {
        next.programaId = "";
        next.planId = "";
      }

      if (key === "programaId") {
        next.planId = "";
      }

      if (key === "planId") {
        return syncFiltersByActivePlan(next, String(value), catalogs);
      }

      return next;
    });
  };

  const handleFormSubmit = (values: FormState) => {
    const baseRecord = buildRecordFromForm(
      values,
      formMode === "edit" ? selectedRecord : null,
      records,
    );
    const relatedProposito = mockBackend
      .list<{ id: string; programaId?: string; planId?: string }>("propositosFormacion", currentUser)
      .find((item) => item.planId === baseRecord.planId || item.programaId === baseRecord.programaId);
    const nextRecord = {
      ...baseRecord,
      propositoFormacionId: baseRecord.propositoFormacionId ?? relatedProposito?.id,
    };

    const validationMessage = getLearningResultsValidationMessage(nextRecord);

    if (nextRecord.resultadosAprendizaje.length > MAX_RA_PER_COMPETENCIA) {
      window.alert(validationMessage || "Máximo 4 Resultados de Aprendizaje por competencia.");
      return;
    }

    try {
      setRecords(
        formMode === "create"
          ? mockBackend.create<CompetenciasRaFormacionRecord>("competenciasRa", nextRecord, currentUser)
          : mockBackend.update<CompetenciasRaFormacionRecord>("competenciasRa", nextRecord, currentUser),
      );
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No fue posible guardar la competencia.");
      return;
    }

    setFilters({
      seccionalId: values.seccionalId,
      lugarId: values.lugarId,
      facultadId: values.facultadId,
      programaId: values.programaId,
      planId: values.planId,
      estado: "activo",
    });

    setFormOpen(false);
    setSelectedRecord(null);
  };

  const invalidCompetencias = filteredRecords.filter((record) =>
    Boolean(getLearningResultsValidationMessage(record)),
  );

  const pageActions = (
    <div className="flex flex-wrap items-center gap-3">
      {permissions.canCreate ? (
        <Button
          variant="primary"
          leftIcon={<GoPlus className="text-lg" />}
          onClick={openCreateModal}
          title="Crear una nueva competencia"
        >
          Nueva competencia
        </Button>
      ) : null}

      <Button
        variant="outline"
        leftIcon={<GoFile className="text-lg" />}
        onClick={() => setExportFormat("pdf")}
        disabled={!permissions.canExportPdf || filteredRecords.length === 0}
        title={
          permissions.canExportPdf
            ? "Exportar resultados filtrados en PDF"
            : "Tu rol no tiene permiso para exportar en PDF."
        }
      >
        PDF
      </Button>

      <Button
        variant="outline"
        leftIcon={<GoDownload className="text-lg" />}
        onClick={() => setExportFormat("excel")}
        disabled={!permissions.canExportExcel || filteredRecords.length === 0}
        title={
          permissions.canExportExcel
            ? "Exportar resultados filtrados en Excel"
            : "Tu rol no tiene permiso para exportar en Excel."
        }
      >
        Excel
      </Button>
    </div>
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

          <div className="surface-card p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
                  Competencias y Resultados de Aprendizaje
                </h3>
                <p className="mt-1 text-sm text-[var(--color-gray-3)]">
                  Cada tarjeta muestra una competencia con sus resultados de aprendizaje asociados. Expande para ver los detalles de cada resultado.
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] px-4 py-2 text-sm text-[var(--color-gray-3)]">
                  <GoEye className="text-base text-[var(--color-secondary-1)]" />
                  La edición solo se habilita sobre programas activos.
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-[var(--color-gray-4)]">Ordenar:</label>
                  <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value as "asc" | "desc")}
                    className="rounded border border-[var(--color-gray-6)] bg-white px-3 py-2 text-sm text-[var(--color-gray-3)] transition-colors hover:border-[var(--color-gray-4)]"
                  >
                    <option value="asc">Ascendente (1-10)</option>
                    <option value="desc">Descendente (10-1)</option>
                  </select>
                </div>
              </div>
            </div>

            {invalidCompetencias.length > 0 ? (
              <div
                role="alert"
                className="mb-5 rounded-[var(--radius-lg)] border border-[var(--color-warning)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-gray-3)]"
              >
                Hay {invalidCompetencias.length} competencia
                {invalidCompetencias.length === 1 ? "" : "s"} con RA pendientes o fuera del límite permitido. Agrega al menos 1 RA y máximo 4 por competencia para habilitar Mapeo de Competencias.
              </div>
            ) : null}

            <CompetenciasRaCardGrid
              data={filteredRecords}
              role={currentUser.role}
              permissions={permissions}
              onView={openViewModal}
              onAddRa={openCreateRaModal}
              onEditRa={openEditRaModal}
            />
          </div>
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

      <Modal
        open={Boolean(raModalMode)}
        title={raModalMode === "edit" ? "Editar RA" : "Agregar RA"}
        description={
          selectedRaRecord
            ? `Resultado de Aprendizaje asociado a ${selectedRaRecord.nombre}.`
            : "Resultado de Aprendizaje asociado a la competencia."
        }
        size="md"
        onClose={closeRaModal}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={closeRaModal}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSaveRa}>
              {raModalMode === "edit" ? "Guardar RA" : "Agregar RA"}
            </Button>
          </div>
        }
      >
        <Textarea
          label="Descripción del RA"
          value={raDraft}
          onChange={(event) => {
            setRaDraft(event.target.value);
            setRaError("");
          }}
          rows={6}
          placeholder="Escribe el Resultado de Aprendizaje"
          id="raDescripcion"
          data-validation-field="raDescripcion"
          error={raError}
        />
      </Modal>

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
