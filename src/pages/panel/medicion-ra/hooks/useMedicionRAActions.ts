import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { EMPTY_EVIDENCE, EMPTY_IMPROVEMENT_PLAN } from "../constants/medicionRA.constants";
import { normalizeEvaluationMatrix, normalizeInstrumentState } from "../medicion-ra.utils";
import type {
  CourseRecord,
  EvaluationMatrix,
  EvidenceState,
  ImprovementPlanState,
  InstrumentByRa,
  PerformanceLevel,
  ValidationFeedback,
} from "../medicion-ra.types";

export function useMedicionRAActions({
  activeCompetenceId,
  activeCompetenceIndex,
  activeCompetenceStorageKey,
  course,
  isLastCompetence,
  isSelectedCourseLocked,
  nextPendingCourse,
  pendingAutoScrollCompetenceIdRef,
  setActiveCompetenceId,
  setSelectedCourseId,
  setCompletedCompetenceIds,
  setEvaluationsByCourse,
  setEvidenceByCompetence,
  setFeedback,
  setImprovementByCompetence,
  setInstrumentsByCourse,
  setIsSelectedCourseLocked,
  setShowFinishModal,
  setShowValidationErrors,
  validateCurrentCompetence,
  validateSelectedCourseBeforeFinalizing,
  handleValidationError,
}: {
  activeCompetenceId: string;
  activeCompetenceIndex: number;
  activeCompetenceStorageKey: string;
  course: CourseRecord;
  isLastCompetence: boolean;
  isSelectedCourseLocked: boolean;
  nextPendingCourse?: CourseRecord;
  pendingAutoScrollCompetenceIdRef: MutableRefObject<string | null>;
  setActiveCompetenceId: (competenceId: string) => void;
  setSelectedCourseId: (courseId: string) => void;
  setCompletedCompetenceIds: Dispatch<SetStateAction<string[]>>;
  setEvaluationsByCourse: Dispatch<SetStateAction<Record<string, EvaluationMatrix>>>;
  setEvidenceByCompetence: Dispatch<SetStateAction<Record<string, EvidenceState>>>;
  setFeedback: (feedback: ValidationFeedback | null) => void;
  setImprovementByCompetence: Dispatch<SetStateAction<Record<string, ImprovementPlanState>>>;
  setInstrumentsByCourse: Dispatch<SetStateAction<Record<string, InstrumentByRa>>>;
  setIsSelectedCourseLocked: (locked: boolean) => void;
  setShowFinishModal: (show: boolean) => void;
  setShowValidationErrors: (show: boolean) => void;
  validateCurrentCompetence: () => ValidationFeedback;
  validateSelectedCourseBeforeFinalizing: () => ValidationFeedback;
  handleValidationError: (result: ValidationFeedback) => void;
}) {
  const markActiveCompetenceAsCompleted = () => {
    setCompletedCompetenceIds((current) => {
      if (current.includes(activeCompetenceId)) return current;
      return [...current, activeCompetenceId];
    });
  };

  const handleLevelChange = (studentId: string, raId: string, level: PerformanceLevel) => {
    if (isSelectedCourseLocked) return;

    setEvaluationsByCourse((current) => {
      const currentCourseMatrix = normalizeEvaluationMatrix(course, current[course.id]);

      return {
        ...current,
        [course.id]: {
          ...currentCourseMatrix,
          [studentId]: {
            ...currentCourseMatrix[studentId],
            [raId]: level,
          },
        },
      };
    });

    setFeedback(null);
  };

  const handleInstrumentDescriptionChange = (raId: string, value: string) => {
    if (isSelectedCourseLocked) return;

    setInstrumentsByCourse((current) => {
      const currentCourseInstruments = normalizeInstrumentState(course, current[course.id]);

      return {
        ...current,
        [course.id]: {
          ...currentCourseInstruments,
          [raId]: {
            ...currentCourseInstruments[raId],
            description: value,
          },
        },
      };
    });

    setFeedback(null);
  };

  const handleEvidenceChange = (nextEvidence: Partial<EvidenceState>) => {
    if (isSelectedCourseLocked) return;

    setEvidenceByCompetence((current) => ({
      ...current,
      [activeCompetenceStorageKey]: {
        ...(current[activeCompetenceStorageKey] ?? EMPTY_EVIDENCE),
        ...nextEvidence,
      },
    }));

    setFeedback(null);
  };

  const handleImprovementPlanChange = (key: keyof ImprovementPlanState, value: string) => {
    if (isSelectedCourseLocked) return;

    setImprovementByCompetence((current) => ({
      ...current,
      [activeCompetenceStorageKey]: {
        ...(current[activeCompetenceStorageKey] ?? EMPTY_IMPROVEMENT_PLAN),
        [key]: value,
      },
    }));

    setFeedback(null);
  };

  const handleSaveProgress = () => {
    if (isSelectedCourseLocked) return;

    setShowValidationErrors(false);

    setFeedback({
      type: "info",
      title: "Progreso guardado",
      message:
        "El avance parcial del curso actual quedó guardado localmente sin exigir completar toda la competencia, avanzar ni finalizar la medición.",
    });
  };

  const validateCourseBeforeCourseFlowAction = () => {
    const courseValidation = validateSelectedCourseBeforeFinalizing();

    if (courseValidation.type === "error") {
      handleValidationError(courseValidation);
      return false;
    }

    setShowValidationErrors(false);
    setCompletedCompetenceIds(course.competences.map((competence) => competence.id));
    return true;
  };

  const handlePrimaryAction = () => {
    if (isSelectedCourseLocked) return;

    const result = validateCurrentCompetence();

    if (result.type === "error") {
      handleValidationError(result);
      return;
    }

    setShowValidationErrors(false);
    markActiveCompetenceAsCompleted();

    if (!isLastCompetence) {
      const nextCompetence = course.competences[activeCompetenceIndex + 1];

      pendingAutoScrollCompetenceIdRef.current = nextCompetence.id;
      setActiveCompetenceId(nextCompetence.id);

      setFeedback({
        type: "success",
        title: "Competencia guardada",
        message: "El progreso de la competencia actual quedó guardado. Continúa con la siguiente competencia.",
      });

      return;
    }

    if (!validateCourseBeforeCourseFlowAction()) return;

    setShowFinishModal(true);
  };

  const handleRequestFinishEvaluation = () => {
    if (isSelectedCourseLocked) return;
    if (!validateCourseBeforeCourseFlowAction()) return;

    setShowFinishModal(true);
  };

  const handleNextCourse = () => {
    if (!nextPendingCourse) return;

    if (!isSelectedCourseLocked && !validateCourseBeforeCourseFlowAction()) return;

    pendingAutoScrollCompetenceIdRef.current = nextPendingCourse.competences[0]?.id ?? null;
    setSelectedCourseId(nextPendingCourse.id);
    setActiveCompetenceId(nextPendingCourse.competences[0]?.id ?? "");

    setFeedback({
      type: "success",
      title: "Curso guardado",
      message: `La medición de ${course.name} quedó guardada. Continúa con ${nextPendingCourse.name}.`,
    });
  };

  const handleConfirmFinishEvaluation = () => {
    setCompletedCompetenceIds(course.competences.map((competence) => competence.id));
    setIsSelectedCourseLocked(true);
    setShowFinishModal(false);

    setFeedback({
      type: "success",
      title: "Evaluación finalizada",
      message:
        "La evaluación del curso seleccionado quedó guardada y bloqueada. Puedes cambiar a otro curso asignado desde el selector superior.",
    });
  };

  const handleCancelFinishEvaluation = () => {
    setShowFinishModal(false);
  };

  const handleCloseFeedback = () => {
    setFeedback(null);
  };

  return {
    handleLevelChange,
    handleInstrumentDescriptionChange,
    handleEvidenceChange,
    handleImprovementPlanChange,
    handleSaveProgress,
    handlePrimaryAction,
    handleRequestFinishEvaluation,
    handleNextCourse,
    handleConfirmFinishEvaluation,
    handleCancelFinishEvaluation,
    handleCloseFeedback,
  };
}
