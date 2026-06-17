import { GoX } from "react-icons/go";
import { Button, Select } from "../../../../components/ui";
import type {
  CurrentUser,
  CompetenciasRaEnriched,
  CompetenciasRaFilters as CompetenciasRaFiltersState,
  RolePermissions,
} from "../CompetenciasRa.types";

interface CompetenciasRaFiltersProps {
  user: CurrentUser;
  permissions: RolePermissions;
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
  const effectiveSeccionalId = filters.seccionalId || user.scope.seccionalId || "";
  const isLugarLocked = Boolean(effectiveSeccionalId);

  return (
    <div className="surface-card p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            Filtros
          </h3>
          <p className="mt-1 text-sm text-[var(--color-gray-3)]">
            Ajusta la lista según el alcance permitido para el usuario en sesión.
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

      <div className="panel-filters-grid">
        {permissions.canFilterByLugar ? (
          <div className="panel-filter-item">
            <Select
              label="Lugar de desarrollo"
              value={filters.lugarId}
              onChange={(event) => onFilterChange("lugarId", event.target.value)}
              options={filterOptions.lugares.map((item) => ({
                label: item.nombre,
                value: item.id,
              }))}
              placeholder="Todos los lugares"
              disabled={isLugarLocked}
            />
          </div>
        ) : null}

        {permissions.canFilterByFacultad ? (
          <div className="panel-filter-item">
            <Select
              label="Facultad"
              value={filters.facultadId}
              onChange={(event) =>
                onFilterChange("facultadId", event.target.value)
              }
              options={filterOptions.facultades.map((item) => ({
                label: item.nombre,
                value: item.id,
              }))}
              placeholder="Todas las facultades"
            />
          </div>
        ) : null}

        {permissions.canFilterByPrograma ? (
          <div className="panel-filter-item">
            <Select
              label="Programa académico"
              value={filters.programaId}
              onChange={(event) =>
                onFilterChange("programaId", event.target.value)
              }
              options={filterOptions.programas.map((item) => ({
                label: item.nombre,
                value: item.id,
              }))}
              placeholder="Todos los programas"
            />
          </div>
        ) : null}

        {permissions.canFilterByPlan ? (
          <div className="panel-filter-item">
            <Select
              label="Plan de estudios"
              value={filters.planId}
              onChange={(event) => onFilterChange("planId", event.target.value)}
              options={filterOptions.planes.map((item) => ({
                label:
                  item.estado === "inactivo" && !item.nombre.includes("Inactivo")
                    ? `${item.nombre} (Inactivo)`
                    : item.nombre,
                value: item.id,
              }))}
              placeholder="Todos los planes"
            />
          </div>
        ) : null}

        {permissions.canFilterByEstado ? (
          <div className="panel-filter-item">
            <Select
              label="Estado"
              value={filters.estado}
              onChange={(event) =>
                onFilterChange(
                  "estado",
                  event.target.value as CompetenciasRaFiltersState["estado"],
                )
              }
              options={[
                { label: "Activo", value: "activo" },
                { label: "Inactivo", value: "inactivo" },
              ]}
              placeholder="Todos los estados"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default CompetenciasRaFilters;