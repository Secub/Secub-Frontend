import { useMemo } from "react";
import { EMPTY_EVIDENCE, EMPTY_IMPROVEMENT_PLAN } from "../constants/medicionRA.constants";
import { mockCourses } from "../medicion-ra.mock";
import {
  calculateRaResults,
  getCompetenceStorageKey,
  getCompletionPercentage,
  normalizeEvaluationMatrix,
  normalizeInstrumentState,
} from "../medicion-ra.utils";
import type {
  CourseRecord,
  EvaluationMatrix,
  EvidenceState,
  ImprovementPlanState,
  InstrumentByRa,
} from "../medicion-ra.types";
import { resolveMedicionRaContextForCourse } from "../utils/medicionRA.assignments";
import { buildMedicionRaDemoStateId } from "../utils/medicionRA.persistence";

export function useMedicionRAComputedState({
  userId,
  availableCourses,
  selectedCourseId,
  activeCompetenceId,
  evaluationsByCourse,
  instrumentsByCourse,
  evidenceByCompetence,
  improvementByCompetence,
}: {
  userId: string;
  availableCourses: CourseRecord[];
  selectedCourseId: string;
  activeCompetenceId: string;
  evaluationsByCourse: Record<string, EvaluationMatrix>;
  instrumentsByCourse: Record<string, InstrumentByRa>;
  evidenceByCompetence: Record<string, EvidenceState>;
  improvementByCompetence: Record<string, ImprovementPlanState>;
}) {
  const selectedCourse = useMemo(() => {
    return (
      availableCourses.find((course) => course.id === selectedCourseId) ??
      availableCourses[0] ??
      mockCourses[0]
    );
  }, [availableCourses, selectedCourseId]);

  const medicionRaContext = useMemo(
    () => resolveMedicionRaContextForCourse(selectedCourse),
    [selectedCourse],
  );

  const medicionRaDemoStateId = useMemo(
    () =>
      buildMedicionRaDemoStateId({
        userId,
        cicloId: medicionRaContext.cicloId,
        courseId: selectedCourse.id,
      }),
    [medicionRaContext.cicloId, selectedCourse.id, userId],
  );

  const activeCompetence = useMemo(() => {
    return (
      selectedCourse.competences.find((competence) => competence.id === activeCompetenceId) ??
      selectedCourse.competences[0]
    );
  }, [activeCompetenceId, selectedCourse.competences]);

  const activeCompetenceIndex = useMemo(() => {
    return Math.max(
      0,
      selectedCourse.competences.findIndex((competence) => competence.id === activeCompetence.id),
    );
  }, [activeCompetence.id, selectedCourse.competences]);

  const isLastCompetence = activeCompetenceIndex === selectedCourse.competences.length - 1;

  const activeCompetenceStorageKey = useMemo(() => {
    return getCompetenceStorageKey(selectedCourse.id, activeCompetence.id);
  }, [activeCompetence.id, selectedCourse.id]);

  const evaluations = useMemo(() => {
    return normalizeEvaluationMatrix(selectedCourse, evaluationsByCourse[selectedCourse.id]);
  }, [evaluationsByCourse, selectedCourse]);

  const instruments = useMemo(() => {
    return normalizeInstrumentState(selectedCourse, instrumentsByCourse[selectedCourse.id]);
  }, [instrumentsByCourse, selectedCourse]);

  const evidence = evidenceByCompetence[activeCompetenceStorageKey] ?? EMPTY_EVIDENCE;
  const improvementPlan = improvementByCompetence[activeCompetenceStorageKey] ?? EMPTY_IMPROVEMENT_PLAN;

  const raResults = useMemo(() => {
    return calculateRaResults(selectedCourse, evaluations);
  }, [evaluations, selectedCourse]);

  const activeRaResults = useMemo(() => {
    const activeRaIds = new Set(activeCompetence.learningResults.map((ra) => ra.id));
    return raResults.filter((result) => activeRaIds.has(result.raId));
  }, [activeCompetence, raResults]);

  const completionPercentage = useMemo(() => {
    return getCompletionPercentage(selectedCourse, evaluations);
  }, [evaluations, selectedCourse]);

  return {
    selectedCourse,
    medicionRaContext,
    medicionRaDemoStateId,
    activeCompetence,
    activeCompetenceIndex,
    isLastCompetence,
    activeCompetenceStorageKey,
    evaluations,
    instruments,
    evidence,
    improvementPlan,
    raResults,
    activeRaResults,
    completionPercentage,
  };
}
