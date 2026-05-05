import { GoAlert, GoFile, GoLink, GoUpload } from "react-icons/go";
import { Input, Textarea } from "../../../../components/ui";
import { ACCEPTED_FILE_FORMATS } from "../medicion-ra.mock";
import type {
  Competence,
  EvidenceState,
  ImprovementPlanState,
  RaResultSummary,
} from "../medicion-ra.types";

interface EvidenceImprovementSectionProps {
  activeCompetence: Competence;
  evidence: EvidenceState;
  improvementPlan: ImprovementPlanState;
  results: RaResultSummary[];
  onEvidenceFileChange: (fileName: string) => void;
  onEvidenceLinkChange: (value: string) => void;
  onImprovementPlanChange: (
    key: keyof ImprovementPlanState,
    value: string,
  ) => void;
}

export default function EvidenceImprovementSection({
  activeCompetence,
  evidence,
  improvementPlan,
  results,
  onEvidenceFileChange,
  onEvidenceLinkChange,
  onImprovementPlanChange,
}: EvidenceImprovementSectionProps) {
  const underTargetResults = results.filter((result) => !result.reachedTarget);
  const hasUnderTargetResults = underTargetResults.length > 0;

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <article className="surface-card p-6">
        <div className="mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
              Evidencia de la competencia
            </h2>

            <span className="rounded-[var(--radius-pill)] bg-[var(--color-secondary-4)] px-3 py-1 text-xs font-semibold text-[var(--color-white)]">
              {activeCompetence.code}
            </span>
          </div>

          <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
            Adjunta un único archivo de soporte para toda la competencia seleccionada. Este archivo aplica para los RA evaluados en esta competencia.
          </p>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-white)] text-[var(--color-secondary-1)]">
                <GoFile className="text-xl" />
              </span>

              <div>
                <p className="text-sm font-semibold text-[var(--color-secondary-4)]">
                  Archivo obligatorio por competencia
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-gray-4)]">
                  Formatos permitidos: Word, PDF, PNG y JPG.
                </p>
              </div>
            </div>

            <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-secondary-1)] px-5 py-3 text-sm font-semibold text-[var(--color-white)] transition-opacity hover:opacity-95">
              <GoUpload className="text-lg" />
              Examinar
              <input
                type="file"
                accept={ACCEPTED_FILE_FORMATS}
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  onEvidenceFileChange(file?.name ?? "");
                }}
              />
            </label>
          </div>

          <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-white)] px-4 py-3 text-sm text-[var(--color-gray-3)]">
            <span className="font-semibold text-[var(--color-secondary-4)]">
              Archivo seleccionado:
            </span>{" "}
            {evidence.fileName || "No hay archivo seleccionado"}
          </div>
        </div>

        <div className="mt-5">
          <Input
            label="Enlace de evidencia (opcional)"
            value={evidence.link}
            onChange={(event) => onEvidenceLinkChange(event.target.value)}
            placeholder="https://"
            leftIcon={<GoLink className="text-lg" />}
            helperText="Puedes pegar un enlace a Drive, repositorio, prototipo o carpeta institucional."
          />
        </div>
      </article>

      <article className="surface-card p-6">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
              Plan de mejora
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
              Registra el análisis y las acciones propuestas para el seguimiento de la competencia seleccionada.
            </p>
          </div>

          <span className="inline-flex w-fit rounded-[var(--radius-pill)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--color-gray-3)]">
            Campo opcional
          </span>
        </div>

        {hasUnderTargetResults ? (
          <div className="mb-5 rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[var(--color-surface-soft)] p-4">
            <div className="flex items-start gap-3">
              <GoAlert className="mt-0.5 shrink-0 text-xl text-[var(--color-primary)]" />
              <p className="text-sm leading-6 text-[var(--color-gray-3)]">
                Hay RA por debajo del target:{" "}
                {underTargetResults.map((result) => result.raCode).join(", ")}.
                Aunque el campo es opcional, se recomienda dejar acciones de
                mejora con seguimiento.
              </p>
            </div>
          </div>
        ) : null}

        <div className="space-y-5">
          <Textarea
            label="1. Análisis de los resultados obtenidos"
            value={improvementPlan.analysis}
            onChange={(event) =>
              onImprovementPlanChange("analysis", event.target.value)
            }
            rows={5}
            maxLength={1200}
            helperText={`${improvementPlan.analysis.length}/1200 caracteres`}
            placeholder="Enfóquese en los RA de la competencia seleccionada y describa los principales hallazgos del grupo."
          />

          <Textarea
            label="2. Acciones propuestas para próximas mediciones"
            value={improvementPlan.actions}
            onChange={(event) =>
              onImprovementPlanChange("actions", event.target.value)
            }
            rows={5}
            maxLength={1200}
            helperText={`${improvementPlan.actions.length}/1200 caracteres`}
            placeholder="Describa acciones concretas, medibles y con posibilidad de seguimiento."
          />
        </div>
      </article>
    </section>
  );
}