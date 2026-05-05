import { GoCheckCircle, GoGoal } from "react-icons/go";
import type { Competence } from "../medicion-ra.types";

interface CompetenceStepperProps {
  competences: Competence[];
  activeCompetenceId: string;
  onChange: (competenceId: string) => void;
}

export default function CompetenceStepper({
  competences,
  activeCompetenceId,
  onChange,
}: CompetenceStepperProps) {
  const activeIndex = Math.max(
    0,
    competences.findIndex((competence) => competence.id === activeCompetenceId),
  );

  const progressPercentage =
    competences.length <= 1
      ? 100
      : Math.round((activeIndex / (competences.length - 1)) * 100);


  if (!competences.length) {
    return null;
  }

  return (
    <section className="surface-card p-6">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            Progreso por competencias
          </h2>
          <p className="mt-1 text-sm text-[var(--color-gray-3)]">
            Avanza entre las competencias del curso para evaluar sus RA asociados.
          </p>
        </div>

        <span className="w-fit rounded-full border border-[var(--color-gray-6)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-secondary-1)]">
          Competencia {activeIndex + 1} de {competences.length}
        </span>
      </div>

      <div className="px-2 md:px-8">
        <div className="relative">
          <div className="absolute left-0 right-0 top-[22px] h-1 rounded-full bg-[var(--color-gray-6)]" />
          <div
            className="absolute left-0 top-[22px] h-1 rounded-full bg-[var(--color-success)] transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />

          <div
            className="relative z-10 grid gap-3"
            style={{ gridTemplateColumns: `repeat(${competences.length}, minmax(0, 1fr))` }}
          >
            {competences.map((competence, index) => {
              const isActive = competence.id === activeCompetenceId;
              const isCompleted = index < activeIndex;

              return (
                <button
                  key={competence.id}
                  type="button"
                  onClick={() => onChange(competence.id)}
                  className="group flex min-w-0 flex-col items-center text-center focus-visible:outline-none"
                  aria-current={isActive ? "step" : undefined}
                >
                  <span
                    className={[
                      "inline-flex h-11 w-11 items-center justify-center rounded-full border-4 text-sm font-bold shadow-sm transition-all duration-200 group-focus-visible:ring-4 group-focus-visible:ring-[color:rgba(14,101,217,0.18)]",
                      isCompleted
                        ? "border-[var(--color-success)] bg-[var(--color-success)] text-white"
                        : isActive
                          ? "border-[var(--color-secondary-1)] bg-[var(--color-secondary-1)] text-white"
                          : "border-[var(--color-secondary-4)] bg-white text-[var(--color-secondary-4)] group-hover:border-[var(--color-secondary-1)] group-hover:text-[var(--color-secondary-1)]",
                    ].join(" ")}
                  >
                    {isCompleted ? (
                      <GoCheckCircle className="text-xl" />
                    ) : isActive ? (
                      <GoGoal className="text-xl" />
                    ) : (
                      index + 1
                    )}
                  </span>

                  <span
                    className={[
                      "mt-3 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
                      isActive
                        ? "text-[var(--color-secondary-1)]"
                        : isCompleted
                          ? "text-[var(--color-success)]"
                          : "text-[var(--color-gray-3)]",
                    ].join(" ")}
                  >
                    Competencia {index + 1}
                  </span>
                  <span className="mt-1 truncate text-sm font-semibold text-[var(--color-secondary-4)]">
                    {competence.code}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <progress
          className="sr-only"
          value={activeIndex + 1}
          max={competences.length}
          aria-label="Progreso de navegación entre competencias"
        />
      </div>

    </section>
  );
}
