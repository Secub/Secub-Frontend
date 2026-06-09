import { scrollToFirstValidationError } from "../../../../utils/validationScroll";
import {
  getCompetenceStorageKey,
  validateBeforeClosing,
  validateCourseBeforeFinalizing,
} from "../medicion-ra.utils";
import type {
  Competence,
  CourseRecord,
  EvaluationMatrix,
  EvidenceState,
  InstrumentByRa,
  ValidationFeedback,
} from "../medicion-ra.types";

export function useMedicionRAValidation({
  activeCompetence,
  course,
  evaluations,
  evidence,
  evidenceByCompetence,
  instruments,
  setActiveCompetenceId,
  setFeedback,
  setShowValidationErrors,
}: {
  activeCompetence: Competence;
  course: CourseRecord;
  evaluations: EvaluationMatrix;
  evidence: EvidenceState;
  evidenceByCompetence: Record<string, EvidenceState>;
  instruments: InstrumentByRa;
  setActiveCompetenceId: (competenceId: string) => void;
  setFeedback: (feedback: ValidationFeedback | null) => void;
  setShowValidationErrors: (show: boolean) => void;
}) {
  const getEvidenceFileNameByCompetence = (competence: Competence) => {
    const key = getCompetenceStorageKey(course.id, competence.id);
    return evidenceByCompetence[key]?.fileName ?? "";
  };

  const validateCurrentCompetence = () => {
    return validateBeforeClosing({
      course,
      activeCompetence,
      evaluations,
      instruments,
      evidenceFileName: evidence.fileName,
    });
  };

  const validateSelectedCourseBeforeFinalizing = () => {
    return validateCourseBeforeFinalizing({
      course,
      evaluations,
      instruments,
      getEvidenceFileName: getEvidenceFileNameByCompetence,
    });
  };

  const handleValidationError = (result: ValidationFeedback) => {
    setShowValidationErrors(true);
    setFeedback(result);

    if (result.firstErrorCompetenceId && result.firstErrorCompetenceId !== activeCompetence.id) {
      setActiveCompetenceId(result.firstErrorCompetenceId);
    }

    scrollToFirstValidationError({
      fieldOrder: result.firstErrorField ? [result.firstErrorField] : [],
      delay: 140,
    });
  };

  return {
    getEvidenceFileNameByCompetence,
    validateCurrentCompetence,
    validateSelectedCourseBeforeFinalizing,
    handleValidationError,
  };
}
