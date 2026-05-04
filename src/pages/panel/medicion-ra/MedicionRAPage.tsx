import { Button } from "../../../components/ui";
import { PanelLayout } from "../../../components/panel";

export default function MedicionRAPage() {
  return (
    <PanelLayout
      currentStep="medicion-ra"
      title="Medición de Resultados de Aprendizaje"
      description="Evaluación, evidencias y análisis estadístico del cumplimiento de resultados de aprendizaje."
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
