import { GoSearch } from "react-icons/go";
import { Select } from "../../../../components/ui";
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
}: AsignarRAFiltersProps) {
  return (
    <section className="surface-card p-6">
      <div className="mb-5 flex items-start gap-3">
        <GoSearch className="mt-1 shrink-0 text-xl text-[var(--color-secondary-1)]" />
        <div>
          <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">Filtros de asignación</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
            Selecciona el programa, plan, ciclo y curso de Síntesis a trabajar.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {locks.showSeccionalFilter ? (
          <Select
            label="Seccional"
            value={filters.selectedSeccionalId}
            options={options.seccionalOptions}
            placeholder="Todas las seccionales"
            onChange={(event) => onSeccionalChange(event.target.value)}
            disabled={locks.isSeccionalLocked}
            helperText={locks.isSeccionalLocked ? "Asignado a tu rol" : undefined}
          />
        ) : null}

        {locks.showFacultadFilter ? (
          <Select
            label="Facultad"
            value={filters.selectedFacultadId}
            options={options.facultadOptions}
            placeholder="Todas las facultades"
            onChange={(event) => onFacultadChange(event.target.value)}
            disabled={locks.isFacultadLocked}
            helperText={locks.isFacultadLocked ? "Asignado a tu rol" : undefined}
          />
        ) : null}

        <Select
          label="Programa académico"
          value={filters.selectedProgramId}
          options={options.programOptions}
          placeholder="Seleccionar programa"
          onChange={(event) => onProgramChange(event.target.value)}
          disabled={locks.isProgramLocked}
          helperText={locks.isProgramLocked ? "Asignado a tu rol" : undefined}
        />

        <Select
          label="Plan de estudios"
          value={filters.selectedPlanId}
          options={options.planOptions}
          placeholder="Seleccionar plan de estudio"
          onChange={(event) => onPlanChange(event.target.value)}
          disabled={locks.isPlanLocked}
          helperText={locks.isPlanLocked ? "Asignado a tu rol" : undefined}
        />

        <Select
          label="Ciclo de medición"
          value={filters.selectedCycleId}
          options={options.cycleOptions}
          placeholder={cyclesLength ? "Seleccionar ciclo" : "Sin ciclo disponible"}
          onChange={(event) => onCycleChange(event.target.value)}
          disabled={!cyclesLength}
        />

        <Select
          label="Curso de Síntesis"
          value={filters.courseFilterId}
          options={options.courseOptions}
          placeholder={coursesLength ? "Todos los cursos" : "Sin cursos disponibles"}
          onChange={(event) => onCourseFilterChange(event.target.value)}
          disabled={!coursesLength}
        />
      </div>
    </section>
  );
}
