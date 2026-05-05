// import { Button } from "../../../components/ui";
// import { PanelLayout } from "../../../components/panel";

// export default function CompetenciasRAPage() {
//   return (
//     <PanelLayout
//       currentStep="competencias-ra"
//       title="Competencias y Resultados de Aprendizaje"
//       description="Administración de competencias, resultados de aprendizaje y relación con el plan de estudios."
//       actions={<Button variant="primary">Acción principal</Button>}
//     >
//       <div className="surface-card p-6 md:p-8">
//         <p className="text-sm leading-7 text-[var(--color-gray-3)]">
//           Este módulo ya quedó preparado dentro de la estructura del panel.
//           Aquí es donde después construiremos filtros, formularios, tablas y acciones específicas del flujo.
//         </p>
//       </div>
//     </PanelLayout>
//   );
// }


import { useEffect, useMemo, useState } from "react";
import { GoDownload, GoEye, GoFile, GoPlus } from "react-icons/go";
import { PanelLayout } from "../../../components/panel";
import { Button } from "../../../components/ui";
import CompetenciasRaDetailModal from "./components/CompetenciasRaDetailModal";
import CompetenciasRaExportModal from "./components/CompetenciasRaExportModal";
import CompetenciasRaFiltersPanel from "./components/CompetenciasRaFilters";
import CompetenciasRaFormModal from "./components/CompetenciasRaFormModal";
import CompetenciasRaCardGrid from "./components/CompetenciasRaCardGrid";
import {
  getCurrentUser,
  getCatalogs,
  mockCompetenciasRa,
} from "./CompetenciasRa.mock";
import { rolePermissions } from "./CompetenciasRa.permissions";
import {
  INITIAL_FILTERS,
  applyFilters,
  applyRoleScope,
  buildAvailableFilters,
  buildRecordFromForm,
  enrichCompetenciasRa,
  getDefaultLugarBySeccional,
  getEmptyFormState,
  mapRecordToForm,
  sanitizeFilters,
} from "./CompetenciasRa.utils";
import type {
  FormState,
  CompetenciasRaEnriched,
  CompetenciasRaFilters as FiltersState,
  CompetenciasRaFormacionRecord,
} from "./CompetenciasRa.types";

const currentUser = getCurrentUser();
const catalogs = getCatalogs();

export default function CompetenciasRaFormacionPage() {
  const [records, setRecords] = useState<CompetenciasRaFormacionRecord[]>(
    mockCompetenciasRa,
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

  const permissions = rolePermissions[currentUser.role];

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
    
    // Ordenar por número
    return filtered.sort((a, b) => {
      if (sortOrder === "asc") {
        return (a.numero || 0) - (b.numero || 0);
      } else {
        return (b.numero || 0) - (a.numero || 0);
      }
    });
  }, [filters, roleScopedRecords, sortOrder]);

  const openCreateModal = () => {
    setFormMode("create");
    setFormValues(getEmptyFormState(currentUser));
    setSelectedRecord(null);
    setFormOpen(true);
  };

  const openEditModal = (record: CompetenciasRaEnriched) => {
    setFormMode("edit");
    setSelectedRecord(record);
    setFormValues(mapRecordToForm(record));
    setFormOpen(true);
  };

  const openViewModal = (record: CompetenciasRaEnriched) => {
    setSelectedRecord(record);
    setDetailOpen(true);
  };

  const handleDelete = (record: CompetenciasRaEnriched) => {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar el propósito de formación de ${record.programaNombre}? Esta acción solo afecta los datos mock actuales.`,
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
      records,
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
          Nuevo Competencias y RA
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
      actions={pageActions}
    >
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
                Cada tarjeta muestra una competencia con sus resultados de aprendizaje asociados.
                Expande para ver los detalles de cada resultado.
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
                  onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                  className="rounded border border-[var(--color-gray-6)] bg-white px-3 py-2 text-sm text-[var(--color-gray-3)] transition-colors hover:border-[var(--color-gray-4)]"
                >
                  <option value="asc">Ascendente (1-10)</option>
                  <option value="desc">Descendente (10-1)</option>
                </select>
              </div>
            </div>
          </div>

          <CompetenciasRaCardGrid
            data={filteredRecords}
            role={currentUser.role}
            permissions={permissions}
            onView={openViewModal}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <CompetenciasRaDetailModal
        open={detailOpen}
        record={selectedRecord}
        onClose={() => setDetailOpen(false)}
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

      <CompetenciasRaExportModal
        open={exportFormat === "pdf"}
        title="Exportación de propósitos de formación en PDF"
        format="pdf"
        permissions={permissions}
        catalogs={catalogs}
        baseRecords={roleScopedRecords}
        initialFilters={filters}
        onClose={() => setExportFormat(null)}
      />

      <CompetenciasRaExportModal
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