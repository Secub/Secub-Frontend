import { GoFile } from "react-icons/go";
import { Textarea } from "../../../../components/ui";
import type { Competence, InstrumentByRa } from "../medicion-ra.types";

interface InstrumentSectionProps {
  activeCompetence: Competence;
  instruments: InstrumentByRa;
  disabled?: boolean;
  lockedTooltip?: string;
  showValidationErrors?: boolean;
  onDescriptionChange: (raId: string, value: string) => void;
}

export default function InstrumentSection({
  activeCompetence,
  instruments,
  disabled = false,
  lockedTooltip,
  showValidationErrors = false,
  onDescriptionChange,
}: InstrumentSectionProps) {
  return (
    <section className="surface-card p-6">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:rgba(14,101,217,0.10)] text-[var(--color-secondary-1)]">
              <GoFile className="text-xl" />
            </span>
            <div>
              <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
                Instrumento de Evaluación
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--color-gray-3)]">
                Cada RA conserva su descripción individual. La evidencia se carga una sola vez al final de la competencia.
              </p>
            </div>
          </div>
        </div>

        <span className="inline-flex w-fit rounded-[var(--radius-pill)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--color-secondary-4)]">
          Competencia actual: {activeCompetence.code}
        </span>
      </div>

      <div className="grid gap-4">
        {activeCompetence.learningResults.map((ra, index) => {
          const instrument = instruments[ra.id] ?? { description: "" };
          const descriptionError =
            showValidationErrors && !instrument.description.trim()
              ? "Describe el instrumento o criterio utilizado para evaluar este Resultado de Aprendizaje."
              : undefined;

          return (
            <article
              key={ra.id}
              data-validation-field={`instrument-description-${ra.id}`}
              data-validation-error={descriptionError ? "true" : undefined}
              className={[
                "rounded-[var(--radius-xl)] border bg-[var(--color-white)] p-5 shadow-[var(--shadow-sm)]",
                descriptionError
                  ? "border-[var(--color-error)] ring-4 ring-[color:rgba(235,87,87,0.12)]"
                  : "border-[var(--color-gray-6)]",
              ].join(" ")}
              title={disabled ? lockedTooltip : undefined}
            >
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-[var(--radius-pill)] bg-[var(--color-secondary-4)] px-3 py-1 text-xs font-semibold text-[var(--color-white)]">
                      RA {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-3 font-heading text-base font-semibold text-[var(--color-secondary-4)]">
                    {ra.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-gray-3)]">
                    {ra.description}
                  </p>
                </div>
              </div>

              <Textarea
                label="Descripción del instrumento o criterio"
                value={instrument.description}
                disabled={disabled}
                onChange={(event) => onDescriptionChange(ra.id, event.target.value)}
                rows={4}
                maxLength={600}
                helperText={`${instrument.description.length}/600 caracteres`}
                placeholder="Ejemplo: rúbrica, taller, proyecto, prueba, informe, prototipo o actividad usada para medir este RA."
                error={descriptionError}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
