import { Badge, Table, type TableColumn } from "../../../../components/ui";
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
  const columns: TableColumn<AsignarRACourseRow>[] = [
    {
      key: "code",
      title: "Código",
      render: (row) => <Badge variant="info">{row.course.codigo}</Badge>,
      sortValue: (row) => row.course.codigo,
      searchValue: (row) => row.course.codigo,
    },
    {
      key: "course",
      title: "Curso",
      render: (row) => (
        <div>
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
        </div>
      ),
      sortValue: (row) => row.course.nombre,
      searchValue: (row) => row.course.nombre,
    },
    {
      key: "semester",
      title: "Semestre",
      render: (row) => row.course.semestre,
      sortValue: (row) => row.course.semestre,
    },
    {
      key: "teacher",
      title: "Docente",
      render: (row) => row.course.docente,
      sortValue: (row) => row.course.docente,
      searchValue: (row) => row.course.docente,
    },
    {
      key: "assigned",
      title: "RA asignados",
      render: (row) => <Badge variant={row.assignedCount > 0 ? "success" : "neutral"}>{row.assignedCount} RA</Badge>,
      sortValue: (row) => row.assignedCount,
    },
    {
      key: "competences",
      title: "Competencias",
      render: (row) => <Badge variant={row.competenceCount > 0 ? "info" : "warning"}>{row.competenceCount}</Badge>,
      sortValue: (row) => row.competenceCount,
    },
    {
      key: "status",
      title: "Estado",
      render: (row) => <Badge variant={row.status.variant}>{row.status.label}</Badge>,
      sortValue: (row) => row.status.label,
      searchValue: (row) => row.status.label,
    },
    {
      key: "action",
      title: "Acción",
      sortable: false,
      render: (row) => (
        <AsignarRARowActions row={row} canManage={canManage} onSelectCourse={onSelectCourse} />
      ),
    },
  ];

  return (
    <section className="surface-card p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">Cursos de Síntesis</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
            Filtra y abre el detalle desde la acción de cada curso.
          </p>
        </div>
        <Badge variant="info">{rows.length} de {totalCourses}</Badge>
      </div>

      <Table
        columns={columns}
        data={rows}
        rowKey={(row) => row.course.id}
        minWidth={980}
        emptyMessage={isFiltered ? "Sin resultados para los filtros aplicados." : "No hay cursos de Síntesis disponibles para este ciclo."}
        noMatchesMessage="Sin resultados para esta búsqueda."
        searchPlaceholder="Buscar por código, curso, docente o estado…"
      />
    </section>
  );
}
