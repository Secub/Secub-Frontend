import { useEffect, useMemo, useState } from "react";
import {
  mockCourses,
  mockInitialEvaluations,
  mockInitialInstruments,
} from "../medicion-ra.mock";
import {
  calculateRaResults,
  getCompetenceStorageKey,
  getCompletionPercentage,
  normalizeEvaluationMatrix,
  normalizeInstrumentState,
  validateBeforeClosing,
  validateCourseBeforeFinalizing,
} from "../medicion-ra.utils";
import type {
  Competence,
  EvaluationMatrix,
  EvidenceState,
  ImprovementPlanState,
  InstrumentByRa,
  PerformanceLevel,
  ValidationFeedback,
} from "../medicion-ra.types";

const emptyEvidence: EvidenceState = {
  fileName: "",
  link: "",
};

const emptyImprovementPlan: ImprovementPlanState = {
  analysis: "",
  actions: "",
};

export const LOCKED_TOOLTIP =
  "Esta información ya fue guardada y bloqueada. No puedes modificarla después de finalizar la evaluación.";

export function useMedicionRA() {
  const [selectedCourseId, setSelectedCourseId] = useState(mockCourses[0].id);
  const [activeCompetenceId, setActiveCompetenceId] = useState(
    mockCourses[0].competences[0]?.id ?? "",
  );

  const [evaluationsByCourse, setEvaluationsByCourse] = useState<
    Record<string, EvaluationMatrix>
  >(mockInitialEvaluations);

  const [instrumentsByCourse, setInstrumentsByCourse] = useState<
    Record<string, InstrumentByRa>
  >(mockInitialInstruments);

  const [evidenceByCompetence, setEvidenceByCompetence] = useState<
    Record<string, EvidenceState>
  >({});

  const [improvementByCompetence, setImprovementByCompetence] = useState<
    Record<string, ImprovementPlanState>
  >({});

  const [completedCompetenceIds, setCompletedCompetenceIds] = useState<
    string[]
  >([]);

  const [isEvaluationLocked, setIsEvaluationLocked] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [feedback, setFeedback] = useState<ValidationFeedback | null>(null);

  const selectedCourse = useMemo(() => {
    return (
      mockCourses.find((course) => course.id === selectedCourseId) ??
      mockCourses[0]
    );
  }, [selectedCourseId]);

  useEffect(() => {
    setActiveCompetenceId(selectedCourse.competences[0]?.id ?? "");
    setCompletedCompetenceIds([]);
    setIsEvaluationLocked(false);
    setShowFinishModal(false);
    setFeedback(null);
  }, [selectedCourse.id, selectedCourse.competences]);

  const activeCompetence = useMemo(() => {
    return (
      selectedCourse.competences.find(
        (competence) => competence.id === activeCompetenceId,
      ) ?? selectedCourse.competences[0]
    );
  }, [activeCompetenceId, selectedCourse.competences]);

  const activeCompetenceIndex = useMemo(() => {
    return Math.max(
      0,
      selectedCourse.competences.findIndex(
        (competence) => competence.id === activeCompetence.id,
      ),
    );
  }, [activeCompetence.id, selectedCourse.competences]);

  const isLastCompetence =
    activeCompetenceIndex === selectedCourse.competences.length - 1;

  const activeCompetenceStorageKey = useMemo(() => {
    return getCompetenceStorageKey(selectedCourse.id, activeCompetence.id);
  }, [activeCompetence.id, selectedCourse.id]);

  const evaluations = useMemo(() => {
    return normalizeEvaluationMatrix(
      selectedCourse,
      evaluationsByCourse[selectedCourse.id],
    );
  }, [evaluationsByCourse, selectedCourse]);

  const instruments = useMemo(() => {
    return normalizeInstrumentState(
      selectedCourse,
      instrumentsByCourse[selectedCourse.id],
    );
  }, [instrumentsByCourse, selectedCourse]);

  const evidence =
    evidenceByCompetence[activeCompetenceStorageKey] ?? emptyEvidence;

  const improvementPlan =
    improvementByCompetence[activeCompetenceStorageKey] ?? emptyImprovementPlan;

  const raResults = useMemo(() => {
    return calculateRaResults(selectedCourse, evaluations);
  }, [evaluations, selectedCourse]);

  const activeRaResults = useMemo(() => {
    const activeRaIds = new Set(
      activeCompetence.learningResults.map((ra) => ra.id),
    );

    return raResults.filter((result) => activeRaIds.has(result.raId));
  }, [activeCompetence, raResults]);

  const completionPercentage = useMemo(() => {
    return getCompletionPercentage(selectedCourse, evaluations);
  }, [evaluations, selectedCourse]);

  const subProgressSteps = useMemo(() => {
    const totalCells =
      selectedCourse.students.length * activeCompetence.learningResults.length;

    const completedCells = selectedCourse.students.reduce((total, student) => {
      const completedByStudent = activeCompetence.learningResults.filter((ra) =>
        Boolean(evaluations[student.id]?.[ra.id]),
      ).length;

      return total + completedByStudent;
    }, 0);

    const evaluationsCompleted = totalCells > 0 && completedCells === totalCells;

    const instrumentsCompleted = activeCompetence.learningResults.every((ra) =>
      Boolean(instruments[ra.id]?.description?.trim()),
    );

    const evidenceCompleted = Boolean(evidence.fileName);

    const steps = [
      {
        id: "evaluations",
        label: "Calificaciones",
        completed: evaluationsCompleted,
        active: !evaluationsCompleted,
      },
      {
        id: "instruments",
        label: "Instrumentos",
        completed: instrumentsCompleted,
        active: evaluationsCompleted && !instrumentsCompleted,
      },
      {
        id: "evidence",
        label: "Evidencia",
        completed: evidenceCompleted,
        active:
          evaluationsCompleted && instrumentsCompleted && !evidenceCompleted,
      },
    ];

    if (evaluationsCompleted && instrumentsCompleted && evidenceCompleted) {
      return steps.map((step) => ({ ...step, active: false }));
    }

    return steps;
  }, [
    activeCompetence.learningResults,
    evaluations,
    evidence.fileName,
    instruments,
    selectedCourse.students,
  ]);

  const getEvidenceFileNameByCompetence = (competence: Competence) => {
    const key = getCompetenceStorageKey(selectedCourse.id, competence.id);
    return evidenceByCompetence[key]?.fileName ?? "";
  };

  const validateCurrentCompetence = () => {
    return validateBeforeClosing({
      course: selectedCourse,
      activeCompetence,
      evaluations,
      instruments,
      evidenceFileName: evidence.fileName,
    });
  };

  const markActiveCompetenceAsCompleted = () => {
    setCompletedCompetenceIds((current) => {
      if (current.includes(activeCompetence.id)) return current;
      return [...current, activeCompetence.id];
    });
  };

  const handleCourseChange = (courseId: string) => {
    if (!courseId || isEvaluationLocked) return;

    setSelectedCourseId(courseId);
  };

  const handleCompetenceChange = (competenceId: string) => {
    setActiveCompetenceId(competenceId);
  };

  const handleLevelChange = (
    studentId: string,
    raId: string,
    level: PerformanceLevel,
  ) => {
    if (isEvaluationLocked) return;

    setEvaluationsByCourse((current) => {
      const currentCourseMatrix = normalizeEvaluationMatrix(
        selectedCourse,
        current[selectedCourse.id],
      );

      return {
        ...current,
        [selectedCourse.id]: {
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
    if (isEvaluationLocked) return;

    setInstrumentsByCourse((current) => {
      const currentCourseInstruments = normalizeInstrumentState(
        selectedCourse,
        current[selectedCourse.id],
      );

      return {
        ...current,
        [selectedCourse.id]: {
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
    if (isEvaluationLocked) return;

    setEvidenceByCompetence((current) => ({
      ...current,
      [activeCompetenceStorageKey]: {
        ...(current[activeCompetenceStorageKey] ?? emptyEvidence),
        ...nextEvidence,
      },
    }));

    setFeedback(null);
  };

  const handleImprovementPlanChange = (
    key: keyof ImprovementPlanState,
    value: string,
  ) => {
    if (isEvaluationLocked) return;

    setImprovementByCompetence((current) => ({
      ...current,
      [activeCompetenceStorageKey]: {
        ...(current[activeCompetenceStorageKey] ?? emptyImprovementPlan),
        [key]: value,
      },
    }));

    setFeedback(null);
  };

  const handleSaveProgress = () => {
    if (isEvaluationLocked) return;

    const result = validateCurrentCompetence();

    if (result.type === "error") {
      setFeedback(result);
      return;
    }

    markActiveCompetenceAsCompleted();

    setFeedback({
      type: "info",
      title: "Progreso guardado",
      message:
        "La información de la competencia seleccionada quedó conservada correctamente en la pantalla. Cuando exista backend, esta acción enviará el avance parcial al servicio correspondiente.",
    });
  };

  const handlePrimaryAction = () => {
    if (isEvaluationLocked) return;

    const result = validateCurrentCompetence();

    if (result.type === "error") {
      setFeedback(result);
      return;
    }

    markActiveCompetenceAsCompleted();

    if (!isLastCompetence) {
      const nextCompetence =
        selectedCourse.competences[activeCompetenceIndex + 1];

      setActiveCompetenceId(nextCompetence.id);

      setFeedback({
        type: "success",
        title: "Competencia guardada",
        message:
          "El progreso de la competencia actual quedó guardado. Continúa con la siguiente competencia.",
      });

      return;
    }

    const courseValidation = validateCourseBeforeFinalizing({
      course: selectedCourse,
      evaluations,
      instruments,
      getEvidenceFileName: getEvidenceFileNameByCompetence,
    });

    if (courseValidation.type === "error") {
      setFeedback(courseValidation);
      return;
    }

    setShowFinishModal(true);
  };

  const handleConfirmFinishEvaluation = () => {
    setCompletedCompetenceIds(
      selectedCourse.competences.map((competence) => competence.id),
    );

    setIsEvaluationLocked(true);
    setShowFinishModal(false);

    setFeedback({
      type: "success",
      title: "Evaluación finalizada",
      message:
        "La evaluación quedó guardada y bloqueada. Ya no es posible modificar la información registrada.",
    });
  };

  const handleCancelFinishEvaluation = () => {
    setShowFinishModal(false);
  };

  const handleCloseFeedback = () => {
    setFeedback(null);
  };

  return {
    selectedCourse,
    activeCompetence,
    activeRaResults,
    completionPercentage,
    subProgressSteps,
    completedCompetenceIds,
    evidence,
    improvementPlan,
    evaluations,
    instruments,
    feedback,
    showFinishModal,
    isEvaluationLocked,
    isLastCompetence,
    handleCourseChange,
    handleCompetenceChange,
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