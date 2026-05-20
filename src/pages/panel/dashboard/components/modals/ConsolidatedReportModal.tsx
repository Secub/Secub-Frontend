import { GoDownload } from "react-icons/go";
import { Button, Modal } from "../../../../../components/ui";
import type { CompetenceCatalog, EnrichedCycle } from "../../dashboard.types";

interface ConsolidatedReportModalProps {
  reportCycle: EnrichedCycle | null;
  availableReportCompetences: CompetenceCatalog[];
  selectedReportCompetences: string[];
  onClose: () => void;
  onToggleCompetence: (competenceId: string) => void;
  onDownload: () => void;
}

export default function ConsolidatedReportModal({
  reportCycle,
  availableReportCompetences,
  selectedReportCompetences,
  onClose,
  onToggleCompetence,
  onDownload,
}: ConsolidatedReportModalProps) {
  return (
    <Modal
      open={Boolean(reportCycle)}
      title="Reporte consolidado PDF"
      description="Selecciona una o varias competencias. El reporte final solo se habilita cuando Gestión Académica, Medición RA y Plan de mejora estén completos."
      size="lg"
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            leftIcon={<GoDownload className="text-lg" />}
            disabled={!reportCycle || !reportCycle.hasImprovementPlan || reportCycle.progress < 100 || selectedReportCompetences.length === 0}
            onClick={onDownload}
          >
            Descargar consolidado
          </Button>
        </div>
      }
    >
      <div className="grid gap-3 md:grid-cols-2">
        {availableReportCompetences.map((competence) => {
          const checked = selectedReportCompetences.includes(competence.id);

          return (
            <label
              key={competence.id}
              className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-gray-6)] bg-white p-4 shadow-sm transition-colors hover:bg-[var(--color-surface-soft)]"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleCompetence(competence.id)}
                className="mt-1 h-4 w-4 accent-[var(--color-secondary-1)]"
              />
              <span>
                <span className="block font-heading text-sm font-semibold text-[var(--color-secondary-4)]">
                  {competence.code} · {competence.name}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[var(--color-gray-4)]">
                  {competence.learningResults.length} RA asociados al ciclo seleccionado.
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </Modal>
  );
}
