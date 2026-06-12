import { FaUniversalAccess } from "react-icons/fa";
import { Button } from "../components/ui";
import { useAccessibilitySettings } from "./useAccessibilitySettings";
import type { FontSizeMode } from "./AccessibilityProvider";

const fontSizeOptions: Array<{
  value: FontSizeMode;
  label: string;
  description: string;
}> = [
  {
    value: "default",
    label: "Texto normal",
    description: "Mantiene el tamaño base definido por SECUB.",
  },
  {
    value: "large",
    label: "Texto grande",
    description: "Aumenta la lectura sin alterar la estructura principal.",
  },
  {
    value: "xlarge",
    label: "Texto extra grande",
    description: "Refuerza la legibilidad en textos y controles principales.",
  },
];

export default function AccessibilitySettingsPanel() {
  const { settings, toggleHighContrast, setFontSize, resetSettings } = useAccessibilitySettings();
  const hasCustomSettings = settings.contrast === "high" || settings.fontSize !== "default";

  return (
    <section
      className="accessibility-settings-card"
      aria-labelledby="accessibility-settings-title"
    >
      <div className="accessibility-settings-card__header">
        <span className="accessibility-settings-card__icon" aria-hidden="true">
          <FaUniversalAccess />
        </span>

        <div>
          <p className="accessibility-settings-card__eyebrow">Configuración del panel</p>
          <h2 id="accessibility-settings-title" className="accessibility-settings-card__title">
            Accesibilidad
          </h2>
          <p className="accessibility-settings-card__description">
            Ajusta el contraste y el tamaño del texto para mejorar la lectura dentro de SECUB.
          </p>
        </div>
      </div>

      <div className="accessibility-settings-card__content">
        <article className="accessibility-settings-section" aria-labelledby="contrast-title">
          <div>
            <h3 id="contrast-title" className="accessibility-settings-section__title">
              Contraste
            </h3>
            <p className="accessibility-settings-section__description">
              Activa una visualización de mayor contraste para reforzar la separación entre texto, fondos y controles.
            </p>
          </div>

          <button
            type="button"
            className="accessibility-settings-action"
            aria-pressed={settings.contrast === "high"}
            onClick={toggleHighContrast}
          >
            <span>
              <span className="accessibility-settings-action__title">Contraste alto</span>
              <span className="accessibility-settings-action__description">
                {settings.contrast === "high" ? "Activo actualmente" : "Inactivo actualmente"}
              </span>
            </span>
            <span className="accessibility-settings-action__state" aria-hidden="true">
              {settings.contrast === "high" ? "Activo" : "Inactivo"}
            </span>
          </button>
        </article>

        <article className="accessibility-settings-section" aria-labelledby="font-size-title">
          <div>
            <h3 id="font-size-title" className="accessibility-settings-section__title">
              Tamaño de texto
            </h3>
            <p className="accessibility-settings-section__description">
              Selecciona el nivel de lectura que prefieras sin cambiar la identidad visual de la plataforma.
            </p>
          </div>

          <div className="accessibility-settings-options" role="group" aria-label="Tamaño de texto">
            {fontSizeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="accessibility-settings-action"
                aria-pressed={settings.fontSize === option.value}
                onClick={() => setFontSize(option.value)}
              >
                <span>
                  <span className="accessibility-settings-action__title">{option.label}</span>
                  <span className="accessibility-settings-action__description">{option.description}</span>
                </span>
                <span className="accessibility-settings-action__state" aria-hidden="true">
                  {settings.fontSize === option.value ? "Activo" : "Elegir"}
                </span>
              </button>
            ))}
          </div>
        </article>
      </div>

      <div className="accessibility-settings-card__footer">
        <p className="accessibility-settings-card__status">
          {hasCustomSettings
            ? "Tienes cambios de accesibilidad aplicados en este navegador."
            : "Estás usando la configuración visual predeterminada de SECUB."}
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={resetSettings}
        >
          Restablecer ajustes
        </Button>
      </div>
    </section>
  );
}
