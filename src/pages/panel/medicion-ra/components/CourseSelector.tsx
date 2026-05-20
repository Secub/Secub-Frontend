import { Select } from "../../../../components/ui";
import type { CourseRecord } from "../medicion-ra.types";

interface CourseSelectorProps {
  courses: CourseRecord[];
  selectedCourseId: string;
  onCourseChange: (courseId: string) => void;
}

export default function CourseSelector({
  courses,
  selectedCourseId,
  onCourseChange,
}: CourseSelectorProps) {
  const courseOptions = courses.map((course) => ({
    value: course.id,
    label: `${course.name} · ${course.period}`,
  }));

  return (
    <section className="surface-card p-6">
      <div className="max-w-2xl">
        <Select
          label="Curso asignado al docente"
          value={selectedCourseId}
          options={courseOptions}
          onChange={(event) => onCourseChange(event.target.value)}
          helperText="El listado se muestra únicamente con cursos asociados al docente autenticado."
        />
      </div>
    </section>
  );
}
