import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const TOTAL_SEMESTERS = 8;

export default function MapeoCompetenciasEditPage() {
  const navigate = useNavigate();
  const { mapeoId } = useParams();
  const currentUser = getCurrentUser();
//   const catalogs = getCatalogs();
  const permissions = rolePermissions[currentUser.role];

  const [currentSemesterIndex, setCurrentSemesterIndex] = useState(0);
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [showProgress, setShowProgress] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga del mapeo existente
    const timer = setTimeout(() => {
      // Mock data - en producción vendría del backend
      const initialSemesters: SemesterData[] = [];
      for (let i = 0; i < TOTAL_SEMESTERS; i++) {
        initialSemesters.push({
          semesterId: `sem-${i + 1}`,
          semesterNumber: i + 1,
          competencias: i === 0 ? [
            {
              id: "comp-1",
              numero: 1,
              descripcion: "Competencia de ejemplo",
              resultadosAprendizaje: [
                {
                  id: "ra-1",
                  numero: 1,
                  descripcion: "Resultado de aprendizaje de ejemplo",
                },
              ],
            },
          ] : [],
        });
      }

      setSemesters(initialSemesters);
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

  if (loading) {
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
    setIsSaving(true);

    // Simular guardado en backend
    setTimeout(() => {
      localStorage.setItem(
        "mapeoEditCompleted",
        JSON.stringify({
          mapeoId,
          semesters,
          updatedAt: new Date().toISOString(),
        })
      );

      // Limpiar datos temporales
      localStorage.removeItem("mapeoEditProgress");
      localStorage.removeItem("mapeoEditDraft");

      setIsSaving(false);
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
      title="Mapeo de Competencias - Edición"
      description="Edita las competencias y resultados de aprendizaje por semestre"
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
              canEdit={permissions.canUpdate}
              onSemesterChange={handleSemesterChange}
              onNext={handleNext}
              onPrev={handlePrev}
              onFinalize={handleFinalize}
              isFinalizing={isSaving}
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
                "mapeoEditPausedDraft",
                JSON.stringify({
                  mapeoId,
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
          isSaving
            ? "Tu mapeo de competencias ha sido actualizado exitosamente."
            : "Tu progreso ha sido guardado correctamente. Puedes continuar después."
        }
        onClose={() => setShowProgress(false)}
      />
    </PanelLayout>
  );
}
