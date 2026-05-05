import { GoGoal } from "react-icons/go";
import { StepCircleProgress } from "../../../../components/ui";
import type { SegmentedStepProgressItem } from "../../../../components/ui";
import type { Competence } from "../medicion-ra.types";

interface CompetenceStepperProps {
  competences: Competence[];
  activeCompetenceId: string;
  completedCompetenceIds?: string[];
  subProgressSteps?: SegmentedStepProgressItem[];
  disabled?: boolean;
  lockedTooltip?: string;
  onChange: (competenceId: string) => void;
}

export default function CompetenceStepper({
  competences,
  activeCompetenceId,
  completedCompetenceIds = [],
  disabled = false,
  lockedTooltip,
  onChange,
}: CompetenceStepperProps) {
  const activeIndex = Math.max(
    0,
    competences.findIndex((competence) => competence.id === activeCompetenceId),
  );

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

      <StepCircleProgress
        items={competences.map((competence, index) => ({
          id: competence.id,
          label: `Competencia ${index + 1}`,
          sublabel: competence.code,
          icon: <GoGoal className="text-xl" />,
        }))}
        activeId={activeCompetenceId}
        completedIds={completedCompetenceIds}
        disabled={disabled}
        lockedTooltip={lockedTooltip}
        onChange={onChange}
      />

      
    </section>
  );
}
