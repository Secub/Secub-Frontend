import { GoEye } from "react-icons/go";
import CompetenciasRaCardGrid from "./CompetenciasRaCardGrid";
import type {
  CompetenciasRaEnriched,
  CompetenciasRaFormacionRole,
  ResultadoAprendizaje,
  RolePermissions,
} from "../CompetenciasRa.types";

interface CompetenciasRaListSectionProps {
  data: CompetenciasRaEnriched[];
  role: CompetenciasRaFormacionRole;
  permissions: RolePermissions;
  invalidCount: number;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
  onView: (record: CompetenciasRaEnriched) => void;
  onAddRa: (record: CompetenciasRaEnriched) => void;
  onEditRa: (record: CompetenciasRaEnriched, ra: ResultadoAprendizaje) => void;
}

export default function CompetenciasRaListSection({
  data,
  role,
  permissions,
  invalidCount,
  sortOrder,
  onSortOrderChange,
  onView,
  onAddRa,
  onEditRa,
}: CompetenciasRaListSectionProps) {
  return (
    <div className="surface-card p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            Competencias y Resultados de Aprendizaje
          </h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--color-gray-3)]">
            Cada tarjeta muestra una competencia con sus resultados de aprendizaje asociados. Expande para ver los detalles de cada resultado.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] px-4 py-2 text-sm text-[var(--color-gray-3)]">
            <GoEye className="text-base text-[var(--color-secondary-1)]" />
            La edición solo se habilita sobre programas activos.
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 md:pt-1">
          <label className="text-sm font-medium text-[var(--color-gray-4)]">Ordenar:</label>
          <select
            value={sortOrder}
            onChange={(event) => onSortOrderChange(event.target.value as "asc" | "desc")}
            className="rounded border border-[var(--color-gray-6)] bg-white px-3 py-2 text-sm text-[var(--color-gray-3)] transition-colors hover:border-[var(--color-gray-4)]"
          >
            <option value="asc">Ascendente (1-10)</option>
            <option value="desc">Descendente (10-1)</option>
          </select>
        </div>
      </div>

      {invalidCount > 0 ? (
        <div
          role="alert"
          className="mb-5 rounded-[var(--radius-lg)] border border-[var(--color-warning)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-gray-3)]"
        >
          Hay {invalidCount} competencia
          {invalidCount === 1 ? "" : "s"} con RA pendientes o fuera del límite permitido. Agrega al menos 1 RA y máximo 4 por competencia para habilitar Mapeo de Competencias.
        </div>
      ) : null}

      <CompetenciasRaCardGrid
        data={data}
        role={role}
        permissions={permissions}
        onView={onView}
        onAddRa={onAddRa}
        onEditRa={onEditRa}
      />
    </div>
  );
}
