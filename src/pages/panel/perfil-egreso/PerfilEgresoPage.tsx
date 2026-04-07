import { Button } from "../../../components/ui";
import { PanelLayout } from "../../../components/panel";

export default function PerfilEgresoPage() {
  return (
    <PanelLayout
      currentStep="perfil-egreso"
      title="Perfil de Egreso"
      description="Gestión del perfil de egreso por programa académico, plan de estudios y estado."
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
