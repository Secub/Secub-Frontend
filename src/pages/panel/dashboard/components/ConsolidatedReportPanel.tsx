import { GoDownload } from "react-icons/go";
import { Button } from "../../../../components/ui";
import type { CompetenceCatalog, EnrichedCycle } from "../dashboard.types";

interface ConsolidatedReportPanelProps {
  cycle: EnrichedCycle | null;
  competences: CompetenceCatalog[];
  selectedCompetenceIds: string[];
  onToggleCompetence: (competenceId: string) => void;
  onDownload: () => void;
}

export default function ConsolidatedReportPanel({
  cycle,
  competences,
  selectedCompetenceIds,
  onToggleCompetence,
  onDownload,
}: ConsolidatedReportPanelProps) {
  const canDownload = Boolean(cycle && cycle.progress >= 100 && selectedCompetenceIds.length > 0);

  return (
    <section className="surface-card p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            Reporte consolidado PDF
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--color-gray-3)]">
            Selecciona una o varias competencias antes de generar el reporte consolidado. La descarga se habilita únicamente cuando el ciclo está completo al 100%.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<GoDownload className="text-lg" />}
          onClick={onDownload}
          disabled={!canDownload}
          title={
            !cycle
              ? "Selecciona un ciclo para generar el reporte."
              : cycle.progress < 100
                ? "El reporte consolidado se habilita cuando el ciclo llega al 100%."
                : selectedCompetenceIds.length === 0
                  ? "Selecciona al menos una competencia."
                  : "Descargar reporte consolidado"
          }
        >
          Descargar consolidado
        </Button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {competences.map((competence) => {
          const checked = selectedCompetenceIds.includes(competence.id);

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
    </section>
  );
}
