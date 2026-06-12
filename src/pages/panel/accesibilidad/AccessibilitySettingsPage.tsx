import PanelLayout from "../../../components/panel/PanelLayout";
import AccessibilitySettingsPanel from "../../../accessibility/AccessibilitySettingsPanel";
import { ROUTES } from "../../../app/appRoutes";

export default function AccessibilitySettingsPage() {
  return (
    <PanelLayout
      currentStep="accesibilidad"
      title="Accesibilidad"
      description="Configura opciones de lectura y contraste para adaptar la experiencia del panel SECUB."
      breadcrumbItems={[
        { label: "Panel", href: ROUTES.panelDashboard },
        { label: "Accesibilidad" },
      ]}
    >
      <AccessibilitySettingsPanel />
    </PanelLayout>
  );
}
