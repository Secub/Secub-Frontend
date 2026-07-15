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
      className="w-full rounded-[var(--radius-2xl)] border border-[var(--secub-border)] bg-[var(--secub-surface)] p-5 text-[var(--secub-text)] shadow-[var(--shadow-sm)] sm:p-6"
      aria-labelledby="accessibility-settings-title"
    >
      <div className="flex flex-col gap-4 border-b border-[var(--secub-border)] pb-5 sm:flex-row sm:items-start">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-secondary-1)] text-2xl text-[var(--color-white)]"
          aria-hidden="true"
        >
          <FaUniversalAccess />
        </span>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--secub-muted-text)]">
            Configuración del panel
          </p>
          <h2 id="accessibility-settings-title" className="mt-1 font-heading text-2xl font-semibold text-[var(--secub-text)]">
            Accesibilidad
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--secub-muted-text)]">
            Ajusta contraste y tamaño de texto sin cambiar la estructura de SECUB.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <article
          className="rounded-[var(--radius-xl)] border border-[var(--secub-border)] bg-[var(--secub-surface-soft)] p-4"
          aria-labelledby="contrast-title"
        >
          <div className="mb-4">
            <h3 id="contrast-title" className="font-heading text-base font-semibold text-[var(--secub-text)]">
              Contraste
            </h3>
            <p className="mt-1 text-sm leading-6 text-[var(--secub-muted-text)]">
              Refuerza la separación entre textos, fondos y controles.
            </p>
          </div>

          <button
            type="button"
            className="group flex min-h-16 w-full items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--secub-border)] bg-[var(--secub-surface)] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--secub-secondary)] hover:bg-[color:rgba(14,101,217,0.06)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--secub-focus)]"
            aria-pressed={settings.contrast === "high"}
            onClick={toggleHighContrast}
          >
            <span className="min-w-0">
              <span className="block font-heading text-sm font-semibold text-[var(--secub-text)]">
                Contraste alto
              </span>
              <span className="mt-1 block text-xs font-semibold text-[var(--secub-muted-text)]">
                {settings.contrast === "high" ? "Activo actualmente" : "Inactivo actualmente"}
              </span>
            </span>
            <span
              className={[
                "shrink-0 rounded-[var(--radius-pill)] px-3 py-1 text-xs font-bold",
                settings.contrast === "high"
                  ? "bg-[var(--secub-secondary)] text-[var(--secub-secondary-text)]"
                  : "bg-[var(--secub-surface-soft)] text-[var(--secub-muted-text)]",
              ].join(" ")}
              aria-hidden="true"
            >
              {settings.contrast === "high" ? "Activo" : "Inactivo"}
            </span>
          </button>
        </article>

        <article
          className="rounded-[var(--radius-xl)] border border-[var(--secub-border)] bg-[var(--secub-surface-soft)] p-4"
          aria-labelledby="font-size-title"
        >
          <div className="mb-4">
            <h3 id="font-size-title" className="font-heading text-base font-semibold text-[var(--secub-text)]">
              Tamaño de texto
            </h3>
            <p className="mt-1 text-sm leading-6 text-[var(--secub-muted-text)]">
              Elige el nivel de lectura que prefieras.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3" role="group" aria-label="Tamaño de texto">
            {fontSizeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="group flex min-h-28 flex-col justify-between rounded-[var(--radius-lg)] border border-[var(--secub-border)] bg-[var(--secub-surface)] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--secub-secondary)] hover:bg-[color:rgba(14,101,217,0.06)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--secub-focus)]"
                aria-pressed={settings.fontSize === option.value}
                onClick={() => setFontSize(option.value)}
              >
                <span>
                  <span className="block font-heading text-sm font-semibold text-[var(--secub-text)]">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-xs font-semibold leading-5 text-[var(--secub-muted-text)]">
                    {option.description}
                  </span>
                </span>
                <span
                  className={[
                  "mt-4 w-fit rounded-[var(--radius-pill)] px-3 py-1 text-xs font-bold",
                  settings.fontSize === option.value
                    ? "bg-[var(--secub-secondary)] text-[var(--secub-secondary-text)]"
                    : "bg-[var(--secub-surface-soft)] text-[var(--secub-muted-text)]",
                ].join(" ")}
                  aria-hidden="true"
                >
                  {settings.fontSize === option.value ? "Activo" : "Elegir"}
                </span>
              </button>
            ))}
          </div>
        </article>
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-[var(--secub-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0 text-sm font-medium leading-6 text-[var(--secub-muted-text)]">
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
