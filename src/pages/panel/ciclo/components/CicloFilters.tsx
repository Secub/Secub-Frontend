import { GoX } from "react-icons/go";
import { Button, Select, type SelectOption } from "../../../../components/ui";
import type {
  CicloCatalogs,
  CicloEnriched,
  CicloFilters as CicloFiltersState,
  CicloRolePermissions,
  CurrentUser,
} from "../ciclo.types";
import { getAvailablePeriods } from "../ciclo.utils";

interface CicloFiltersProps {
  user: CurrentUser;
  permissions: CicloRolePermissions;
  catalogs: CicloCatalogs;
  filters: CicloFiltersState;
  baseCycles: CicloEnriched[];
  filteredCount: number;
  totalCount: number;
  onFilterChange: <K extends keyof CicloFiltersState>(
    key: K,
    value: CicloFiltersState[K],
  ) => void;
  onReset: () => void;
}

function toOptions<T extends { id: string; nombre: string }>(items: T[]): SelectOption[] {
  return items.map((item) => ({ label: item.nombre, value: item.id }));
}

const estadoOptions: SelectOption[] = [
  { label: "En curso", value: "activo" },
  { label: "Finalizado", value: "finalizado" },
];

export default function CicloFilters({
  user,
  permissions,
  catalogs,
  filters,
  baseCycles,
  filteredCount,
  totalCount,
  onFilterChange,
  onReset,
}: CicloFiltersProps) {
  const scopedSeccionalIds = new Set(baseCycles.map((ciclo) => ciclo.seccionalId));
  const scopedFacultadIds = new Set(baseCycles.map((ciclo) => ciclo.facultadId));
  const scopedProgramaIds = new Set(baseCycles.map((ciclo) => ciclo.programaId));

  const seccionalOptions = toOptions(
    catalogs.seccionales.filter((item) => scopedSeccionalIds.has(item.id)),
  );

  const facultadOptions = toOptions(
    catalogs.facultades.filter((item) => {
      if (!scopedFacultadIds.has(item.id)) return false;
      if (filters.seccionalId && item.seccionalId !== filters.seccionalId) return false;
      if (user.scope.seccionalId && item.seccionalId !== user.scope.seccionalId) return false;
      return true;
    }),
  );

  const programaOptions = toOptions(
    catalogs.programas.filter((item) => {
      if (!scopedProgramaIds.has(item.id)) return false;
      if (filters.seccionalId && item.seccionalId !== filters.seccionalId) return false;
      if (filters.facultadId && item.facultadId !== filters.facultadId) return false;
      if (user.scope.programaId && item.id !== user.scope.programaId) return false;
      if (user.scope.facultadId && item.facultadId !== user.scope.facultadId) return false;
      if (user.scope.seccionalId && item.seccionalId !== user.scope.seccionalId) return false;
      return true;
    }),
  );

  const periodoOptions: SelectOption[] = getAvailablePeriods(baseCycles).map((periodo) => ({
    label: periodo,
    value: periodo,
  }));

  return (
    <section className="surface-card p-6" aria-label="Filtros de creación del ciclo">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            Filtros
          </h2>
          <p className="mt-1 text-sm text-[var(--color-gray-3)]">
            Consulta ciclos por programa, periodo, estado y alcance del rol actual.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          leftIcon={<GoX className="text-lg" />}
          onClick={onReset}
          title={`${filteredCount} de ${totalCount} ciclos visibles`}
        >
          Limpiar filtros
        </Button>
      </div>

      <div className="panel-filters-grid">
        {permissions.canFilterBySeccional ? (
          <div className="panel-filter-item">
            <Select
              label="Seccional / sede"
              placeholder="Todas"
              value={filters.seccionalId}
              options={seccionalOptions}
              onChange={(event) => onFilterChange("seccionalId", event.target.value)}
            />
          </div>
        ) : null}

        {permissions.canFilterByFacultad ? (
          <div className="panel-filter-item">
            <Select
              label="Facultad"
              placeholder="Todas"
              value={filters.facultadId}
              options={facultadOptions}
              onChange={(event) => onFilterChange("facultadId", event.target.value)}
            />
          </div>
        ) : null}

        {permissions.canFilterByPrograma ? (
          <div className="panel-filter-item">
            <Select
              label="Programa académico"
              placeholder="Todos"
              value={filters.programaId}
              options={programaOptions}
              onChange={(event) => onFilterChange("programaId", event.target.value)}
            />
          </div>
        ) : null}

        {permissions.canFilterByPeriodo ? (
          <div className="panel-filter-item">
            <Select
              label="Periodo de selección"
              placeholder="Todos los periodos"
              value={filters.periodo}
              options={periodoOptions}
              onChange={(event) => onFilterChange("periodo", event.target.value)}
            />
          </div>
        ) : null}

        {permissions.canFilterByEstado ? (
          <div className="panel-filter-item">
            <Select
              label="Estado"
              placeholder="Todos"
              value={filters.estado}
              options={estadoOptions}
              onChange={(event) => onFilterChange("estado", event.target.value)}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
