import { PanelLayout } from "../../../components/panel";
import { ConfirmDialog } from "../../../components/ui";
import CompetenceStepper from "./components/CompetenceStepper";
import CourseSelector from "./components/CourseSelector";
import EvaluationInstructions from "./components/EvaluationInstructions";
import EvidenceImprovementSection from "./components/EvidenceImprovementSection";
import InstrumentSection from "./components/InstrumentSection";
import MedicionRAFooter from "./components/MedicionRAFooter";
import RaResultsCharts from "./components/RaResultsCharts";
import StudentsEvaluationTable from "./components/StudentsEvaluationTable";
import ValidationBanner from "./components/ValidationBanner";
import { LOCKED_TOOLTIP, useMedicionRA } from "./hooks/useMedicionRA";

export default function MedicionRAPage() {
  const {
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
  } = useMedicionRA();

  return (
    <PanelLayout
      currentStep="medicion-ra"
      title="Medición RA"
      description="Panel docente para calificar Resultados de Aprendizaje, definir instrumentos, cargar evidencias, analizar porcentajes y registrar planes de mejora por competencia."
    >
      <div className="space-y-6 pb-24">
        <CourseSelector
          courses={selectedCourse ? [selectedCourse] : []}
          selectedCourseId={selectedCourse.id}
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
          onChange={handleCompetenceChange}
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

      <ValidationBanner feedback={feedback} onClose={handleCloseFeedback} />

      <ConfirmDialog
        open={showFinishModal}
        title="¿Estás seguro de que deseas finalizar la evaluación?"
        description="Después de finalizarla, la información registrada quedará bloqueada y no podrás editar ni modificar las competencias evaluadas."
        confirmLabel="Sí, finalizar evaluación"
        variant="warning"
        onCancel={handleCancelFinishEvaluation}
        onConfirm={handleConfirmFinishEvaluation}
      />

      <MedicionRAFooter
        isEvaluationLocked={isEvaluationLocked}
        isLastCompetence={isLastCompetence}
        onSaveProgress={handleSaveProgress}
        onPrimaryAction={handlePrimaryAction}
      />
    </PanelLayout>
  );
}