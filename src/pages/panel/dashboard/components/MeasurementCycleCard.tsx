import {
  GoChecklist,
  GoDownload,
  GoEye,
  GoGraph,
  GoListUnordered,
  GoUpload,
} from "react-icons/go";
import { Badge, Button, StepCircleProgress } from "../../../../components/ui";
import type { EnrichedCycle } from "../dashboard.types";

interface MeasurementCycleCardProps {
  cycle: EnrichedCycle;
  isTeacher: boolean;
  isDirector: boolean;
  onViewPending: (cycle: EnrichedCycle) => void;
  onViewResults: (cycle: EnrichedCycle) => void;
  onDownloadReport: (cycle: EnrichedCycle) => void;
  onImprovementPlan: (cycle: EnrichedCycle) => void;
}

export default function MeasurementCycleCard({
  cycle,
  isTeacher,
  isDirector,
  onViewPending,
  onViewResults,
  onDownloadReport,
  onImprovementPlan,
}: MeasurementCycleCardProps) {
  const isMeasurementComplete = cycle.progress >= 100;
  const hasResults = cycle.evaluatedRa > 0;
  const hasImprovementPlan = Boolean(cycle.hasImprovementPlan);
  const isCycleClosed = isMeasurementComplete && hasImprovementPlan;
  const hasAcademicManagement = cycle.totalRa > 0 || cycle.totalCourses > 0;
  const canLoadImprovementPlan = isMeasurementComplete && isDirector;

  const status = isCycleClosed
    ? { label: "Finalizado", variant: "success" as const }
    : isMeasurementComplete
      ? { label: "Plan de mejora pendiente", variant: "warning" as const }
      : { label: "Pendiente", variant: "warning" as const };

  const activeStepId = !hasAcademicManagement
    ? "gestion-academica"
    : !isMeasurementComplete
      ? "medicion-ra"
      : "plan-mejora";
  const completedStepIds = [
    ...(hasAcademicManagement ? ["gestion-academica"] : []),
    ...(isMeasurementComplete ? ["medicion-ra"] : []),
    ...(hasImprovementPlan ? ["plan-mejora"] : []),
  ];
  const improvementPlanLockedReason = !isMeasurementComplete
    ? "El plan de mejora se habilita cuando la Medición RA del ciclo esté completada al 100%."
    : !isDirector
      ? "Solo Jefatura de programa puede cargar el plan de mejora del ciclo."
      : "";
  const reportLockedReason = !isMeasurementComplete
    ? "El reporte se habilita cuando Gestión Académica, Medición RA y Plan de mejora estén completos."
    : !hasImprovementPlan
      ? "Falta cargar el Plan de mejora para cerrar el ciclo y habilitar el reporte."
      : undefined;

  const handleStepChange = (stepId: string) => {
    if (stepId === "medicion-ra" && !isMeasurementComplete) {
      onViewPending(cycle);
      return;
    }

    if (stepId === "medicion-ra" && hasResults) {
      onViewResults(cycle);
      return;
    }

    if (stepId === "plan-mejora" && canLoadImprovementPlan) {
      onImprovementPlan(cycle);
    }
  };

  return (
    <article className="surface-card rounded-[24px] p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
              {cycle.name}
            </h3>
            <Badge variant={status.variant}>{status.label}</Badge>
            {cycle.planEstado === "inactivo" ? (
              <Badge variant="neutral">Plan inactivo</Badge>
            ) : null}
          </div>

          <p className="mt-1 text-sm text-[var(--color-gray-3)]">
            {cycle.completedCourses}/{cycle.totalCourses} cursos completados · {cycle.planName.replace(" (Inactivo)", "")}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] px-3 py-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 px-2">
          <div>
            <p className="font-heading text-base font-semibold text-[var(--color-secondary-4)]">
              Flujo del ciclo
            </p>
            <p className="mt-1 text-sm text-[var(--color-gray-3)]">
              Avance real del proceso: gestión académica, medición y plan de mejora.
            </p>
          </div>

          <span className="rounded-full border border-[var(--color-gray-6)] bg-white px-4 py-2 font-heading text-sm font-semibold text-[var(--color-secondary-4)]">
            {cycle.progress}% completado
          </span>
        </div>

        <StepCircleProgress
          items={[
            {
              id: "gestion-academica",
              label: "Gestión académica",
              sublabel: hasAcademicManagement ? "Completada" : "Pendiente",
              icon: <GoChecklist className="text-xl" />,
            },
            {
              id: "medicion-ra",
              label: "Medición RA",
              sublabel: isMeasurementComplete ? "Completada" : hasResults ? "En proceso" : "Pendiente",
              icon: <GoGraph className="text-xl" />,
            },
            {
              id: "plan-mejora",
              label: "Cargar plan de mejora",
              sublabel: hasImprovementPlan
                ? "Registrado"
                : canLoadImprovementPlan
                  ? "Disponible"
                  : isMeasurementComplete
                    ? "Pendiente"
                    : "Bloqueado",
              icon: <GoUpload className="text-xl" />,
              disabled: !canLoadImprovementPlan,
              disabledTooltip: improvementPlanLockedReason,
            },
          ]}
          activeId={activeStepId}
          completedIds={completedStepIds}
          onChange={handleStepChange}
        />
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<GoListUnordered className="text-lg" />}
          onClick={() => onViewPending(cycle)}
          disabled={isMeasurementComplete}
          title={
            isMeasurementComplete
              ? "No hay pendientes de Medición RA; revisa el Plan de mejora para cerrar el ciclo."
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

        {!isTeacher ? (
          <Button
            variant={canLoadImprovementPlan ? "primary" : "outline"}
            size="sm"
            leftIcon={<GoUpload className="text-lg" />}
            onClick={() => onImprovementPlan(cycle)}
            disabled={!canLoadImprovementPlan}
            title={
              canLoadImprovementPlan
                ? "Cargar, consultar o actualizar el plan de mejora del ciclo"
                : improvementPlanLockedReason || "El plan de mejora se habilita cuando la medición llega al 100%."
            }
          >
            {hasImprovementPlan ? "Actualizar plan de mejora" : "Plan de mejora"}
          </Button>
        ) : null}

        <Button
          variant="primary_soft"
          size="sm"
          leftIcon={<GoDownload className="text-lg" />}
          onClick={() => onDownloadReport(cycle)}
          disabled={!isCycleClosed}
          title={
            reportLockedReason ??
            (isTeacher ? "Descargar reporte individual" : "Descargar reporte consolidado")
          }
        >
          Descargar reporte
        </Button>
      </div>
    </article>
  );
}
