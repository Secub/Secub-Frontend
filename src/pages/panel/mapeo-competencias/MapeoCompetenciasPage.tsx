import { useEffect, useState } from "react";
import { GoPlus } from "react-icons/go";
import {
  PanelLayout,
  WorkflowStateCard,
  getAcademicWorkflowLockedDescription,
  isAcademicWorkflowStepLocked,
  setAcademicWorkflowStepCompleted,
} from "../../../components/panel";
import { Button } from "../../../components/ui";

interface MapeoTemporalRecord {
  id: string;
  createdAt: string;
}

export default function MapeoCompetenciasPage() {
  const [records, setRecords] = useState<MapeoTemporalRecord[]>([]);

  const isStepLocked = isAcademicWorkflowStepLocked("mapeo-competencias");
  const hasRecords = records.length > 0;

  useEffect(() => {
    setAcademicWorkflowStepCompleted("mapeo-competencias", hasRecords);
  }, [hasRecords]);

  const createTemporalMapeo = () => {
    setRecords((current) => [
      {
        id: `mapeo-${Date.now()}`,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
  };

  const pageActions = (
    <Button
      variant="primary"
      leftIcon={<GoPlus className="text-lg" />}
      onClick={createTemporalMapeo}
    >
      Nuevo mapeo
    </Button>
  );

  return (
    <PanelLayout
      currentStep="mapeo-competencias"
      title="Mapeo de Competencias"
      description="Asignación I-R-A y visualización de la malla curricular por semestres y cursos."
      actions={!isStepLocked && hasRecords ? pageActions : undefined}
    >
      {isStepLocked ? (
        <WorkflowStateCard
          variant="locked"
          title="Este paso aún no está disponible"
          description={getAcademicWorkflowLockedDescription("mapeo-competencias")}
          helperText="La restricción secuencial se valida solo en Gestión Académica."
        />
      ) : !hasRecords ? (
        <WorkflowStateCard
          title="Aún no hay mapeos de competencias creados"
          description="Cuando se registre el primer mapeo, se habilitará la vista completa para asignar niveles I-R-A y revisar la malla curricular."
          actionLabel="Crear mapeo de competencias"
          onAction={createTemporalMapeo}
          helperText="No se muestran datos de prueba ni información precargada."
        />
      ) : (
        <div className="surface-card p-6 md:p-8">
          <p className="text-sm leading-7 text-[var(--color-gray-3)]">
            Este módulo ya quedó habilitado para conectar la información real del mapeo de competencias. Aquí se podrán cargar filtros, formularios, tablas y acciones específicas del flujo.
          </p>
        </div>
      )}
    </PanelLayout>
  );
}
