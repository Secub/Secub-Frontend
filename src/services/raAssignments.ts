import { httpClient } from "../infrastructure/api";
import type {
  AsignacionRaRecord,
  CicloDemoRecord,
  CompetenciaRaDemoRecord,
  MapeoDemoRecord,
} from "../pages/panel/asignar-ra/AsignarRA.types";
import type { PlanEstudio } from "../pages/panel/ciclo/ciclo.types";

export interface RAAssignmentContext {
  scope: {
    seccionalId: string;
    seccionalNombre: string;
    facultadId: string;
    facultadNombre: string;
    programaId: string;
    programaNombre: string;
  };
  planes: Array<PlanEstudio & { totalSemestres?: number }>;
  ciclos: CicloDemoRecord[];
  competencias: CompetenciaRaDemoRecord[];
  mapeos: MapeoDemoRecord[];
  asignaciones: AsignacionRaRecord[];
}

export interface RAAssignmentSelection {
  competenciaId: string;
  resultadoAprendizajeIds: string[];
}

export function getRAAssignmentContext(signal?: AbortSignal) {
  return httpClient.get<RAAssignmentContext>("/ra-assignments/context", { signal });
}

export function saveCourseRAAssignments(
  cycleId: string,
  courseId: string,
  selecciones: RAAssignmentSelection[],
) {
  return httpClient.put<AsignacionRaRecord[]>(
    `/ra-assignments/cycles/${encodeURIComponent(cycleId)}/courses/${encodeURIComponent(courseId)}`,
    { selecciones },
  );
}

export function deleteCourseRAAssignments(cycleId: string, courseId: string) {
  return httpClient.delete<void>(
    `/ra-assignments/cycles/${encodeURIComponent(cycleId)}/courses/${encodeURIComponent(courseId)}`,
  );
}
