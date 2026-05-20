import { Select } from "../../../../components/ui";
import type {
  Catalogs,
  CurrentUser,
  MapeoCompetenciasFilters as FiltersState,
  RolePermissions,
} from "../MapeoCompetencias.types";
import { getDefaultLugarBySeccional, getLugaresBySeccional } from "../MapeoCompetencias.utils";

interface MapeoCompetenciasFiltersProps {
  filters: FiltersState;
  catalogs: Catalogs;
  permissions: RolePermissions;
  currentUser: CurrentUser;
  onChange: (filters: FiltersState) => void;
  showEstado?: boolean;
}

function toOptions(items: Array<{ id: string; nombre: string }>, suffix?: (id: string) => string) {
  return items.map((item) => ({
    label: `${item.nombre}${suffix?.(item.id) ?? ""}`,
    value: item.id,
  }));
}

export default function MapeoCompetenciasFilters({
  filters,
  catalogs,
  permissions,
  currentUser,
  onChange,
  showEstado = true,
}: MapeoCompetenciasFiltersProps) {
  const scopedProgramId = currentUser.scope.programaId ?? currentUser.scope.academicProgramId;
  const showSeccional = permissions.canFilterBySeccional && currentUser.role !== "director" && currentUser.role !== "decano";
  const showFacultad = permissions.canFilterByFacultad;
  const showPrograma = permissions.canFilterByPrograma;

  const seccionales = catalogs.seccionales.filter((seccional) => {
    if (currentUser.scope.seccionalId && seccional.id !== currentUser.scope.seccionalId) return false;
    return true;
  });

  const baseLugares = currentUser.scope.seccionalId
    ? getLugaresBySeccional(catalogs.lugares, currentUser.scope.seccionalId)
    : catalogs.lugares;

  const lugares = filters.seccionalId
    ? getLugaresBySeccional(baseLugares, filters.seccionalId)
    : baseLugares;

  const facultades = catalogs.facultades.filter((facultad) => {
    if (currentUser.scope.seccionalId && facultad.seccionalId !== currentUser.scope.seccionalId) return false;
    if (currentUser.scope.facultadId && facultad.id !== currentUser.scope.facultadId) return false;
    if (filters.seccionalId && facultad.seccionalId !== filters.seccionalId) return false;
    return true;
  });

  const programas = catalogs.programas.filter((programa) => {
    if (currentUser.scope.seccionalId && programa.seccionalId !== currentUser.scope.seccionalId) return false;
    if (currentUser.scope.facultadId && programa.facultadId !== currentUser.scope.facultadId) return false;
    if (scopedProgramId && programa.id !== scopedProgramId) return false;
    if (filters.seccionalId && programa.seccionalId !== filters.seccionalId) return false;
    if (filters.facultadId && programa.facultadId !== filters.facultadId) return false;
    return true;
  });

  const planes = catalogs.planes.filter((plan) => {
    if (currentUser.scope.planId && plan.id !== currentUser.scope.planId) return false;
    if (filters.programaId && plan.programaId !== filters.programaId) return false;
    if (!filters.programaId) return programas.some((programa) => programa.id === plan.programaId);
    return true;
  });

  function update<K extends keyof FiltersState>(key: K, value: FiltersState[K]) {
    const next = {
      ...filters,
      [key]: value,
    };

    if (key === "seccionalId") {
      const seccionalId = value as string;
      const lugaresPermitidos = getLugaresBySeccional(catalogs.lugares, seccionalId);

      next.facultadId = "";
      next.lugarId = getDefaultLugarBySeccional(seccionalId, lugaresPermitidos);
      next.programaId = "";
      next.planId = "";
    }

    if (key === "facultadId") {
      next.programaId = "";
      next.planId = "";
    }

    if (key === "programaId") {
      next.planId = "";
    }

    onChange(next);
  }

  return (
    <section className="surface-card p-5">
      <div className="mb-4 flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
          Filtros del mapeo
        </h2>
        <p className="text-sm leading-6 text-[var(--color-gray-3)]">
          Selecciona el alcance académico para consultar o administrar la matriz curricular.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {showSeccional ? (
          <Select
            label="Sede / Seccional"
            value={filters.seccionalId}
            options={toOptions(seccionales)}
            placeholder="Todas"
            onChange={(event) => update("seccionalId", event.target.value)}
          />
        ) : null}

        {showSeccional && permissions.canFilterByLugar ? (
          <Select
            label="Lugar de desarrollo"
            value={filters.lugarId}
            options={toOptions(lugares)}
            placeholder="Todos"
            onChange={(event) => update("lugarId", event.target.value)}
          />
        ) : null}

        {showFacultad ? (
          <Select
            label="Facultad"
            value={filters.facultadId}
            options={toOptions(facultades)}
            placeholder="Todas"
            onChange={(event) => update("facultadId", event.target.value)}
          />
        ) : null}

        {showPrograma ? (
          <Select
            label="Programa académico"
            value={filters.programaId}
            options={toOptions(programas, (id) => {
              const programa = catalogs.programas.find((item) => item.id === id);
              return programa?.estado === "inactivo" ? " (Inactivo)" : "";
            })}
            placeholder="Selecciona programa"
            onChange={(event) => update("programaId", event.target.value)}
          />
        ) : null}

        {permissions.canFilterByPlan ? (
          <Select
            label="Plan de estudios"
            value={filters.planId}
            options={planes.map((plan) => ({
              label: `${plan.nombre}${plan.estado === "inactivo" ? " (Inactivo)" : ""}`,
              value: plan.id,
            }))}
            placeholder="Selecciona plan"
            onChange={(event) => update("planId", event.target.value)}
          />
        ) : null}

        {showEstado && permissions.canFilterByEstado ? (
          <Select
            label="Estado"
            value={filters.estado}
            options={[
              { label: "Activo", value: "activo" },
              { label: "Inactivo", value: "inactivo" },
            ]}
            placeholder="Todos"
            onChange={(event) => update("estado", event.target.value as FiltersState["estado"])}
          />
        ) : null}
      </div>
    </section>
  );
}
