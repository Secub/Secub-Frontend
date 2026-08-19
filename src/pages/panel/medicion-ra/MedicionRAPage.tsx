import { useEffect } from "react";
import { ROUTES, buildRouteWithSearch, navigateToRoute } from "../../../app/appRoutes";
import { FlowActionBar, PanelLayout, WorkflowStateCard } from "../../../components/panel";
import { ConfirmDialog } from "../../../components/ui";
import { getCurrentMockUser } from "../../../services/auth/mockUser";
import CompetenceStepper from "./components/CompetenceStepper";
import EvaluationInstructions from "./components/EvaluationInstructions";
import EvidenceImprovementSection from "./components/EvidenceImprovementSection";
import InstrumentSection from "./components/InstrumentSection";
import RaResultsCharts from "./components/RaResultsCharts";
import StudentsEvaluationTable from "./components/StudentsEvaluationTable";
import ValidationBanner from "./components/ValidationBanner";
import { LOCKED_TOOLTIP, useMedicionRA } from "./hooks/useMedicionRA";
import { buildCoursesFromRealAssignments, getSearchCourseId, getSearchCycleId } from "./utils/medicionRA.assignments";

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

  return <MedicionRAContextGate />;
}

function MedicionRAContextGate() {
  const currentUser = getCurrentMockUser();
  const availableCourses = buildCoursesFromRealAssignments(currentUser);
  const requestedCourseId = getSearchCourseId();
  const requestedCycleId = getSearchCycleId();
  const hasValidCourseContext = Boolean(
    requestedCourseId &&
      requestedCycleId &&
      availableCourses.some(
        (course) => course.id === requestedCourseId && course.cycleId === requestedCycleId,
      ),
  );

  useEffect(() => {
    if (hasValidCourseContext) return;

    navigateToRoute(
      buildRouteWithSearch(ROUTES.panelDashboard, {
        role: "docente",
      }),
    );
  }, [hasValidCourseContext]);

  if (!hasValidCourseContext) {
    return (
      <PanelLayout
        currentStep="medicion-ra"
        title="Medición RA"
        description="Registro y seguimiento de Resultados de Aprendizaje asignados."
      >
        <WorkflowStateCard
          title="Selecciona un curso desde Estado del ciclo"
          description="La medición se abre con el contexto del curso seleccionado en Estado del ciclo."
        />
      </PanelLayout>
    );
  }

  return <MedicionRAContent />;
}

function MedicionRAContent() {
  const {
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
    showValidationErrors,
    competenceContentRef,
    handleCompetenceChange,
    handleLevelChange,
    handleInstrumentDescriptionChange,
    handleEvidenceChange,
    handleImprovementPlanChange,
    handleSaveProgress,
    handleRequestFinishEvaluation,
    handleConfirmFinishEvaluation,
    handleCancelFinishEvaluation,
    handleCloseFeedback,
    hasAvailableCourses,
  } = useMedicionRA();

  const handleFinishCourse = () => {
    const didFinish = handleConfirmFinishEvaluation();
    if (!didFinish) return;

    navigateToRoute(
      buildRouteWithSearch(ROUTES.panelDashboard, {
        role: "docente",
      }),
    );
  };

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
        description="Una vez finalizado, se guardará la medición del curso actual y volverás a Estado del ciclo para consultar el progreso actualizado."
        confirmLabel="Finalizar curso"
        variant="warning"
        onCancel={handleCancelFinishEvaluation}
        onConfirm={handleFinishCourse}
      />

      <FlowActionBar
        description="Guardar conserva el avance parcial del curso actual. Finalizar curso valida la medición, la guarda como completada y actualiza su progreso en Estado del ciclo."
        showSaveProgress={!isSelectedCourseLocked}
        saveLabel="Guardar"
        onSaveProgress={handleSaveProgress}
        saveDisabled={isSelectedCourseLocked}
        saveTitle={isSelectedCourseLocked ? LOCKED_TOOLTIP : undefined}
        showFinish
        finishLabel={isSelectedCourseLocked ? "Curso finalizado" : "Finalizar curso"}
        finishDisabled={isSelectedCourseLocked}
        finishTitle={isSelectedCourseLocked ? LOCKED_TOOLTIP : undefined}
        onFinish={handleRequestFinishEvaluation}
      />
    </PanelLayout>
  );
}