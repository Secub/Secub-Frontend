import { useEffect, useMemo } from "react";
import { ROUTES, buildRouteWithSearch, navigateToRoute } from "../../../app/appRoutes";
import { FlowActionBar, PanelLayout, WorkflowStateCard } from "../../../components/panel";
import { useOnboardingTour, type OnboardingTourStep } from "../../../components/OnboardingTour";
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
    isLastCompetence,
    showValidationErrors,
    competenceContentRef,
    handleCompetenceChange,
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
    hasAvailableCourses,
  } = useMedicionRA();

  const tourSteps = useMemo<OnboardingTourStep[]>(
    () => [
      {
        target: "#medicion-competence-stepper",
        title: "Progreso por competencias",
        content: "Avanza entre las competencias del curso para evaluar sus RA asociados.",
        order: 1,
      },
      {
        target: "#medicion-evaluation-levels",
        title: "Niveles de desempeño",
        content: "Estos son los niveles que puedes asignar a cada estudiante al evaluar un Resultado de Aprendizaje.",
        order: 2,
      },
      {
        target: "#medicion-instrument-first-ra",
        title: "Instrumento de Evaluación",
        content: "Cada RA conserva su descripción individual. La evidencia se carga una sola vez al final de la competencia.",
        order: 3,
      },
      {
        target: "#medicion-students-table",
        title: "Medición de Resultados de Aprendizaje",
        content: "Asigna el nivel de desempeño de cada estudiante para los Resultados de Aprendizaje de esta competencia.",
        order: 4,
      },
      {
        target: "#medicion-ra-results-first",
        title: "Resultado de Aprendizaje",
        content: "Consulta el gráfico porcentual de los RA asociados a la competencia seleccionada.",
        order: 5,
        forceTop: false,
      },
      {
        target: "#medicion-evidencia-competencia",
        title: "Evidencia de la competencia",
        content: "Adjunta un único archivo de soporte para toda la competencia seleccionada. Este archivo aplica para los RA evaluados en esta competencia.",
        order: 6,
        forceTop: false,
      },
      {
        target: "#medicion-plan-mejora",
        title: "Plan de mejora",
        content: "Registra el análisis y las acciones propuestas para el seguimiento de la competencia seleccionada.",
        order: 7,
        forceTop: false,
      },
    ],
    []
  );

  const canShowTour = hasAvailableCourses;

  const { startTour } = useOnboardingTour({
    steps: tourSteps,
    storageKey: "tour_medicion_ra_v1",
    autoStart: canShowTour,
    enabled: canShowTour,
  });

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
        {canShowTour ? (
          <button
            type="button"
            onClick={startTour}
            className="text-sm text-blue-600 underline"
          >
            Ver guía de esta sección
          </button>
        ) : null}

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
        showNext={!isSelectedCourseLocked && !isLastCompetence}
        nextLabel="Siguiente competencia"
        onNext={handlePrimaryAction}
        showFinish={isSelectedCourseLocked || isLastCompetence}
        finishLabel={isSelectedCourseLocked ? "Curso finalizado" : "Finalizar curso"}
        finishDisabled={isSelectedCourseLocked}
        finishTitle={isSelectedCourseLocked ? LOCKED_TOOLTIP : undefined}
        onFinish={handleRequestFinishEvaluation}
      />
    </PanelLayout>
  );
}