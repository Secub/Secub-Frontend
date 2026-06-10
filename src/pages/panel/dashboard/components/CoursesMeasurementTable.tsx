import { GoChevronRight, GoEye, GoGraph, GoMail } from "react-icons/go";
import { Badge, Button, Table, type TableColumn } from "../../../../components/ui";
import type { EnrichedCourse } from "../dashboard.types";

interface CoursesMeasurementTableProps {
  title?: string;
  description?: string;
  courses: EnrichedCourse[];
  mode: "teacher" | "supervisor";
  onMeasureCourse?: (course: EnrichedCourse) => void;
  onViewResults: (course: EnrichedCourse) => void;
  onNotifyTeacher?: (course: EnrichedCourse) => void;
}

const statusVariant = {
  pendiente: "warning",
  finalizado: "success",
} as const;

const statusLabel = {
  pendiente: "Pendiente",
  finalizado: "Finalizado",
} as const;

const compactHeader = "px-3";
const compactCell = "px-3";

function PendingCoursesSummary({ courses }: { courses: EnrichedCourse[] }) {
  const totalRa = courses.reduce((total, course) => total + course.totalRa, 0);
  const evaluatedRa = courses.reduce((total, course) => total + course.evaluatedRa, 0);
  const pendingRa = Math.max(totalRa - evaluatedRa, 0);
  const progress = totalRa ? Math.round((evaluatedRa / totalRa) * 100) : 0;

  if (courses.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-5 text-sm text-[var(--color-gray-3)]">
        No hay pendientes para visualizar en el ciclo seleccionado.
      </div>
    );
  }

  return (
    <div className="surface-card rounded-[22px] p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <GoGraph className="text-xl text-[var(--color-secondary-1)]" />
            <h3 className="font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
              Resumen visual de pendientes
            </h3>
          </div>
          <p className="mt-1 text-sm text-[var(--color-gray-3)]">
            {evaluatedRa} RA evaluados · {pendingRa} RA pendientes · avance del ciclo {progress}%.
          </p>
        </div>

        <div className="grid min-w-[260px] gap-3 sm:grid-cols-3">
          <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)] px-4 py-3 text-center">
            <p className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">{totalRa}</p>
            <p className="text-xs text-[var(--color-gray-4)]">RA asignados</p>
          </div>
          <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)] px-4 py-3 text-center">
            <p className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">{evaluatedRa}</p>
            <p className="text-xs text-[var(--color-gray-4)]">Evaluados</p>
          </div>
          <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)] px-4 py-3 text-center">
            <p className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">{pendingRa}</p>
            <p className="text-xs text-[var(--color-gray-4)]">Pendientes</p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {courses.slice(0, 6).map((course) => {
          const courseProgress = course.totalRa ? Math.round((course.evaluatedRa / course.totalRa) * 100) : 0;

          return (
            <div key={course.id} className="rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)] p-4">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-heading font-semibold text-[var(--color-secondary-4)]">
                  {course.code} · {course.name}
                </span>
                <span className="text-xs font-semibold text-[var(--color-gray-4)]">
                  {course.evaluatedRa}/{course.totalRa} RA
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-[var(--color-secondary-1)] transition-all duration-300"
                  style={{ width: `${courseProgress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CoursesMeasurementTable({
  title,
  description,
  courses,
  mode,
  onMeasureCourse,
  onViewResults,
  onNotifyTeacher,
}: CoursesMeasurementTableProps) {
  const teacherColumns: TableColumn<EnrichedCourse>[] = [
    {
      key: "id",
      title: "Id Curso",
      render: (course) => (
        <span className="font-medium text-[var(--color-secondary-4)]">
          {course.code}
        </span>
      ),
      className: `${compactCell} w-[10%] text-center`,
      headerClassName: `${compactHeader} w-[10%] text-center`,
    },
    {
      key: "name",
      title: "Nombre",
      render: (course) => (
        <p className="font-heading font-semibold leading-snug text-[var(--color-secondary-4)]">
          {course.name}
        </p>
      ),
      className: `${compactCell} w-[16%]`,
      headerClassName: `${compactHeader} w-[16%]`,
    },
    {
      key: "cycle",
      title: "Ciclo de Medición",
      render: (course) => course.period,
      className: `${compactCell} w-[12%]`,
      headerClassName: `${compactHeader} w-[12%]`,
    },
    {
      key: "competences",
      title: "#Competencias",
      render: (course) => course.competenceIds.length,
      className: `${compactCell} w-[12%] text-center`,
      headerClassName: `${compactHeader} w-[12%] text-center`,
    },
    {
      key: "ra",
      title: "#RA a evaluar",
      render: (course) => course.totalRa,
      className: `${compactCell} w-[12%] text-center`,
      headerClassName: `${compactHeader} w-[12%] text-center`,
    },
    {
      key: "evaluated",
      title: "RAs Evaluados",
      render: (course) => `${course.evaluatedRa}/${course.totalRa}`,
      className: `${compactCell} w-[12%] text-center`,
      headerClassName: `${compactHeader} w-[12%] text-center`,
    },
    {
      key: "status",
      title: "Estado",
      render: (course) => (
        <Badge variant={statusVariant[course.status]}>
          {statusLabel[course.status]}
        </Badge>
      ),
      className: `${compactCell} w-[10%] text-center`,
      headerClassName: `${compactHeader} w-[10%] text-center`,
    },
    {
      key: "actions",
      title: "Acciones",
      render: (course) => (
        <div className="flex flex-col items-center justify-center gap-2">
          <Button
            variant="primary_soft"
            size="sm"
            leftIcon={<GoEye className="text-base" />}
            onClick={() => onViewResults(course)}
            disabled={course.results.length === 0}
            title={
              course.results.length === 0
                ? "El detalle se habilita cuando exista al menos un RA medido."
                : "Ver detalle del curso"
            }
            className="w-full max-w-[130px] px-3 text-center leading-tight"
          >
            Ver detalle
          </Button>

          {course.status === "pendiente" ? (
            <Button
              variant="outline"
              size="sm"
              rightIcon={<GoChevronRight className="text-base" />}
              onClick={() => onMeasureCourse?.(course)}
              className="w-full max-w-[130px] px-3 text-center leading-tight"
            >
              Medir RA
            </Button>
          ) : null}
        </div>
      ),
      className: `${compactCell} w-[16%] text-center`,
      headerClassName: `${compactHeader} w-[16%] text-center`,
    },
  ];

  const supervisorColumns: TableColumn<EnrichedCourse>[] = [
    {
      key: "code",
      title: "Código",
      render: (course) => (
        <span className="font-medium text-[var(--color-secondary-4)]">
          {course.code}
        </span>
      ),
      className: `${compactCell} w-[9%]`,
      headerClassName: `${compactHeader} w-[9%]`,
    },
    {
      key: "course",
      title: "Curso",
      render: (course) => (
        <div>
          <p className="font-heading font-semibold leading-snug text-[var(--color-secondary-4)]">
            {course.name}
          </p>
          <p className="mt-1 text-xs text-[var(--color-gray-4)]">
            {course.programaName}
          </p>
        </div>
      ),
      className: `${compactCell} w-[18%]`,
      headerClassName: `${compactHeader} w-[18%]`,
    },
    {
      key: "teacher",
      title: "Docente titular",
      render: (course) => (
        <div>
          <p className="font-medium leading-snug text-[var(--color-secondary-4)]">
            {course.teacherName}
          </p>
          <p className="mt-1 break-words text-xs text-[var(--color-gray-4)]">
            {course.teacherEmail}
          </p>
        </div>
      ),
      className: `${compactCell} w-[18%]`,
      headerClassName: `${compactHeader} w-[18%]`,
    },
    {
      key: "cycle",
      title: "Ciclo",
      render: (course) => course.period,
      className: `${compactCell} w-[9%] text-center`,
      headerClassName: `${compactHeader} w-[9%] text-center`,
    },
    {
      key: "competences",
      title: "# Competencias",
      render: (course) => course.competenceIds.length,
      className: `${compactCell} w-[11%] text-center`,
      headerClassName: `${compactHeader} w-[11%] text-center`,
    },
    {
      key: "pendingRa",
      title: "RAs pendientes",
      render: (course) => course.pendingRa,
      className: `${compactCell} w-[11%] text-center`,
      headerClassName: `${compactHeader} w-[11%] text-center`,
    },
    {
      key: "status",
      title: "Estado",
      render: (course) => (
        <Badge variant={statusVariant[course.status]}>
          {statusLabel[course.status]}
        </Badge>
      ),
      className: `${compactCell} w-[10%] text-center`,
      headerClassName: `${compactHeader} w-[10%] text-center`,
    },
    {
      key: "actions",
      title: "Acciones",
      render: (course) => (
        <div className="flex flex-col items-center justify-center gap-2">
          {course.status === "pendiente" ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<GoMail className="text-base" />}
              onClick={() => onNotifyTeacher?.(course)}
              className="w-full max-w-[125px] px-3 text-center leading-tight"
            >
              Enviar correo
            </Button>
          ) : null}

          <Button
            variant="primary_soft"
            size="sm"
            leftIcon={<GoEye className="text-base" />}
            onClick={() => onViewResults(course)}
            disabled={course.results.length === 0}
            title={
              course.results.length === 0
                ? "El detalle se habilita cuando exista al menos un RA medido."
                : "Ver detalle del curso"
            }
            className="w-full max-w-[125px] px-3 text-center leading-tight"
          >
            Ver detalle
          </Button>
        </div>
      ),
      className: `${compactCell} w-[14%] text-center`,
      headerClassName: `${compactHeader} w-[14%] text-center`,
    },
  ];

  return (
    <section className="space-y-4">
      {title || description ? (
        <div>
          {title ? (
            <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
              {title}
            </h2>
          ) : null}

          {description ? (
            <p className="mt-1 text-sm text-[var(--color-gray-3)]">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      {mode === "supervisor" ? <PendingCoursesSummary courses={courses} /> : null}

      <Table
        columns={mode === "teacher" ? teacherColumns : supervisorColumns}
        data={courses}
        rowKey={(course) => course.id}
        emptyMessage={
          mode === "teacher"
            ? "No hay cursos para los filtros seleccionados."
            : "No hay cursos pendientes para el ciclo seleccionado."
        }
      />
    </section>
  );
}
