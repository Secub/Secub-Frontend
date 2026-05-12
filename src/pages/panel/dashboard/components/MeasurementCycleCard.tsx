import { GoDownload, GoEye, GoListUnordered } from "react-icons/go";
import { Badge, Button } from "../../../../components/ui";
import type { EnrichedCycle } from "../dashboard.types";

interface MeasurementCycleCardProps {
  cycle: EnrichedCycle;
  isTeacher: boolean;
  onViewPending: (cycle: EnrichedCycle) => void;
  onViewResults: (cycle: EnrichedCycle) => void;
  onDownloadReport: (cycle: EnrichedCycle) => void;
}

const statusConfig = {
  pendiente: {
    label: "Pendiente",
    variant: "warning",
  },
  finalizado: {
    label: "Finalizado",
    variant: "success",
  },
} as const;

export default function MeasurementCycleCard({
  cycle,
  isTeacher,
  onViewPending,
  onViewResults,
  onDownloadReport,
}: MeasurementCycleCardProps) {
  const status = statusConfig[cycle.status];
  const isComplete = cycle.progress >= 100;
  const hasResults = cycle.evaluatedRa > 0;
  const progressColor = isComplete ? "bg-[var(--color-success)]" : "bg-[var(--color-error)]";

  return (
    <article className="surface-card rounded-[24px] p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
              {cycle.name}
            </h3>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          <p className="mt-1 text-sm text-[var(--color-gray-3)]">
            {cycle.completedCourses}/{cycle.totalCourses} cursos completados
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-[var(--color-gray-6)]">
          <div
            className={["h-full rounded-full transition-all", progressColor].join(" ")}
            style={{ width: `${cycle.progress}%` }}
          />
        </div>
        <span className="w-14 text-right font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
          {cycle.progress}%
        </span>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<GoListUnordered className="text-lg" />}
          onClick={() => onViewPending(cycle)}
          disabled={isComplete}
          title={
            isComplete
              ? "No hay pendientes porque el ciclo está finalizado al 100%."
              : "Ver cursos pendientes del ciclo"
          }
        >
          Ver pendientes
        </Button>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<GoEye className="text-lg" />}
          onClick={() => onViewResults(cycle)}
          disabled={!hasResults}
          title={
            hasResults
              ? "Ver resultados consolidados por competencia y RA"
              : "Los resultados se habilitan cuando existan RA medidos."
          }
        >
          Ver resultados
        </Button>

        <Button
          variant="primary_soft"
          size="sm"
          leftIcon={<GoDownload className="text-lg" />}
          onClick={() => onDownloadReport(cycle)}
          disabled={!isComplete}
          title={
            !isComplete
              ? "El reporte se habilita cuando el ciclo llega al 100%."
              : isTeacher
                ? "Descargar reporte individual"
                : "Descargar reporte consolidado"
          }
        >
          Descargar reporte
        </Button>
      </div>
    </article>
  );
}
