import { Button, Select, type SelectOption } from "../../../../components/ui";
import type {
  DashboardCatalogs,
  DashboardFiltersState,
  DashboardUser,
  EnrichedCycle,
} from "../dashboard.types";

import { ActionIcon } from "../../../../components/ui/ActionIcon";
import { getFilterPermissions } from "../../../../config/access/permissions";

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
  const filterPermissions = getFilterPermissions("dashboard", user.role);
  const showSeccional = filterPermissions.canFilterBySeccional;
  const showFacultad = filterPermissions.canFilterByFacultad;
  const showPrograma = filterPermissions.canFilterByPrograma;
  const showPlan = filterPermissions.canFilterByPlan;
  const showEstado = filterPermissions.canFilterByEstado;

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

  const planOptions = catalogs.planes
    .filter((plan) => {
      if (filters.programaId && plan.programaId !== filters.programaId) return false;
      if (scopedProgramaIds.length && !scopedProgramaIds.includes(plan.programaId)) return false;
      return plan.estado === "activo" || plan.id === filters.planId;
    })
    .map((plan) => ({
      label: plan.estado === "inactivo" ? `${plan.name} (Inactivo)` : plan.name,
      value: plan.id,
    }));

  const cycleOptions = cycles.map((cycle) => ({ label: cycle.name, value: cycle.id }));

  return (
    <section className="surface-card p-6" aria-label="Filtros del dashboard de medición">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            Filtros
          </h2>
          <p className="mt-1 text-sm text-[var(--color-gray-3)]">
            Ajusta la información visible por ciclo y estado.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ActionIcon name="close" />}
          onClick={onReset}
        >
          Limpiar filtros
        </Button>
      </div>

      <div className="panel-filters-grid">
        {showSeccional ? (
          <div className="panel-filter-item">
            <Select
              label="Seccional"
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

        {showPrograma ? (
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

        {showPlan ? (
          <div className="panel-filter-item">
            <Select
              label="Plan de estudios"
              placeholder="Todos"
              value={filters.planId}
              options={planOptions}
              onChange={(event) => onFilterChange("planId", event.target.value)}
            />
          </div>
        ) : null}

        {showEstado ? (
          <div className="panel-filter-item">
            <Select
              label="Estado"
              placeholder="Todos los estados"
              value={filters.status}
              options={statusOptions}
              onChange={(event) => onFilterChange("status", event.target.value)}
            />
          </div>
        ) : null}

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
