import { httpClient } from "../infrastructure/api";

export interface GraduationProfileScope {
  seccionalId: string;
  seccionalNombre: string;
  lugarId: string;
  lugarNombre: string;
  facultadId: string;
  facultadNombre: string;
  programaId: string;
  programaNombre: string;
}

export interface GraduationProfilePlan {
  id: string;
  nombre: string;
  programaId: string;
  estado: "activo" | "inactivo";
}

export interface GraduationProfileRecord {
  id: string;
  seccionalId: string;
  lugarId: string;
  facultadId: string;
  programaId: string;
  planId: string;
  estado: "activo" | "inactivo";
  descripcion: string;
  createdAt: string;
  updatedAt: string;
}

export interface GraduationProfileContext {
  scope: GraduationProfileScope;
  planes: GraduationProfilePlan[];
}

export function getGraduationProfileContext(signal?: AbortSignal) {
  return httpClient.get<GraduationProfileContext>("/graduation-profiles/context", { signal });
}

export function listGraduationProfiles(signal?: AbortSignal) {
  return httpClient.get<GraduationProfileRecord[]>("/graduation-profiles", { signal });
}

export function createGraduationProfile(input: { planId: string; descripcion: string }) {
  return httpClient.post<GraduationProfileRecord>("/graduation-profiles", {
    plan_codigo: input.planId,
    descripcion: input.descripcion,
  });
}

export function updateGraduationProfile(
  profileId: string,
  input: { planId: string; descripcion: string; estado: "activo" | "inactivo" },
) {
  return httpClient.patch<GraduationProfileRecord>(`/graduation-profiles/${profileId}`, {
    plan_codigo: input.planId,
    descripcion: input.descripcion,
    estado: input.estado,
  });
}

export function deleteGraduationProfile(profileId: string) {
  return httpClient.delete<void>(`/graduation-profiles/${profileId}`);
}
