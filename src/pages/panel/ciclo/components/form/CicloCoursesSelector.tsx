import { GoAlert } from "react-icons/go";
import { Badge } from "../../../../../components/ui";
import type { CursoSintesis } from "../../ciclo.types";
import { getNivelCompromisoLabel } from "../../ciclo.utils";
import { getTeacherContractAlert } from "../../hooks/useCicloFormModal";

interface CicloCoursesSelectorProps {
  courses: CursoSintesis[];
  selectedCourseIds: string[];
  selectedCount: number;
  isReadOnly: boolean;
  error?: string;
  onToggleCourse: (courseId: string) => void;
}

export default function CicloCoursesSelector({
  courses,
  selectedCourseIds,
  selectedCount,
  isReadOnly,
  error,
  onToggleCourse,
}: CicloCoursesSelectorProps) {
  return (
    <section
      data-validation-field="cursoIds"
      data-validation-error={error ? "true" : undefined}
      className={[error ? "rounded-[var(--radius-lg)] border border-[var(--color-error)] p-3 ring-4 ring-[color:rgba(235,87,87,0.10)]" : ""].join(" ")}
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            Cursos de Síntesis
          </h3>
          <p className="mt-1 text-sm text-[var(--color-gray-3)]">
            Selecciona los cursos que harán parte del ciclo de medición.
          </p>
        </div>

        <Badge variant={selectedCount > 0 ? "success" : "neutral"}>
          {selectedCount} cursos seleccionados
        </Badge>
      </div>

      {courses.length > 0 ? (
        <div className="space-y-4">
          {courses.map((course) => {
            const checked = selectedCourseIds.includes(course.id);
            const teacherAlert = getTeacherContractAlert(course.tipoVinculacion);

            return (
              <label
                key={course.id}
                className={[
                  "flex cursor-pointer gap-4 rounded-[var(--radius-lg)] border bg-white p-4 shadow-sm transition-all",
                  checked ? "border-[var(--color-secondary-1)] ring-4 ring-[color:rgba(14,101,217,0.10)]" : "border-[var(--color-gray-6)]",
                  isReadOnly ? "cursor-not-allowed opacity-80" : "hover:border-[var(--color-secondary-1)]",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--color-gray-6)] accent-[var(--color-secondary-1)]"
                  checked={checked}
                  disabled={isReadOnly}
                  onChange={() => onToggleCourse(course.id)}
                  aria-label={`Seleccionar ${course.nombre}`}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
                      {course.nombre}
                    </h4>
                    <span className="text-sm font-semibold text-[var(--color-secondary-4)]">
                      {course.codigo}
                    </span>
                    <Badge variant="info">{course.nucleo}</Badge>
                  </div>

                  <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
                    Semestre {course.semestre} · Docente: {course.docente} ({course.tipoVinculacion}) · {course.creditos} créditos
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="info">{course.competenciasAsignadas} competencias</Badge>
                    <Badge variant="info">{getNivelCompromisoLabel(course.nivelCompromiso)}</Badge>
                  </div>

                  {teacherAlert ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[color:rgba(251,199,86,0.16)] px-3 py-2 text-sm text-[var(--color-gray-2)]">
                      <GoAlert className="shrink-0 text-base text-[var(--color-secondary-4)]" />
                      <Badge variant="warning">Caso excepcional</Badge>
                      <span>{teacherAlert}</span>
                    </div>
                  ) : null}
                </div>
              </label>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-6 text-sm leading-6 text-[var(--color-gray-3)]">
          No hay cursos de Síntesis asociados al programa y plan seleccionados. Cuando el backend esté conectado,
          este bloque debe consumir el endpoint de cursos por plan de estudios.
        </div>
      )}

      {error ? <p className="mt-3 text-sm text-[var(--color-error)]">{error}</p> : null}
    </section>
  );
}
