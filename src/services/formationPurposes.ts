import { httpClient } from '../infrastructure/api';

export interface FormationPurposeScope {
  seccionalId: string;
  seccionalNombre: string;
  lugarId: string;
  lugarNombre: string;
  facultadId: string;
  facultadNombre: string;
  programaId: string;
  programaNombre: string;
}

export interface FormationPurposePlan {
  id: string;
  nombre: string;
  programaId: string;
  estado: 'activo' | 'inactivo';
}

export interface FormationPurposeRecord {
  id: string;
  seccionalId: string;
  lugarId: string;
  facultadId: string;
  programaId: string;
  planId: string;
  estado: 'activo' | 'inactivo';
  descripcion: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormationPurposeContext {
  scope: FormationPurposeScope;
  planes: FormationPurposePlan[];
}

export function getFormationPurposeContext(signal?: AbortSignal) {
  return httpClient.get<FormationPurposeContext>('/formation-purposes/context', { signal });
}

export function listFormationPurposes(signal?: AbortSignal) {
  return httpClient.get<FormationPurposeRecord[]>('/formation-purposes', { signal });
}

export function createFormationPurpose(input: { planId: string; descripcion: string }) {
  return httpClient.post<FormationPurposeRecord>('/formation-purposes', {
    plan_codigo: input.planId,
    descripcion: input.descripcion,
  });
}

export function updateFormationPurpose(
  purposeId: string,
  input: { planId: string; descripcion: string; estado: 'activo' | 'inactivo' },
) {
  return httpClient.patch<FormationPurposeRecord>(`/formation-purposes/${purposeId}`, {
    plan_codigo: input.planId,
    descripcion: input.descripcion,
    estado: input.estado,
  });
}

export function deleteFormationPurpose(purposeId: string) {
  return httpClient.delete<void>(`/formation-purposes/${purposeId}`);
}
