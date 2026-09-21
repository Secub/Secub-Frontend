import { httpClient } from "../infrastructure/api";
import type {
  CompetenciaRaDemoRecord,
  CursoAsis,
  MapeoCompetenciasRecord,
  NivelCompromisoItem,
  SemestreClasificado,
} from "../pages/panel/mapeo-competencias/MapeoCompetencias.types";

export interface CompetencyMappingContext {
  scope: {
    seccionalId: string;
    seccionalNombre: string;
    lugarId: string;
    lugarNombre: string;
    facultadId: string;
    facultadNombre: string;
    programaId: string;
    programaNombre: string;
  };
  planes: Array<{
    id: string;
    nombre: string;
    programaId: string;
    estado: "activo" | "inactivo";
    totalSemestres: number;
  }>;
  cursos: CursoAsis[];
  competencias: CompetenciaRaDemoRecord[];
}

export function getCompetencyMappingContext(signal?: AbortSignal) {
  return httpClient.get<CompetencyMappingContext>("/competency-mappings/context", { signal });
}

export function listCompetencyMappings(signal?: AbortSignal) {
  return httpClient.get<MapeoCompetenciasRecord[]>("/competency-mappings", { signal });
}

export function saveCompetencyMapping(
  planId: string,
  input: {
    semestresClasificados: SemestreClasificado[];
    nivelesCompromiso: NivelCompromisoItem[];
    finalizar: boolean;
  },
) {
  return httpClient.put<MapeoCompetenciasRecord>(`/competency-mappings/${encodeURIComponent(planId)}`, input);
}

export function deleteCompetencyMapping(planId: string) {
  return httpClient.delete<void>(`/competency-mappings/${encodeURIComponent(planId)}`);
}
