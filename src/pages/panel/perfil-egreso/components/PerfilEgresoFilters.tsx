import type { AcademicModulePermissions } from "../../../../config/access/permissions";
import { AcademicScopeFilters } from "../../../../features/academic-scope";
import type {
  CurrentUser,
  PerfilEgresoFilters as PerfilEgresoFiltersState,
  } from "../perfil-egreso.types";

interface PerfilEgresoFiltersProps {
  user: CurrentUser;
  permissions: AcademicModulePermissions;
  filters: PerfilEgresoFiltersState;
  filterOptions: {
    lugares: { id: string; nombre: string }[];
    facultades: { id: string; nombre: string }[];
    programas: { id: string; nombre: string }[];
    planes: { id: string; nombre: string; estado?: "activo" | "inactivo" }[];
  };
  onFilterChange: <K extends keyof PerfilEgresoFiltersState>(
    key: K,
    value: PerfilEgresoFiltersState[K],
  ) => void;
  onReset: () => void;
}

export function PerfilEgresoFilters(props: PerfilEgresoFiltersProps) {
  return (
    <AcademicScopeFilters
      description="Filtra los perfiles de egreso por su información académica."
      scopeSeccionalId={props.user.scope.seccionalId}
      filters={props.filters}
      filterOptions={props.filterOptions}
      permissions={{
        canFilterByLugar: true,
        canFilterByFacultad: props.permissions.canFilterByFacultad,
        canFilterByPrograma: props.permissions.canFilterByPrograma,
        canFilterByPlan: props.permissions.canFilterByPlan,
        canFilterByEstado: props.permissions.canFilterByEstado,
      }}
      onFilterChange={props.onFilterChange}
      onReset={props.onReset}
    />
  );
}

export default PerfilEgresoFilters;
