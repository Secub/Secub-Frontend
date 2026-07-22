import { GoX } from "react-icons/go";
import { Button, Select } from "../../../components/ui";

export interface AcademicScopeFilterValues {
  seccionalId: string;
  lugarId: string;
  facultadId: string;
  programaId: string;
  planId: string;
  estado: string;
}

export interface AcademicScopeCatalogOption {
  id: string;
  nombre: string;
  estado?: "activo" | "inactivo";
}

export interface AcademicScopeFilterOptions {
  lugares: AcademicScopeCatalogOption[];
  facultades: AcademicScopeCatalogOption[];
  programas: AcademicScopeCatalogOption[];
  planes: AcademicScopeCatalogOption[];
}

export interface AcademicScopeFilterPermissions {
  canFilterByLugar?: boolean;
  canFilterByFacultad: boolean;
  canFilterByPrograma: boolean;
  canFilterByPlan: boolean;
  canFilterByEstado: boolean;
}

interface AcademicScopeFiltersProps<T extends AcademicScopeFilterValues> {
  description: string;
  scopeSeccionalId?: string;
  filters: T;
  filterOptions: AcademicScopeFilterOptions;
  permissions: AcademicScopeFilterPermissions;
  onFilterChange: <K extends keyof AcademicScopeFilterValues>(
    key: K,
    value: T[K],
  ) => void;
  onReset: () => void;
}

const statusOptions = [
  { label: "Activo", value: "activo" },
  { label: "Inactivo", value: "inactivo" },
];

function mapCatalogOptions(items: AcademicScopeCatalogOption[]) {
  return items.map((item) => ({ label: item.nombre, value: item.id }));
}

function mapPlanOptions(items: AcademicScopeCatalogOption[]) {
  return items.map((item) => ({
    label:
      item.estado === "inactivo" && !item.nombre.includes("Inactivo")
        ? `${item.nombre} (Inactivo)`
        : item.nombre,
    value: item.id,
  }));
}

export default function AcademicScopeFilters<T extends AcademicScopeFilterValues>({
  description,
  scopeSeccionalId = "",
  filters,
  filterOptions,
  permissions,
  onFilterChange,
  onReset,
}: AcademicScopeFiltersProps<T>) {
  const isLugarLocked = Boolean(filters.seccionalId || scopeSeccionalId);
  const showLugar = permissions.canFilterByLugar ?? true;

  return (
    <div className="surface-card p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            Filtros
          </h3>
          <p className="mt-1 text-sm text-[var(--color-gray-3)]">{description}</p>
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
        {showLugar ? (
          <div className="panel-filter-item">
            <Select
              label="Lugar de desarrollo"
              value={filters.lugarId}
              onChange={(event) => onFilterChange("lugarId", event.target.value as T["lugarId"])}
              options={mapCatalogOptions(filterOptions.lugares)}
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
              onChange={(event) => onFilterChange("facultadId", event.target.value as T["facultadId"])}
              options={mapCatalogOptions(filterOptions.facultades)}
              placeholder="Todas las facultades"
            />
          </div>
        ) : null}

        {permissions.canFilterByPrograma ? (
          <div className="panel-filter-item">
            <Select
              label="Programa académico"
              value={filters.programaId}
              onChange={(event) => onFilterChange("programaId", event.target.value as T["programaId"])}
              options={mapCatalogOptions(filterOptions.programas)}
              placeholder="Todos los programas"
            />
          </div>
        ) : null}

        {permissions.canFilterByPlan ? (
          <div className="panel-filter-item">
            <Select
              label="Plan de estudios"
              value={filters.planId}
              onChange={(event) => onFilterChange("planId", event.target.value as T["planId"])}
              options={mapPlanOptions(filterOptions.planes)}
              placeholder="Todos los planes"
            />
          </div>
        ) : null}

        {permissions.canFilterByEstado ? (
          <div className="panel-filter-item">
            <Select
              label="Estado"
              value={filters.estado}
              onChange={(event) => onFilterChange("estado", event.target.value as T["estado"])}
              options={statusOptions}
              placeholder="Todos los estados"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
