import { useState } from "react";
import type { CourseRecord } from "../medicion-ra.types";
import type { MedicionRaDemoState } from "../types/medicionRA.persistence.types";

export function useMedicionRASelection({
  availableCourses,
  initialCourseId,
  initialPersistedDemoState,
}: {
  availableCourses: CourseRecord[];
  initialCourseId: string;
  initialPersistedDemoState?: MedicionRaDemoState;
}) {
  const [selectedCourseId, setSelectedCourseId] = useState(
    initialPersistedDemoState?.selectedCourseId ?? initialCourseId,
  );
  const [activeCompetenceId, setActiveCompetenceId] = useState(
    initialPersistedDemoState?.activeCompetenceId ?? availableCourses[0]?.competences[0]?.id ?? "",
  );

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
