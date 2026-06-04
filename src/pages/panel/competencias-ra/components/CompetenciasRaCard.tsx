import { useState } from "react";
import { GoChevronDown, GoChevronUp, GoEye, GoPlus } from "react-icons/go";
import { Badge, Button } from "../../../../components/ui";
import {
  MAX_RA_PER_COMPETENCIA,
  canAddLearningResult,
  getEstadoBadgeVariant,
  getLearningResultsCountLabel,
  getLearningResultsValidationMessage,
} from "../CompetenciasRa.utils";
import type { CompetenciasRaEnriched, ResultadoAprendizaje } from "../CompetenciasRa.types";

interface CompetenciasRaCardProps {
  record: CompetenciasRaEnriched;
  onView: (record: CompetenciasRaEnriched) => void;
  onAddRa: (record: CompetenciasRaEnriched) => void;
  onEditRa: (record: CompetenciasRaEnriched, ra: ResultadoAprendizaje) => void;
  canEdit: boolean;
}

function getRaLabel(numero: number) {
  return `RA ${String(numero).padStart(2, "0")}`;
}

function getRaSummary(descripcion: string) {
  const clean = descripcion.trim();
  if (clean.length <= 140) return clean;
  return `${clean.slice(0, 140).trim()}...`;
}

export default function CompetenciasRaCard({
  record,
  onView,
  onAddRa,
  onEditRa,
  canEdit,
}: CompetenciasRaCardProps) {
  const [expandedRAs, setExpandedRAs] = useState(false);

  const raCount = record.resultadosAprendizaje?.length || 0;
  const raValidationMessage = getLearningResultsValidationMessage(record);
  const maxReachedMessage =
    raCount >= MAX_RA_PER_COMPETENCIA
      ? "Ya alcanzaste el máximo de 4 resultados de aprendizaje permitidos."
      : "";
  const canAddMoreRa = canEdit && canAddLearningResult(record);

  return (
    <div className="relative flex flex-col rounded-lg border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-6 transition-all hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
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

        <button
          onClick={() => onView(record)}
          className="rounded p-1.5 text-[var(--color-gray-3)] transition-colors hover:bg-[var(--color-gray-5)] hover:text-[var(--color-secondary-1)]"
          title="Ver más de la competencia"
          aria-label={`Ver detalle de la competencia ${record.nombre}`}
          type="button"
        >
          <GoEye aria-hidden="true" className="text-lg" />
        </button>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
            {record.nombre}
          </h3>
          <span className="inline-flex items-center gap-2 text-xs text-[var(--color-gray-3)]">
            {record.planNombre.replace(" (Inactivo)", "")}
            {record.planEstado === "inactivo" ? (
              <Badge variant="neutral">Inactivo</Badge>
            ) : null}
          </span>
        </div>
      </div>

      <p className="mb-4 text-sm leading-6 text-[var(--color-gray-3)]">
        {record.descripcion}
      </p>

      <div className="mt-auto border-t border-[var(--color-gray-6)] pt-4">
        <button
          type="button"
          onClick={() => setExpandedRAs(!expandedRAs)}
          className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[var(--color-gray-6)] bg-white px-4 py-3 text-left transition-colors hover:bg-[var(--color-surface-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary-1)] focus:ring-offset-2"
          aria-expanded={expandedRAs}
        >
          <span>
            <span className="block text-sm font-semibold text-[var(--color-secondary-4)]">
              Resultados de Aprendizaje
            </span>
            <span className="mt-1 block text-xs font-medium text-[var(--color-gray-3)]">
              {getLearningResultsCountLabel(record)}
            </span>
          </span>
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary-1)]/5 text-[var(--color-secondary-1)]">
            {expandedRAs ? <GoChevronUp aria-hidden="true" /> : <GoChevronDown aria-hidden="true" />}
          </span>
        </button>

        {raValidationMessage || maxReachedMessage ? (
          <div
            role={raValidationMessage ? "alert" : undefined}
            className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-gray-3)]"
          >
            {raValidationMessage || maxReachedMessage} {" "}
            {raCount > MAX_RA_PER_COMPETENCIA
              ? "No es posible agregar más RA hasta corregir esta competencia."
              : null}
          </div>
        ) : null}

        {expandedRAs ? (
          <div className="mt-3 space-y-3 rounded-2xl border border-[var(--color-gray-6)] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-[var(--color-gray-4)]">
                RA asociados a esta competencia
              </p>
              {canEdit ? (
                <span
                  className={canAddMoreRa ? "inline-flex" : "inline-flex cursor-not-allowed"}
                  title={
                    canAddMoreRa
                      ? "Agregar Resultado de Aprendizaje"
                      : "Ya alcanzaste el máximo de 4 resultados de aprendizaje permitidos."
                  }
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<GoPlus className="text-base" />}
                    onClick={() => onAddRa(record)}
                    disabled={!canAddMoreRa}
                  >
                    Agregar RA
                  </Button>
                </span>
              ) : null}
            </div>

            {raCount > 0 ? (
              record.resultadosAprendizaje.map((ra) => (
                <div
                  key={ra.id}
                  className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-3 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex min-w-0 gap-3 text-sm">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary-1)] text-[0.7rem] font-semibold text-white">
                      {getRaLabel(ra.numero).replace("RA ", "")}
                    </div>
                    <div className="min-w-0">
                      <Badge variant="info">{getRaLabel(ra.numero)}</Badge>
                      <p className="mt-2 text-[var(--color-gray-3)]">
                        {getRaSummary(ra.descripcion)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {canEdit ? (
                      <Button type="button" variant="outline" size="sm" onClick={() => onEditRa(record, ra)}>
                        Editar RA
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4 text-sm leading-6 text-[var(--color-gray-3)]">
                Esta competencia todavía no tiene RA. Agrega al menos un Resultado de Aprendizaje para completar el paso y habilitar el mapeo.
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
