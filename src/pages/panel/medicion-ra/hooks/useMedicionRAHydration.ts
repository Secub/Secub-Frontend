import { useEffect, useState } from "react";
import { normalizeEvaluationMatrix, normalizeInstrumentState } from "../medicion-ra.utils";
import type {
  CourseRecord,
  EvaluationMatrix,
  EvidenceState,
  ImprovementPlanState,
  InstrumentByRa,
} from "../medicion-ra.types";
import type { CourseMeasurementState } from "../types/medicionRA.persistence.types";

export function useMedicionRAHydration({
  availableCourses,
  selectedCourseId,
  selectedCourse,
  persistedState,
  courseMeasurementStateId,
  initialPersistedState,
  setSelectedCourseId,
  setActiveCompetenceId,
}: {
  availableCourses: CourseRecord[];
  selectedCourseId: string;
  selectedCourse: CourseRecord;
  persistedState?: CourseMeasurementState;
  courseMeasurementStateId: string;
  initialPersistedState?: CourseMeasurementState;
  setSelectedCourseId: (courseId: string) => void;
  setActiveCompetenceId: (competenceId: string) => void;
}) {
  const [evaluationsByCourse, setEvaluationsByCourse] = useState<Record<string, EvaluationMatrix>>(
    initialPersistedState?.evaluationsByCourse ?? {},
  );
  const [instrumentsByCourse, setInstrumentsByCourse] = useState<Record<string, InstrumentByRa>>(
    initialPersistedState?.instrumentsByCourse ?? {},
  );
  const [evidenceByCompetence, setEvidenceByCompetence] = useState<Record<string, EvidenceState>>(
    initialPersistedState?.evidenceByCompetence ?? {},
  );
  const [improvementByCompetence, setImprovementByCompetence] = useState<Record<string, ImprovementPlanState>>(
    initialPersistedState?.improvementByCompetence ?? {},
  );
  const [completedCompetenceIds, setCompletedCompetenceIds] = useState<string[]>(
    initialPersistedState?.completedCompetenceIds ?? [],
  );
  const [isSelectedCourseLocked, setIsSelectedCourseLocked] = useState(
    initialPersistedState?.isEvaluationLocked ?? false,
  );
  const [hydratedStateId, setHydratedStateId] = useState(courseMeasurementStateId);

  useEffect(() => {
    if (!availableCourses.some((course) => course.id === selectedCourseId)) {
      setSelectedCourseId(availableCourses[0]?.id ?? "");
      return;
    }

    if (persistedState?.selectedCourseId === selectedCourse.id) {
      setActiveCompetenceId(persistedState.activeCompetenceId ?? selectedCourse.competences[0]?.id ?? "");
      setEvaluationsByCourse(persistedState.evaluationsByCourse ?? {});
      setInstrumentsByCourse(persistedState.instrumentsByCourse ?? {});
      setEvidenceByCompetence(persistedState.evidenceByCompetence ?? {});
      setImprovementByCompetence(persistedState.improvementByCompetence ?? {});
      setCompletedCompetenceIds(persistedState.completedCompetenceIds ?? []);
      setIsSelectedCourseLocked(persistedState.isEvaluationLocked ?? false);
    } else {
      setActiveCompetenceId(selectedCourse.competences[0]?.id ?? "");
      setEvaluationsByCourse((current) => ({
        ...current,
        [selectedCourse.id]: normalizeEvaluationMatrix(selectedCourse, current[selectedCourse.id]),
      }));
      setInstrumentsByCourse((current) => ({
        ...current,
        [selectedCourse.id]: normalizeInstrumentState(selectedCourse, current[selectedCourse.id]),
      }));
      setCompletedCompetenceIds([]);
      setIsSelectedCourseLocked(false);
    }

    setHydratedStateId(courseMeasurementStateId);
  }, [availableCourses, courseMeasurementStateId, persistedState, selectedCourse, selectedCourseId, setActiveCompetenceId, setSelectedCourseId]);

  return {
    evaluationsByCourse,
    instrumentsByCourse,
    evidenceByCompetence,
    improvementByCompetence,
    completedCompetenceIds,
    isSelectedCourseLocked,
    hydratedStateId,
    setEvaluationsByCourse,
    setInstrumentsByCourse,
    setEvidenceByCompetence,
    setImprovementByCompetence,
    setCompletedCompetenceIds,
    setIsSelectedCourseLocked,
  };
}
