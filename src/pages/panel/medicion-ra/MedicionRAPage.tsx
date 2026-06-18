import { GoLock } from "react-icons/go";
import { PanelLayout, WorkflowStateCard } from "../../../components/panel";
import { Badge, ConfirmDialog } from "../../../components/ui";
import { getCurrentMockUser } from "../../../services/auth/mockUser";
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

function MedicionRAAccessRestricted({ cargo }: { cargo: string }) {
  return (
    <PanelLayout
      currentStep="medicion-ra"
      title="Medición RA"
      description="Este módulo es independiente del flujo de Gestión Académica y está habilitado únicamente para el rol Docencia."
    >
      <div className="surface-card p-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)] text-[var(--color-secondary-1)]">
            <GoLock className="text-3xl" />
          </div>

          <h2 className="mt-5 font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
            Acceso restringido a Medición RA
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--color-gray-3)]">
            La medición de Resultados de Aprendizaje corresponde al rol Docencia.
            Este módulo no hace parte de los pasos de Gestión Académica del sidebar.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Badge variant="neutral">Rol actual: {cargo}</Badge>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gray-6)] bg-white px-4 py-2 text-sm text-[var(--color-gray-3)]">
              La validación se reemplazará por permisos reales desde backend/Auth.
            </span>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}

export default function MedicionRAPage() {
  const currentUser = getCurrentMockUser();

  if (currentUser.role !== "docente") {
    return <MedicionRAAccessRestricted cargo={currentUser.cargo} />;
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
    isLastCompetence,
    showValidationErrors,
    competenceContentRef,
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
    hasAvailableCourses,
  } = useMedicionRA();

  if (!hasAvailableCourses) {
    return (
      <PanelLayout
        currentStep="medicion-ra"
        title="Medición RA"
        description="Panel docente para calificar Resultados de Aprendizaje asignados desde el flujo académico."
      >
        <WorkflowStateCard
          variant="locked"
          title="No tienes cursos asignados para medir"
          description="La medición solo muestra cursos realmente asignados al docente autenticado. Cuando Jefatura de programa asigne RA a un curso asociado a este docente, aparecerá en este módulo."
          helperText="El fallback demo solo se usa cuando todavía no existen asignaciones reales en mockBackend."
        />
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      currentStep="medicion-ra"
      title="Medición RA"
      description="Panel docente para calificar Resultados de Aprendizaje, definir instrumentos, cargar evidencias, analizar porcentajes y registrar planes de mejora por competencia."
    >
      <div className="space-y-6 pb-24">
        <CourseSelector
          courses={availableCourses}
          selectedCourseId={selectedCourse.id}
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
        title="¿Estás seguro de que deseas finalizar la evaluación?"
        description="Después de finalizarla, la información registrada quedará bloqueada y no podrás editar ni modificar las competencias evaluadas."
        confirmLabel="Sí, finalizar evaluación"
        variant="warning"
        onCancel={handleCancelFinishEvaluation}
        onConfirm={handleConfirmFinishEvaluation}
      />

      <MedicionRAFooter
        isEvaluationLocked={isSelectedCourseLocked}
        isLastCompetence={isLastCompetence}
        onSaveProgress={handleSaveProgress}
        onPrimaryAction={handlePrimaryAction}
      />
    </PanelLayout>
  );
}