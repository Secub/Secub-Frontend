import { useEffect, useMemo, useState } from "react";
import { mockBackend } from "../../../../services/mockBackend";
import { LOCKED_TOOLTIP } from "../constants/medicionRA.constants";
import type { ValidationFeedback } from "../medicion-ra.types";
import type { MedicionRaDemoState } from "../types/medicionRA.persistence.types";
import { useMedicionRAActions } from "./useMedicionRAActions";
import { useMedicionRAAutoScroll } from "./useMedicionRAAutoScroll";
import { useMedicionRAComputedState } from "./useMedicionRAComputedState";
import { useMedicionRAData } from "./useMedicionRAData";
import { useMedicionRAHydration } from "./useMedicionRAHydration";
import { useMedicionRAPersistence } from "./useMedicionRAPersistence";
import { useMedicionRASelection } from "./useMedicionRASelection";
import { useMedicionRASubProgress } from "./useMedicionRASubProgress";
import { useMedicionRAValidation } from "./useMedicionRAValidation";

export { LOCKED_TOOLTIP };

export function useMedicionRA() {
  const {
    currentUser,
    backendVersion,
    ignoreNextBackendChangeRef,
    availableCourses,
    hasAvailableCourses,
    initialCourseId,
    initialPersistedDemoState,
  } = useMedicionRAData();

  const normalizedInitialPersistedDemoState = initialPersistedDemoState ?? undefined;

  const selection = useMedicionRASelection({
    availableCourses,
    initialCourseId,
    initialPersistedDemoState: normalizedInitialPersistedDemoState,
  });

  const [feedback, setFeedback] = useState<ValidationFeedback | null>(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const computedDraft = useMedicionRAComputedState({
    userId: currentUser.id,
    availableCourses,
    selectedCourseId: selection.selectedCourseId,
    activeCompetenceId: selection.activeCompetenceId,
    evaluationsByCourse: initialPersistedDemoState?.evaluationsByCourse ?? {},
    instrumentsByCourse: initialPersistedDemoState?.instrumentsByCourse ?? {},
    evidenceByCompetence: initialPersistedDemoState?.evidenceByCompetence ?? {},
    improvementByCompetence: initialPersistedDemoState?.improvementByCompetence ?? {},
  });

  const persistedDemoState = useMemo(
    () => mockBackend.getById<MedicionRaDemoState>("medicionesRa", computedDraft.medicionRaDemoStateId),
    [backendVersion, computedDraft.medicionRaDemoStateId],
  );

  const normalizedPersistedDemoState = persistedDemoState ?? undefined;

  const hydrated = useMedicionRAHydration({
    availableCourses,
    selectedCourseId: selection.selectedCourseId,
    selectedCourse: computedDraft.selectedCourse,
    persistedDemoState: normalizedPersistedDemoState,
    medicionRaDemoStateId: computedDraft.medicionRaDemoStateId,
    initialPersistedDemoState: normalizedInitialPersistedDemoState,
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

  useEffect(() => {
    setShowFinishModal(false);
    setFeedback(null);
    setShowValidationErrors(false);
  }, [computed.selectedCourse.id]);

  useMedicionRAPersistence({
    activeCompetenceId: selection.activeCompetenceId,
    completedCompetenceIds: hydrated.completedCompetenceIds,
    currentUser,
    evaluationsByCourse: hydrated.evaluationsByCourse,
    evidenceByCompetence: hydrated.evidenceByCompetence,
    hydratedStateId: hydrated.hydratedStateId,
    ignoreNextBackendChangeRef,
    improvementByCompetence: hydrated.improvementByCompetence,
    instrumentsByCourse: hydrated.instrumentsByCourse,
    isSelectedCourseLocked: hydrated.isSelectedCourseLocked,
    medicionRaContext: computed.medicionRaContext,
    medicionRaDemoStateId: computed.medicionRaDemoStateId,
    selectedCourse: computed.selectedCourse,
    selectedCourseId: selection.selectedCourseId,
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

  const actions = useMedicionRAActions({
    activeCompetenceId: computed.activeCompetence.id,
    activeCompetenceIndex: computed.activeCompetenceIndex,
    activeCompetenceStorageKey: computed.activeCompetenceStorageKey,
    course: computed.selectedCourse,
    isLastCompetence: computed.isLastCompetence,
    isSelectedCourseLocked: hydrated.isSelectedCourseLocked,
    pendingAutoScrollCompetenceIdRef,
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
    ...actions,
  };
}