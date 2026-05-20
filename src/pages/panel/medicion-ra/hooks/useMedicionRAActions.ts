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
  pendingAutoScrollCompetenceIdRef,
  setActiveCompetenceId,
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
  pendingAutoScrollCompetenceIdRef: MutableRefObject<string | null>;
  setActiveCompetenceId: (competenceId: string) => void;
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

    const result = validateCurrentCompetence();

    if (result.type === "error") {
      handleValidationError(result);
      return;
    }

    setShowValidationErrors(false);
    markActiveCompetenceAsCompleted();

    setFeedback({
      type: "info",
      title: "Progreso guardado",
      message:
        "La información de la competencia seleccionada quedó conservada correctamente en mockBackend. Cuando exista backend, esta acción enviará el avance parcial al servicio correspondiente.",
    });
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

    const courseValidation = validateSelectedCourseBeforeFinalizing();

    if (courseValidation.type === "error") {
      handleValidationError(courseValidation);
      return;
    }

    setShowValidationErrors(false);
    setShowFinishModal(true);
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
    handleConfirmFinishEvaluation,
    handleCancelFinishEvaluation,
    handleCloseFeedback,
  };
}
