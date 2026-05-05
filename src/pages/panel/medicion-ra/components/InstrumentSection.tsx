import { Textarea } from "../../../../components/ui";
import type { Competence, InstrumentByRa } from "../medicion-ra.types";

interface InstrumentSectionProps {
  activeCompetence: Competence;
  instruments: InstrumentByRa;
  onDescriptionChange: (raId: string, value: string) => void;
}

export default function InstrumentSection({
  activeCompetence,
  instruments,
  onDescriptionChange,
}: InstrumentSectionProps) {
  return (
    <section className="surface-card p-6">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            Instrumento de evaluación
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--color-gray-3)]">
            Define el instrumento utilizado para medir cada RA de la competencia seleccionada. La carga de archivo se realiza una sola vez al final del flujo de la competencia.
          </p>
        </div>

        <span className="inline-flex w-fit rounded-[var(--radius-pill)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--color-secondary-4)]">
          Competencia {activeCompetence.code}
        </span>
      </div>

      <div className="space-y-4">
        {activeCompetence.learningResults.map((ra) => {
          const instrument = instruments[ra.id] ?? {
            fileName: "",
            description: "",
          };

          return (
            <article
              key={ra.id}
              className="rounded-[var(--radius-xl)] border border-[var(--color-gray-6)] bg-[var(--color-white)] p-5 shadow-[var(--shadow-sm)]"
            >
              <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-[var(--radius-pill)] bg-[var(--color-secondary-4)] px-3 py-1 text-xs font-semibold text-[var(--color-white)]">
                      {ra.code}
                    </span>

                    <h3 className="font-heading text-base font-semibold text-[var(--color-secondary-4)]">
                      {ra.title}
                    </h3>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-[var(--color-gray-3)]">
                    {ra.description}
                  </p>
                </div>
              </div>

              <Textarea
                label="Descripción del instrumento"
                value={instrument.description}
                onChange={(event) =>
                  onDescriptionChange(ra.id, event.target.value)
                }
                rows={3}
                maxLength={600}
                helperText={`${instrument.description.length}/600 caracteres`}
                placeholder="Ejemplo: rúbrica, taller, proyecto, prueba, informe, prototipo o actividad usada para medir este RA."
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}