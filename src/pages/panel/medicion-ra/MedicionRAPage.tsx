import { useEffect, useMemo, useState } from "react";
import { GoCheckCircle, GoClock } from "react-icons/go";
import { PanelLayout } from "../../../components/panel";
import { Badge, Button, ConfirmDialog } from "../../../components/ui";
import CompetenceStepper from "./components/CompetenceStepper";
import CourseSelector from "./components/CourseSelector";
import EvaluationInstructions from "./components/EvaluationInstructions";
import EvidenceImprovementSection from "./components/EvidenceImprovementSection";
import InstrumentSection from "./components/InstrumentSection";
import RaResultsCharts from "./components/RaResultsCharts";
import StudentsEvaluationTable from "./components/StudentsEvaluationTable";
import ValidationBanner from "./components/ValidationBanner";
import {
  mockCourses,
  mockInitialEvaluations,
  mockInitialInstruments,
} from "./medicion-ra.mock";
import {
  calculateRaResults,
  getCompetenceStorageKey,
  getCompletionPercentage,
  normalizeEvaluationMatrix,
  normalizeInstrumentState,
  validateBeforeClosing,
  validateCourseBeforeFinalizing,
} from "./medicion-ra.utils";
import type {
  Competence,
  EvaluationMatrix,
  EvidenceState,
  ImprovementPlanState,
  InstrumentByRa,
  PerformanceLevel,
  ValidationFeedback,
} from "./medicion-ra.types";

const emptyEvidence: EvidenceState = {
  fileName: "",
  link: "",
};

const emptyImprovementPlan: ImprovementPlanState = {
  analysis: "",
  actions: "",
};

const LOCKED_TOOLTIP =
  "Esta información ya fue guardada y bloqueada. No puedes modificarla después de finalizar la evaluación.";

export default function MedicionRAPage() {
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

  const [completedCompetenceIds, setCompletedCompetenceIds] = useState<string[]>([]);
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
    const totalCells = selectedCourse.students.length * activeCompetence.learningResults.length;
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
        active: evaluationsCompleted && instrumentsCompleted && !evidenceCompleted,
      },
    ];

    if (evaluationsCompleted && instrumentsCompleted && evidenceCompleted) {
      return steps.map((step) => ({ ...step, active: false }));
    }

    return steps;
  }, [activeCompetence.learningResults, evaluations, evidence.fileName, instruments, selectedCourse.students]);

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
      const nextCompetence = selectedCourse.competences[activeCompetenceIndex + 1];
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
    setCompletedCompetenceIds(selectedCourse.competences.map((competence) => competence.id));
    setIsEvaluationLocked(true);
    setShowFinishModal(false);
    setFeedback({
      type: "success",
      title: "Evaluación finalizada",
      message:
        "La evaluación quedó guardada y bloqueada. Ya no es posible modificar la información registrada.",
    });
  };

  const pageActions = (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="accent" className="px-4 py-2">
        Rol docente
      </Badge>

      <Badge
        variant={completionPercentage === 100 ? "success" : "warning"}
        className="px-4 py-2"
      >
        Avance {completionPercentage}%
      </Badge>

      {isEvaluationLocked ? (
        <Badge variant="success" className="px-4 py-2">
          Evaluación bloqueada
        </Badge>
      ) : null}
    </div>
  );

  return (
    <PanelLayout
      currentStep="medicion-ra"
      title="Medición RA"
      description="Panel docente para calificar Resultados de Aprendizaje, definir instrumentos, cargar evidencias, analizar porcentajes y registrar planes de mejora por competencia."
      actions={pageActions}
    >
      <div className="space-y-6 pb-24">
        <CourseSelector
          courses={mockCourses}
          selectedCourseId={selectedCourseId}
          completionPercentage={completionPercentage}
          disabled={isEvaluationLocked}
          lockedTooltip={LOCKED_TOOLTIP}
          onCourseChange={handleCourseChange}
        />

        <CompetenceStepper
          competences={selectedCourse.competences}
          activeCompetenceId={activeCompetence.id}
          completedCompetenceIds={completedCompetenceIds}
          subProgressSteps={subProgressSteps}
          onChange={setActiveCompetenceId}
        />

        <EvaluationInstructions />

        <InstrumentSection
          activeCompetence={activeCompetence}
          instruments={instruments}
          disabled={isEvaluationLocked}
          lockedTooltip={LOCKED_TOOLTIP}
          onDescriptionChange={handleInstrumentDescriptionChange}
        />

        <StudentsEvaluationTable
          activeCompetence={activeCompetence}
          students={selectedCourse.students}
          evaluations={evaluations}
          disabled={isEvaluationLocked}
          lockedTooltip={LOCKED_TOOLTIP}
          onLevelChange={handleLevelChange}
        />

        <RaResultsCharts
          results={activeRaResults}
          activeCompetenceCode={activeCompetence.code}
        />

        <EvidenceImprovementSection
          activeCompetence={activeCompetence}
          evidence={evidence}
          improvementPlan={improvementPlan}
          results={activeRaResults}
          disabled={isEvaluationLocked}
          lockedTooltip={LOCKED_TOOLTIP}
          onEvidenceFileChange={(fileName) =>
            handleEvidenceChange({ fileName })
          }
          onEvidenceLinkChange={(link) => handleEvidenceChange({ link })}
          onImprovementPlanChange={handleImprovementPlanChange}
        />
      </div>

      <ValidationBanner
        feedback={feedback}
        onClose={() => setFeedback(null)}
      />

      <ConfirmDialog
        open={showFinishModal}
        title="¿Estás seguro de que deseas finalizar la evaluación?"
        description="Después de finalizarla, la información registrada quedará bloqueada y no podrás editar ni modificar las competencias evaluadas."
        confirmLabel="Sí, finalizar evaluación"
        variant="warning"
        onCancel={() => setShowFinishModal(false)}
        onConfirm={handleConfirmFinishEvaluation}
      />

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--color-gray-6)] bg-[var(--color-white)] px-6 py-4 shadow-[var(--shadow-lg)] xl:left-[320px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-3xl text-sm leading-6 text-[var(--color-gray-3)]">
            Guardar permite conservar avances parciales. Finalizar valida la
            competencia seleccionada: RA, instrumentos y evidencia obligatoria.
          </p>

          <div className="flex shrink-0 items-center gap-3">
            <Button
              variant="outline"
              leftIcon={<GoClock className="text-lg" />}
              onClick={handleSaveProgress}
              disabled={isEvaluationLocked}
              title={isEvaluationLocked ? LOCKED_TOOLTIP : undefined}
              className="min-w-[220px]"
            >
              Guardar progreso
            </Button>

            <Button
              variant="primary"
              leftIcon={<GoCheckCircle className="text-lg" />}
              onClick={handlePrimaryAction}
              disabled={isEvaluationLocked}
              title={isEvaluationLocked ? LOCKED_TOOLTIP : undefined}
              className="min-w-[240px]"
            >
              {isEvaluationLocked
                ? "Evaluación finalizada"
                : isLastCompetence
                  ? "Finalizar evaluación"
                  : "Siguiente competencia"}
            </Button>
          </div>
        </div>
      </div>

    </PanelLayout>
  );
}
