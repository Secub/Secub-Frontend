import { FlowActionBar, PanelLayout, WorkflowStateCard } from "../../../components/panel";
import { ConfirmDialog } from "../../../components/ui";
import { getCurrentMockUser } from "../../../services/auth/mockUser";
import CompetenceStepper from "./components/CompetenceStepper";
import CourseSelector from "./components/CourseSelector";
import EvaluationInstructions from "./components/EvaluationInstructions";
import EvidenceImprovementSection from "./components/EvidenceImprovementSection";
import InstrumentSection from "./components/InstrumentSection";
import RaResultsCharts from "./components/RaResultsCharts";
import StudentsEvaluationTable from "./components/StudentsEvaluationTable";
import ValidationBanner from "./components/ValidationBanner";
import { LOCKED_TOOLTIP, useMedicionRA } from "./hooks/useMedicionRA";

function MedicionRAAccessRestricted() {
  return (
    <PanelLayout
      currentStep="medicion-ra"
      title="Medición RA"
      description="Registro y seguimiento de Resultados de Aprendizaje."
    >
      <WorkflowStateCard
        variant="locked"
        title="Módulo no disponible"
        description="Regresa al Estado del ciclo para continuar."
      />
    </PanelLayout>
  );
}

export default function MedicionRAPage() {
  const currentUser = getCurrentMockUser();

  if (currentUser.role !== "docente") {
    return <MedicionRAAccessRestricted />;
  }

  return <MedicionRAContent />;
}

function MedicionRAContent() {
  const {
    availableCourses,
    selectedCourse,
    activeCompetence,
    activeRaResults,
    subProgressSteps,
    completedCompetenceIds,
    evidence,
    improvementPlan,
    evaluations,
    instruments,
    feedback,
    showFinishModal,
    isSelectedCourseLocked,
    courseSummaries,
    isSelectedCourseComplete,
    hasNextPendingCourse,
    showValidationErrors,
    competenceContentRef,
    handleCourseChange,
    handleCompetenceChange,
    handleLevelChange,
    handleInstrumentDescriptionChange,
    handleEvidenceChange,
    handleImprovementPlanChange,
    handleSaveProgress,
    handleNextCourse,
    handleRequestFinishEvaluation,
    handleConfirmFinishEvaluation,
    handleCancelFinishEvaluation,
    handleCloseFeedback,
    hasAvailableCourses,
  } = useMedicionRA();

  if (!hasAvailableCourses) {
    return (
      <PanelLayout
        currentStep="medicion-ra"
        title="Medición RA"
        description="Registro y seguimiento de Resultados de Aprendizaje asignados."
      >
        <WorkflowStateCard
          variant="locked"
          title="No tienes cursos asignados para medir"
          description="Los cursos con Resultados de Aprendizaje asignados aparecerán aquí cuando estén disponibles."
        />
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      currentStep="medicion-ra"
      title="Medición RA"
      description="Calificación de Resultados de Aprendizaje, instrumentos, evidencias y planes de mejora por competencia."
    >
      <div className="space-y-6 pb-24">
        <CourseSelector
          courses={availableCourses}
          selectedCourseId={selectedCourse.id}
          courseSummaries={courseSummaries}
          onCourseChange={handleCourseChange}
        />

        <CompetenceStepper
          competences={selectedCourse.competences}
          activeCompetenceId={activeCompetence.id}
          completedCompetenceIds={completedCompetenceIds}
          subProgressSteps={subProgressSteps}
          onChange={handleCompetenceChange}
        />

        <div
          ref={competenceContentRef}
          data-medicion-competence-start
          className="scroll-mt-6 space-y-6"
        >
          <EvaluationInstructions />

          <InstrumentSection
            activeCompetence={activeCompetence}
            instruments={instruments}
            disabled={isSelectedCourseLocked}
            lockedTooltip={LOCKED_TOOLTIP}
            showValidationErrors={showValidationErrors}
            onDescriptionChange={handleInstrumentDescriptionChange}
          />

          <StudentsEvaluationTable
            activeCompetence={activeCompetence}
            students={selectedCourse.students}
            evaluations={evaluations}
            disabled={isSelectedCourseLocked}
            lockedTooltip={LOCKED_TOOLTIP}
            showValidationErrors={showValidationErrors}
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
            disabled={isSelectedCourseLocked}
            lockedTooltip={LOCKED_TOOLTIP}
            showValidationErrors={showValidationErrors}
            onEvidenceFileChange={(fileName) =>
              handleEvidenceChange({ fileName })
            }
            onEvidenceLinkChange={(link) => handleEvidenceChange({ link })}
            onImprovementPlanChange={handleImprovementPlanChange}
          />
        </div>
      </div>

      <ValidationBanner feedback={feedback} onClose={handleCloseFeedback} />

      <ConfirmDialog
        open={showFinishModal}
        title="¿Deseas finalizar la medición?"
        description="Una vez finalizada, se guardará el estado de la medición del curso correspondiente."
        confirmLabel="Finalizar"
        variant="warning"
        onCancel={handleCancelFinishEvaluation}
        onConfirm={handleConfirmFinishEvaluation}
      />

      <FlowActionBar
        description="Guardar conserva avances parciales del curso actual. Siguiente curso aparece cuando la medición del curso está completa y queda otro curso pendiente. Finalizar cierra la medición del último curso pendiente."
        showSaveProgress={!isSelectedCourseLocked}
        onSaveProgress={handleSaveProgress}
        saveDisabled={isSelectedCourseLocked}
        saveTitle={isSelectedCourseLocked ? LOCKED_TOOLTIP : undefined}
        showNext={hasNextPendingCourse && isSelectedCourseComplete}
        nextLabel="Siguiente curso"
        onNext={handleNextCourse}
        nextTitle="Guardar y continuar con el siguiente curso pendiente"
        showFinish={!hasNextPendingCourse}
        finishLabel={isSelectedCourseLocked ? "Medición finalizada" : "Finalizar"}
        finishDisabled={isSelectedCourseLocked}
        finishTitle={isSelectedCourseLocked ? LOCKED_TOOLTIP : undefined}
        onFinish={handleRequestFinishEvaluation}
      />
    </PanelLayout>
  );
}