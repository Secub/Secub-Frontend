import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentMockUser } from "../../../../services/auth/mockUser";
import { mockBackend, subscribeToMockBackendChanges } from "../../../../services/mockBackend";
import { getCatalogs } from "../../competencias-ra/CompetenciasRa.mock";
import { getCicloCatalogs } from "../../ciclo/ciclo.mock";
import type {
  Catalogs,
  CompetenciaRaDemoRecord,
  CurrentUser,
  CursoAsis,
  MapeoCompetenciasRecord,
  ProgramaAcademico,
} from "../MapeoCompetencias.types";
function deduplicateMapeoRecords(records: MapeoCompetenciasRecord[]) {
  const byKey = new Map<string, MapeoCompetenciasRecord>();

  records.forEach((record) => {
    const key = `${record.programaId ?? ""}::${record.planId ?? ""}`;
    const previous = byKey.get(key);

    if (!previous) {
      byKey.set(key, record);
      return;
    }

    const shouldReplace = (record.updatedAt ?? "") >= (previous.updatedAt ?? "");
    if (shouldReplace) {
      byKey.set(key, record);
    }
  });

  return Array.from(byKey.values()).sort((a, b) => (a.updatedAt ?? "").localeCompare(b.updatedAt ?? ""));
}
function buildCatalogs(): Catalogs {
  const academicCatalogs = getCatalogs();
  const cicloCatalogs = getCicloCatalogs();

  const cicloProgramsById = new Map(
    cicloCatalogs.programas.map((programa) => [programa.id, programa]),
  );

  const programas: ProgramaAcademico[] = academicCatalogs.programas.map((programa) => ({
    ...programa,
    estado: cicloProgramsById.get(programa.id)?.estado ?? "activo",
  }));

  return {
    seccionales: academicCatalogs.seccionales,
    facultades: academicCatalogs.facultades,
    lugares: academicCatalogs.lugares,
    programas,
    planes: academicCatalogs.planes,
  };
}

export function useMapeoCompetenciasData() {
  const currentUser = useMemo(() => getCurrentMockUser() as CurrentUser, []);
  const catalogs = useMemo(() => buildCatalogs(), []);
  const cicloCatalogs = useMemo(() => getCicloCatalogs(), []);
  const cursos = useMemo(() => cicloCatalogs.cursos as CursoAsis[], [cicloCatalogs.cursos]);

  const [records, setRecords] = useState<MapeoCompetenciasRecord[]>([]);
  const [competenciasRa, setCompetenciasRa] = useState<CompetenciaRaDemoRecord[]>([]);

  const refresh = useCallback(() => {
    const rawRecords = mockBackend.list<MapeoCompetenciasRecord>("mapeosCompetencias", currentUser);
    const dedupedRecords = deduplicateMapeoRecords(rawRecords);

    setRecords(dedupedRecords);
    setCompetenciasRa(mockBackend.list<CompetenciaRaDemoRecord>("competenciasRa", currentUser));
  }, [currentUser]);

  useEffect(() => {
    refresh();
    return subscribeToMockBackendChanges(refresh);
  }, [refresh]);

  return {
    currentUser,
    catalogs,
    cursos,
    competenciasRa,
    records,
    refresh,
  };
}
