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

interface PersistCourseMeasurementOptions {
  completedCompetenceIds?: string[];
  isEvaluationLocked?: boolean;
  completed?: boolean;
}

export function useMedicionRAActions({
  activeCompetenceId,
  activeCompetenceIndex,
  activeCompetenceStorageKey,
  course,
  isLastCompetence,
  isSelectedCourseLocked,
  pendingAutoScrollCompetenceIdRef,
  persistSelectedCourse,
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
  persistSelectedCourse: (options?: PersistCourseMeasurementOptions) => boolean;
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

    setShowValidationErrors(false);

    try {
      const didSave = persistSelectedCourse();

      if (!didSave) {
        setFeedback({
          type: "error",
          title: "No fue posible guardar",
          message: "Espera un momento y vuelve a intentar guardar el progreso del curso.",
        });
        return;
      }

      setFeedback({
        type: "success",
        title: "Progreso guardado",
        message: "El avance parcial del curso actual quedó guardado correctamente.",
      });
    } catch {
      setFeedback({
        type: "error",
        title: "No fue posible guardar",
        message: "Ocurrió un error al guardar el progreso del curso. Inténtalo nuevamente.",
      });
    }
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

  const handleConfirmFinishEvaluation = () => {
    if (isSelectedCourseLocked) return false;

    const completedIds = course.competences.map((competence) => competence.id);

    try {
      const didSave = persistSelectedCourse({
        completedCompetenceIds: completedIds,
        isEvaluationLocked: true,
        completed: true,
      });

      if (!didSave) {
        setShowFinishModal(false);
        setFeedback({
          type: "error",
          title: "No fue posible finalizar",
          message: "La medición no pudo guardarse. Inténtalo nuevamente antes de salir del curso.",
        });
        return false;
      }

      setCompletedCompetenceIds(completedIds);
      setIsSelectedCourseLocked(true);
      setShowFinishModal(false);

      setFeedback({
        type: "success",
        title: "Curso finalizado",
        message: "La medición del curso quedó guardada y finalizada correctamente.",
      });

      return true;
    } catch {
      setShowFinishModal(false);
      setFeedback({
        type: "error",
        title: "No fue posible finalizar",
        message: "Ocurrió un error al guardar la medición. Inténtalo nuevamente.",
      });
      return false;
    }
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
    handleConfirmFinishEvaluation,
    handleCancelFinishEvaluation,
    handleCloseFeedback,
  };
}
