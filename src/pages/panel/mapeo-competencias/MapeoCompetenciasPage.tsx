import { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { GoDownload, GoFile, GoPlus } from "react-icons/go";
import { Button } from "../../../components/ui/Button";
import { PanelLayout } from "../../../components/panel";
import CompetenciasRaExportModal from "./components/CompetenciasRaExportModal";
import MapeoCompetenciasCardGrid from "./components/MapeoCompetenciasCardGrid";
import MapeoCompetenciasDeleteModal from "./components/MapeoCompetenciasDeleteModal";
import MapeoCompetenciasFilters from "./components/MapeoCompetenciasFilters";
import {
  getCatalogs,
  getCurrentUser,
  mockMapeoCompetencias,
} from "./MapeoCompetencias.mock";
import { rolePermissions } from "./MapeoCompetencias.permissions";
import {
  INITIAL_FILTERS,
  applyFilters,
  applyRoleScope,
  buildAvailableFilters,
  deleteStoredMapeoRecord,
  enrichCompetenciasRa,
  readStoredMapeoRecords,
  sanitizeFilters,
} from "./MapeoCompetencias.utils";
import type {
  MapeoCompetenciasEnriched,
  MapeoCompetenciasFilters as FiltersState,
  MapeoCompetenciasRecord,
} from "./MapeoCompetencias.types";

const currentUser = getCurrentUser();
const catalogs = getCatalogs();

export default function MapeoCompetenciasPage() {
  // const navigate = useNavigate();

  const [records, setRecords] = useState<MapeoCompetenciasRecord[]>(() =>
    readStoredMapeoRecords(mockMapeoCompetencias),
  );
  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | null>(null);
  const [selectedRecordForDelete, setSelectedRecordForDelete] =
    useState<MapeoCompetenciasEnriched | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingRecord, setIsDeletingRecord] = useState(false);

  const permissions = rolePermissions[currentUser.role];

  const enrichedRecords = useMemo(
    () => enrichCompetenciasRa(records, catalogs),
    [records],
  );

  const roleScopedRecords = useMemo(
    () => applyRoleScope(enrichedRecords, currentUser),
    [enrichedRecords],
  );

  const availableFilterOptions = useMemo(
    () => buildAvailableFilters(roleScopedRecords, catalogs, filters),
    [filters, roleScopedRecords],
  );

  const sanitizedFilters = useMemo(
    () => sanitizeFilters(filters, availableFilterOptions),
    [availableFilterOptions, filters],
  );

  const filteredRecords = useMemo(
    () => applyFilters(roleScopedRecords, sanitizedFilters),
    [roleScopedRecords, sanitizedFilters],
  );

  const summaryStats = useMemo(() => {
    const activeRecords = roleScopedRecords.filter((record) => record.estado === "activo");
    const mappedSemesters = activeRecords.reduce((total, record) => {
      const count =
        record.semestres?.filter((semester) => semester.competencias.length > 0).length ?? 0;
      return total + count;
    }, 0);
    const totalCompetencias = activeRecords.reduce((total, record) => {
      const count =
        record.semestres?.reduce(
          (semesterTotal, semester) => semesterTotal + semester.competencias.length,
          0,
        ) ?? 0;
      return total + count;
    }, 0);

    return {
      fundamentacion: Math.min(mappedSemesters, 3),
      profesionalizacion: Math.max(mappedSemesters - 3, 0),
      sintesis: Math.max(totalCompetencias, activeRecords.length),
    };
  }, [roleScopedRecords]);

  const handleFilterChange = <K extends keyof FiltersState>(
    key: K,
    value: FiltersState[K],
  ) => {
    setFilters((current) => {
      const next = { ...current, [key]: value };

      if (key === "seccionalId") {
        next.lugarId = "";
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

  const handleCreateClick = () => {
    // navigate("/panel/mapeo-competencias/clasificacion/crear");
    window.location.href = "/panel/mapeo-competencias/clasificacion/crear";
  };

  const handleEditClick = (record: MapeoCompetenciasEnriched) => {
    // navigate(`/panel/mapeo-competencias/${record.id}/clasificacion/editar`);
    window.location.href = `/panel/mapeo-competencias/${record.id}/clasificacion/editar`;
  };

  const handleDeleteClick = (record: MapeoCompetenciasEnriched) => {
    setSelectedRecordForDelete(record);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRecordForDelete) return;

    setIsDeletingRecord(true);

    window.setTimeout(() => {
      const nextRecords = deleteStoredMapeoRecord(
        selectedRecordForDelete.id,
        mockMapeoCompetencias,
      );

      setRecords(nextRecords);
      setIsDeletingRecord(false);
      setShowDeleteModal(false);
      setSelectedRecordForDelete(null);
    }, 400);
  };

  const pageActions = (
    <div className="flex flex-wrap items-center gap-3">
      {permissions.canCreate ? (
        <Button
          variant="primary"
          leftIcon={<GoPlus className="text-lg" />}
          onClick={handleCreateClick}
          title="Crear nuevo mapeo de competencias"
        >
          Crear Mapeo
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
      currentStep="mapeo-competencias"
      title="Mapeo de Competencias"
      description="Asignacion I-R-A y visualizacion de la malla curricular por semestres y cursos."
      actions={pageActions}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="surface-card rounded-lg p-5 text-center">
            <p className="text-sm font-semibold text-[var(--color-gray-3)]">
              Fundamentacion
            </p>
            <p className="mt-3 text-3xl font-bold text-[var(--color-secondary-4)]">
              {summaryStats.fundamentacion}
            </p>
            <p className="mt-1 text-xs text-[var(--color-gray-4)]">
              Semestres iniciales
            </p>
          </article>

          <article className="surface-card rounded-lg p-5 text-center">
            <p className="text-sm font-semibold text-[var(--color-gray-3)]">
              Profesionalizacion
            </p>
            <p className="mt-3 text-3xl font-bold text-[var(--color-secondary-4)]">
              {summaryStats.profesionalizacion}
            </p>
            <p className="mt-1 text-xs text-[var(--color-gray-4)]">
              Semestres avanzados
            </p>
          </article>

          <article className="surface-card rounded-lg p-5 text-center">
            <p className="text-sm font-semibold text-[var(--color-gray-3)]">
              Sintesis
            </p>
            <p className="mt-3 text-3xl font-bold text-[var(--color-secondary-4)]">
              {summaryStats.sintesis}
            </p>
            <p className="mt-1 text-xs text-[var(--color-gray-4)]">
              Competencias mapeadas
            </p>
          </article>
        </div>

        <MapeoCompetenciasFilters
          user={currentUser}
          permissions={permissions}
          filters={sanitizedFilters}
          filterOptions={{
            seccionales: availableFilterOptions.seccionales.map((item) => ({
              id: item.id,
              nombre: item.nombre,
            })),
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
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-[var(--color-secondary-4)]">
                Mapeos de Competencias
              </h3>
              <p className="mt-1 text-sm text-[var(--color-gray-3)]">
                {filteredRecords.length} mapeo{filteredRecords.length !== 1 ? "s" : ""} disponible
                {filteredRecords.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <MapeoCompetenciasCardGrid
            records={filteredRecords}
            role={currentUser.role}
            permissions={permissions}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </div>

        <CompetenciasRaExportModal
          open={exportFormat === "pdf"}
          title="Exportacion de Mapeos de Competencias en PDF"
          format="pdf"
          permissions={permissions}
          catalogs={catalogs}
          baseRecords={roleScopedRecords}
          initialFilters={sanitizedFilters}
          onClose={() => setExportFormat(null)}
        />

        <CompetenciasRaExportModal
          open={exportFormat === "excel"}
          title="Exportacion de Mapeos de Competencias en Excel"
          format="excel"
          permissions={permissions}
          catalogs={catalogs}
          baseRecords={roleScopedRecords}
          initialFilters={sanitizedFilters}
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
