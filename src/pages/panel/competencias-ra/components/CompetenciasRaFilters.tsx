import type { AcademicModulePermissions } from "../../../../config/access/permissions";
import { AcademicScopeFilters } from "../../../../features/academic-scope";
import type {
  CurrentUser,
  CompetenciasRaEnriched,
  CompetenciasRaFilters as CompetenciasRaFiltersState,
  } from "../CompetenciasRa.types";

interface CompetenciasRaFiltersProps {
  user: CurrentUser;
  permissions: AcademicModulePermissions;
  filters: CompetenciasRaFiltersState;
  filterOptions: {
    facultades: { id: string; nombre: string }[];
    lugares: { id: string; nombre: string }[];
    programas: { id: string; nombre: string }[];
    planes: { id: string; nombre: string; estado?: "activo" | "inactivo" }[];
  };
  filteredCount: number;
  totalCount: number;
  onFilterChange: <K extends keyof CompetenciasRaFiltersState>(
    key: K,
    value: CompetenciasRaFiltersState[K],
  ) => void;
  onReset: () => void;
  activeRecords: CompetenciasRaEnriched[];
}

export function CompetenciasRaFilters({
  user,
  permissions,
  filters,
  filterOptions,
  onFilterChange,
  onReset,
}: CompetenciasRaFiltersProps) {
  return (
    <AcademicScopeFilters
      description="Ajusta la lista con los filtros académicos disponibles."
      scopeSeccionalId={user.scope.seccionalId}
      filters={filters}
      filterOptions={filterOptions}
      permissions={{
        canFilterByLugar: false,
        canFilterByFacultad: permissions.canFilterByFacultad,
        canFilterByPrograma: permissions.canFilterByPrograma,
        canFilterByPlan: permissions.canFilterByPlan,
        canFilterByEstado: permissions.canFilterByEstado,
      }}
      onFilterChange={onFilterChange}
      onReset={onReset}
    />
  );
}

export default CompetenciasRaFilters;
