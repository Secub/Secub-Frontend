import { useEffect, useState } from "react";
import { ROUTES, buildRouteWithSearch, navigateToRoute } from "../../../app/appRoutes";
import { FlowActionBar, PanelLayout, WorkflowStateCard } from "../../../components/panel";
import { ConfirmDialog } from "../../../components/ui";
import { getCurrentMockUser } from "../../../services/auth/mockUser";
import { getMeasurementAccess, type MeasurementAccess } from "../../../services/measurements";
import { mockBackend } from "../../../services/mockBackend";
import type { MedicionRaDemoState } from "./types/medicionRA.persistence.types";
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
  const [currentUser] = useState(() => getCurrentMockUser());
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
  const [access, setAccess] = useState<MeasurementAccess | null>(null);
  const [accessError, setAccessError] = useState("");
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    if (!requestedCourseId || !requestedCycleId) {
      setIsCheckingAccess(false);
      return;
    }
    const controller = new AbortController();
    setIsCheckingAccess(true);
    setAccessError("");
    void getMeasurementAccess(requestedCycleId, requestedCourseId, controller.signal)
      .then((result) => {
        if (result.measurement) {
          mockBackend.upsert<MedicionRaDemoState>("medicionesRa", result.measurement, currentUser);
        }
        setAccess(result);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setAccessError(error instanceof Error ? error.message : "No fue posible validar el acceso a la medición.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsCheckingAccess(false);
      });
    return () => controller.abort();
  }, [currentUser, requestedCourseId, requestedCycleId]);

  if (isCheckingAccess) {
    return (
      <PanelLayout currentStep="medicion-ra" title="Medición RA" description="Registro y seguimiento de Resultados de Aprendizaje asignados.">
        <WorkflowStateCard title="Validando acceso" description="Estamos verificando la asignación docente y el tipo de contratación en ITIS." />
      </PanelLayout>
    );
  }

  if (accessError) {
    return (
      <PanelLayout currentStep="medicion-ra" title="Medición RA" description="Registro y seguimiento de Resultados de Aprendizaje asignados.">
        <WorkflowStateCard variant="locked" title="No fue posible validar el acceso" description={accessError} />
      </PanelLayout>
    );
  }

  if (access && !access.canGrade) {
    return (
      <PanelLayout currentStep="medicion-ra" title="Medición RA" description="Registro y seguimiento de Resultados de Aprendizaje asignados.">
        <WorkflowStateCard
          variant="locked"
          title="No tienes permiso para calificar este curso"
          description={`${access.reason ?? "Solo los docentes de tiempo completo pueden registrar la medición."} Docente registrado: ${access.teacherName}. Contratación: ${access.contractType}.`}
        />
      </PanelLayout>
    );
  }

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

  const handleFinishCourse = async () => {
    const didFinish = await handleConfirmFinishEvaluation();
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
