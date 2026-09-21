import { useMemo } from "react";
import { ROUTES, buildRouteWithSearch } from "../../../app/appRoutes";
import { BackButton, PanelLayout } from "../../../components/panel";
import { ConfirmDialog } from "../../../components/ui";
import { useOnboardingTour, type OnboardingTourStep } from "../../../components/OnboardingTour";
import { MapeoCompetenciasAccessState } from "./components";
import MapeoCompetenciasCreateHeader from "./components/MapeoCompetenciasCreateHeader";
import MapeoCompetenciasFeedback from "./components/MapeoCompetenciasFeedback";
import MapeoCompetenciasIraStep from "./components/MapeoCompetenciasIraStep";
import MapeoCompetenciasNucleosStep from "./components/MapeoCompetenciasNucleosStep";
import MapeoCompetenciasStepProgress from "./components/MapeoCompetenciasStepProgress";
import { getMapeoAccessRestrictedDescription } from "../../../config/access/permissions";
import { navigateToMapeoList, useMapeoCompetenciasCreatePage } from "./hooks/useMapeoCompetenciasCreatePage";

export default function MapeoCompetenciasCreatePage() {
  const page = useMapeoCompetenciasCreatePage();
  const {
    currentUser,
    permissions,
    filters,
    selectedPrograma,
    selectedPlan,
    existingRecord,
    cursosPlan,
    competenciasPlan,
    canManage,
    totalSemestres,
    manager,
    coursesBySemester,
    completedStepIds,
    activeSemesterAssignedCount,
    activeSemesterTotalCount,
    handleGoBack,
    handleFinish,
    handleConfirmFinish,
    showFinishConfirm,
    setShowFinishConfirm,
  } = page;

  const isNucleosStep = manager.activeStep === "nucleos";
  const hasAcademicContext = Boolean(filters.programaId && filters.planId);

  const nucleosTourSteps = useMemo<OnboardingTourStep[]>(() => {
    const steps: OnboardingTourStep[] = [
      {
        target: "#mapeo-progreso-flujo",
        title: "Progreso del flujo de clasificación",
        content:
          "Este proceso tiene dos etapas: primero clasificas los Núcleos de Formación y luego defines los Niveles de Compromiso.",
        order: 1,
      },
      {
        target: "#mapeo-nucleos-step",
        title: "Núcleos de Formación",
        content:
          "Consulta la descripción de cada núcleo (fundamentación, profesionalización o síntesis) antes de clasificar los semestres.",
        order: 2,
      },
    ];

    if (totalSemestres > 0) {
      steps.push({
        target: "#mapeo-nucleos-semestre-1",
        title: "Semestre 1",
        content:
          "Para cada semestre selecciona una de las tres opciones: indica la etapa de formación a la que pertenece dentro del plan de estudios.",
        order: 3,
      });
    }

    return steps;
  }, [totalSemestres]);

  const { startTour: startNucleosTour } = useOnboardingTour({
    steps: nucleosTourSteps,
    storageKey: "tour_mapeo_nucleos_v1",
    autoStart: permissions.canRead && hasAcademicContext && isNucleosStep,
    enabled: permissions.canRead && hasAcademicContext && isNucleosStep,
    forceVerticalPlacement: true,
    autoScrollSmooth: false,
  });

  const activeSemesterHasCourseNivelAnchor =
    (coursesBySemester[manager.activeSemester]?.length ?? 0) > 0 && competenciasPlan.length > 0;

  const iraTourSteps = useMemo<OnboardingTourStep[]>(() => {
    const steps: OnboardingTourStep[] = [
      {
        target: "#mapeo-ira-flujo-semestres",
        title: "Flujo por semestres",
        content: "Aquí ves el flujo organizado por semestres: avanza entre ellos para definir sus niveles de compromiso.",
        order: 1,
      },
      {
        target: "#mapeo-ira-step",
        title: "Indicaciones de Niveles de Compromiso",
        content: "Consulta qué significa cada nivel (Introduce, Refuerza, Afianza, No aplica) antes de asignarlos.",
        order: 2,
      },
    ];

    if (activeSemesterHasCourseNivelAnchor) {
      steps.push({
        target: "#mapeo-ira-first-course-nivel",
        title: "Nivel de compromiso por curso",
        content:
          "Selecciona el nivel de compromiso correspondiente para cada curso, según qué tanto requiere trabajar esa competencia específica.",
        order: 3,
      });
    }

    steps.push({
      target: "#mapeo-ira-confirmar-semestre",
      title: "Confirmar semestre",
      content:
        "Después de asignar los niveles de compromiso del semestre, baja hasta aquí y haz clic en \"Confirmar semestre\" para poder continuar.",
      order: 4,
    });

    return steps;
  }, [activeSemesterHasCourseNivelAnchor]);

  const { startTour: startIraTour } = useOnboardingTour({
    steps: iraTourSteps,
    storageKey: "tour_mapeo_ira_v1",
    autoStart: permissions.canRead && hasAcademicContext && !isNucleosStep,
    enabled: permissions.canRead && hasAcademicContext && !isNucleosStep,
    autoScrollSmooth: false,
    allowDialogOverlap: true,
    forceVerticalPlacement: true,
  });

  return (
    <PanelLayout
      currentStep="mapeo-competencias"
      title={existingRecord ? "Editar mapeo" : "Crear mapeo"}
      description="Clasifica los núcleos de formación por semestre y define el nivel I-R-A-NA por curso y competencia."
      breadcrumbItems={[
        { label: "Mapeo de Competencias", href: buildRouteWithSearch(ROUTES.panelMapeoCompetencias, { role: currentUser.role }) },
        { label: existingRecord ? "Editar mapeo" : "Crear mapeo" },
      ]}
    >
      <BackButton label="Volver a Mapeo de Competencias" onClick={handleGoBack} />

      {permissions.canRead && filters.programaId && filters.planId ? (
        <button
          type="button"
          onClick={isNucleosStep ? startNucleosTour : startIraTour}
          className="mb-3 text-sm text-blue-600 underline"
        >
          Ver guía de esta sección
        </button>
      ) : null}

      {!permissions.canRead ? (
        <MapeoCompetenciasAccessState
          title="Acceso restringido"
          description={getMapeoAccessRestrictedDescription()}
        />
      ) : (
        <div className="space-y-6">
          {/*
            El programa académico y el plan de estudios no se seleccionan en esta pantalla.
            Ambos llegan desde el contexto definido previamente en Competencias y RA,
            por lo que deben permanecer fijos durante la creación o edición del mapeo.
          */}

          {!filters.programaId || !filters.planId ? (
            <MapeoCompetenciasAccessState
              title="No se encontró el contexto académico del mapeo"
              description="Regresa al flujo académico y verifica que el programa y el plan de estudios estén definidos previamente en Competencias y RA."
            />
          ) : (
            <>
              <MapeoCompetenciasCreateHeader
                selectedPrograma={selectedPrograma}
                selectedPlan={selectedPlan}
                totalSemestres={totalSemestres}
                cursos={cursosPlan}
                competencias={competenciasPlan}
              />

              <MapeoCompetenciasStepProgress
                activeStep={manager.activeStep}
                completedStepIds={completedStepIds}
                classificationComplete={manager.classificationComplete}
                onChange={(step) => {
                  if (step === "mapeo") {
                    manager.tryContinueToMapeo();
                    return;
                  }
                  manager.setActiveStep("nucleos");
                }}
              />

              <MapeoCompetenciasFeedback feedback={manager.feedback} />

              {manager.activeStep === "nucleos" ? (
                <MapeoCompetenciasNucleosStep
                  nucleosDraft={manager.nucleosDraft}
                  canManage={canManage}
                  totalSemestres={totalSemestres}
                  coursesBySemester={coursesBySemester}
                  programaNombre={selectedPrograma?.nombre}
                  classificationComplete={manager.classificationComplete}
                  onNucleoChange={manager.updateNucleo}
                  onSave={manager.saveProgress}
                  onContinue={manager.tryContinueToMapeo}
                />
              ) : (
                <MapeoCompetenciasIraStep
                  activeSemester={manager.activeSemester}
                  totalSemestres={totalSemestres}
                  activeSemesterAssignedCount={activeSemesterAssignedCount}
                  activeSemesterTotalCount={activeSemesterTotalCount}
                  nucleosDraft={manager.nucleosDraft}
                  nivelesDraft={manager.nivelesDraft}
                  coursesBySemester={coursesBySemester}
                  competencias={competenciasPlan}
                  canManage={canManage}
                  onActiveSemesterChange={manager.setActiveSemester}
                  onNivelChange={manager.updateNivel}
                  onSave={manager.saveProgress}
                  onFinish={handleFinish}
                />
              )}
            </>
          )}

          <ConfirmDialog
            open={showFinishConfirm}
            title="¿Deseas finalizar este mapeo?"
            description="Una vez finalizado, se guardará la matriz I-R-A-NA completa para continuar con el flujo académico."
            confirmLabel="Finalizar mapeo"
            variant="warning"
            onCancel={() => setShowFinishConfirm(false)}
            onConfirm={handleConfirmFinish}
          />

          <ConfirmDialog
            open={manager.showExitConfirm}
            title="Guardar progreso antes de salir"
            description="Si sales sin guardar, los cambios no persistidos se perderán."
            confirmLabel="Guardar y salir"
            cancelLabel="Salir sin guardar"
            onCancel={() => navigateToMapeoList(currentUser.role)}
            onConfirm={() => {
              manager.saveProgress();
              navigateToMapeoList(currentUser.role);
            }}
          />
        </div>
      )}
    </PanelLayout>
  );
}
