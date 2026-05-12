import { useEffect, useState } from "react";

import {
  getCurrentUser,
} from "../../../../api/repositories/user.repository";

import {
  getSeccionales,
  getFacultades,
  getProgramas,
  getPlanes,
} from "../../../../api/repositories/catalogs.repository";

import type {
  CurrentUser,
  Catalogs,
} from "../MapeoCompetencias.types";

export function useMapeoCompetenciasData() {
  const [loading, setLoading] =
    useState(true);

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [catalogs, setCatalogs] =
    useState<Catalogs>({
      seccionales: [],
      facultades: [],
      lugares: [],
      programas: [],
      planes: [],
    });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          currentUser,
          seccionales,
          facultades,
          programas,
          planes,
        ] = await Promise.all([
          getCurrentUser(),
          getSeccionales(),
          getFacultades(),
          getProgramas(),
          getPlanes(),
        ]);

        setCurrentUser(currentUser);

        setCatalogs({
          seccionales,
          facultades,
          lugares: [],
          programas,
          planes,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    loading,
    currentUser,
    catalogs,
  };
}