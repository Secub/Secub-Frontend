import { Select } from "../../../../components/ui";
import { AcademicScopeFilters, type AcademicScopeFilterValues } from "../../../../features/academic-scope";
import type { FilterLocks, FilterOptions, FilterState } from "../AsignarRA.types";

interface AsignarRAFiltersProps {
  filters: FilterState;
  options: FilterOptions;
  locks: FilterLocks;
  coursesLength: number;
  cyclesLength: number;
  onSeccionalChange: (value: string) => void;
  onFacultadChange: (value: string) => void;
  onProgramChange: (value: string) => void;
  onPlanChange: (value: string) => void;
  onCycleChange: (value: string) => void;
  onCourseFilterChange: (value: string) => void;
  onReset: () => void;
}

function toCatalogOptions(options: FilterOptions["programOptions"]) {
  return options.map((option) => ({ id: String(option.value), nombre: String(option.label) }));
}

export function AsignarRAFilters({
  filters,
  options,
  locks,
  coursesLength,
  cyclesLength,
  onSeccionalChange,
  onFacultadChange,
  onProgramChange,
  onPlanChange,
  onCycleChange,
  onCourseFilterChange,
  onReset,
}: AsignarRAFiltersProps) {
  const academicFilters: AcademicScopeFilterValues = {
    seccionalId: filters.selectedSeccionalId,
    lugarId: "",
    facultadId: filters.selectedFacultadId,
    programaId: filters.selectedProgramId,
    planId: filters.selectedPlanId,
    estado: "",
  };

  return (
    <AcademicScopeFilters
      description="Selecciona el programa, plan, ciclo y curso de Síntesis a trabajar."
      filters={academicFilters}
      filterOptions={{
        lugares: [],
        facultades: toCatalogOptions(options.facultadOptions),
        programas: toCatalogOptions(options.programOptions),
        planes: toCatalogOptions(options.planOptions),
      }}
      permissions={{
        canFilterByLugar: false,
        canFilterByFacultad: locks.showFacultadFilter,
        canFilterByPrograma: true,
        canFilterByPlan: true,
        canFilterByEstado: false,
      }}
      disabledFields={{
        facultadId: locks.isFacultadLocked,
        programaId: locks.isProgramLocked,
        planId: locks.isPlanLocked,
      }}
      beforeFilters={locks.showSeccionalFilter ? (
        <div className="panel-filter-item">
          <Select
            label="Seccional"
            value={filters.selectedSeccionalId}
            options={options.seccionalOptions}
            placeholder="Todas las seccionales"
            onChange={(event) => onSeccionalChange(event.target.value)}
            disabled={locks.isSeccionalLocked}
          />
        </div>
      ) : undefined}
      afterFilters={(
        <>
          <div className="panel-filter-item">
            <Select
              label="Ciclo de medición"
              value={filters.selectedCycleId}
              options={options.cycleOptions}
              placeholder={cyclesLength ? "Seleccionar ciclo" : "Sin ciclo disponible"}
              onChange={(event) => onCycleChange(event.target.value)}
              disabled={!cyclesLength}
            />
          </div>
          <div className="panel-filter-item">
            <Select
              label="Curso de Síntesis"
              value={filters.courseFilterId}
              options={options.courseOptions}
              placeholder={coursesLength ? "Todos los cursos" : "Sin cursos disponibles"}
              onChange={(event) => onCourseFilterChange(event.target.value)}
              disabled={!coursesLength}
            />
          </div>
        </>
      )}
      onFilterChange={(key, value) => {
        if (key === "facultadId") onFacultadChange(value);
        if (key === "programaId") onProgramChange(value);
        if (key === "planId") onPlanChange(value);
      }}
      onReset={onReset}
    />
  );
}
