import { GoChecklist, GoDownload, GoEye } from "react-icons/go";
import { Badge, Button } from "../../../../components/ui";
import type { CycleSummary } from "../dashboard-ra.types";
import { formatDate, isReportAvailable } from "../dashboard-ra.utils";

interface CycleProgressCardProps {
  cycle: CycleSummary;
  roleType: "docente" | "directivo";
  onViewPending: (cycle: CycleSummary) => void;
  onDownloadReport: (cycle: CycleSummary) => void;
}

export default function CycleProgressCard({
  cycle,
  roleType,
  onViewPending,
  onDownloadReport,
}: CycleProgressCardProps) {
  const finished = cycle.progress >= 100;
  const reportAvailable = isReportAvailable(cycle.progress);

  return (
    <article className="surface-card p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
              {cycle.name}
            </h3>
            <Badge variant={finished ? "success" : "warning"}>
              {finished ? "Finalizado" : "Pendiente"}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-[var(--color-gray-3)]">
            {cycle.planName} · {formatDate(cycle.startDate)} al {formatDate(cycle.endDate)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<GoEye className="text-lg" />}
            disabled={finished}
            title={finished ? "El ciclo ya está finalizado y no tiene pendientes." : "Ver pendientes"}
            onClick={() => onViewPending(cycle)}
          >
            Ver pendientes
          </Button>

          <Button
            variant={reportAvailable ? "primary" : "outline"}
            size="sm"
            leftIcon={<GoDownload className="text-lg" />}
            disabled={!reportAvailable}
            title={
              reportAvailable
                ? "Simular descarga de reporte"
                : "El reporte se habilita cuando el ciclo está completado al 100%."
            }
            onClick={() => onDownloadReport(cycle)}
          >
            {roleType === "docente" ? "Descargar reporte" : "Descargar reporte"}
          </Button>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-[var(--color-gray-4)]">
          <span className="inline-flex items-center gap-2">
            <GoChecklist className="text-base text-[var(--color-secondary-1)]" />
            {cycle.evaluatedRa} de {cycle.totalRa} RA evaluados
          </span>
          <span>{cycle.progress}%</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-[var(--color-gray-7)]">
          <div
            className={[
              "h-full rounded-full transition-all duration-300",
              finished ? "bg-[var(--color-success)]" : "bg-[var(--color-error)]",
            ].join(" ")}
            style={{ width: `${cycle.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)] px-4 py-3">
          <p className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
            {cycle.totalCourses}
          </p>
          <p className="text-xs text-[var(--color-gray-4)]">Cursos vinculados</p>
        </div>
        <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)] px-4 py-3">
          <p className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
            {cycle.pendingCourses}
          </p>
          <p className="text-xs text-[var(--color-gray-4)]">Cursos pendientes</p>
        </div>
        <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)] px-4 py-3">
          <p className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
            {cycle.finishedCourses}
          </p>
          <p className="text-xs text-[var(--color-gray-4)]">Cursos finalizados</p>
        </div>
      </div>
    </article>
  );
}
