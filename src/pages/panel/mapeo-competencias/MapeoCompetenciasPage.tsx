import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoDownload, GoFile, GoPlus } from "react-icons/go";
import { Button } from "../../../components/ui/Button";
import { PanelLayout } from "../../../components/panel";
import CompetenciasRaExportModal from "./components/CompetenciasRaExportModal"
import MapeoCompetenciasFilters from "./components/MapeoCompetenciasFilters";
import MapeoCompetenciasCardGrid from "./components/MapeoCompetenciasCardGrid";
import MapeoCompetenciasDeleteModal from "./components/MapeoCompetenciasDeleteModal";
import {
  getCurrentUser,
  getCatalogs,
  mockMapeoCompetencias,
} from "./MapeoCompetencias.mock";
import { rolePermissions } from "./MapeoCompetencias.permissions";
import {
  INITIAL_FILTERS,
  applyFilters,
  applyRoleScope,
  buildAvailableFilters,
  enrichCompetenciasRa,
  // getDefaultLugarBySeccional,
  sanitizeFilters,
} from "./MapeoCompetencias.utils";
import type {
  MapeoCompetenciasRecord,
  MapeoCompetenciasFilters as FiltersState,
  MapeoCompetenciasEnriched,
} from "./MapeoCompetencias.types";

const currentUser = getCurrentUser();
const catalogs = getCatalogs();

export default function MapeoCompetenciasPage() {
  const navigate = useNavigate();
  
  const [records, setRecords] = useState<MapeoCompetenciasRecord[]>(
    mockMapeoCompetencias,
  );
  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | null>(
    null,
  );
  const [selectedRecordForDelete, setSelectedRecordForDelete] =
    useState<MapeoCompetenciasEnriched | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingRecord, setIsDeletingRecord] = useState(false);

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
    return applyFilters(roleScopedRecords, filters);
  }, [filters, roleScopedRecords]);

  const handleFilterChange = <K extends keyof FiltersState>(
    key: K,
    value: FiltersState[K],
  ) => {
    setFilters((current) => {
      const next = { ...current, [key]: value };

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

  const handleCreateClick = () => {
    navigate("/panel/mapeo-competencias/clasificacion/crear");
  };

  const handleEditClick = (record: MapeoCompetenciasEnriched) => {
    navigate(`/panel/mapeo-competencias/${record.id}/clasificacion/editar`);
  };

  const handleDeleteClick = (record: MapeoCompetenciasEnriched) => {
    setSelectedRecordForDelete(record);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRecordForDelete) return;

    setIsDeletingRecord(true);

    // Simular eliminación en backend
    setTimeout(() => {
      setRecords((current) =>
        current.filter((item) => item.id !== selectedRecordForDelete.id)
      );

      setIsDeletingRecord(false);
      setShowDeleteModal(false);
      setSelectedRecordForDelete(null);
    }, 1000);
  };

  const handleViewClick = (record: MapeoCompetenciasEnriched) => {
    // Implementar vista de detalles si es necesario
    console.log("Ver detalles:", record);
  };

  const pageActions = (
    <div className="flex flex-wrap items-center gap-3">
      {permissions.canCreate && (
        <Button
          variant="primary"
          leftIcon={<GoPlus className="text-lg" />}
          onClick={handleCreateClick}
          title="Crear nuevo mapeo de competencias"
        >
          Crear Mapeo
        </Button>
      )}

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
      currentStep="mapeo-competencias"
      title="Mapeo de Competencias"
      description="Asignación I-R-A y visualización de la malla curricular por semestres y cursos."
      actions={pageActions}
    >
      <div className="space-y-6">
        <MapeoCompetenciasFilters
          user={currentUser}
          permissions={permissions}
          filters={filters}
          filterOptions={{
            facultades: availableFilterOptions.facultades.map((item) => ({
              id: item.id,
              nombre: item.nombre,
            })),
            lugares: availableFilterOptions.lugares.map((item) => ({
              id: item.id,
              nombre: item.nombre,
            })),
            programas: availableFilterOptions.programas.map((item) => ({
              id: item.id,
              nombre: item.nombre,
            })),
            planes: availableFilterOptions.planes.map((item) => ({
              id: item.id,
              nombre: item.nombre,
            })),
          }}
          filteredCount={filteredRecords.length}
          totalCount={roleScopedRecords.length}
          onFilterChange={handleFilterChange}
          onReset={() => setFilters(INITIAL_FILTERS)}
          activeRecords={filteredRecords}
        />

        <div className="surface-card rounded-lg p-6 md:p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-[var(--color-secondary-4)]">
              Mapeos de Competencias
            </h3>
            <p className="mt-1 text-sm text-[var(--color-gray-3)]">
              {filteredRecords.length} mapeo{filteredRecords.length !== 1 ? "s" : ""} disponible{filteredRecords.length !== 1 ? "s" : ""}
            </p>
          </div>

          <MapeoCompetenciasCardGrid
            records={filteredRecords}
            permissions={permissions}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onView={handleViewClick}
          />
        </div>

        <CompetenciasRaExportModal
          open={exportFormat === "pdf"}
          title="Exportación de Mapeos de Competencias en PDF"
          format="pdf"
          permissions={permissions}
          catalogs={catalogs}
          baseRecords={roleScopedRecords}
          initialFilters={filters}
          onClose={() => setExportFormat(null)}
        />

        <CompetenciasRaExportModal
          open={exportFormat === "excel"}
          title="Exportación de Mapeos de Competencias en Excel"
          format="excel"
          permissions={permissions}
          catalogs={catalogs}
          baseRecords={roleScopedRecords}
          initialFilters={filters}
          onClose={() => setExportFormat(null)}
        />
      </div>

      <MapeoCompetenciasDeleteModal
        open={showDeleteModal}
        record={selectedRecordForDelete}
        isLoading={isDeletingRecord}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedRecordForDelete(null);
        }}
      />
    </PanelLayout>
  );
}

