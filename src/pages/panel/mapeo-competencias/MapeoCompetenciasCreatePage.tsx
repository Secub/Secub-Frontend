import { GoArrowLeft } from "react-icons/go";
import { ROUTES, buildRouteWithSearch } from "../../../app/appRoutes";
import { PanelLayout } from "../../../components/panel";
import { Button, ConfirmDialog } from "../../../components/ui";
import { MapeoCompetenciasAccessState } from "./components";
import MapeoCompetenciasCreateHeader from "./components/MapeoCompetenciasCreateHeader";
import MapeoCompetenciasFeedback from "./components/MapeoCompetenciasFeedback";
import MapeoCompetenciasIraStep from "./components/MapeoCompetenciasIraStep";
import MapeoCompetenciasNucleosStep from "./components/MapeoCompetenciasNucleosStep";
import MapeoCompetenciasStepProgress from "./components/MapeoCompetenciasStepProgress";
import { getAccessRestrictedDescription } from "./MapeoCompetencias.permissions";
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
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<GoArrowLeft className="text-lg" />}
          onClick={handleGoBack}
        >
          Volver a Mapeo de Competencias
        </Button>
      </div>

      {!permissions.canRead ? (
        <MapeoCompetenciasAccessState
          title="Acceso restringido"
          description={getAccessRestrictedDescription(currentUser.role)}
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
