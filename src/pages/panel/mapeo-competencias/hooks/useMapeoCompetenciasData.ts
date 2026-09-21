import { useCallback, useEffect, useMemo, useState } from "react";
import { getCompetencyMappingContext, listCompetencyMappings } from "../../../../services/competencyMappings";
import { getCurrentMockUser } from "../../../../services/auth/mockUser";
import { mockBackend } from "../../../../services/mockBackend";
import type { Catalogs, CompetenciaRaDemoRecord, CurrentUser, CursoAsis, MapeoCompetenciasRecord } from "../MapeoCompetencias.types";

const emptyCatalogs: Catalogs = {
  seccionales: [], facultades: [], lugares: [], programas: [], planes: [],
};

export function useMapeoCompetenciasData() {
  const currentUser = useMemo(() => getCurrentMockUser() as CurrentUser, []);
  const [catalogs, setCatalogs] = useState<Catalogs>(emptyCatalogs);
  const [cursos, setCursos] = useState<CursoAsis[]>([]);
  const [competenciasRa, setCompetenciasRa] = useState<CompetenciaRaDemoRecord[]>([]);
  const [records, setRecords] = useState<MapeoCompetenciasRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoadError(null);
    try {
      const [context, mappings] = await Promise.all([
        getCompetencyMappingContext(signal),
        listCompetencyMappings(signal),
      ]);
      if (signal?.aborted) return;
      const { scope } = context;
      setCatalogs({
        seccionales: [{ id: scope.seccionalId, nombre: scope.seccionalNombre }],
        facultades: [{ id: scope.facultadId, nombre: scope.facultadNombre, seccionalId: scope.seccionalId }],
        lugares: [{ id: scope.lugarId, nombre: scope.lugarNombre, seccionalId: scope.seccionalId }],
        programas: [{ id: scope.programaId, nombre: scope.programaNombre, facultadId: scope.facultadId, seccionalId: scope.seccionalId, estado: "activo" }],
        planes: context.planes,
      });
      setCursos(context.cursos);
      setCompetenciasRa(context.competencias);
      setRecords(mappings);
      mappings.forEach((record) => {
        try { mockBackend.upsert<MapeoCompetenciasRecord>("mapeosCompetencias", record, currentUser); }
        catch { /* El backend conserva la fuente de verdad. */ }
      });
    } catch (reason) {
      if (signal?.aborted) return;
      setLoadError(reason instanceof Error ? reason.message : "No fue posible cargar el mapeo de competencias.");
    } finally {
      if (!signal?.aborted) setIsLoaded(true);
    }
  }, [currentUser]);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  return { currentUser, catalogs, cursos, competenciasRa, records, isLoaded, loadError, refresh };
}
