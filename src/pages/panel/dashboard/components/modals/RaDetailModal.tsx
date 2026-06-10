import { Modal } from "../../../../../components/ui";
import type { EnrichedRaResult } from "../../dashboard.types";

interface RaDetailModalProps {
  selectedRa: EnrichedRaResult | null;
  onClose: () => void;
}

export default function RaDetailModal({ selectedRa, onClose }: RaDetailModalProps) {
  return (
    <Modal
      open={Boolean(selectedRa)}
      title="Detalle Informativo del RA"
      description={selectedRa ? `${selectedRa.raCode} · ${selectedRa.raName}` : undefined}
      size="md"
      onClose={onClose}
    >
      {selectedRa ? (
        <div className="space-y-4">
          <p className="text-sm leading-6 text-[var(--color-gray-3)]">
            {selectedRa.raDescription}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--radius-md)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-gray-4)]">
                Cumplimiento
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-secondary-4)]">
                {selectedRa.compliance}%
              </p>
            </div>

            <div className="rounded-[var(--radius-md)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-gray-4)]">
                Curso
              </p>
              <p className="mt-2 font-heading text-base font-semibold text-[var(--color-secondary-4)]">
                {selectedRa.courseName}
              </p>
            </div>
          </div>

          {selectedRa.improvementPlanSummary ? (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[color:rgba(251,199,86,0.16)] p-4">
              <p className="font-heading text-sm font-semibold text-[var(--color-secondary-4)]">
                Plan de mejora sugerido
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-gray-3)]">
                {selectedRa.improvementPlanSummary}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
