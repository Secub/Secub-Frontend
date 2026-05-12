import { api } from "../client";

import type {
  Seccional,
  Facultad,
  LugarDesarrollo,
  ProgramaAcademico,
  PlanEstudio,
} from "../../pages/panel/mapeo-competencias/MapeoCompetencias.types";

export const getSeccionales = async (): Promise<
  Seccional[]
> => {
  const response =
    await api.get<Seccional[]>(
      "/seccionales"
    );

  return response.data;
};

export const getFacultades = async (): Promise<
  Facultad[]
> => {
  const response =
    await api.get<Facultad[]>(
      "/facultades"
    );

  return response.data;
};

export const getProgramas = async (): Promise<
  ProgramaAcademico[]
> => {
  const response =
    await api.get<
      ProgramaAcademico[]
    >("/programas");

  return response.data;
};

export const getPlanes = async (): Promise<
  PlanEstudio[]
> => {
  const response =
    await api.get<PlanEstudio[]>(
      "/planes"
    );

  return response.data;
};

export const getLugares = async (): Promise<
  LugarDesarrollo[]
> => {

  const response =
    await api.get<LugarDesarrollo[]>(
      "/lugares"
    );

  return response.data;
};

