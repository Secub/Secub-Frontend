import { GoFilter, GoX } from "react-icons/go";
import { Button, Select } from "../../../../components/ui";
import { roleLabels } from "../proposito-formacion.permissions";
import type {
  CurrentUser,
  PropositoEnriched,
  PropositoFilters as PropositoFiltersState,
  RolePermissions,
} from "../proposito-formacion.types";

interface PropositoFiltersPanelProps {
  user: CurrentUser;
  permissions: RolePermissions;
  filters: PropositoFiltersState;
  filterOptions: {
    seccionales: { id: string; nombre: string }[];
    facultades: { id: string; nombre: string }[];
    programas: { id: string; nombre: string }[];
    planes: { id: string; nombre: string }[];
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

export function PropositoFiltersPanel({
  user,
  permissions,
  filters,
  filterOptions,
  filteredCount,
  totalCount,
  onFilterChange,
  onReset,
  activeRecords,
}: PropositoFiltersPanelProps) {
  const activos = activeRecords.filter((item) => item.estado === "activo").length;
  const inactivos = activeRecords.length - activos;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="surface-card flex items-start gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color:rgba(14,101,217,0.10)] text-[var(--color-secondary-1)]">
            <GoFilter className="text-2xl" />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-gray-4)]">
              Rol actual
            </p>
            <h2 className="mt-1 font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
              {roleLabels[user.role]}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-gray-3)]">
              {user.nombre} visualiza esta pantalla según su alcance
              institucional y permisos configurados.
            </p>
          </div>
        </div>

        <div className="surface-card p-5">
          <p className="text-sm font-medium text-[var(--color-gray-4)]">
            Registros visibles
          </p>
          <p className="mt-3 font-heading text-3xl font-semibold text-[var(--color-secondary-4)]">
            {filteredCount}
          </p>
          <p className="mt-2 text-sm text-[var(--color-gray-3)]">
            de {totalCount} propósitos disponibles para este rol.
          </p>
        </div>

        <div className="surface-card p-5">
          <p className="text-sm font-medium text-[var(--color-gray-4)]">
            Activos
          </p>
          <p className="mt-3 font-heading text-3xl font-semibold text-[var(--color-secondary-4)]">
            {activos}
          </p>
          <p className="mt-2 text-sm text-[var(--color-gray-3)]">
            habilitados para consulta y, si aplica, edición.
          </p>
        </div>

        <div className="surface-card p-5">
          <p className="text-sm font-medium text-[var(--color-gray-4)]">
            Inactivos
          </p>
          <p className="mt-3 font-heading text-3xl font-semibold text-[var(--color-secondary-4)]">
            {inactivos}
          </p>
          <p className="mt-2 text-sm text-[var(--color-gray-3)]">
            visibles solo para lectura dentro del módulo.
          </p>
        </div>
      </div>

      <div className="surface-card p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
              Filtros
            </h3>
            <p className="mt-1 text-sm text-[var(--color-gray-3)]">
              Ajusta la lista según el alcance permitido para el usuario en
              sesión.
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
              label="Seccional"
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
                  event.target.value as PropositoFiltersState["estado"],
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
    </div>
  );
}

export default PropositoFiltersPanel;