import PanelLayout from "../../../components/panel/PanelLayout";
import { BackButton } from "../../../components/panel";
import AccessibilitySettingsPanel from "../../../accessibility/AccessibilitySettingsPanel";
import { ROUTES, navigateToRoute } from "../../../app/appRoutes";

export default function AccessibilitySettingsPage() {
  return (
    <PanelLayout
      currentStep="accesibilidad"
      title="Accesibilidad"
      description="Configura opciones de lectura y contraste para adaptar la experiencia del panel SECUB."
      breadcrumbItems={[
        { label: "Ajustes de usuario", href: ROUTES.panelSettings },
        { label: "Accesibilidad" },
      ]}
    >
      <div className="w-full">
        <BackButton
          label="Volver a Ajustes de usuario"
          onClick={() => navigateToRoute(ROUTES.panelSettings, { preserveSearch: true })}
        />

        <AccessibilitySettingsPanel />
      </div>
    </PanelLayout>
  );
}
