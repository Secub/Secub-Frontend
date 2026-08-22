import type { AcademicModulePermissions } from "../../../../config/access/permissions";
import { AcademicScopeFilters } from "../../../../features/academic-scope";
import type {
  CurrentUser,
  PropositoEnriched,
  PropositoFilters as PropositoFiltersState,
  } from "../proposito-formacion.types";

interface PropositoFiltersProps {
  user: CurrentUser;
  permissions: AcademicModulePermissions;
  filters: PropositoFiltersState;
  filterOptions: {
    facultades: { id: string; nombre: string }[];
    lugares: { id: string; nombre: string }[];
    programas: { id: string; nombre: string }[];
    planes: { id: string; nombre: string; estado?: "activo" | "inactivo" }[];
  };
  filteredCount: number;
  totalCount: number;
  onFilterChange: <K extends keyof PropositoFiltersState>(
    key: K,
    value: PropositoFiltersState[K],
  ) => void;
  onReset: () => void;
  activeRecords: PropositoEnriched[];
}

export function PropositoFilters({
  user,
  permissions,
  filters,
  filterOptions,
  onFilterChange,
  onReset,
}: PropositoFiltersProps) {
  return (
    <AcademicScopeFilters
      description="Ajusta la lista con los filtros académicos disponibles."
      scopeSeccionalId={user.scope.seccionalId}
      filters={filters}
      filterOptions={filterOptions}
      permissions={{
        canFilterByLugar: permissions.canFilterByLugar,
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

export default PropositoFilters;
