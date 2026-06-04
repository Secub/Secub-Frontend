import { GoLock } from "react-icons/go";
import { Badge } from "../../../../components/ui";
import type {
  AsignacionRaRecord,
  CompetenciaRaDemoRecord,
  MedicionRaRecord,
} from "../AsignarRA.types";
import {
  getCompetenciaLabel,
  getLearningResults,
  getRaLabel,
  hasMeasurementForAssignment,
} from "../AsignarRA.utils";

interface AsignarRACompetenceAccordionProps {
  competencia: CompetenciaRaDemoRecord;
  competenciaIndex: number;
  isExpanded: boolean;
  selectedRaIds: string[];
  canManage: boolean;
  measurements: MedicionRaRecord[];
  getRaAssignment: (competenciaId: string, raId: string) => AsignacionRaRecord | undefined;
  isRaSelected: (competenciaId: string, raId: string) => boolean;
  onToggleAccordion: (competenciaId: string) => void;
  onToggleRa: (competencia: CompetenciaRaDemoRecord, raId?: string) => void;
}

export function AsignarRACompetenceAccordion({
  competencia,
  competenciaIndex,
  isExpanded,
  selectedRaIds,
  canManage,
  measurements,
  getRaAssignment,
  isRaSelected,
  onToggleAccordion,
  onToggleRa,
}: AsignarRACompetenceAccordionProps) {
  const ras = getLearningResults(competencia);
  const selectedCount = selectedRaIds.length;
  const hasValidationWarning = selectedCount === 0;
  const progress = Math.min(selectedCount, 4) * 25;

  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)]">
      <button
        type="button"
        onClick={() => onToggleAccordion(competencia.id)}
        className="flex w-full flex-col gap-4 p-5 text-left md:flex-row md:items-start md:justify-between focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.22)]"
        aria-expanded={isExpanded}
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <Badge variant="info">{getCompetenciaLabel(competencia, competenciaIndex)}</Badge>
            <Badge variant={selectedCount ? "success" : "warning"}>{selectedCount ? "Completa" : "Sin asignar"}</Badge>
            <Badge variant="neutral">{selectedCount} de 4 RA seleccionados</Badge>
          </span>
          <span className="mt-3 block font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
            {competencia.nombre ?? "Competencia"}
          </span>
          <span className="mt-2 block text-sm leading-6 text-[var(--color-gray-3)]">
            {competencia.descripcion ?? "Sin descripción registrada."}
          </span>
          <span className="mt-4 block h-2 overflow-hidden rounded-full bg-white">
            <span className="block h-full rounded-full bg-[var(--color-success)] transition-all" style={{ width: `${progress}%` }} />
          </span>
          {hasValidationWarning ? (
            <span className="mt-2 block text-xs font-semibold text-[var(--color-error)]">
              Selecciona al menos 1 RA para esta competencia.
            </span>
          ) : null}
        </span>
        <span className="shrink-0 text-sm font-semibold text-[var(--color-secondary-1)]">
          {isExpanded ? "Ocultar RA" : "Ver RA"}
        </span>
      </button>

      {isExpanded ? (
        <div className="space-y-3 border-t border-[var(--color-gray-6)] bg-white p-5">
          <p className="text-sm leading-6 text-[var(--color-gray-3)]">Máximo 4 Resultados de Aprendizaje por competencia.</p>
          {ras.map((ra, raIndex) => {
            if (!ra.id) return null;

            const selected = isRaSelected(competencia.id, ra.id);
            const assignment = getRaAssignment(competencia.id, ra.id);
            const isMeasured = assignment ? hasMeasurementForAssignment(measurements, assignment.id) : false;
            const isDisabled = !canManage || isMeasured;

            return (
              <label
                key={ra.id}
                className={[
                  "flex cursor-pointer items-start gap-4 rounded-[var(--radius-lg)] border p-4 transition-all",
                  selected
                    ? "border-[var(--color-secondary-1)] bg-[color:rgba(14,101,217,0.07)]"
                    : "border-[var(--color-gray-6)] bg-white hover:border-[var(--color-secondary-2)] hover:bg-[var(--color-surface-soft)]",
                  isDisabled ? "cursor-default opacity-90" : "",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 rounded border-[var(--color-gray-5)] text-[var(--color-secondary-1)] focus:ring-[var(--color-secondary-1)]"
                  checked={selected}
                  disabled={isDisabled}
                  onChange={() => {
                    if (!isMeasured) onToggleRa(competencia, ra.id);
                  }}
                />

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <Badge variant={selected ? "info" : "neutral"}>{getRaLabel(ra, raIndex)}</Badge>
                    {selected ? <Badge variant="success">Asignado</Badge> : null}
                    {isMeasured ? <Badge variant="success">Medido</Badge> : <Badge variant="warning">Pendiente</Badge>}
                    {isMeasured ? <GoLock aria-hidden="true" className="text-sm text-[var(--color-gray-4)]" /> : null}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-[var(--color-gray-3)]">
                    {ra.descripcion ?? "Sin descripción registrada."}
                  </span>
                  {isMeasured ? (
                    <span className="mt-2 block text-xs font-medium text-[var(--color-gray-3)]">
                      Este RA ya tiene medición registrada y no puede modificarse.
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}
