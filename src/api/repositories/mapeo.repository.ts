import { api } from "../client";

import type {
  MapeoCompetenciasRecord,
  CreateMapeoCompetenciasDto,
  UpdateMapeoCompetenciasDto,
} from "../../pages/panel/mapeo-competencias/MapeoCompetencias.types";

export const getMapeos = async (): Promise<
  MapeoCompetenciasRecord[]
> => {
  const response = await api.get<
    MapeoCompetenciasRecord[]
  >("/mapeosCompetencias");

  return response.data;
};

export const getMapeoByPrograma = async (
  programaId: string
): Promise<MapeoCompetenciasRecord[]> => {
  const response = await api.get<
    MapeoCompetenciasRecord[]
  >(
    `/mapeosCompetencias?programaId=${programaId}`
  );

  return response.data;
};

export const createMapeo = async (
  data: CreateMapeoCompetenciasDto
): Promise<MapeoCompetenciasRecord> => {
  const response =
    await api.post<MapeoCompetenciasRecord>(
      "/mapeosCompetencias",
      data
    );

  return response.data;
};

export const updateMapeo = async (
  id: string,
  data: UpdateMapeoCompetenciasDto
): Promise<MapeoCompetenciasRecord> => {
  const response =
    await api.patch<MapeoCompetenciasRecord>(
      `/mapeosCompetencias/${id}`,
      data
    );

  return response.data;
};

export const deleteMapeo = async (
  id: string
): Promise<void> => {
  await api.delete(
    `/mapeosCompetencias/${id}`
  );
};