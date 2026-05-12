import { GoGraph } from "react-icons/go";
import { Badge, Button } from "../../../../components/ui";
import type {
  CompetenceOption,
  CourseSummary,
  LearningResultOption,
} from "../dashboard-ra.types";
import { canViewMeasurementResult } from "../dashboard-ra.utils";

interface MonitoringSectionProps {
  competences: CompetenceOption[];
  learningResults: LearningResultOption[];
  courses: CourseSummary[];
  onViewResult: (course: CourseSummary) => void;
}

export default function MonitoringSection({
  competences,
  learningResults,
  courses,
  onViewResult,
}: MonitoringSectionProps) {
  return (
    <section className="surface-card p-6">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
          Monitoreo de competencias y RA
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--color-gray-3)]">
          Vista jerárquica exclusiva para Dirección de Programa. Permite revisar competencias, Resultados de Aprendizaje y cursos asociados dentro del ciclo seleccionado.
        </p>
      </div>

      {competences.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-5 text-sm text-[var(--color-gray-3)]">
          No hay competencias asociadas a los cursos visibles.
        </div>
      ) : (
        <div className="space-y-4">
          {competences.map((competence) => {
            const competenceRas = learningResults.filter((ra) => ra.competenceId === competence.id);

            return (
              <article key={competence.id} className="rounded-[22px] border border-[var(--color-gray-6)] bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-gray-4)]">
                      Competencia
                    </p>
                    <h3 className="mt-1 font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
                      {competence.code} · {competence.name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-gray-3)]">
                      {competence.description}
                    </p>
                  </div>
                  <Badge variant="info">{competenceRas.length} RA</Badge>
                </div>

                <div className="mt-5 space-y-3">
                  {competenceRas.map((ra) => {
                    const relatedCourses = courses.filter((course) => course.raIds.includes(ra.id));

                    return (
                      <div key={ra.id} className="rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)] p-4">
                        <h4 className="font-heading text-base font-semibold text-[var(--color-secondary-4)]">
                          {ra.code} · {ra.name}
                        </h4>

                        {relatedCourses.length === 0 ? (
                          <p className="mt-2 text-sm text-[var(--color-gray-4)]">
                            No hay cursos asociados a este RA dentro de los filtros actuales.
                          </p>
                        ) : (
                          <div className="mt-3 space-y-2">
                            {relatedCourses.map((course) => {
                              const resultEnabled = canViewMeasurementResult(course);

                              return (
                                <div
                                  key={`${ra.id}-${course.id}`}
                                  className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-white px-4 py-3 md:flex-row md:items-center md:justify-between"
                                >
                                  <div>
                                    <p className="font-semibold text-[var(--color-secondary-4)]">
                                      {course.name}
                                    </p>
                                    <p className="mt-1 text-xs text-[var(--color-gray-4)]">
                                      {course.code} · Docente: {course.teacherName}
                                    </p>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-3">
                                    <Badge variant={course.status === "finalizado" ? "success" : "warning"}>
                                      {course.status === "finalizado" ? "Finalizado" : "Pendiente"}
                                    </Badge>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      leftIcon={<GoGraph className="text-lg" />}
                                      disabled={!resultEnabled}
                                      title={
                                        resultEnabled
                                          ? "Ver Resultado de Medición"
                                          : "El resultado se habilita cuando el docente completa el 100% de los RA del curso."
                                      }
                                      onClick={() => onViewResult(course)}
                                    >
                                      Resultado de Medición
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
