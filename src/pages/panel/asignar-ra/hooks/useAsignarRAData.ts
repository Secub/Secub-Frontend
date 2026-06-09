import { useCallback, useEffect, useState } from "react";
import { mockBackend, subscribeToMockBackendChanges } from "../../../../services/mockBackend";
import type {
  AsignacionRaRecord,
  CicloDemoRecord,
  CompetenciaRaDemoRecord,
  MapeoDemoRecord,
  MedicionRaRecord,
} from "../AsignarRA.types";
import { asignarRACurrentUser as currentUser } from "./asignarRA.shared";

export function useAsignarRAData() {
  const [records, setRecords] = useState<AsignacionRaRecord[]>(() =>
    mockBackend.list<AsignacionRaRecord>("asignacionesRa", currentUser),
  );
  const [measurements, setMeasurements] = useState<MedicionRaRecord[]>(() =>
    mockBackend.list<MedicionRaRecord>("medicionesRa", currentUser),
  );
  const [cyclesSource, setCyclesSource] = useState<CicloDemoRecord[]>(() =>
    mockBackend.list<CicloDemoRecord>("ciclosMedicion", currentUser),
  );
  const [competenciasSource, setCompetenciasSource] = useState<CompetenciaRaDemoRecord[]>(() =>
    mockBackend.list<CompetenciaRaDemoRecord>("competenciasRa", currentUser),
  );
  const [mapeosSource, setMapeosSource] = useState<MapeoDemoRecord[]>(() =>
    mockBackend.list<MapeoDemoRecord>("mapeosCompetencias", currentUser),
  );

  const refreshBackendState = useCallback(() => {
    setRecords(mockBackend.list<AsignacionRaRecord>("asignacionesRa", currentUser));
    setMeasurements(mockBackend.list<MedicionRaRecord>("medicionesRa", currentUser));
    setCyclesSource(mockBackend.list<CicloDemoRecord>("ciclosMedicion", currentUser));
    setCompetenciasSource(mockBackend.list<CompetenciaRaDemoRecord>("competenciasRa", currentUser));
    setMapeosSource(mockBackend.list<MapeoDemoRecord>("mapeosCompetencias", currentUser));
  }, []);

  useEffect(() => {
    refreshBackendState();
    return subscribeToMockBackendChanges(refreshBackendState);
  }, [refreshBackendState]);

  return {
    records,
    measurements,
    cyclesSource,
    competenciasSource,
    mapeosSource,
    refreshBackendState,
  };
}
