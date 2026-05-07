import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/ui";
import { PanelLayout } from "../../../components/panel";
import MapeoSemesterClassificationStep from "./components/MapeoSemesterClassificationStep";
import MapeoCompetenciasProgressModal from "./components/MapeoCompetenciasProgressModal";
import {
  getCurrentUser,
  getCatalogs,
} from "./MapeoCompetencias.mock";
import { rolePermissions } from "./MapeoCompetencias.permissions";
import { mapRecordToForm } from "./MapeoCompetencias.utils";
import type { FormState, MapeoCompetenciasEnriched } from "./MapeoCompetencias.types";

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

export default function MapeoCompetenciasClassificationEditPage() {
  const navigate = useNavigate();
  const { mapeoId } = useParams();
  const currentUser = getCurrentUser();
  const catalogs = getCatalogs();
  const permissions = rolePermissions[currentUser.role];

  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<FormState | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga del mapeo
    const timer = setTimeout(() => {
      // Mock record - en producción vendría del backend
      const mockRecord: MapeoCompetenciasEnriched = {
        id: mapeoId || "mock-id",
        seccionalId: "cali",
        facultadId: "ing-cali",
        lugarId: "cali",
        programaId: "sis-cali",
        planId: "plan-2024-2",
        estado: "activo",
        descripcion: "Mapeo de competencias para Ingeniería de Sistemas",
        nombre: "Competencias Ingeniería",
        numero: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        seccionalNombre: "Seccional Cali",
        facultadNombre: "Facultad de Ingeniería",
        lugarNombre: "Cali",
        programaNombre: "Ingeniería de Sistemas",
        planNombre: "Plan 2024-2",
      };

      setFormValues(mapRecordToForm(mockRecord));
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [mapeoId]);

  if (!permissions.canUpdate) {
    return (
      <PanelLayout
        currentStep="mapeo-competencias"
        title="Mapeo de Competencias - Edición"
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

  if (loading || !formValues) {
    return (
      <PanelLayout
        currentStep="mapeo-competencias"
        title="Cargando..."
        description="Esperando datos"
      >
        <div className="surface-card rounded-lg p-6">
          <p className="text-[var(--color-gray-3)]">Cargando mapeo...</p>
        </div>
      </PanelLayout>
    );
  }

  const handleFormChange = (field: keyof FormState, value: unknown) => {
    setFormValues((prev) => {
      if (!prev) return prev;

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
        "mapeoEditProgress",
        JSON.stringify({
          classification: formValues,
          mapeoId,
          timestamp: new Date().toISOString(),
        })
      );

      setShowProgress(true);
      setTimeout(() => {
        setShowProgress(false);
        navigate(`/panel/mapeo-competencias/${mapeoId}/editar`);
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
        return !!formValues?.lugarId;
      case 1:
        return !!formValues?.facultadId;
      case 2:
        return !!formValues?.programaId;
      case 3:
        return !!(formValues?.planId && formValues?.descripcion);
      default:
        return false;
    }
  };

  const step = CLASSIFICATION_STEPS[currentStep];

  return (
    <PanelLayout
      currentStep="mapeo-competencias"
      title="Mapeo de Competencias - Clasificación de Semestres (Edición)"
      description="Edita los parámetros del mapeo de competencias"
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
                "mapeoEditDraft",
                JSON.stringify({
                  classification: formValues,
                  step: currentStep,
                  mapeoId,
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
