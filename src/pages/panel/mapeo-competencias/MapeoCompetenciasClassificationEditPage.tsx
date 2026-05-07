import { useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
import {useParams } from "react-router-dom";
import { Button } from "../../../components/ui";
import { PanelLayout } from "../../../components/panel";
import MapeoCompetenciasProgressModal from "./components/MapeoCompetenciasProgressModal";
import MapeoSemesterClassificationStep from "./components/MapeoSemesterClassificationStep";
import {
  getCatalogs,
  getCurrentUser,
  mockMapeoCompetencias,
} from "./MapeoCompetencias.mock";
import { rolePermissions } from "./MapeoCompetencias.permissions";
import {
  buildRecordFromForm,
  enrichCompetenciasRa,
  findStoredMapeoRecord,
  mapRecordToForm,
  upsertStoredMapeoRecord,
} from "./MapeoCompetencias.utils";
import type {
  FormState,
  MapeoCompetenciasEnriched,
} from "./MapeoCompetencias.types";

const CLASSIFICATION_STEPS = [
  {
    id: "1",
    title: "Selecciona el lugar",
    description: "Elige la seccional y el lugar de desarrollo para este mapeo",
  },
  {
    id: "2",
    title: "Selecciona la facultad",
    description: "Elige la facultad asociada",
  },
  {
    id: "3",
    title: "Selecciona el programa",
    description: "Elige el programa academico",
  },
  {
    id: "4",
    title: "Selecciona el plan",
    description: "Elige el plan de estudios y completa la descripcion",
  },
];

const catalogs = getCatalogs();

export default function MapeoCompetenciasClassificationEditPage() {
  // const navigate = useNavigate();
  const { mapeoId } = useParams();
  const currentUser = getCurrentUser();
  const permissions = rolePermissions[currentUser.role];
  const initialRecord = findStoredMapeoRecord(mapeoId, mockMapeoCompetencias);
  const initialEnrichedRecord = initialRecord
    ? enrichCompetenciasRa([initialRecord], catalogs)[0]
    : null;

  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<FormState | null>(
    initialEnrichedRecord ? mapRecordToForm(initialEnrichedRecord) : null,
  );
  const [existingRecord] =
    useState<MapeoCompetenciasEnriched | null>(initialEnrichedRecord);
  const [showProgress, setShowProgress] = useState(false);

  if (!permissions.canUpdate) {
    return (
      <PanelLayout
        currentStep="mapeo-competencias"
        title="Mapeo de Competencias - Edicion"
        description="No tienes permiso para editar mapeos"
      >
        <div className="surface-card rounded-lg p-6">
          <p className="text-[var(--color-gray-3)]">
            Tu rol no tiene permisos para editar mapeos de competencias.
          </p>
        </div>
      </PanelLayout>
    );
  }

  if (!formValues || !existingRecord) {
    return (
      <PanelLayout
        currentStep="mapeo-competencias"
        title="Mapeo no encontrado"
        description="No fue posible cargar el mapeo solicitado"
      >
        <div className="surface-card rounded-lg p-6">
          <p className="text-[var(--color-gray-3)]">
            El mapeo seleccionado no existe o fue eliminado.
          </p>
        </div>
      </PanelLayout>
    );
  }

  const handleFormChange = (field: keyof FormState, value: unknown) => {
    setFormValues((prev) => {
      if (!prev) return prev;

      const next = { ...prev, [field]: value };

      if (field === "seccionalId") {
        next.lugarId = "";
        next.facultadId = "";
        next.programaId = "";
      }
      if (field === "lugarId") {
        next.facultadId = "";
        next.programaId = "";
      }
      if (field === "facultadId") {
        next.programaId = "";
      }

      return next;
    });
  };

  const handleNext = () => {
    if (currentStep < CLASSIFICATION_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    const updatedRecord = buildRecordFromForm(
      formValues,
      existingRecord,
      mockMapeoCompetencias,
      existingRecord.semestres,
    );

    upsertStoredMapeoRecord(updatedRecord, mockMapeoCompetencias);
    localStorage.setItem(
      "mapeoEditProgress",
      JSON.stringify({
        classification: formValues,
        mapeoId,
        timestamp: new Date().toISOString(),
      }),
    );

    setShowProgress(true);
    window.setTimeout(() => {
      setShowProgress(false);
      // navigate(`/panel/mapeo-competencias/${mapeoId}/editar`);
      window.location.href = `/panel/mapeo-competencias/${mapeoId}/editar`;

    }, 800);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!(formValues.seccionalId && formValues.lugarId);
      case 1:
        return !!formValues.facultadId;
      case 2:
        return !!formValues.programaId;
      case 3:
        return !!(formValues.planId && formValues.descripcion.trim());
      default:
        return false;
    }
  };

  const step = CLASSIFICATION_STEPS[currentStep];

  return (
    <PanelLayout
      currentStep="mapeo-competencias"
      title="Mapeo de Competencias - Clasificacion"
      description="Edita los parametros del mapeo de competencias"
      actions={
        // <Button variant="outline" onClick={() => navigate("/panel/mapeo-competencias")}>
        <Button variant="outline" onClick={() => window.location.href = "/panel/mapeo-competencias"}>
          Cancelar
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="surface-card rounded-lg p-6 md:p-8">
          <MapeoSemesterClassificationStep
            step={currentStep + 1}
            totalSteps={CLASSIFICATION_STEPS.length}
            title={step.title}
            description={step.description}
            formValues={formValues}
            catalogs={catalogs}
            permissions={permissions}
            onFormChange={handleFormChange}
            onNext={handleNext}
            onPrev={handlePrev}
            canProceed={canProceed()}
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            // onClick={() => navigate("/panel/mapeo-competencias")}
            onClick={() => window.location.href = "/panel/mapeo-competencias"}
            className="flex-1 sm:flex-none"
          >
            Cancelar y volver
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.setItem(
                "mapeoEditDraft",
                JSON.stringify({
                  classification: formValues,
                  step: currentStep,
                  mapeoId,
                  timestamp: new Date().toISOString(),
                }),
              );
              setShowProgress(true);
              window.setTimeout(() => setShowProgress(false), 1200);
            }}
            className="flex-1 sm:flex-none"
          >
            Guardar progreso
          </Button>
        </div>
      </div>

      <MapeoCompetenciasProgressModal
        open={showProgress}
        message="Tu progreso ha sido guardado correctamente."
        onClose={() => setShowProgress(false)}
      />
    </PanelLayout>
  );
}
