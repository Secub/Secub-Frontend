import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui";
import { PanelLayout } from "../../../components/panel";
import MapeoSemesterClassificationStep from "./components/MapeoSemesterClassificationStep";
import MapeoCompetenciasProgressModal from "./components/MapeoCompetenciasProgressModal";
import {
  getCurrentUser,
  getCatalogs,
} from "./MapeoCompetencias.mock";
import { rolePermissions } from "./MapeoCompetencias.permissions";
import { getEmptyFormState } from "./MapeoCompetencias.utils";
import type { FormState } from "./MapeoCompetencias.types";

const CLASSIFICATION_STEPS = [
  {
    id: "1",
    title: "Selecciona el Lugar",
    description: "Elige el lugar de desarrollo para este mapeo",
  },
  {
    id: "2",
    title: "Selecciona la Facultad",
    description: "Elige la facultad asociada",
  },
  {
    id: "3",
    title: "Selecciona el Programa",
    description: "Elige el programa académico",
  },
  {
    id: "4",
    title: "Selecciona el Plan",
    description: "Elige el plan de estudios y completa la descripción",
  },
];

export default function MapeoCompetenciasClassificationCreatePage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const catalogs = getCatalogs();
  const permissions = rolePermissions[currentUser.role];

  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<FormState>(
    getEmptyFormState(currentUser)
  );
  const [showProgress, setShowProgress] = useState(false);

  if (!permissions.canCreate) {
    return (
      <PanelLayout
        currentStep="mapeo-competencias"
        title="Mapeo de Competencias"
        description="No tienes permiso para crear mapeos"
      >
        <div className="surface-card rounded-lg p-6">
          <p className="text-[var(--color-gray-3)]">
            Tu rol no tiene permisos para crear mapeos de competencias.
          </p>
        </div>
      </PanelLayout>
    );
  }

  const handleFormChange = (field: keyof FormState, value: unknown) => {
    setFormValues((prev) => {
      const next = { ...prev, [field]: value };

      // Cascading logic
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
    } else {
      // Al finalizar el último paso
      localStorage.setItem(
        "mapeoProgress",
        JSON.stringify({
          classification: formValues,
          timestamp: new Date().toISOString(),
        })
      );

      setShowProgress(true);
      setTimeout(() => {
        setShowProgress(false);
        navigate("/panel/mapeo-competencias/crear");
      }, 2000);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!formValues.lugarId;
      case 1:
        return !!formValues.facultadId;
      case 2:
        return !!formValues.programaId;
      case 3:
        return !!(formValues.planId && formValues.descripcion);
      default:
        return false;
    }
  };

  const step = CLASSIFICATION_STEPS[currentStep];

  return (
    <PanelLayout
      currentStep="mapeo-competencias"
      title="Mapeo de Competencias - Clasificación de Semestres"
      description="Define los parámetros básicos para tu mapeo de competencias"
      actions={
        <Button
          variant="outline"
          onClick={() => navigate("/panel/mapeo-competencias")}
        >
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
            onClick={() => navigate("/panel/mapeo-competencias")}
            className="flex-1 sm:flex-none"
          >
            Cancelar y volver
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.setItem(
                "mapeoProgressDraft",
                JSON.stringify({
                  classification: formValues,
                  step: currentStep,
                  timestamp: new Date().toISOString(),
                })
              );
              setShowProgress(true);
              setTimeout(() => {
                setShowProgress(false);
              }, 2000);
            }}
            className="flex-1 sm:flex-none"
          >
            Guardar progreso
          </Button>
        </div>
      </div>

      <MapeoCompetenciasProgressModal
        open={showProgress}
        message="Tu progreso ha sido guardado correctamente. Puedes continuar después."
        onClose={() => setShowProgress(false)}
      />
    </PanelLayout>
  );
}
