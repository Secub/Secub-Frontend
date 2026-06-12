import { GoArrowLeft } from "react-icons/go";
import { ROUTES, buildRouteWithSearch } from "../../../app/appRoutes";
import { PanelLayout } from "../../../components/panel";
import { Button, ConfirmDialog } from "../../../components/ui";
import {
  MapeoCompetenciasAccessState,
  MapeoCompetenciasFilters,
} from "./components";
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
    catalogs,
    permissions,
    filters,
    setFilters,
    selectedPrograma,
    selectedPlan,
    existingRecord,
    cursosPlan,
    competenciasPlan,
    canManage,
    disabledReason,
    totalSemestres,
    manager,
    coursesBySemester,
    completedStepIds,
    activeSemesterAssignedCount,
    activeSemesterTotalCount,
    handleGoBack,
    handleFinish,
  } = page;

  return (
    <PanelLayout
      currentStep="mapeo-competencias"
      title={existingRecord ? "Editar mapeo" : "Crear mapeo"}
      description="Clasifica los núcleos de formación por semestre y define el nivel I-R-A-NA por curso y competencia."
      actions={
        <Button variant="outline" leftIcon={<GoArrowLeft />} onClick={handleGoBack}>
          Volver
        </Button>
      }
      breadcrumbItems={[
        { label: "Gestión Académica" },
        { label: "Mapeo de Competencias", href: buildRouteWithSearch(ROUTES.panelMapeoCompetencias, { role: currentUser.role }) },
        { label: existingRecord ? "Editar mapeo" : "Crear mapeo" },
      ]}
    >
      {!permissions.canRead ? (
        <MapeoCompetenciasAccessState
          title="Acceso restringido"
          description={getAccessRestrictedDescription(currentUser.role)}
        />
      ) : (
        <div className="space-y-6">
          <MapeoCompetenciasFilters
            filters={filters}
            catalogs={catalogs}
            permissions={permissions}
            currentUser={currentUser}
            onChange={setFilters}
            showEstado={false}
          />

          {!filters.programaId || !filters.planId ? (
            <MapeoCompetenciasAccessState
              title="Selecciona un programa académico y un plan de estudios para iniciar el mapeo"
              description="El registro se guardará asociado a programaId y planId para evitar datos sueltos o mezclados entre planes."
            />
          ) : (
            <>
              <MapeoCompetenciasCreateHeader
                selectedPrograma={selectedPrograma}
                selectedPlan={selectedPlan}
                totalSemestres={totalSemestres}
                cursos={cursosPlan}
                competencias={competenciasPlan}
                canManage={canManage}
                disabledReason={disabledReason}
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
