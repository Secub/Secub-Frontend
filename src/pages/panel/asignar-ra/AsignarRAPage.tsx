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

interface AsignacionTemporalRecord {
  id: string;
  createdAt: string;
}

export default function AsignarRAPage() {
  const [records, setRecords] = useState<AsignacionTemporalRecord[]>([]);

  const isStepLocked = isAcademicWorkflowStepLocked("asignar-ra");
  const hasRecords = records.length > 0;

  useEffect(() => {
    setAcademicWorkflowStepCompleted("asignar-ra", hasRecords);
  }, [hasRecords]);

  const createTemporalAsignacion = () => {
    setRecords((current) => [
      {
        id: `asignacion-ra-${Date.now()}`,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
  };

  const pageActions = (
    <Button
      variant="primary"
      leftIcon={<GoPlus className="text-lg" />}
      onClick={createTemporalAsignacion}
    >
      Nueva asignación RA
    </Button>
  );

  return (
    <PanelLayout
      currentStep="asignar-ra"
      title="Asignar Resultados de Aprendizaje"
      description="Selección de resultados de aprendizaje por curso, periodo y competencia."
      actions={!isStepLocked && hasRecords ? pageActions : undefined}
    >
      {isStepLocked ? (
        <WorkflowStateCard
          variant="locked"
          title="Este paso aún no está disponible"
          description={getAcademicWorkflowLockedDescription("asignar-ra")}
          helperText="La restricción secuencial se valida solo en Gestión Académica."
        />
      ) : !hasRecords ? (
        <WorkflowStateCard
          title="Aún no hay asignaciones de RA creadas"
          description="Cuando se cree la primera asignación, se habilitará la vista completa para seleccionar resultados de aprendizaje por curso, periodo y competencia."
          actionLabel="Crear asignación RA"
          onAction={createTemporalAsignacion}
          helperText="No se muestran datos de prueba ni información precargada."
        />
      ) : (
        <div className="surface-card p-6 md:p-8">
          <p className="text-sm leading-7 text-[var(--color-gray-3)]">
            Este módulo ya quedó habilitado para conectar la información real de asignación de RA. Aquí se podrán cargar filtros, formularios, tablas y acciones específicas del flujo.
          </p>
        </div>
      )}
    </PanelLayout>
  );
}
