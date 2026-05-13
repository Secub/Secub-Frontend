import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  GoPencil,
  GoPlus,
  GoTrash,
} from "react-icons/go";

import { Button } from "../../../components/ui/Button";
import { PanelLayout } from "../../../components/panel";

import MapeoCompetenciasExportModal from "./components/MapeoCompetenciasExportModal";
import MapeoCompetenciasDeleteModal from "./components/MapeoCompetenciasDeleteModal";
import MapeoCompetenciasFilters from "./components/MapeoCompetenciasFilters";

import EmptyState_NoDataCard from "../../../components/ui/statesEmpty/EmptyState_NoDataCard";

import {
  getSeccionales,
  getFacultades,
  getProgramas,
  getPlanes,
  getLugares,
} from "../../../api/repositories/catalogs.repository";

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
  Facultad,
  MapeoCompetenciasEnriched,
  MapeoCompetenciasFilters as FiltersState,
  MapeoCompetenciasRecord,
  MapeoCompetenciasRole,
  PlanEstudio,
  ProgramaAcademico,
  LugarDesarrollo,
  Seccional,
} from "./MapeoCompetencias.types";

import {
  getMapeos,
} from "../../../api/repositories/mapeo.repository";

export default function MapeoCompetenciasPage() {

  // =========================
  // USER TEMPORAL
  // =========================

  const currentUser = {
  id: "1",
  nombre: "Administrador",
  cargo: "Administrador del sistema",
  role: "admin" as MapeoCompetenciasRole,

  scope: {
    seccionalId: "",
    facultadId: "",
    programaId: "",
  },
  };
  // =========================
  // CATALOGOS
  // =========================

  const [seccionales, setSeccionales] =
    useState<Seccional[]>([]);

  const [facultades, setFacultades] =
    useState<Facultad[]>([]);

  const [programas, setProgramas] =
    useState<ProgramaAcademico[]>([]);

  const [planes, setPlanes] =
    useState<PlanEstudio[]>([]);

  const [lugares, setLugares] =
  useState<LugarDesarrollo[]>([]);

  const catalogs = {
    seccionales,
    facultades,
    lugares,
    programas,
    planes,
  };

  // =========================
  // RECORDS
  // =========================

  const [records, setRecords] =
    useState<MapeoCompetenciasRecord[]>([]);

  const [filters, setFilters] =
    useState<FiltersState>(
      INITIAL_FILTERS
    );

  const [exportFormat, setExportFormat] =
    useState<"pdf" | "excel" | null>(
      null
    );

  const [
    selectedRecordForDelete,
    setSelectedRecordForDelete,
  ] =
    useState<MapeoCompetenciasEnriched | null>(
      null
    );

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [isDeletingRecord, setIsDeletingRecord] =
    useState(false);

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    const loadCatalogs = async () => {
      try {

        const [
          seccionalesData,
          facultadesData,
          programasData,
          lugaresData = [],
          planesData,
        ] = await Promise.all([
          getSeccionales(),
          getFacultades(),
          getProgramas(),
          getLugares(),
          getPlanes(),
        ]);

        setSeccionales(seccionalesData);
        setFacultades(facultadesData);
        setProgramas(programasData);
        setPlanes(planesData);
        setLugares(lugaresData);
      } catch (error) {
        console.error(
          "Error cargando catalogos:",
          error
        );
      }
    };

    loadCatalogs();
  }, []);

  useEffect(() => {
    const loadMapeos = async () => {
      try {

        const data =
          await getMapeos();

        setRecords(
          readStoredMapeoRecords(data)
        );

      } catch (error) {
        console.error(
          "Error cargando mapeos:",
          error
        );
      }
    };

    loadMapeos();
  }, []);

  // =========================
  // PERMISSIONS
  // =========================

  const permissions =
    rolePermissions[
      currentUser.role
    ];

  // =========================
  // ENRICHED DATA
  // =========================

  const enrichedRecords =
    useMemo(
      () =>
        enrichCompetenciasRa(
          records,
          catalogs
        ),
      [records, catalogs]
    );

  const roleScopedRecords =
    useMemo(
      () =>
        applyRoleScope(
          enrichedRecords,
          currentUser
        ),
      [
        enrichedRecords,
        currentUser,
      ]
    );

  const availableFilterOptions =
  useMemo(() => {

    // Si no hay registros aún,
    // usar directamente los catálogos

    if (roleScopedRecords.length === 0) {
      return {
        seccionales: catalogs.seccionales,
        facultades: catalogs.facultades,
        lugares: catalogs.lugares,
        programas: catalogs.programas,
        planes: catalogs.planes,
      };
    }

    // Si ya hay registros,
    // usar la lógica normal

    return buildAvailableFilters(
      roleScopedRecords,
      catalogs,
      filters
    );

  }, [
    filters,
    roleScopedRecords,
    catalogs,
  ]);

  const sanitizedFilters =
    useMemo(
      () =>
        sanitizeFilters(
          filters,
          availableFilterOptions
        ),
      [
        availableFilterOptions,
        filters,
      ]
    );

  const filteredRecords =
    useMemo(
      () =>
        applyFilters(
          roleScopedRecords,
          sanitizedFilters
        ),
      [
        roleScopedRecords,
        sanitizedFilters,
      ]
    );

  const selectedMapeoForActions =
    filteredRecords[0] ?? null;

  // =========================
  // SUMMARY
  // =========================

  const summaryStats =
    useMemo(() => {

      const activeRecords =
        roleScopedRecords.filter(
          (record) =>
            record.estado === "activo"
        );

      const mappedSemesters =
        activeRecords.reduce(
          (total, record) => {

            const count =
              record.semestres?.filter(
                (semester) =>
                  semester.competencias.length > 0
              ).length ?? 0;

            return total + count;

          },
          0
        );

      const totalCompetencias =
        activeRecords.reduce(
          (total, record) => {

            const count =
              record.semestres?.reduce(
                (
                  semesterTotal,
                  semester
                ) =>
                  semesterTotal +
                  semester.competencias.length,
                0
              ) ?? 0;

            return total + count;

          },
          0
        );

      return {
        fundamentacion:
          Math.min(
            mappedSemesters,
            3
          ),

        profesionalizacion:
          Math.max(
            mappedSemesters - 3,
            0
          ),

        sintesis:
          Math.max(
            totalCompetencias,
            activeRecords.length
          ),
      };

    }, [roleScopedRecords]);

  // =========================
  // FILTERS
  // =========================

  const handleFilterChange =
    <
      K extends keyof FiltersState
    >(
      key: K,
      value: FiltersState[K]
    ) => {

      setFilters((current) => {

        const next = {
          ...current,
          [key]: value,
        };

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

  // =========================
  // ACTIONS
  // =========================

  const handleCreateClick =
    () => {

      window.location.href =
        "/panel/mapeo-competencias/crear";
    };

  const handleEditClick = (
    record: MapeoCompetenciasEnriched
  ) => {

    window.location.href =
      `/panel/mapeo-competencias/${record.id}/clasificacion/editar`;
  };

  const handleDeleteClick = (
    record: MapeoCompetenciasEnriched
  ) => {

    setSelectedRecordForDelete(
      record
    );

    setShowDeleteModal(true);
  };

  const handleConfirmDelete =
    async () => {

      if (
        !selectedRecordForDelete
      ) {
        return;
      }

      setIsDeletingRecord(true);

      window.setTimeout(() => {

        const nextRecords =
          deleteStoredMapeoRecord(
            selectedRecordForDelete.id,
            records
          );

        setRecords(nextRecords);

        setIsDeletingRecord(false);

        setShowDeleteModal(false);

        setSelectedRecordForDelete(
          null
        );

      }, 400);
    };

  // =========================
  // RENDER
  // =========================

  return (
    <PanelLayout
      currentStep="mapeo-competencias"
      title="Mapeo de Competencias"
      description="Asignacion I-R-A y visualizacion de la malla curricular por semestres y cursos."
    >

      <div className="space-y-6">

        {/* SUMMARY */}

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

        {/* ACTIONS */}

        <div className="flex justify-end gap-4">

          {permissions.canCreate && (
            <Button
              variant="primary"
              leftIcon={
                <GoPlus className="text-lg" />
              }
              onClick={handleCreateClick}
            >
              Crear Mapeo
            </Button>
          )}

          {permissions.canUpdate && (
            <Button
              variant="primary_soft"
              leftIcon={
                <GoPencil className="text-lg" />
              }
              onClick={() => {

                if (
                  selectedMapeoForActions
                ) {
                  handleEditClick(
                    selectedMapeoForActions
                  );
                }
              }}
              disabled={
                !selectedMapeoForActions
              }
            >
              Editar Mapeo
            </Button>
          )}

          {permissions.canDelete && (
            <Button
              variant="danger_soft"
              leftIcon={
                <GoTrash className="text-lg" />
              }
              onClick={() => {

                if (
                  selectedMapeoForActions
                ) {
                  handleDeleteClick(
                    selectedMapeoForActions
                  );
                }
              }}
              disabled={
                !selectedMapeoForActions
              }
            >
              Eliminar Mapeo
            </Button>
          )}

        </div>

        {/* FILTERS */}

        <MapeoCompetenciasFilters
          user={currentUser}
          permissions={permissions}
          filters={sanitizedFilters}
          filterOptions={{
            seccionales:
              availableFilterOptions.seccionales.map(
                (item) => ({
                  id: item.id,
                  nombre: item.nombre,
                })
              ),

            facultades:
              availableFilterOptions.facultades.map(
                (item) => ({
                  id: item.id,
                  nombre: item.nombre,
                })
              ),

            lugares:
              availableFilterOptions.lugares.map(
                (item) => ({
                  id: item.id,
                  nombre: item.nombre,
                })
              ),

            programas:
              availableFilterOptions.programas.map(
                (item) => ({
                  id: item.id,
                  nombre: item.nombre,
                })
              ),

            planes:
              availableFilterOptions.planes.map(
                (item) => ({
                  id: item.id,
                  nombre: item.nombre,
                })
              ),
          }}
          filteredCount={
            filteredRecords.length
          }
          totalCount={
            roleScopedRecords.length
          }
          onFilterChange={
            handleFilterChange
          }
          onReset={() =>
            setFilters(
              INITIAL_FILTERS
            )
          }
          activeRecords={
            filteredRecords
          }
        />

        {/* CONTENT */}

        <div className="surface-card rounded-lg p-6 md:p-8">

          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">

            <div>

              <h3 className="text-xl font-semibold text-[var(--color-secondary-4)]">
                Semestres
              </h3>

            </div>

          </div>

          <div className="flex justify-center">

            <EmptyState_NoDataCard />

          </div>

        </div>

        {/* EXPORT MODALS */}

        <MapeoCompetenciasExportModal
          open={
            exportFormat === "pdf"
          }
          title="Exportacion de Mapeos de Competencias en PDF"
          format="pdf"
          permissions={permissions}
          catalogs={catalogs}
          baseRecords={
            roleScopedRecords
          }
          initialFilters={
            sanitizedFilters
          }
          onClose={() =>
            setExportFormat(null)
          }
        />

        <MapeoCompetenciasExportModal
          open={
            exportFormat === "excel"
          }
          title="Exportacion de Mapeos de Competencias en Excel"
          format="excel"
          permissions={permissions}
          catalogs={catalogs}
          baseRecords={
            roleScopedRecords
          }
          initialFilters={
            sanitizedFilters
          }
          onClose={() =>
            setExportFormat(null)
          }
        />

      </div>

      {/* DELETE MODAL */}

      <MapeoCompetenciasDeleteModal
        open={showDeleteModal}
        record={
          selectedRecordForDelete
        }
        isLoading={
          isDeletingRecord
        }
        onConfirm={
          handleConfirmDelete
        }
        onCancel={() => {

          setShowDeleteModal(false);

          setSelectedRecordForDelete(
            null
          );
        }}
      />

    </PanelLayout>
  );
}