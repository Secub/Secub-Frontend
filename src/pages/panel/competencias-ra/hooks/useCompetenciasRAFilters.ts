import { useEffect, useMemo, useState } from "react";
import {
  INITIAL_FILTERS,
  applyFilters,
  applyRoleScope,
  buildAvailableFilters,
  enrichCompetenciasRa,
  getDefaultLugarBySeccional,
  getLearningResultsValidationMessage,
  sanitizeFilters,
  syncFiltersByActivePlan,
} from "../CompetenciasRa.utils";
import type {
  Catalogs,
  CurrentUser,
  CompetenciasRaFilters as FiltersState,
  CompetenciasRaFormacionRecord,
} from "../CompetenciasRa.types";

function areFiltersEqual(first: FiltersState, second: FiltersState) {
  return (
    first.seccionalId === second.seccionalId &&
    first.lugarId === second.lugarId &&
    first.facultadId === second.facultadId &&
    first.programaId === second.programaId &&
    first.planId === second.planId &&
    first.estado === second.estado
  );
}

interface UseCompetenciasRAFiltersParams {
  records: CompetenciasRaFormacionRecord[];
  catalogs: Catalogs;
  currentUser: CurrentUser;
}

export function useCompetenciasRAFilters({ records, catalogs, currentUser }: UseCompetenciasRAFiltersParams) {
  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const enrichedRecords = useMemo(() => enrichCompetenciasRa(records, catalogs), [catalogs, records]);
  const roleScopedRecords = useMemo(() => applyRoleScope(enrichedRecords, currentUser), [currentUser, enrichedRecords]);
  const availableFilterOptions = useMemo(
    () => buildAvailableFilters(roleScopedRecords, catalogs, filters),
    [catalogs, filters, roleScopedRecords],
  );

  useEffect(() => {
    setFilters((current) => {
      const sanitized = sanitizeFilters(current, availableFilterOptions);
      return areFiltersEqual(sanitized, current) ? current : sanitized;
    });
  }, [availableFilterOptions]);

  const filteredRecords = useMemo(() => {
    const filtered = applyFilters(roleScopedRecords, filters);
    return filtered.sort((a, b) =>
      sortOrder === "asc" ? (a.numero || 0) - (b.numero || 0) : (b.numero || 0) - (a.numero || 0),
    );
  }, [filters, roleScopedRecords, sortOrder]);

  const invalidCompetencias = useMemo(
    () => filteredRecords.filter((record) => Boolean(getLearningResultsValidationMessage(record))),
    [filteredRecords],
  );

  const handleFilterChange = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
    setFilters((current) => {
      const next = { ...current, [key]: value };

      if (key === "seccionalId") {
        next.lugarId = getDefaultLugarBySeccional(String(value));
        next.facultadId = "";
        next.programaId = "";
        next.planId = "";
      }

      if (key === "lugarId") {
        next.facultadId = "";
        next.programaId = "";
        next.planId = "";
      }

      if (key === "facultadId") {
        next.programaId = "";
        next.planId = "";
      }

      if (key === "programaId") next.planId = "";
      if (key === "planId") return syncFiltersByActivePlan(next, String(value), catalogs);

      return next;
    });
  };

  return {
    filters,
    sortOrder,
    setFilters,
    setSortOrder,
    roleScopedRecords,
    availableFilterOptions,
    filteredRecords,
    invalidCompetencias,
    handleFilterChange,
  };
}
