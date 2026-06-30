import { GoArrowLeft } from "react-icons/go";
import PanelLayout from "../../../components/panel/PanelLayout";
import AccessibilitySettingsPanel from "../../../accessibility/AccessibilitySettingsPanel";
import { ROUTES, navigateToRoute } from "../../../app/appRoutes";
import { Button } from "../../../components/ui";

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
      <div className="w-full space-y-5">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<GoArrowLeft className="text-lg" />}
          onClick={() => navigateToRoute(ROUTES.panelSettings, { preserveSearch: true })}
        >
          Volver a Ajustes de usuario
        </Button>

        <AccessibilitySettingsPanel />
      </div>
    </PanelLayout>
  );
}
