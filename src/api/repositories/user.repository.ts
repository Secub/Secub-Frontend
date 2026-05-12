import { api } from "../client";

import type {
  CurrentUser,
} from "../../pages/panel/mapeo-competencias/MapeoCompetencias.types";

export const getCurrentUser =
  async (): Promise<CurrentUser> => {
    const response =
      await api.get<CurrentUser>(
        "/currentUser"
      );

    return response.data;
  };