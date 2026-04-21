import { useEffect, useMemo, useState } from "react";
import { GoDownload, GoEye, GoFile, GoPlus } from "react-icons/go";
import { PanelLayout } from "../../../components/panel";
import { Button } from "../../../components/ui";
import PerfilEgresoDetailModal from "./components/PerfilEgresoDetailModal";
import PerfilEgresoExportModal from "./components/PerfilEgresoExportModal";
import PerfilEgresoFilters from "./components/PerfilEgresoFilters";
import PerfilEgresoFormModal from "./components/PerfilEgresoFormModal";
import PerfilEgresoTable from "./components/PerfilEgresoTable";
import {
  getCatalogs,
  getCurrentUser,
  mockPerfilesEgreso,
} from "./perfil-egreso.mock";
import { rolePermissions } from "./perfil-egreso.permissions";
import {
  INITIAL_FILTERS,
  applyFilters,
  applyRoleScope,
  buildAvailableFilters,
  buildRecordFromForm,
  getDefaultLugarBySeccional,
  enrichPerfilesEgreso,
  getEmptyFormState,
  mapRecordToForm,
  sanitizeFilters,
} from "./perfil-egreso.utils";
import type {
  FormState,
  PerfilEgresoEnriched,
  PerfilEgresoFilters as FiltersState,
  PerfilEgresoRecord,
} from "./perfil-egreso.types";

const currentUser = getCurrentUser();
const catalogs = getCatalogs();

export default function PerfilEgresoPage() {
  const [records, setRecords] = useState<PerfilEgresoRecord[]>(
    mockPerfilesEgreso,
  );
  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);
  const [selectedRecord, setSelectedRecord] =
    useState<PerfilEgresoEnriched | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formValues, setFormValues] = useState<FormState>(
    getEmptyFormState(currentUser),
  );
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | null>(
    null,
  );

  const permissions = rolePermissions[currentUser.role];

  const enrichedRecords = useMemo(
    () => enrichPerfilesEgreso(records, catalogs),
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
    return applyFilters(roleScopedRecords, filters);
  }, [filters, roleScopedRecords]);

  const openCreateModal = () => {
    setFormMode("create");
    setFormValues(getEmptyFormState(currentUser));
    setSelectedRecord(null);
    setFormOpen(true);
  };

  const openEditModal = (record: PerfilEgresoEnriched) => {
    setFormMode("edit");
    setSelectedRecord(record);
    setFormValues(mapRecordToForm(record));
    setFormOpen(true);
  };

  const openDetailModal = (record: PerfilEgresoEnriched) => {
    setSelectedRecord(record);
    setDetailOpen(true);
  };

  const handleDelete = (record: PerfilEgresoEnriched) => {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar el perfil de egreso de ${record.programaNombre}? Esta acción solo afecta los datos mock actuales.`,
    );

    if (!confirmed) return;

    setRecords((current) => current.filter((item) => item.id !== record.id));

    if (selectedRecord?.id === record.id) {
      setSelectedRecord(null);
      setDetailOpen(false);
      setFormOpen(false);
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
      }

      if (key === "lugarId") {
        next.facultadId = "";
        next.programaId = "";
      }

      if (key === "facultadId") {
        next.programaId = "";
      }

      return next;
    });
  };

  const handleFormSubmit = (values: FormState) => {
    const nextRecord = buildRecordFromForm(
      values,
      formMode === "edit" ? selectedRecord : null,
    );

    setRecords((current) => {
      if (formMode === "create") {
        return [nextRecord, ...current];
      }

      return current.map((item) =>
        item.id === nextRecord.id ? nextRecord : item,
      );
    });

    setFormOpen(false);
    setSelectedRecord(null);
  };

  const pageActions = (
    <div className="flex flex-wrap gap-3">
      {permissions.canCreate ? (
        <Button
          variant="primary"
          leftIcon={<GoPlus className="text-lg" />}
          onClick={openCreateModal}
          title="Crear un nuevo propósito de formación"
        >
          Nuevo propósito
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
      currentStep="perfil-egreso"
      title="Perfil de Egreso"
      description="Visualización, filtrado, creación, actualización, eliminación y exportación del perfil de egreso según el alcance institucional del rol autenticado."
      actions={pageActions}
    >
      <div className="space-y-6">
        <PerfilEgresoFilters
          permissions={permissions}
          filters={filters}
          filterOptions={availableFilterOptions}
          onFilterChange={handleFilterChange}
          onReset={() => setFilters(INITIAL_FILTERS)}
        />

        <div className="surface-card p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
                Lista de perfiles de egreso
              </h3>
              <p className="mt-1 text-sm text-[var(--color-gray-3)]">
                Cada fila respeta el alcance del usuario logueado y habilita acciones según su permiso actual.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] px-4 py-2 text-sm text-[var(--color-gray-3)]">
              <GoEye className="text-base text-[var(--color-secondary-1)]" />
              La actualización solo se habilita sobre programas activos.
            </div>
          </div>

          <PerfilEgresoTable
            data={filteredRecords}
            role={currentUser.role}
            permissions={permissions}
            onView={openDetailModal}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        </div>
      </div>

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