import { Button } from "../../../components/ui";
import { PanelLayout } from "../../../components/panel";

export default function CompetenciasRAPage() {
  return (
    <PanelLayout
      currentStep="competencias-ra"
      title="Competencias y Resultados de Aprendizaje"
      description="Administración de competencias, resultados de aprendizaje y relación con el plan de estudios."
      actions={<Button variant="primary">Acción principal</Button>}
    >
      <div className="surface-card p-6 md:p-8">
        <p className="text-sm leading-7 text-[var(--color-gray-3)]">
          Este módulo ya quedó preparado dentro de la estructura del panel.
          Aquí es donde después construiremos filtros, formularios, tablas y acciones específicas del flujo.
        </p>
      </div>
    </PanelLayout>
  );
}
