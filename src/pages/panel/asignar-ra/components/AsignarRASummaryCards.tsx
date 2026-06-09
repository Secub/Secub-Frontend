import { Badge } from "../../../../components/ui";
import type { SummaryMetrics, BadgeVariant } from "../AsignarRA.types";

interface SummaryItem {
  label: string;
  value: number;
  variant: BadgeVariant;
}

interface AsignarRASummaryCardsProps {
  metrics: SummaryMetrics;
}

export function AsignarRASummaryCards({ metrics }: AsignarRASummaryCardsProps) {
  const items: SummaryItem[] = [
    { label: "Cursos de Síntesis", value: metrics.totalCourses, variant: "info" },
    { label: "Cursos con asignación iniciada", value: metrics.assignedCourses, variant: "success" },
    { label: "Cursos pendientes", value: metrics.pendingCourses, variant: "warning" },
    { label: "RA asignados en total", value: metrics.totalAssignedRa, variant: "neutral" },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((metric) => (
        <article key={metric.label} className="surface-card p-5">
          <Badge variant={metric.variant}>{metric.label}</Badge>
          <p className="mt-4 font-heading text-3xl font-semibold text-[var(--color-secondary-4)]">{metric.value}</p>
        </article>
      ))}
    </section>
  );
}
