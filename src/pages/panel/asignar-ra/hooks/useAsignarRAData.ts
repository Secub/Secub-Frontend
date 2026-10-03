import { useCallback, useEffect, useState } from "react";
import { getRAAssignmentContext } from "../../../../services/raAssignments";
import type {
  AsignacionRaRecord,
  MeasurementCycleRecord,
  CompetenceRaRecord,
  CompetencyMappingRecord,
  MedicionRaRecord,
} from "../AsignarRA.types";
import type { CicloCatalogs } from "../../ciclo/ciclo.types";

const EMPTY_CATALOGS: CicloCatalogs = { seccionales: [], facultades: [], programas: [], planes: [], cursos: [] };
export function useAsignarRAData() {
  const [records, setRecords] = useState<AsignacionRaRecord[]>([]);
  const [measurements] = useState<MedicionRaRecord[]>([]);
  const [cyclesSource, setCyclesSource] = useState<MeasurementCycleRecord[]>([]);
  const [competenciasSource, setCompetenciasSource] = useState<CompetenceRaRecord[]>([]);
  const [mapeosSource, setMapeosSource] = useState<CompetencyMappingRecord[]>([]);
  const [academicCatalogs, setAcademicCatalogs] = useState<CicloCatalogs>(EMPTY_CATALOGS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshBackendState = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setLoadError(null);
    try {
      const context = await getRAAssignmentContext(signal);
      if (signal?.aborted) return;
      setRecords(context.asignaciones);
      setCyclesSource(context.ciclos);
      setCompetenciasSource(context.competencias);
      setMapeosSource(context.mapeos);
      setAcademicCatalogs({
        seccionales: [{ id: context.scope.seccionalId, nombre: context.scope.seccionalNombre }],
        facultades: [{ id: context.scope.facultadId, nombre: context.scope.facultadNombre, seccionalId: context.scope.seccionalId }],
        programas: [{ id: context.scope.programaId, nombre: context.scope.programaNombre, facultadId: context.scope.facultadId, seccionalId: context.scope.seccionalId, estado: "activo" }],
        planes: context.planes,
        cursos: context.ciclos.flatMap((cycle) => cycle.cursos ?? []),
      });
    } catch (reason) {
      if (signal?.aborted) return;
      setLoadError(reason instanceof Error ? reason.message : "No fue posible cargar la asignación de RA.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refreshBackendState(controller.signal);
    return () => controller.abort();
  }, [refreshBackendState]);

  return {
    records,
    measurements,
    cyclesSource,
    competenciasSource,
    mapeosSource,
    academicCatalogs,
    loading,
    loadError,
    refreshBackendState,
  };
}
