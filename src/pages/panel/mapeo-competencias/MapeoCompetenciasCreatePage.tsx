import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui";
import { PanelLayout } from "../../../components/panel";
import MapeoCompetenciasProgressModal from "./components/MapeoCompetenciasProgressModal";
import MapeoSemesterEditor from "./components/MapeoSemesterEditor";
import {
  getCurrentUser,
  mockMapeoCompetencias,
} from "./MapeoCompetencias.mock";
import { rolePermissions } from "./MapeoCompetencias.permissions";
import {
  buildRecordFromForm,
  readStoredMapeoRecords,
  upsertStoredMapeoRecord,
} from "./MapeoCompetencias.utils";
import type { FormState, MapeoSemesterData } from "./MapeoCompetencias.types";

const TOTAL_SEMESTERS = 10;

function buildEmptySemesters(): MapeoSemesterData[] {
  return Array.from({ length: TOTAL_SEMESTERS }, (_, index) => ({
    semesterId: `sem-${index + 1}`,
    semesterNumber: index + 1,
    competencias: [],
  }));
}

function getInitialCreationState() {
  const fallback = {
    semesters: buildEmptySemesters(),
    currentSemesterIndex: 0,
  };

  const savedDraft = localStorage.getItem("mapeoCreationDraft");
  if (!savedDraft) return fallback;

  try {
    const parsed = JSON.parse(savedDraft) as {
      semesters?: MapeoSemesterData[];
      currentSemesterIndex?: number;
    };

    if (Array.isArray(parsed.semesters) && parsed.semesters.length > 0) {
      return {
        semesters: parsed.semesters,
        currentSemesterIndex: parsed.currentSemesterIndex ?? 0,
      };
    }
  } catch {
    return fallback;
  }

  return fallback;
}

export default function MapeoCompetenciasCreatePage() {
  // const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const permissions = rolePermissions[currentUser.role];

  const [currentSemesterIndex, setCurrentSemesterIndex] = useState(
    () => getInitialCreationState().currentSemesterIndex,
  );
  const [semesters, setSemesters] = useState<MapeoSemesterData[]>(
    () => getInitialCreationState().semesters,
  );
  const [showProgress, setShowProgress] = useState(false);
  const [isFinalizingTotal, setIsFinalizingTotal] = useState(false);
  const [progressMessage, setProgressMessage] = useState(
    "Tu progreso ha sido guardado correctamente. Puedes continuar despues.",
  );

  if (!permissions.canCreate) {
    return (
      <PanelLayout
        currentStep="mapeo-competencias"
        title="Mapeo de Competencias - Creacion"
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

  const handleSemesterChange = (index: number, data: MapeoSemesterData) => {
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

    window.setTimeout(() => {
      const rawProgress = localStorage.getItem("mapeoProgress");
      const parsedProgress = rawProgress ? JSON.parse(rawProgress) : null;
      const classification = parsedProgress?.classification as FormState | undefined;

      if (!classification) {
        setIsFinalizingTotal(false);
        // navigate("/panel/mapeo-competencias/clasificacion/crear");
        window.location.href = "/panel/mapeo-competencias/clasificacion/crear";
        return;
      }

      const currentRecords = readStoredMapeoRecords(mockMapeoCompetencias);
      const newRecord = buildRecordFromForm(
        classification,
        null,
        currentRecords,
        semesters,
      );

      upsertStoredMapeoRecord(newRecord, mockMapeoCompetencias);

      localStorage.setItem(
        "mapeoCompleted",
        JSON.stringify({
          record: newRecord,
          classification,
          semesters,
          completedAt: new Date().toISOString(),
        }),
      );

      localStorage.removeItem("mapeoProgress");
      localStorage.removeItem("mapeoProgressDraft");
      localStorage.removeItem("mapeoCreationDraft");

      setIsFinalizingTotal(false);
      setProgressMessage("Tu mapeo de competencias ha sido creado exitosamente.");
      setShowProgress(true);

      window.setTimeout(() => {
        setShowProgress(false);
        // navigate("/panel/mapeo-competencias");
        window.location.href = "/panel/mapeo-competencias";
      }, 1200);
    }, 600);
  };

  return (
    <PanelLayout
      currentStep="mapeo-competencias"
      title="Mapeo de Competencias - Creacion"
      description="Asigna competencias y resultados de aprendizaje por semestre"
      actions={
        <Button variant="outline" onClick={() => window.location.href = "/panel/mapeo-competencias"}>
          Cancelar
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="surface-card rounded-lg p-6 md:p-8">
          {semesters.length > 0 ? (
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
          ) : null}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => window.location.href = "/panel/mapeo-competencias"}
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
                }),
              );
              setProgressMessage(
                "Tu progreso ha sido guardado correctamente. Puedes continuar despues.",
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
        message={progressMessage}
        onClose={() => setShowProgress(false)}
      />
    </PanelLayout>
  );
}
