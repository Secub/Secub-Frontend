import { GoX } from "react-icons/go";
import { Button, Select, type SelectOption } from "../../../../components/ui";
import type {
  DashboardCatalogs,
  DashboardFiltersState,
  DashboardUser,
  EnrichedCycle,
} from "../dashboard.types";

interface DashboardFiltersProps {
  user: DashboardUser;
  catalogs: DashboardCatalogs;
  cycles: EnrichedCycle[];
  filters: DashboardFiltersState;
  onFilterChange: <K extends keyof DashboardFiltersState>(
    key: K,
    value: DashboardFiltersState[K],
  ) => void;
  onReset: () => void;
}

const statusOptions: SelectOption[] = [
  { label: "Pendiente", value: "pendiente" },
  { label: "Finalizado", value: "finalizado" },
];

function toOptions(items: { id: string; name: string }[]): SelectOption[] {
  return items.map((item) => ({ label: item.name, value: item.id }));
}

export default function DashboardFilters({
  user,
  catalogs,
  cycles,
  filters,
  onFilterChange,
  onReset,
}: DashboardFiltersProps) {
  const showSeccional = user.role === "admin";
  const showFacultad = user.role === "admin" || user.role === "vice" || user.role === "decano";

  const scopedProgramaIds = user.scope.programaIds ?? [];
  const seccionalOptions = toOptions(catalogs.seccionales);

  const facultadOptions = toOptions(
    catalogs.facultades.filter((facultad) => {
      if (filters.seccionalId && facultad.seccionalId !== filters.seccionalId) return false;
      if (user.scope.seccionalId && facultad.seccionalId !== user.scope.seccionalId) return false;
      if (user.role === "decano" && user.scope.facultadId && facultad.id !== user.scope.facultadId) return false;
      return true;
    }),
  );

  const programaOptions = toOptions(
    catalogs.programas.filter((programa) => {
      if (filters.seccionalId && programa.seccionalId !== filters.seccionalId) return false;
      if (filters.facultadId && programa.facultadId !== filters.facultadId) return false;
      if (user.scope.seccionalId && programa.seccionalId !== user.scope.seccionalId) return false;
      if (user.scope.facultadId && programa.facultadId !== user.scope.facultadId) return false;
      if (scopedProgramaIds.length && !scopedProgramaIds.includes(programa.id)) return false;
      return true;
    }),
  );

  const planOptions = toOptions(
    catalogs.planes.filter((plan) => {
      if (filters.programaId && plan.programaId !== filters.programaId) return false;
      if (scopedProgramaIds.length && !scopedProgramaIds.includes(plan.programaId)) return false;
      return true;
    }),
  );

  const cycleOptions = cycles.map((cycle) => ({ label: cycle.name, value: cycle.id }));

  return (
    <section className="surface-card p-6" aria-label="Filtros del dashboard de medición">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            Filtros
          </h2>
          <p className="mt-1 text-sm text-[var(--color-gray-3)]">
            Ajusta la información visible según ciclo, estado y alcance del rol actual.
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
        {showSeccional ? (
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

        {showFacultad ? (
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

        <div className="panel-filter-item">
          <Select
            label="Programa académico"
            placeholder="Todos"
            value={filters.programaId}
            options={programaOptions}
            onChange={(event) => onFilterChange("programaId", event.target.value)}
          />
        </div>

        <div className="panel-filter-item">
          <Select
            label="Plan de estudios"
            placeholder="Todos"
            value={filters.planId}
            options={planOptions}
            onChange={(event) => onFilterChange("planId", event.target.value)}
          />
        </div>

        <div className="panel-filter-item">
          <Select
            label="Estado"
            placeholder="Todos los estados"
            value={filters.status}
            options={statusOptions}
            onChange={(event) => onFilterChange("status", event.target.value)}
          />
        </div>

        <div className="panel-filter-item">
          <Select
            label="Ciclo de medición"
            placeholder="Todos los ciclos"
            value={filters.cycleId}
            options={cycleOptions}
            onChange={(event) => onFilterChange("cycleId", event.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
