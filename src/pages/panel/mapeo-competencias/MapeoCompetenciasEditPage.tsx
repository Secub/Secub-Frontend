import { useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
import {useParams } from "react-router-dom";
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
  findStoredMapeoRecord,
  upsertStoredMapeoRecord,
} from "./MapeoCompetencias.utils";
import type {
  MapeoCompetenciasRecord,
  MapeoSemesterData,
} from "./MapeoCompetencias.types";

const TOTAL_SEMESTERS = 10;

function buildEmptySemesters(): MapeoSemesterData[] {
  return Array.from({ length: TOTAL_SEMESTERS }, (_, index) => ({
    semesterId: `sem-${index + 1}`,
    semesterNumber: index + 1,
    competencias: [],
  }));
}

function normalizeSemesters(semesters?: MapeoSemesterData[]) {
  const existing = semesters ?? [];
  return buildEmptySemesters().map((semester) => {
    return existing.find((item) => item.semesterNumber === semester.semesterNumber) ?? semester;
  });
}

export default function MapeoCompetenciasEditPage() {
  // const navigate = useNavigate();
  const { mapeoId } = useParams();
  const currentUser = getCurrentUser();
  const permissions = rolePermissions[currentUser.role];
  const initialRecord = findStoredMapeoRecord(mapeoId, mockMapeoCompetencias);

  const [record, setRecord] = useState<MapeoCompetenciasRecord | null>(
    initialRecord,
  );
  const [currentSemesterIndex, setCurrentSemesterIndex] = useState(0);
  const [semesters, setSemesters] = useState<MapeoSemesterData[]>(() =>
    normalizeSemesters(initialRecord?.semestres),
  );
  const [showProgress, setShowProgress] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progressMessage, setProgressMessage] = useState(
    "Tu progreso ha sido guardado correctamente. Puedes continuar despues.",
  );

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

  if (!record) {
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
    setIsSaving(true);

    window.setTimeout(() => {
      const updatedRecord: MapeoCompetenciasRecord = {
        ...record,
        semestres: semesters,
        updatedAt: new Date().toISOString(),
      };

      upsertStoredMapeoRecord(updatedRecord, mockMapeoCompetencias);
      localStorage.setItem(
        "mapeoEditCompleted",
        JSON.stringify({
          mapeoId,
          record: updatedRecord,
          semesters,
          updatedAt: updatedRecord.updatedAt,
        }),
      );

      localStorage.removeItem("mapeoEditProgress");
      localStorage.removeItem("mapeoEditDraft");
      localStorage.removeItem("mapeoEditPausedDraft");

      setRecord(updatedRecord);
      setIsSaving(false);
      setProgressMessage("Tu mapeo de competencias ha sido actualizado exitosamente.");
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
      title="Mapeo de Competencias - Edicion"
      description="Edita las competencias y resultados de aprendizaje por semestre"
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
              canEdit={permissions.canUpdate}
              onSemesterChange={handleSemesterChange}
              onNext={handleNext}
              onPrev={handlePrev}
              onFinalize={handleFinalize}
              isFinalizing={isSaving}
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
                "mapeoEditPausedDraft",
                JSON.stringify({
                  mapeoId,
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
