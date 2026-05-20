import { useEffect, useState } from "react";
import { mockInitialEvaluations, mockInitialInstruments, mockCourses } from "../medicion-ra.mock";
import { normalizeEvaluationMatrix, normalizeInstrumentState } from "../medicion-ra.utils";
import type {
  CourseRecord,
  EvaluationMatrix,
  EvidenceState,
  ImprovementPlanState,
  InstrumentByRa,
} from "../medicion-ra.types";
import type { MedicionRaDemoState } from "../types/medicionRA.persistence.types";

export function useMedicionRAHydration({
  availableCourses,
  selectedCourseId,
  selectedCourse,
  persistedDemoState,
  medicionRaDemoStateId,
  initialPersistedDemoState,
  setSelectedCourseId,
  setActiveCompetenceId,
}: {
  availableCourses: CourseRecord[];
  selectedCourseId: string;
  selectedCourse: CourseRecord;
  persistedDemoState?: MedicionRaDemoState;
  medicionRaDemoStateId: string;
  initialPersistedDemoState?: MedicionRaDemoState;
  setSelectedCourseId: (courseId: string) => void;
  setActiveCompetenceId: (competenceId: string) => void;
}) {
  const [evaluationsByCourse, setEvaluationsByCourse] = useState<Record<string, EvaluationMatrix>>(
    initialPersistedDemoState?.evaluationsByCourse ?? mockInitialEvaluations,
  );
  const [instrumentsByCourse, setInstrumentsByCourse] = useState<Record<string, InstrumentByRa>>(
    initialPersistedDemoState?.instrumentsByCourse ?? mockInitialInstruments,
  );
  const [evidenceByCompetence, setEvidenceByCompetence] = useState<Record<string, EvidenceState>>(
    initialPersistedDemoState?.evidenceByCompetence ?? {},
  );
  const [improvementByCompetence, setImprovementByCompetence] = useState<Record<string, ImprovementPlanState>>(
    initialPersistedDemoState?.improvementByCompetence ?? {},
  );
  const [completedCompetenceIds, setCompletedCompetenceIds] = useState<string[]>(
    initialPersistedDemoState?.completedCompetenceIds ?? [],
  );
  const [isSelectedCourseLocked, setIsSelectedCourseLocked] = useState(
    initialPersistedDemoState?.isEvaluationLocked ?? false,
  );
  const [hydratedStateId, setHydratedStateId] = useState(medicionRaDemoStateId);

  useEffect(() => {
    if (!availableCourses.some((course) => course.id === selectedCourseId)) {
      setSelectedCourseId(availableCourses[0]?.id ?? mockCourses[0].id);
      return;
    }

    if (persistedDemoState?.selectedCourseId === selectedCourse.id) {
      setActiveCompetenceId(persistedDemoState.activeCompetenceId ?? selectedCourse.competences[0]?.id ?? "");
      setEvaluationsByCourse(persistedDemoState.evaluationsByCourse ?? mockInitialEvaluations);
      setInstrumentsByCourse(persistedDemoState.instrumentsByCourse ?? mockInitialInstruments);
      setEvidenceByCompetence(persistedDemoState.evidenceByCompetence ?? {});
      setImprovementByCompetence(persistedDemoState.improvementByCompetence ?? {});
      setCompletedCompetenceIds(persistedDemoState.completedCompetenceIds ?? []);
      setIsSelectedCourseLocked(persistedDemoState.isEvaluationLocked ?? false);
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

    setHydratedStateId(medicionRaDemoStateId);
  }, [availableCourses, medicionRaDemoStateId, persistedDemoState, selectedCourse, selectedCourseId, setActiveCompetenceId, setSelectedCourseId]);

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
