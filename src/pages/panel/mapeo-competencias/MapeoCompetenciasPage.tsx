import { Button } from "../../../components/ui";
import { PanelLayout } from "../../../components/panel";

export default function MapeoCompetenciasPage() {
  return (
    <PanelLayout
      currentStep="mapeo-competencias"
      title="Mapeo de Competencias"
      description="Asignación I-R-A y visualización de la malla curricular por semestres y cursos."
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
