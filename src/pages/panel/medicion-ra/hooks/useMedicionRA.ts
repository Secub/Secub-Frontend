import { useCallback, useEffect, useMemo, useState } from "react";
import { LOCKED_TOOLTIP } from "../constants/medicionRA.constants";
import type { CourseMeasurementSummary, ValidationFeedback } from "../medicion-ra.types";
import { getCourseMeasurementSummary } from "../medicion-ra.utils";
import { useMedicionRAActions } from "./useMedicionRAActions";
import { useMedicionRAAutoScroll } from "./useMedicionRAAutoScroll";
import { useMedicionRAComputedState } from "./useMedicionRAComputedState";
import { useMedicionRAData } from "./useMedicionRAData";
import { useMedicionRAHydration } from "./useMedicionRAHydration";
import { useMedicionRAPersistence } from "./useMedicionRAPersistence";
import { useMedicionRASelection } from "./useMedicionRASelection";
import { useMedicionRASubProgress } from "./useMedicionRASubProgress";
import { useMedicionRAValidation } from "./useMedicionRAValidation";
import { useCompetenceCompletionAlert } from "./useCompetenceCompletionAlert";

export { LOCKED_TOOLTIP };

export function useMedicionRA() {
  const {
    currentUser,
    availableCourses,
    measurementsByCourse,
    hasAvailableCourses,
    initialCourseId,
    initialPersistedState,
    updateMeasurementCache,
    isLoading,
    loadError,
  } = useMedicionRAData();

  const normalizedInitialPersistedState = initialPersistedState ?? undefined;

  const selection = useMedicionRASelection({
    availableCourses,
    initialCourseId,
    initialPersistedState: normalizedInitialPersistedState,
  });

  const [feedback, setFeedback] = useState<ValidationFeedback | null>(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const computedDraft = useMedicionRAComputedState({
    userId: currentUser.id,
    availableCourses,
    selectedCourseId: selection.selectedCourseId,
    activeCompetenceId: selection.activeCompetenceId,
    evaluationsByCourse: initialPersistedState?.evaluationsByCourse ?? {},
    instrumentsByCourse: initialPersistedState?.instrumentsByCourse ?? {},
    evidenceByCompetence: initialPersistedState?.evidenceByCompetence ?? {},
    improvementByCompetence: initialPersistedState?.improvementByCompetence ?? {},
  });

  const persistedState = measurementsByCourse[
    `${computedDraft.selectedCourse.cycleId}::${computedDraft.selectedCourse.id}`
  ];

  const normalizedPersistedState = persistedState ?? undefined;

  const hydrated = useMedicionRAHydration({
    availableCourses,
    selectedCourseId: selection.selectedCourseId,
    selectedCourse: computedDraft.selectedCourse,
    persistedState: normalizedPersistedState,
    courseMeasurementStateId: computedDraft.courseMeasurementStateId,
    initialPersistedState: normalizedInitialPersistedState,
    setSelectedCourseId: selection.setSelectedCourseId,
    setActiveCompetenceId: selection.setActiveCompetenceId,
  });

  const computed = useMedicionRAComputedState({
    userId: currentUser.id,
    availableCourses,
    selectedCourseId: selection.selectedCourseId,
    activeCompetenceId: selection.activeCompetenceId,
    evaluationsByCourse: hydrated.evaluationsByCourse,
    instrumentsByCourse: hydrated.instrumentsByCourse,
    evidenceByCompetence: hydrated.evidenceByCompetence,
    improvementByCompetence: hydrated.improvementByCompetence,
  });

  const { competenceContentRef, pendingAutoScrollCompetenceIdRef } = useMedicionRAAutoScroll(
    computed.activeCompetence.id,
  );

  const subProgressSteps = useMedicionRASubProgress({
    activeCompetence: computed.activeCompetence,
    course: computed.selectedCourse,
    evaluations: computed.evaluations,
    evidence: computed.evidence,
    instruments: computed.instruments,
  });
  const activeCompetenceComplete =
    subProgressSteps.length > 0 && subProgressSteps.every((step) => step.completed);
  const setCompletedCompetenceIds = hydrated.setCompletedCompetenceIds;
  const markCompletedCompetence = useCallback((competenceId: string) => {
    setCompletedCompetenceIds((current) =>
      current.includes(competenceId)
        ? current
        : [...current, competenceId],
    );
  }, [setCompletedCompetenceIds]);

  useCompetenceCompletionAlert({
    courseId: computed.selectedCourse.id,
    competenceId: computed.activeCompetence.id,
    isComplete: activeCompetenceComplete,
    isReady: hydrated.hydratedStateId === computed.courseMeasurementStateId,
    isLocked: hydrated.isSelectedCourseLocked,
    onCompleted: markCompletedCompetence,
  });

  useEffect(() => {
    setShowFinishModal(false);
    setFeedback(null);
    setShowValidationErrors(false);
  }, [computed.selectedCourse.id]);

  const { persistSelectedCourse } = useMedicionRAPersistence({
    activeCompetenceId: selection.activeCompetenceId,
    completedCompetenceIds: hydrated.completedCompetenceIds,
    currentUser,
    evaluationsByCourse: hydrated.evaluationsByCourse,
    evidenceByCompetence: hydrated.evidenceByCompetence,
    hydratedStateId: hydrated.hydratedStateId,
    improvementByCompetence: hydrated.improvementByCompetence,
    instrumentsByCourse: hydrated.instrumentsByCourse,
    isSelectedCourseLocked: hydrated.isSelectedCourseLocked,
    medicionRaContext: computed.medicionRaContext,
    courseMeasurementStateId: computed.courseMeasurementStateId,
    selectedCourse: computed.selectedCourse,
    selectedCourseId: selection.selectedCourseId,
    onPersisted: updateMeasurementCache,
  });

  const validation = useMedicionRAValidation({
    activeCompetence: computed.activeCompetence,
    course: computed.selectedCourse,
    evaluations: computed.evaluations,
    evidence: computed.evidence,
    evidenceByCompetence: hydrated.evidenceByCompetence,
    instruments: computed.instruments,
    setActiveCompetenceId: selection.setActiveCompetenceId,
    setFeedback,
    setShowValidationErrors,
  });

  const courseSummaries: CourseMeasurementSummary[] = availableCourses.map((course) => {
      if (course.id === computed.selectedCourse.id) {
        return getCourseMeasurementSummary({
          course,
          evaluations: hydrated.evaluationsByCourse[course.id],
          instruments: hydrated.instrumentsByCourse[course.id],
          evidenceByCompetence: hydrated.evidenceByCompetence,
          isLocked: hydrated.isSelectedCourseLocked,
        });
      }

      const courseState = measurementsByCourse[`${course.cycleId}::${course.id}`];

      return getCourseMeasurementSummary({
        course,
        evaluations: courseState?.evaluationsByCourse?.[course.id],
        instruments: courseState?.instrumentsByCourse?.[course.id],
        evidenceByCompetence: courseState?.evidenceByCompetence ?? {},
        isLocked: courseState?.isEvaluationLocked ?? false,
      });
    });

  const selectedCourseSummary = courseSummaries.find(
    (summary) => summary.courseId === computed.selectedCourse.id,
  );
  const isSelectedCourseComplete = selectedCourseSummary?.status === "completed";
  const nextPendingCourse = useMemo(() => {
    if (!availableCourses.length) return undefined;

    const selectedCourseIndex = Math.max(
      0,
      availableCourses.findIndex((course) => course.id === computed.selectedCourse.id),
    );
    const orderedCourses = [
      ...availableCourses.slice(selectedCourseIndex + 1),
      ...availableCourses.slice(0, selectedCourseIndex),
    ];

    return orderedCourses.find((course) => {
      const summary = courseSummaries.find((item) => item.courseId === course.id);
      return summary?.status !== "completed";
    });
  }, [availableCourses, computed.selectedCourse.id, courseSummaries]);

  const actions = useMedicionRAActions({
    activeCompetenceId: computed.activeCompetence.id,
    activeCompetenceIndex: computed.activeCompetenceIndex,
    activeCompetenceStorageKey: computed.activeCompetenceStorageKey,
    course: computed.selectedCourse,
    isLastCompetence: computed.isLastCompetence,
    isSelectedCourseLocked: hydrated.isSelectedCourseLocked,
    pendingAutoScrollCompetenceIdRef,
    persistSelectedCourse,
    setActiveCompetenceId: selection.setActiveCompetenceId,
    setCompletedCompetenceIds: hydrated.setCompletedCompetenceIds,
    setEvaluationsByCourse: hydrated.setEvaluationsByCourse,
    setEvidenceByCompetence: hydrated.setEvidenceByCompetence,
    setFeedback,
    setImprovementByCompetence: hydrated.setImprovementByCompetence,
    setInstrumentsByCourse: hydrated.setInstrumentsByCourse,
    setIsSelectedCourseLocked: hydrated.setIsSelectedCourseLocked,
    setShowFinishModal,
    setShowValidationErrors,
    validateCurrentCompetence: validation.validateCurrentCompetence,
    validateSelectedCourseBeforeFinalizing: validation.validateSelectedCourseBeforeFinalizing,
    handleValidationError: validation.handleValidationError,
  });

  return {
    availableCourses,
    selectedCourse: computed.selectedCourse,
    activeCompetence: computed.activeCompetence,
    activeRaResults: computed.activeRaResults,
    completionPercentage: computed.completionPercentage,
    courseSummaries,
    isSelectedCourseComplete,
    nextPendingCourseId: nextPendingCourse?.id ?? "",
    hasNextPendingCourse: Boolean(nextPendingCourse),
    subProgressSteps,
    completedCompetenceIds: hydrated.completedCompetenceIds,
    evidence: computed.evidence,
    improvementPlan: computed.improvementPlan,
    evaluations: computed.evaluations,
    instruments: computed.instruments,
    feedback,
    showFinishModal,
    isSelectedCourseLocked: hydrated.isSelectedCourseLocked,
    isLastCompetence: computed.isLastCompetence,
    showValidationErrors,
    competenceContentRef,
    handleCourseChange: selection.handleCourseChange,
    handleCompetenceChange: selection.handleCompetenceChange,
    hasAvailableCourses,
    isLoading,
    loadError,
    ...actions,
  };
}
