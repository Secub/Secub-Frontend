import { GoCheck, GoGoal } from "react-icons/go";
import { StepCircleProgress } from "../../../../components/ui";

interface MapeoCompetenciasStepProgressProps {
  activeStep: "nucleos" | "mapeo";
  completedStepIds: string[];
  classificationComplete: boolean;
  onChange: (id: "nucleos" | "mapeo") => void;
}

export default function MapeoCompetenciasStepProgress({
  activeStep,
  completedStepIds,
  classificationComplete,
  onChange,
}: MapeoCompetenciasStepProgressProps) {
  return (
    <section className="surface-card rounded-lg p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            Progreso del flujo de clasificación
          </h2>
          <p className="mt-1 text-sm text-[var(--color-gray-3)]">
            Completa los pasos para clasificar núcleos de formación y niveles de compromiso.
          </p>
        </div>

        <span className="w-fit rounded-full border border-[var(--color-gray-6)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-secondary-1)]">
          Paso {activeStep === "nucleos" ? 1 : 2} de 2
        </span>
      </div>

      <StepCircleProgress
        activeId={activeStep}
        completedIds={completedStepIds}
        items={[
          {
            id: "nucleos",
            label: "Núcleos",
            sublabel: "Selecciona núcleos de formación",
            icon: <GoGoal className="text-xl" />,
          },
          {
            id: "mapeo",
            label: "Niveles de compromiso",
            sublabel: "Selecciona I-R-A-NA",
            icon: <GoCheck className="text-xl" />,
            disabled: !classificationComplete,
            disabledTooltip: "Clasifica todos los semestres antes de continuar.",
          },
        ]}
        onChange={(id) => onChange(id as "nucleos" | "mapeo")}
      />
    </section>
  );
}
