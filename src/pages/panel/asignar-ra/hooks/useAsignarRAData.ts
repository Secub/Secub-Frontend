import { useCallback, useEffect, useState } from "react";
import { mockBackend } from "../../../../services/mockBackend";
import { getRAAssignmentContext } from "../../../../services/raAssignments";
import type {
  AsignacionRaRecord,
  CicloDemoRecord,
  CompetenciaRaDemoRecord,
  MapeoDemoRecord,
  MedicionRaRecord,
} from "../AsignarRA.types";
import { asignarRACurrentUser as currentUser } from "./asignarRA.shared";
export function useAsignarRAData() {
  const [records, setRecords] = useState<AsignacionRaRecord[]>([]);
  const [measurements] = useState<MedicionRaRecord[]>([]);
  const [cyclesSource, setCyclesSource] = useState<CicloDemoRecord[]>([]);
  const [competenciasSource, setCompetenciasSource] = useState<CompetenciaRaDemoRecord[]>([]);
  const [mapeosSource, setMapeosSource] = useState<MapeoDemoRecord[]>([]);
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
      try {
        const cycleIds = new Set(context.ciclos.map((cycle) => cycle.id));
        mockBackend
          .list<AsignacionRaRecord>("asignacionesRa", currentUser)
          .filter((record) => record.cicloId && cycleIds.has(record.cicloId))
          .forEach((record) => mockBackend.remove("asignacionesRa", record.id, currentUser));
        context.ciclos.forEach((cycle) => mockBackend.upsert("ciclosMedicion", cycle, currentUser));
        context.competencias.forEach((competencia) => mockBackend.upsert("competenciasRa", competencia, currentUser));
        context.mapeos.forEach((mapeo) => mockBackend.upsert("mapeosCompetencias", mapeo, currentUser));
        context.asignaciones.forEach((assignment) => mockBackend.upsert("asignacionesRa", assignment, currentUser));
      } catch {
        // El backend conserva la fuente de verdad; esta copia solo actualiza el indicador del flujo lateral.
      }
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
    loading,
    loadError,
    refreshBackendState,
  };
}
