import { useState } from "react";
import { GoChevronDown, GoChevronUp, GoEye, GoPencil, GoTrash } from "react-icons/go";
import { Badge } from "../../../../components/ui";
import { getEstadoBadgeVariant } from "../CompetenciasRa.utils";
import type { CompetenciasRaEnriched } from "../CompetenciasRa.types";

interface CompetenciasRaCardProps {
  record: CompetenciasRaEnriched;
  onView: (record: CompetenciasRaEnriched) => void;
  onEdit: (record: CompetenciasRaEnriched) => void;
  onDelete: (record: CompetenciasRaEnriched) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export default function CompetenciasRaCard({
  record,
  onView,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: CompetenciasRaCardProps) {
  const [expandedRAs, setExpandedRAs] = useState(false);

  const raCount = record.resultadosAprendizaje?.length || 0;

  return (
    <div className="relative flex flex-col rounded-lg border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-6 transition-all hover:shadow-md">
      {/* Header con etiquetas */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex gap-2">
          <Badge
            variant={getEstadoBadgeVariant(record.estado)}
            className="whitespace-nowrap"
          >
            {record.estado === "activo" ? "Activo" : "Inactivo"}
          </Badge>
          <Badge className="whitespace-nowrap">
            {record.programaNombre}
          </Badge>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            onClick={() => onView(record)}
            className="rounded p-1.5 text-[var(--color-gray-3)] transition-colors hover:bg-[var(--color-gray-5)] hover:text-[var(--color-secondary-1)]"
            title="Ver detalles de la competencia"
            type="button"
          >
            <GoEye className="text-lg" />
          </button>
          {canEdit && (
            <button
              onClick={() => onEdit(record)}
              className="rounded p-1.5 text-[var(--color-gray-3)] transition-colors hover:bg-[var(--color-gray-5)] hover:text-[var(--color-secondary-1)]"
              title="Editar competencia"
              type="button"
            >
              <GoPencil className="text-lg" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(record)}
              className="rounded p-1.5 text-[var(--color-gray-3)] transition-colors hover:bg-[var(--color-gray-5)] hover:text-[var(--color-error)]"
              title="Eliminar competencia"
              type="button"
            >
              <GoTrash className="text-lg" />
            </button>
          )}
        </div>
      </div>

      {/* Nombre y Plan */}
      <div className="mb-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
            {record.nombre}
          </h3>
          <span className="text-xs text-[var(--color-gray-3)]">
            {record.planNombre}
          </span>
        </div>
      </div>

      {/* Descripción */}
      <p className="mb-4 text-sm leading-6 text-[var(--color-gray-3)]">
        {record.descripcion}
      </p>

      {/* Resultados de Aprendizaje */}
      <div className="mt-auto">
        <button
          onClick={() => setExpandedRAs(!expandedRAs)}
          className="flex items-center gap-2 rounded-md bg-[var(--color-gray-5)] px-3 py-2 text-sm font-medium text-[var(--color-secondary-1)] transition-colors hover:bg-[var(--color-gray-4)]"
          type="button"
        >
          {expandedRAs ? (
            <GoChevronUp className="text-base" />
          ) : (
            <GoChevronDown className="text-base" />
          )}
          <span>
            {raCount} Resultado{raCount !== 1 ? "s" : ""} de Aprendizaje
          </span>
        </button>

        {/* RAs expandidos */}
        {expandedRAs && raCount > 0 && (
          <div className="mt-3 space-y-2 rounded-md border border-[var(--color-gray-6)] bg-white p-3">
            {record.resultadosAprendizaje.map((ra) => (
              <div
                key={ra.id}
                className="flex gap-2 pb-2 text-sm last:pb-0"
              >
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary-1)] text-xs font-semibold text-white">
                  {ra.numero}
                </div>
                <p className="pt-0.5 text-[var(--color-gray-3)]">
                  {ra.descripcion}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
