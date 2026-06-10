import type {
  Catalogs,
  CurrentUser,
  MapeoCompetenciasEnriched,
  MapeoCompetenciasFilters,
} from "./MapeoCompetencias.types";

export function getLugaresBySeccional(lugares: Catalogs["lugares"], seccionalId: string) {
  if (!seccionalId) return lugares;

  if (seccionalId === "medellin") {
    const medellinLugarIds = new Set(["medellin", "bello", "armenia"]);
    return lugares.filter((lugar) => lugar.seccionalId === "medellin" || medellinLugarIds.has(lugar.id));
  }

  return lugares.filter((lugar) => lugar.seccionalId === seccionalId);
}

export function getDefaultLugarBySeccional(seccionalId: string, lugares: Catalogs["lugares"] = []) {
  if (!seccionalId) return "";

  const lugaresPermitidos = getLugaresBySeccional(lugares, seccionalId);
  const lugarEquivalente = lugaresPermitidos.find((lugar) => lugar.id === seccionalId);

  return lugarEquivalente?.id ?? lugaresPermitidos[0]?.id ?? "";
}

export function applyRoleScope(
  records: MapeoCompetenciasEnriched[],
  user: CurrentUser,
): MapeoCompetenciasEnriched[] {
  if (user.role === "admin") return records;

  const scope = user.scope ?? {};
  const userProgramId = scope.programaId ?? scope.academicProgramId;

  return records.filter((record) => {
    if (scope.seccionalId && record.seccionalId !== scope.seccionalId) return false;
    if (scope.facultadId && record.facultadId !== scope.facultadId) return false;
    if (userProgramId && record.programaId !== userProgramId) return false;
    if (scope.planId && record.planId !== scope.planId) return false;
    return true;
  });
}

export function applyFilters(
  records: MapeoCompetenciasEnriched[],
  filters: MapeoCompetenciasFilters,
): MapeoCompetenciasEnriched[] {
  return records.filter((record) => {
    if (filters.seccionalId && record.seccionalId !== filters.seccionalId) return false;
    if (filters.facultadId && record.facultadId !== filters.facultadId) return false;
    if (filters.lugarId && record.lugarId !== filters.lugarId) return false;
    if (filters.programaId && record.programaId !== filters.programaId) return false;
    if (filters.planId && record.planId !== filters.planId) return false;
    if (filters.estado && record.estado !== filters.estado) return false;
    return true;
  });
}

export function buildAvailableFilters(
  catalogs: Catalogs,
  filters: MapeoCompetenciasFilters,
  user: CurrentUser,
) {
  const scope = user.scope ?? {};
  const userProgramId = scope.programaId ?? scope.academicProgramId;

  const seccionales = catalogs.seccionales.filter((seccional) => {
    if (scope.seccionalId && seccional.id !== scope.seccionalId) return false;
    return true;
  });

  const scopedLugares = scope.seccionalId
    ? getLugaresBySeccional(catalogs.lugares, scope.seccionalId)
    : catalogs.lugares;

  const lugares = filters.seccionalId
    ? getLugaresBySeccional(scopedLugares, filters.seccionalId)
    : scopedLugares;

  const facultades = catalogs.facultades.filter((facultad) => {
    if (scope.seccionalId && facultad.seccionalId !== scope.seccionalId) return false;
    if (scope.facultadId && facultad.id !== scope.facultadId) return false;
    if (filters.seccionalId && facultad.seccionalId !== filters.seccionalId) return false;
    return true;
  });

  const programas = catalogs.programas.filter((programa) => {
    if (scope.seccionalId && programa.seccionalId !== scope.seccionalId) return false;
    if (scope.facultadId && programa.facultadId !== scope.facultadId) return false;
    if (userProgramId && programa.id !== userProgramId) return false;
    if (filters.seccionalId && programa.seccionalId !== filters.seccionalId) return false;
    if (filters.facultadId && programa.facultadId !== filters.facultadId) return false;
    return true;
  });

  const planes = catalogs.planes.filter((plan) => {
    if (scope.planId && plan.id !== scope.planId) return false;
    if (filters.programaId && plan.programaId !== filters.programaId) return false;
    if (!filters.programaId) {
      return programas.some((programa) => programa.id === plan.programaId);
    }
    return true;
  });

  return {
    seccionales,
    lugares,
    facultades,
    programas,
    planes,
  };
}

export function sanitizeFilters(
  filters: MapeoCompetenciasFilters,
  available: ReturnType<typeof buildAvailableFilters>,
): MapeoCompetenciasFilters {
  const seccionalId = available.seccionales.some((item) => item.id === filters.seccionalId)
    ? filters.seccionalId
    : "";
  const lugarId = available.lugares.some((item) => item.id === filters.lugarId)
    ? filters.lugarId
    : seccionalId
      ? getDefaultLugarBySeccional(seccionalId, available.lugares)
      : "";
  const facultadId = available.facultades.some((item) => item.id === filters.facultadId)
    ? filters.facultadId
    : "";
  const programaId = available.programas.some((item) => item.id === filters.programaId)
    ? filters.programaId
    : "";
  const planId = available.planes.some((item) => item.id === filters.planId)
    ? filters.planId
    : "";

  return {
    ...filters,
    seccionalId,
    lugarId,
    facultadId,
    programaId,
    planId,
  };
}
