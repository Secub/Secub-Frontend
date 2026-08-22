import {
  WorkflowStateCard,
  getAcademicWorkflowLockedDescription,
} from "../../../../components/panel";

interface AsignarRAAccessStateProps {
  variant: "locked-step" | "docente";
}

export function AsignarRAAccessState({ variant }: AsignarRAAccessStateProps) {
  if (variant === "locked-step") {
    return (
      <WorkflowStateCard
        variant="locked"
        title="Este paso aún no está disponible"
        description={getAcademicWorkflowLockedDescription("asignar-ra")}
        helperText="La restricción secuencial se valida desde mapeos persistidos y competencias válidas."
      />
    );
  }

  return (
    <WorkflowStateCard
      variant="locked"
      title="Módulo no disponible"
      description="Regresa al Estado del ciclo para continuar."
    />
  );
}
