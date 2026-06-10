import { GoCheck, GoSearch } from "react-icons/go";
import { Badge } from "../../../../components/ui";
import type { AsignarRACourseRow } from "../AsignarRA.types";
import { AsignarRARowActions } from "./AsignarRARowActions";

interface AsignarRACoursesTableProps {
  rows: AsignarRACourseRow[];
  totalCourses: number;
  isFiltered: boolean;
  canManage: boolean;
  onSelectCourse: (courseId: string) => void;
}

export function AsignarRACoursesTable({
  rows,
  totalCourses,
  isFiltered,
  canManage,
  onSelectCourse,
}: AsignarRACoursesTableProps) {
  return (
    <section className="surface-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">Cursos de Síntesis</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
            Tabla pensada para muchos cursos: filtra arriba y abre el detalle desde la acción de la fila.
          </p>
        </div>
        <Badge variant="info">{rows.length} de {totalCourses}</Badge>
      </div>

      <div className="mt-5 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-separate border-spacing-0">
            <thead className="bg-[var(--color-surface-soft)]">
              <tr>
                {[
                  "Código",
                  "Curso",
                  "Semestre",
                  "Docente",
                  "RA asignados",
                  "Competencias",
                  "Estado",
                  "Acción",
                ].map((title) => (
                  <th key={title} scope="col" className="border-b border-[var(--color-gray-6)] px-5 py-4 text-left text-sm font-semibold text-[var(--color-secondary-4)]">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr
                    key={row.course.id}
                    className={[
                      "bg-white transition-colors hover:bg-[var(--color-surface-soft)]",
                      row.isSelected ? "bg-[color:rgba(14,101,217,0.05)]" : "",
                    ].join(" ")}
                  >
                    <td className="border-b border-[var(--color-gray-6)] px-5 py-4 align-top">
                      <span className="flex items-center gap-2">
                        <Badge variant="info">{row.course.codigo}</Badge>
                        {row.isSelected ? <GoCheck aria-hidden="true" className="text-[var(--color-secondary-1)]" /> : null}
                      </span>
                    </td>
                    <td className="border-b border-[var(--color-gray-6)] px-5 py-4 align-top">
                      <button
                        type="button"
                        onClick={() => onSelectCourse(row.course.id)}
                        className="text-left font-heading text-sm font-semibold text-[var(--color-secondary-4)] hover:text-[var(--color-secondary-1)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.22)]"
                      >
                        {row.course.nombre}
                      </button>
                      {row.course.nucleo !== "Síntesis" ? (
                        <p className="mt-1 text-xs font-medium text-[var(--color-error)]">No aplica para asignación RA</p>
                      ) : null}
                    </td>
                    <td className="border-b border-[var(--color-gray-6)] px-5 py-4 align-top text-sm text-[var(--color-gray-3)]">
                      {row.course.semestre}
                    </td>
                    <td className="border-b border-[var(--color-gray-6)] px-5 py-4 align-top text-sm text-[var(--color-gray-3)]">
                      {row.course.docente}
                    </td>
                    <td className="border-b border-[var(--color-gray-6)] px-5 py-4 align-top">
                      <Badge variant={row.assignedCount > 0 ? "success" : "neutral"}>{row.assignedCount} RA</Badge>
                    </td>
                    <td className="border-b border-[var(--color-gray-6)] px-5 py-4 align-top">
                      <Badge variant={row.competenceCount > 0 ? "info" : "warning"}>{row.competenceCount}</Badge>
                    </td>
                    <td className="border-b border-[var(--color-gray-6)] px-5 py-4 align-top">
                      <Badge variant={row.status.variant}>{row.status.label}</Badge>
                    </td>
                    <td className="border-b border-[var(--color-gray-6)] px-5 py-4 align-top">
                      <AsignarRARowActions row={row} canManage={canManage} onSelectCourse={onSelectCourse} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-[var(--color-gray-4)]">
                    <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                      <GoSearch aria-hidden="true" className="text-2xl text-[var(--color-gray-4)]" />
                      <p>{isFiltered ? "Sin resultados para esta búsqueda." : "No hay cursos de Síntesis disponibles para este ciclo."}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
