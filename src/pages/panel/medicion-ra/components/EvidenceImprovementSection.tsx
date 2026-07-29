import { useState, type ChangeEvent } from "react";
import { showNotification } from "../../../../shared/feedback";
import { GoAlert, GoFile, GoLink, GoTrash, GoUpload } from "react-icons/go";
import { ConfirmDialog, IconButton, Input, Textarea } from "../../../../components/ui";
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
  disabled?: boolean;
  lockedTooltip?: string;
  showValidationErrors?: boolean;
  onEvidenceFileChange: (fileName: string) => void;
  onEvidenceLinkChange: (value: string) => void;
  onImprovementPlanChange: (
    key: keyof ImprovementPlanState,
    value: string,
  ) => void;
}

type DeleteTarget = "file" | "link" | null;

const MAX_EVIDENCE_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_EVIDENCE_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
]);
const ACCEPTED_EVIDENCE_EXTENSIONS = new Set(["pdf", "doc", "docx", "png", "jpg", "jpeg"]);

function isAcceptedEvidenceFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ACCEPTED_EVIDENCE_MIME_TYPES.has(file.type) || ACCEPTED_EVIDENCE_EXTENSIONS.has(extension);
}

export default function EvidenceImprovementSection({
  activeCompetence,
  evidence,
  improvementPlan,
  results,
  disabled = false,
  lockedTooltip,
  showValidationErrors = false,
  onEvidenceFileChange,
  onEvidenceLinkChange,
  onImprovementPlanChange,
}: EvidenceImprovementSectionProps) {
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const underTargetResults = results.filter((result) => !result.reachedTarget);
  const hasUnderTargetResults = underTargetResults.length > 0;
  const evidenceFileError = showValidationErrors && !evidence.fileName;

  const handleConfirmDelete = () => {
    if (deleteTarget === "file") {
      onEvidenceFileChange("");
    }

    if (deleteTarget === "link") {
      onEvidenceLinkChange("");
    }

    setDeleteTarget(null);
  };

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

        <div
          data-validation-field="evidence-file"
          data-validation-error={evidenceFileError ? "true" : undefined}
          className={[
            "rounded-[var(--radius-xl)] border border-dashed bg-[var(--color-surface-soft)] p-5",
            evidenceFileError
              ? "border-[var(--color-error)] ring-4 ring-[color:rgba(235,87,87,0.12)]"
              : "border-[var(--color-gray-6)]",
          ].join(" ")}
          title={disabled ? lockedTooltip : undefined}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--secub-surface)] text-[var(--color-secondary-1)]">
                <GoFile className="text-xl" />
              </span>

              <div>
                <p className="text-sm font-semibold text-[var(--color-secondary-4)]">
                  Archivo obligatorio por competencia
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-gray-4)]">
                  Formatos permitidos: Word, PDF, PNG y JPG. Tamaño máximo: 10 MB.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <label
                className={[
                  "inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-secondary-1)] px-5 py-3 text-sm font-semibold text-[var(--color-white)] transition-opacity hover:opacity-95",
                  disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                ].join(" ")}
              >
                <GoUpload className="text-lg" />
                Examinar
                <input
                  type="file"
                  accept={ACCEPTED_FILE_FORMATS}
                  className="sr-only"
                  disabled={disabled}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      onEvidenceFileChange("");
                      return;
                    }

                    if (!isAcceptedEvidenceFile(file)) {
                      event.target.value = "";
                      showNotification({
                        variant: "error",
                        title: "Formato no permitido",
                        message: "Selecciona un archivo PDF, Word, PNG o JPG.",
                      });
                      return;
                    }

                    if (file.size > MAX_EVIDENCE_FILE_SIZE) {
                      event.target.value = "";
                      showNotification({
                        variant: "error",
                        title: "Archivo demasiado grande",
                        message: "El archivo no puede superar los 10 MB.",
                      });
                      return;
                    }

                    onEvidenceFileChange(file.name);
                  }}
                />
              </label>

              {evidence.fileName ? (
                <IconButton
                  variant="outline"
                  icon={<GoTrash />}
                  label="Eliminar archivo de evidencia"
                  disabled={disabled}
                  title={disabled ? lockedTooltip : "Eliminar archivo de evidencia"}
                  onClick={() => setDeleteTarget("file")}
                />
              ) : null}
            </div>
          </div>

          <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--secub-surface)] px-4 py-3 text-sm text-[var(--color-gray-3)]">
            <span className="font-semibold text-[var(--color-secondary-4)]">
              Archivo seleccionado:
            </span>{" "}
            {evidence.fileName || "No hay archivo seleccionado"}
          </div>

          {evidenceFileError ? (
            <p className="mt-3 text-sm text-[var(--color-error)]">
              Carga la evidencia obligatoria de la competencia.
            </p>
          ) : null}
        </div>

        <div className="mt-5" title={disabled ? lockedTooltip : undefined}>
          <Input
            label="Enlace de evidencia (opcional)"
            value={evidence.link}
            disabled={disabled}
            onChange={(event) => onEvidenceLinkChange(event.target.value)}
            placeholder="https://"
            leftIcon={<GoLink className="text-lg" />}
            helperText="Puedes pegar un enlace a Drive, repositorio, prototipo o carpeta institucional."
          />

          {evidence.link ? (
            <div className="mt-3 flex justify-end">
              <IconButton
                variant="outline"
                icon={<GoTrash />}
                label="Eliminar enlace de evidencia"
                disabled={disabled}
                title={disabled ? lockedTooltip : "Eliminar enlace de evidencia"}
                onClick={() => setDeleteTarget("link")}
              />
            </div>
          ) : null}
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

        <div className="space-y-5" title={disabled ? lockedTooltip : undefined}>
          <Textarea
            label="1. Análisis de los resultados obtenidos"
            value={improvementPlan.analysis}
            disabled={disabled}
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
            disabled={disabled}
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="¿Estás seguro de que deseas eliminar este elemento?"
        description="Esta acción puede modificar la información registrada en la evaluación."
        confirmLabel="Sí, eliminar"
        variant="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
}
