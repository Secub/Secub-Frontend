import { GoCheckCircle, GoClock } from "react-icons/go";
import { Button } from "../../../../components/ui";
import { LOCKED_TOOLTIP } from "../hooks/useMedicionRA";

interface MedicionRAFooterProps {
  isEvaluationLocked: boolean;
  isLastCompetence: boolean;
  onSaveProgress: () => void;
  onPrimaryAction: () => void;
}

export default function MedicionRAFooter({
  isEvaluationLocked,
  isLastCompetence,
  onSaveProgress,
  onPrimaryAction,
}: MedicionRAFooterProps) {
  const primaryLabel = isEvaluationLocked
    ? "Evaluación finalizada"
    : isLastCompetence
      ? "Finalizar evaluación"
      : "Siguiente competencia";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--color-gray-6)] bg-[var(--color-white)] px-6 py-4 shadow-[var(--shadow-lg)] xl:left-[320px]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="max-w-3xl text-sm leading-6 text-[var(--color-gray-3)]">
          Guardar permite conservar avances parciales. Finalizar valida la
          competencia seleccionada: RA, instrumentos y evidencia obligatoria.
        </p>

        <div className="flex shrink-0 items-center gap-3">
          <Button
            variant="outline"
            leftIcon={<GoClock className="text-lg" />}
            onClick={onSaveProgress}
            disabled={isEvaluationLocked}
            title={isEvaluationLocked ? LOCKED_TOOLTIP : undefined}
            className="min-w-[220px]"
          >
            Guardar progreso
          </Button>

          <Button
            variant="primary"
            leftIcon={<GoCheckCircle className="text-lg" />}
            onClick={onPrimaryAction}
            disabled={isEvaluationLocked}
            title={isEvaluationLocked ? LOCKED_TOOLTIP : undefined}
            className="min-w-[240px]"
          >
            {primaryLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}