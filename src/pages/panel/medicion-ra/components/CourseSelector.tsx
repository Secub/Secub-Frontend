
import { Select } from "../../../../components/ui";
import type { CourseRecord } from "../medicion-ra.types";

interface CourseSelectorProps {
  courses: CourseRecord[];
  selectedCourseId: string;
  completionPercentage: number;
  disabled?: boolean;
  lockedTooltip?: string;
  onCourseChange: (courseId: string) => void;
}

export default function CourseSelector({
  courses,
  selectedCourseId,
  disabled = false,
  lockedTooltip,
  onCourseChange,
}: CourseSelectorProps) {

  const courseOptions = courses.map((course) => ({
    value: course.id,
    label: `${course.name} · ${course.period}`,
  }));

  return (
    <section className="surface-card overflow-hidden">
      <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <div title={disabled ? lockedTooltip : undefined}>
          <div className="max-w-xl">
            <Select
              label="Curso asignado al docente"
              value={selectedCourseId}
              options={courseOptions}
              disabled={disabled}
              onChange={(event) => onCourseChange(event.target.value)}
              helperText="El listado se muestra únicamente con cursos asociados al docente autenticado."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
