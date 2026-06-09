import { Badge } from "../../../../components/ui";
import type { SummaryMetric } from "../MapeoCompetencias.types";

interface MapeoCompetenciasSummaryCardsProps {
  metrics: SummaryMetric[];
}

export default function MapeoCompetenciasSummaryCards({
  metrics,
}: MapeoCompetenciasSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <article key={metric.label} className="surface-card p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[var(--color-gray-3)]">{metric.label}</p>
            {metric.variant ? <Badge variant={metric.variant}>RF05</Badge> : null}
          </div>
          <p className="mt-3 font-heading text-3xl font-semibold text-[var(--color-secondary-4)]">
            {metric.value}
          </p>
          <p className="mt-2 text-xs leading-5 text-[var(--color-gray-4)]">{metric.helper}</p>
        </article>
      ))}
    </div>
  );
}
