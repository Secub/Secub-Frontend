import { GoX } from "react-icons/go";
import { Button, Select } from "../../../../components/ui";

import type {
  CurrentUser,
  MapeoCompetenciasEnriched,
  MapeoCompetenciasFilters as MapeoCompetenciasFiltersState,
  RolePermissions,
} from "../MapeoCompetencias.types";

interface FilterOption {
  id: string;
  nombre: string;
}

interface MapeoCompetenciasFiltersProps {
  user: CurrentUser;
  permissions: RolePermissions;

  filters: MapeoCompetenciasFiltersState;

  filterOptions: {
    seccionales: FilterOption[];
    facultades: FilterOption[];
    lugares: FilterOption[];
    programas: FilterOption[];
    planes: FilterOption[];
  };

  filteredCount: number;
  totalCount: number;

  onFilterChange: <
    K extends keyof MapeoCompetenciasFiltersState
  >(
    key: K,
    value: MapeoCompetenciasFiltersState[K],
  ) => void;

  onReset: () => void;

  activeRecords: MapeoCompetenciasEnriched[];
}

export function MapeoCompetenciasFilters({
  permissions,
  filters,
  filterOptions,
  onFilterChange,
  onReset,
}: MapeoCompetenciasFiltersProps) {

  // Normalizacion defensiva para evitar undefined
  const safeFilterOptions = {
    seccionales:
      filterOptions?.seccionales ?? [],

    facultades:
      filterOptions?.facultades ?? [],

    lugares:
      filterOptions?.lugares ?? [],

    programas:
      filterOptions?.programas ?? [],

    planes:
      filterOptions?.planes ?? [],
  };

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

        {/* SECCIONAL */}
        {permissions.canFilterBySeccional && (
          <div className="panel-filter-item">
            <Select
              label="Seccional"
              value={filters.seccionalId ?? ""}
              onChange={(event) =>
                onFilterChange(
                  "seccionalId",
                  event.target.value,
                )
              }
              options={safeFilterOptions.seccionales.map(
                (item) => ({
                  label: item.nombre,
                  value: item.id,
                }),
              )}
              placeholder="Todas las seccionales"
            />
          </div>
        )}

        {/* LUGAR */}
        {permissions.canFilterByLugar && (
          <div className="panel-filter-item">
            <Select
              label="Lugar de desarrollo"
              value={filters.lugarId ?? ""}
              onChange={(event) =>
                onFilterChange(
                  "lugarId",
                  event.target.value,
                )
              }
              options={safeFilterOptions.lugares.map(
                (item) => ({
                  label: item.nombre,
                  value: item.id,
                }),
              )}
              placeholder="Todos los lugares"
            />
          </div>
        )}

        {/* FACULTAD */}
        {permissions.canFilterByFacultad && (
          <div className="panel-filter-item">
            <Select
              label="Facultad"
              value={filters.facultadId ?? ""}
              onChange={(event) =>
                onFilterChange(
                  "facultadId",
                  event.target.value,
                )
              }
              options={safeFilterOptions.facultades.map(
                (item) => ({
                  label: item.nombre,
                  value: item.id,
                }),
              )}
              placeholder="Todas las facultades"
            />
          </div>
        )}

        {/* PROGRAMA */}
        {permissions.canFilterByPrograma && (
          <div className="panel-filter-item">
            <Select
              label="Programa académico"
              value={filters.programaId ?? ""}
              onChange={(event) =>
                onFilterChange(
                  "programaId",
                  event.target.value,
                )
              }
              options={safeFilterOptions.programas.map(
                (item) => ({
                  label: item.nombre,
                  value: item.id,
                }),
              )}
              placeholder="Todos los programas"
            />
          </div>
        )}

        {/* PLAN */}
        {permissions.canFilterByPlan && (
          <div className="panel-filter-item">
            <Select
              label="Plan de estudios"
              value={filters.planId ?? ""}
              onChange={(event) =>
                onFilterChange(
                  "planId",
                  event.target.value,
                )
              }
              options={safeFilterOptions.planes.map(
                (item) => ({
                  label: item.nombre,
                  value: item.id,
                }),
              )}
              placeholder="Todos los planes"
            />
          </div>
        )}

        {/* ESTADO */}
        {permissions.canFilterByEstado && (
          <div className="panel-filter-item">
            <Select
              label="Estado"
              value={filters.estado ?? ""}
              onChange={(event) =>
                onFilterChange(
                  "estado",
                  event.target.value as MapeoCompetenciasFiltersState["estado"],
                )
              }
              options={[
                {
                  label: "Activo",
                  value: "activo",
                },
                {
                  label: "Inactivo",
                  value: "inactivo",
                },
              ]}
              placeholder="Todos los estados"
            />
          </div>
        )}

      </div>
    </div>
  );
}

export default MapeoCompetenciasFilters;