import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui";
import { PanelLayout } from "../../../components/panel";
import MapeoSemesterEditor from "./components/MapeoSemesterEditor";
import MapeoCompetenciasProgressModal from "./components/MapeoCompetenciasProgressModal";
import {
  getCurrentUser
//   getCatalogs,
} from "./MapeoCompetencias.mock";
import { rolePermissions } from "./MapeoCompetencias.permissions";

interface SemesterData {
  semesterId: string;
  semesterNumber: number;
  competencias: Array<{
    id: string;
    numero: number;
    descripcion: string;
    resultadosAprendizaje: Array<{
      id: string;
      numero: number;
      descripcion: string;
    }>;
  }>;
}

const TOTAL_SEMESTERS = 8; // Ajusta según tu plan

export default function MapeoCompetenciasCreatePage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
//   const catalogs = getCatalogs();
  const permissions = rolePermissions[currentUser.role];

  const [currentSemesterIndex, setCurrentSemesterIndex] = useState(0);
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [showProgress, setShowProgress] = useState(false);
  const [isFinalizingTotal, setIsFinalizingTotal] = useState(false);

  useEffect(() => {
    // Inicializar semestres desde el progreso guardado o crear vacíos
    // const savedProgress = localStorage.getItem("mapeoProgress");
    
    const initialSemesters: SemesterData[] = [];
    for (let i = 0; i < TOTAL_SEMESTERS; i++) {
      initialSemesters.push({
        semesterId: `sem-${i + 1}`,
        semesterNumber: i + 1,
        competencias: [],
      });
    }

    setSemesters(initialSemesters);
  }, []);

  if (!permissions.canCreate) {
    return (
      <PanelLayout
        currentStep="mapeo-competencias"
        title="Mapeo de Competencias - Creación"
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

  const handleSemesterChange = (index: number, data: SemesterData) => {
    const updatedSemesters = [...semesters];
    updatedSemesters[index] = data;
    setSemesters(updatedSemesters);
  };

  const handleNext = () => {
    if (currentSemesterIndex < TOTAL_SEMESTERS - 1) {
      setCurrentSemesterIndex(currentSemesterIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentSemesterIndex > 0) {
      setCurrentSemesterIndex(currentSemesterIndex - 1);
    }
  };

  const handleFinalize = async () => {
    setIsFinalizingTotal(true);

    // Simular guardado en backend
    setTimeout(() => {
      localStorage.setItem(
        "mapeoCompleted",
        JSON.stringify({
          classification: JSON.parse(
            localStorage.getItem("mapeoProgress") || "{}"
          ),
          semesters,
          completedAt: new Date().toISOString(),
        })
      );

      // Limpiar datos temporales
      localStorage.removeItem("mapeoProgress");
      localStorage.removeItem("mapeoProgressDraft");

      setIsFinalizingTotal(false);
      setShowProgress(true);

      setTimeout(() => {
        setShowProgress(false);
        navigate("/panel/mapeo-competencias");
      }, 2000);
    }, 1500);
  };

  return (
    <PanelLayout
      currentStep="mapeo-competencias"
      title="Mapeo de Competencias - Creación de Competencias"
      description="Asigna competencias y resultados de aprendizaje para cada semestre"
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
          {semesters.length > 0 && (
            <MapeoSemesterEditor
              semesters={semesters}
              currentSemesterIndex={currentSemesterIndex}
              totalSemesters={TOTAL_SEMESTERS}
              canEdit={permissions.canCreate}
              onSemesterChange={handleSemesterChange}
              onNext={handleNext}
              onPrev={handlePrev}
              onFinalize={handleFinalize}
              isFinalizing={isFinalizingTotal}
            />
          )}
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
                "mapeoCreationDraft",
                JSON.stringify({
                  semesters,
                  currentSemesterIndex,
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
        message={
          isFinalizingTotal
            ? "Tu mapeo de competencias ha sido creado exitosamente."
            : "Tu progreso ha sido guardado correctamente. Puedes continuar después."
        }
        onClose={() => setShowProgress(false)}
      />
    </PanelLayout>
  );
}
