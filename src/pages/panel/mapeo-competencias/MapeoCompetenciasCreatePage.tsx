import { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui";
import { PanelLayout } from "../../../components/panel";
import EmptyState_NoDataCard from "../../../components/ui/statesEmpty/EmptyState_NoDataCard";
import MapeoCompetenciasProgressModal from "./components/MapeoCompetenciasProgressModal";
import MapeoCompetenciasCardInfoNucleos from "./components/MapeoCompetenciasCardInfoNucleos";
import MapeoCompetenciasFilters from "./components/MapeoCompetenciasFilters";
import MapeoCompetenciasSemestreCompromisoCard from "./components/MapeoCompetenciasSemestreCompromisoCard";
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

export default function MapeoCompetenciasCreatePage() {
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
  const selectedMapeoForActions = filteredRecords[0] ?? null;

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

  return (
    <PanelLayout
      currentStep="mapeo-competencias"
      title="Clasificación de núcleos de formación - Creación"
      description="Asigna competencias y resultados de aprendizaje por semestre"
    // actions={
    //   <Button variant="outline" onClick={() => window.location.href = "/panel/mapeo-competencias"}>
    //     Cancelar
    //   </Button>
    // }
    >
      <div className="space-y-6">
        <div className="surface-card rounded-lg p-6 md:p-8">
          <MapeoCompetenciasCardInfoNucleos />
        </div>

        <div className="flex justify-center">
          <h1>
            ----------------------------------------------------------- <br />
            Aqui va el workflow, aun falta por traerlo de componentes <br />
            -----------------------------------------------------------
          </h1>
        </div>

        <div>
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
        </div>

        <div className="surface-card rounded-lg p-6 md:p-8">
          <h2>
            Semestres Listados segun filtro
            <div className="mt-4 flex justify-center">
              <EmptyState_NoDataCard/>
            </div>
            <div className="mt-4 flex justify-center">
              <Button variant="primary_soft" onClick={() => window.location.href = "/panel/mapeo-competencias"}>
                Volver a Mapeo Competencias
              </Button>
            </div>
          </h2>
        </div>
      </div>
    </PanelLayout>
  );
}
  
