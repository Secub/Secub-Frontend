import { SecubIcon, type SecubIconName } from "../../../../components/ui";
interface SummaryCardItem {
  label: string;
  value: string | number;
  helper: string;
  icon: SecubIconName;
  tone: string;
}

interface MeasurementSummaryCardsProps {
  items: SummaryCardItem[];
}

export default function MeasurementSummaryCards({ items }: MeasurementSummaryCardsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        return (
          <article
            key={item.label}
            className="surface-card flex min-h-[132px] items-center gap-4 rounded-[22px] p-5"
          >
            <div
              className={[
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px]",
                item.tone,
              ].join(" ")}
            >
              <SecubIcon name={item.icon} weight="fill" size={24} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--color-gray-3)]">{item.label}</p>
              <p className="mt-1 font-heading text-4xl font-semibold leading-none text-[var(--color-secondary-4)]">
                {item.value}
              </p>
              <p className="mt-2 text-xs leading-5 text-[var(--color-gray-4)]">{item.helper}</p>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export function buildTeacherSummaryItems({
  totalCourses,
  completedCourses,
  pendingCourses,
  advance,
}: {
  totalCourses: number;
  completedCourses: number;
  pendingCourses: number;
  advance: number;
}): SummaryCardItem[] {
  return [
    {
      label: "Cursos totales",
      value: totalCourses,
      helper: "Cursos de Síntesis asociados al docente",
      icon: "book",
      tone: "bg-[color:rgba(160,195,255,0.18)] text-[var(--color-secondary-4)]",
    },
    {
      label: "Completados",
      value: completedCourses,
      helper: "Cursos con todos los RA evaluados",
      icon: "checklist",
      tone: "bg-[color:rgba(118,202,102,0.16)] text-[color:#2f7d32]",
    },
    {
      label: "Pendientes",
      value: pendingCourses,
      helper: "Cursos con RA por medir",
      icon: "people",
      tone: "bg-[color:rgba(251,199,86,0.20)] text-[var(--color-secondary-4)]",
    },
    {
      label: "Avance total",
      value: `${advance}%`,
      helper: "RA evaluados sobre el total asignado",
      icon: "chart-up",
      tone: "bg-[color:rgba(248,129,29,0.12)] text-[var(--color-primary)]",
    },
  ];
}

export function buildSupervisorSummaryItems({
  activeCycles,
  completedCycles,
  pendingCourses,
  completedCourses,
}: {
  activeCycles: number;
  completedCycles: number;
  pendingCourses: number;
  completedCourses: number;
}): SummaryCardItem[] {
  return [
    {
      label: "Ciclo activo",
      value: activeCycles,
      helper: "Ciclos con mediciones pendientes",
      icon: "book",
      tone: "bg-[color:rgba(160,195,255,0.18)] text-[var(--color-secondary-4)]",
    },
    {
      label: "Ciclos finalizados",
      value: completedCycles,
      helper: "Ciclos con medición y Plan de mejora completos",
      icon: "checklist",
      tone: "bg-[color:rgba(118,202,102,0.16)] text-[color:#2f7d32]",
    },
    {
      label: "Cursos pendientes",
      value: pendingCourses,
      helper: "Cursos con RA pendientes por medir",
      icon: "people",
      tone: "bg-[color:rgba(251,199,86,0.20)] text-[var(--color-secondary-4)]",
    },
    {
      label: "Cursos finalizados",
      value: completedCourses,
      helper: "Cursos con medición completada",
      icon: "chart-up",
      tone: "bg-[color:rgba(248,129,29,0.12)] text-[var(--color-primary)]",
    },
  ];
}
