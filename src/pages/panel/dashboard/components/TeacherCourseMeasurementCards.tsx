import { Badge, InformativeProgressBar, SecubIcon } from "../../../../components/ui";
import type { SecubIconName } from "../../../../components/ui";
import type { CourseMeasurementSummary, CourseRecord } from "../../medicion-ra/medicion-ra.types";

interface TeacherCourseMeasurementCardsProps {
  courses: CourseRecord[];
  courseSummaries: CourseMeasurementSummary[];
  onCourseSelect: (courseId: string, cycleId?: string) => void;
}

const statusConfig: Record<
  CourseMeasurementSummary["status"],
  {
    badgeVariant: "neutral" | "info" | "success";
    icon: SecubIconName;
    helper: string;
  }
> = {
  pending: {
    badgeVariant: "neutral",
    icon: "clock",
    helper: "Sin avances registrados",
  },
  "in-progress": {
    badgeVariant: "info",
    icon: "target",
    helper: "Medición iniciada",
  },
  completed: {
    badgeVariant: "success",
    icon: "complete",
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

export default function TeacherCourseMeasurementCards({
  courses,
  courseSummaries,
  onCourseSelect,
}: TeacherCourseMeasurementCardsProps) {
  const completedCourses = courseSummaries.filter(
    (summary) => summary.status === "completed",
  ).length;

  if (courses.length === 0) return null;

  return (
    <section className="surface-card p-6" aria-labelledby="teacher-measurement-courses-title">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-4)]">
            Paso para iniciar Medición RA
          </p>
          <h3
            id="teacher-measurement-courses-title"
            className="mt-1 font-heading text-xl font-semibold text-[var(--color-secondary-4)]"
          >
            Selecciona el curso que deseas medir
          </h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--color-gray-3)]">
            Cada tarjeta muestra el avance del curso. Al seleccionarla entrarás directamente a Medición RA con el curso listo para continuar la evaluación.
          </p>
        </div>

        <Badge variant="neutral">
          {completedCourses}/{courses.length} cursos finalizados
        </Badge>
      </div>

      <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {courses.map((course) => {
          const summary = getSummaryForCourse(course.id, courseSummaries);
          const config = statusConfig[summary.status];

          return (
            <button
              key={`${course.cycleId ?? "sin-ciclo"}-${course.id}`}
              type="button"
              onClick={() => onCourseSelect(course.id, course.cycleId)}
              aria-label={`Abrir Medición RA del curso ${course.name}. ${summary.statusLabel}, ${summary.progressPercentage}% completado.`}
              className={[
                "rounded-[var(--radius-xl)] border bg-[var(--secub-surface)] p-4 text-left shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--secub-focus-soft)]",
                summary.status === "completed"
                  ? "border-[var(--color-success)]"
                  : "border-[var(--color-gray-6)]",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-gray-4)]">
                    {course.code} · {course.period}
                  </p>
                  <h4 className="mt-1 font-heading text-base font-semibold text-[var(--color-secondary-4)]">
                    {course.name}
                  </h4>
                </div>

                <span
                  className={[
                    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg",
                    summary.status === "completed"
                      ? "border-[var(--color-success)] bg-[color:rgba(29,185,84,0.12)] text-[var(--color-secondary-4)]"
                      : "border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] text-[var(--color-gray-4)]",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <SecubIcon name={config.icon} size={20} weight="fill" />
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant={config.badgeVariant}>{summary.statusLabel}</Badge>
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

              <span className="mt-4 inline-flex items-center gap-2 font-heading text-sm font-semibold text-[var(--color-primary)]">
                {summary.isLocked ? "Consultar medición" : "Ir a Medición RA"}
                <SecubIcon name="next" weight="bold" aria-hidden="true" className="text-base" />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
