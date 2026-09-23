import { httpClient } from "../infrastructure/api";
import type {
  CicloMedicion,
  CursoSintesis,
  PlanEstudio,
} from "../pages/panel/ciclo/ciclo.types";

export interface CycleContext {
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
  planes: Array<PlanEstudio & { totalSemestres?: number }>;
  cursos: CursoSintesis[];
  mapeoFinalizado: boolean;
}

export interface CycleInput {
  planId: string;
  fechaInicio: string;
  cursoIds: string[];
}

export function getCycleContext(signal?: AbortSignal) {
  return httpClient.get<CycleContext>("/cycles/context", { signal });
}

export function listCycles(signal?: AbortSignal) {
  return httpClient.get<CicloMedicion[]>("/cycles", { signal });
}

export function createCycle(input: CycleInput) {
  return httpClient.post<CicloMedicion>("/cycles", input);
}

export function updateCycle(cycleId: string, input: CycleInput) {
  return httpClient.put<CicloMedicion>(`/cycles/${encodeURIComponent(cycleId)}`, input);
}

export function deleteCycle(cycleId: string) {
  return httpClient.delete<void>(`/cycles/${encodeURIComponent(cycleId)}`);
}
