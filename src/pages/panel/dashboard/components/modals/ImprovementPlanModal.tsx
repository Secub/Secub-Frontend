import { Button, Modal, Textarea } from "../../../../../components/ui";
import type { EnrichedCycle } from "../../dashboard.types";

interface ImprovementPlanModalProps {
  improvementCycle: EnrichedCycle | null;
  improvementDraft: string;
  improvementError: string;
  onClose: () => void;
  onSave: () => void;
  onDraftChange: (value: string) => void;
}

export default function ImprovementPlanModal({
  improvementCycle,
  improvementDraft,
  improvementError,
  onClose,
  onSave,
  onDraftChange,
}: ImprovementPlanModalProps) {
  return (
    <Modal
      open={Boolean(improvementCycle)}
      title="Cargar plan de mejora"
      description={improvementCycle ? `${improvementCycle.name} · ${improvementCycle.period}` : undefined}
      size="md"
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onSave}>
            Guardar plan de mejora
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4 text-sm leading-6 text-[var(--color-gray-3)]">
          El plan se guarda en <strong>mockBackend.planesMejora</strong> como preparación para el backend real.
          Queda relacionado con ciclo, programa, plan y Director.
        </div>

        <Textarea
          label="Descripción del plan de mejora general"
          value={improvementDraft}
          rows={6}
          maxLength={900}
          helperText={`${improvementDraft.length}/900 caracteres`}
          placeholder="Describe las acciones generales para cerrar brechas del ciclo, responsables, tiempos y seguimiento esperado."
          data-validation-field="dashboard-improvement-plan"
          error={improvementError || undefined}
          onChange={(event) => onDraftChange(event.target.value)}
        />
      </div>
    </Modal>
  );
}
