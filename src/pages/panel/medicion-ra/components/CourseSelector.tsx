import { GoCheckCircle, GoClock, GoGoal } from "react-icons/go";
import { Badge, InformativeProgressBar } from "../../../../components/ui";
import type { CourseMeasurementSummary, CourseRecord } from "../medicion-ra.types";

interface CourseSelectorProps {
  courses: CourseRecord[];
  selectedCourseId: string;
  courseSummaries: CourseMeasurementSummary[];
  onCourseChange: (courseId: string) => void;
}

const statusConfig: Record<
  CourseMeasurementSummary["status"],
  {
    badgeVariant: "neutral" | "info" | "success";
    icon: typeof GoClock;
    helper: string;
  }
> = {
  pending: {
    badgeVariant: "neutral",
    icon: GoClock,
    helper: "Sin avances registrados",
  },
  "in-progress": {
    badgeVariant: "info",
    icon: GoGoal,
    helper: "Medición iniciada",
  },
  completed: {
    badgeVariant: "success",
    icon: GoCheckCircle,
    helper: "Curso listo o finalizado",
  },
};

function getSummaryForCourse(
  courseId: string,
  courseSummaries: CourseMeasurementSummary[],
): CourseMeasurementSummary {
  return (
    courseSummaries.find((summary) => summary.courseId === courseId) ?? {
      courseId,
      status: "pending",
      statusLabel: "Pendiente",
      progressPercentage: 0,
      completedCompetences: 0,
      totalCompetences: 0,
      isLocked: false,
    }
  );
}

export default function CourseSelector({
  courses,
  selectedCourseId,
  courseSummaries,
  onCourseChange,
}: CourseSelectorProps) {
  const completedCourses = courseSummaries.filter(
    (summary) => summary.status === "completed",
  ).length;

  return (
    <section className="surface-card p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-4)]">
            Cursos asignados al docente
          </p>
          <h2 className="mt-1 font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            Avance de medición por curso
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--color-gray-3)]">
            Selecciona el curso que vas a medir y revisa rápidamente cuáles están pendientes, en progreso o finalizados.
          </p>
        </div>

        <Badge variant="neutral">
          {completedCourses}/{courses.length} cursos finalizados
        </Badge>
      </div>

      <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {courses.map((course) => {
          const summary = getSummaryForCourse(course.id, courseSummaries);
          const isActive = course.id === selectedCourseId;
          const config = statusConfig[summary.status];
          const StatusIcon = config.icon;

          return (
            <button
              key={`${course.cycleId ?? "sin-ciclo"}-${course.id}`}
              type="button"
              onClick={() => onCourseChange(course.id)}
              aria-current={isActive ? "true" : undefined}
              className={[
                "rounded-[var(--radius-xl)] border bg-[var(--color-white)] p-4 text-left shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] focus:outline-none focus:ring-4 focus:ring-[color:rgba(14,101,217,0.18)]",
                isActive
                  ? "border-[var(--color-secondary-1)] ring-2 ring-[color:rgba(14,101,217,0.16)]"
                  : summary.status === "completed"
                    ? "border-[var(--color-success)]"
                    : "border-[var(--color-gray-6)]",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-gray-4)]">
                    {course.code} · {course.period}
                  </p>
                  <h3 className="mt-1 font-heading text-base font-semibold text-[var(--color-secondary-4)]">
                    {course.name}
                  </h3>
                </div>

                <span
                  className={[
                    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg",
                    isActive
                      ? "border-[var(--color-secondary-1)] bg-[color:rgba(14,101,217,0.08)] text-[var(--color-secondary-1)]"
                      : summary.status === "completed"
                        ? "border-[var(--color-success)] bg-[color:rgba(29,185,84,0.12)] text-[var(--color-secondary-4)]"
                        : "border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] text-[var(--color-gray-4)]",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <StatusIcon />
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant={config.badgeVariant}>{summary.statusLabel}</Badge>
                {isActive ? <Badge variant="accent">Curso activo</Badge> : null}
              </div>

              <div className="mt-4">
                <InformativeProgressBar
                  value={summary.progressPercentage}
                  label={`${summary.completedCompetences}/${summary.totalCompetences} competencias completas`}
                />
              </div>

              <p className="mt-3 text-xs font-semibold text-[var(--color-gray-4)]">
                {summary.isLocked ? "Información bloqueada por finalización" : config.helper}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
