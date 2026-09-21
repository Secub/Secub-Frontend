import { useMemo } from "react";
import PanelLayout from "../../../components/panel/PanelLayout";
import { BackButton, TourReplayButton } from "../../../components/panel";
import { useOnboardingTour, type OnboardingTourStep } from "../../../components/OnboardingTour";
import AccessibilitySettingsPanel from "../../../accessibility/AccessibilitySettingsPanel";
import { ROUTES, navigateToRoute } from "../../../app/appRoutes";

export default function AccessibilitySettingsPage() {
  const tourSteps = useMemo<OnboardingTourStep[]>(
    () => [
      {
        target: "#accessibility-contrast-card",
        title: "Contraste",
        content: "Activa el contraste alto para reforzar la separación entre textos, fondos y controles.",
        order: 1,
      },
      {
        target: "#accessibility-font-size-card",
        title: "Tamaño de texto",
        content: "Elige el tamaño de texto que te resulte más cómodo para leer.",
        order: 2,
      },
      {
        target: "#accessibility-reset-button",
        title: "Restablecer ajustes",
        content:
          "Vuelve a la configuración visual predeterminada de SECUB. Tus ajustes se guardan solo en este navegador.",
        order: 3,
      },
    ],
    [],
  );

  const { startTour } = useOnboardingTour({
    steps: tourSteps,
    storageKey: "tour_accessibility_v1",
  });

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

        <TourReplayButton onClick={startTour} label="Ver guía de accesibilidad" className="my-3" />

        <AccessibilitySettingsPanel />
      </div>
    </PanelLayout>
  );
}
