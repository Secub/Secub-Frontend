import { GoX } from "react-icons/go";
import { Button, Select } from "../../../../components/ui";
import type {
  PerfilEgresoFilters as PerfilEgresoFiltersState,
  RolePermissions,
} from "../perfil-egreso.types";

interface PerfilEgresoFiltersProps {
  permissions: RolePermissions;
  filters: PerfilEgresoFiltersState;
  filterOptions: {
    seccionales: { id: string; nombre: string }[];
    facultades: { id: string; nombre: string }[];
    programas: { id: string; nombre: string }[];
    planes: { id: string; nombre: string }[];
  };
  onFilterChange: <K extends keyof PerfilEgresoFiltersState>(
    key: K,
    value: PerfilEgresoFiltersState[K],
  ) => void;
  onReset: () => void;
}

export function PerfilEgresoFilters({
  permissions,
  filters,
  filterOptions,
  onFilterChange,
  onReset,
}: PerfilEgresoFiltersProps) {
  return (
    <div className="surface-card p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            Filtros
          </h3>
          <p className="mt-1 text-sm text-[var(--color-gray-3)]">
            Visualiza y filtra los perfiles de egreso según el alcance del rol autenticado.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          leftIcon={<GoX className="text-lg" />}
          onClick={onReset}
        >
          Limpiar filtros
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
        {permissions.canFilterBySeccional ? (
          <Select
            label="Lugar de desarrollo"
            value={filters.seccionalId}
            onChange={(event) => onFilterChange("seccionalId", event.target.value)}
            options={filterOptions.seccionales.map((item) => ({
              label: item.nombre,
              value: item.id,
            }))}
            placeholder="Todas las seccionales"
          />
        ) : null}

        {permissions.canFilterByFacultad ? (
          <Select
            label="Facultad"
            value={filters.facultadId}
            onChange={(event) => onFilterChange("facultadId", event.target.value)}
            options={filterOptions.facultades.map((item) => ({
              label: item.nombre,
              value: item.id,
            }))}
            placeholder="Todas las facultades"
          />
        ) : null}

        {permissions.canFilterByPrograma ? (
          <Select
            label="Programa académico"
            value={filters.programaId}
            onChange={(event) => onFilterChange("programaId", event.target.value)}
            options={filterOptions.programas.map((item) => ({
              label: item.nombre,
              value: item.id,
            }))}
            placeholder="Todos los programas"
          />
        ) : null}

        {permissions.canFilterByPlan ? (
          <Select
            label="Plan de estudios"
            value={filters.planId}
            onChange={(event) => onFilterChange("planId", event.target.value)}
            options={filterOptions.planes.map((item) => ({
              label: item.nombre,
              value: item.id,
            }))}
            placeholder="Todos los planes"
          />
        ) : null}

        {permissions.canFilterByEstado ? (
          <Select
            label="Estado"
            value={filters.estado}
            onChange={(event) =>
              onFilterChange(
                "estado",
                event.target.value as PerfilEgresoFiltersState["estado"],
              )
            }
            options={[
              { label: "Activo", value: "activo" },
              { label: "Inactivo", value: "inactivo" },
            ]}
            placeholder="Todos los estados"
          />
        ) : null}
      </div>
    </div>
  );
}

export default PerfilEgresoFilters;
