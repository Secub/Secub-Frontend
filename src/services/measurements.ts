import { httpClient } from "../infrastructure/api";
import type { MedicionRaDemoState } from "../pages/panel/medicion-ra/types/medicionRA.persistence.types";

export interface MeasurementContextCourse {
  id: string;
  code: string;
  name: string;
  cycleId: string;
  seccionalId: string;
  facultadId: string;
  programaId: string;
  planId: string;
  semester: number;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  teacherContractType: string;
  teacherCanGrade: boolean;
  canGrade: boolean;
  gradeBlockedReason: string | null;
  competenceIds: string[];
  assignedRaIds: string[];
  totalRa: number;
  evaluatedRa: number;
  measurementCompleted: boolean;
  results: [];
}

export interface MeasurementContext {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  scope: {
    seccionalId: string;
    seccionalNombre: string;
    facultadId: string;
    facultadNombre: string;
    programaId: string;
    programaNombre: string;
  };
  planes: Array<{ id: string; nombre: string; programaId: string; estado: "activo" | "inactivo" }>;
  competencias: Array<{
    id: string;
    nombre?: string;
    descripcion?: string;
    resultadosAprendizaje?: Array<{ id?: string; numero?: number; descripcion?: string }>;
  }>;
  ciclos: Array<{
    id: string;
    nombre: string;
    seccionalId: string;
    facultadId: string;
    programaId: string;
    planId: string;
    periodo: string;
    fechaInicio: string;
    fechaFin: string;
    cursoIds: string[];
  }>;
  courses: MeasurementContextCourse[];
}

export interface MeasurementAccess {
  cycleId: string;
  courseId: string;
  canGrade: boolean;
  reason: string | null;
  teacherName: string;
  teacherEmail: string;
  contractType: string;
  measurement: MedicionRaDemoState | null;
}

export function getMeasurementContext(signal?: AbortSignal) {
  return httpClient.get<MeasurementContext>("/ra-assignments/measurement-context", { signal });
}

export function getMeasurementAccess(cycleId: string, courseId: string, signal?: AbortSignal) {
  return httpClient.get<MeasurementAccess>(
    `/ra-assignments/cycles/${encodeURIComponent(cycleId)}/courses/${encodeURIComponent(courseId)}/measurement-access`,
    { signal },
  );
}

export function saveCourseMeasurement(
  cycleId: string,
  courseId: string,
  measurement: MedicionRaDemoState,
) {
  return httpClient.put<MedicionRaDemoState>(
    `/ra-assignments/cycles/${encodeURIComponent(cycleId)}/courses/${encodeURIComponent(courseId)}/measurement`,
    measurement,
  );
}
