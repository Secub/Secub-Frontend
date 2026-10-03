import { useEffect, useState } from "react";
import type { CourseRecord } from "../medicion-ra.types";
import type { CourseMeasurementState } from "../types/medicionRA.persistence.types";

export function useMedicionRASelection({
  availableCourses,
  initialCourseId,
  initialPersistedState,
}: {
  availableCourses: CourseRecord[];
  initialCourseId: string;
  initialPersistedState?: CourseMeasurementState;
}) {
  const [selectedCourseId, setSelectedCourseId] = useState(
    initialPersistedState?.selectedCourseId ?? initialCourseId,
  );
  const [activeCompetenceId, setActiveCompetenceId] = useState(
    initialPersistedState?.activeCompetenceId ?? availableCourses[0]?.competences[0]?.id ?? "",
  );

  useEffect(() => {
    if (initialCourseId && !selectedCourseId) setSelectedCourseId(initialCourseId);
  }, [initialCourseId, selectedCourseId]);

  const handleCourseChange = (courseId: string) => {
    if (!courseId || !availableCourses.some((course) => course.id === courseId)) return;

    // El selector de cursos siempre permanece habilitado.
    // Finalizar un curso solo bloquea la edición de ese curso cuando esté seleccionado.
    setSelectedCourseId(courseId);
  };

  const handleCompetenceChange = (competenceId: string) => {
    setActiveCompetenceId(competenceId);
  };

  return {
    selectedCourseId,
    activeCompetenceId,
    setSelectedCourseId,
    setActiveCompetenceId,
    handleCourseChange,
    handleCompetenceChange,
  };
}
