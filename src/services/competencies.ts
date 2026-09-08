import { httpClient } from '../infrastructure/api';

export interface CompetencyScope {
  seccionalId: string;
  seccionalNombre: string;
  lugarId: string;
  lugarNombre: string;
  facultadId: string;
  facultadNombre: string;
  programaId: string;
  programaNombre: string;
}

export interface CompetencyPlan {
  id: string;
  nombre: string;
  programaId: string;
  estado: 'activo' | 'inactivo';
}

export interface LearningOutcomeRecord {
  id: string;
  numero: number;
  descripcion: string;
}

export interface CompetencyRecord {
  id: string;
  seccionalId: string;
  lugarId: string;
  facultadId: string;
  programaId: string;
  planId: string;
  estado: 'activo' | 'inactivo';
  descripcion: string;
  nombre: string;
  numero: number;
  resultadosAprendizaje: LearningOutcomeRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CompetencyContext {
  scope: CompetencyScope;
  planes: CompetencyPlan[];
  maxCompetenciasPorPlan: number;
  maxResultadosPorCompetencia: number;
}

export function getCompetencyContext(signal?: AbortSignal) {
  return httpClient.get<CompetencyContext>('/competencies/context', { signal });
}

export function listCompetencies(signal?: AbortSignal) {
  return httpClient.get<CompetencyRecord[]>('/competencies', { signal });
}

export function createCompetency(input: { planId: string; descripcion: string }) {
  return httpClient.post<CompetencyRecord>('/competencies', {
    plan_codigo: input.planId,
    descripcion: input.descripcion,
  });
}

export function updateCompetency(
  competencyId: string,
  input: { planId: string; descripcion: string; estado: 'activo' | 'inactivo' },
) {
  return httpClient.patch<CompetencyRecord>(`/competencies/${competencyId}`, {
    plan_codigo: input.planId,
    descripcion: input.descripcion,
    estado: input.estado,
  });
}

export function deleteCompetency(competencyId: string) {
  return httpClient.delete<void>(`/competencies/${competencyId}`);
}

export function createLearningOutcome(competencyId: string, descripcion: string) {
  return httpClient.post<CompetencyRecord>(`/competencies/${competencyId}/learning-outcomes`, {
    descripcion,
  });
}

export function updateLearningOutcome(
  competencyId: string,
  outcomeId: string,
  descripcion: string,
) {
  return httpClient.patch<CompetencyRecord>(
    `/competencies/${competencyId}/learning-outcomes/${outcomeId}`,
    { descripcion },
  );
}

export function deleteLearningOutcome(competencyId: string, outcomeId: string) {
  return httpClient.delete<void>(
    `/competencies/${competencyId}/learning-outcomes/${outcomeId}`,
  );
}
