import { useEffect, useId, useRef, useState } from "react";
import { FaUniversalAccess } from "react-icons/fa";
import { useAccessibilitySettings } from "./useAccessibilitySettings";
import type { FontSizeMode } from "./AccessibilityProvider";

interface AccessibilityMenuProps {
  className?: string;
  triggerText?: string;
}

const fontSizeOptions: Array<{ value: FontSizeMode; label: string }> = [
  { value: "default", label: "Texto normal" },
  { value: "large", label: "Texto grande" },
  { value: "xlarge", label: "Texto extra grande" },
];

export default function AccessibilityMenu({
  className = "",
  triggerText = "Accesibilidad",
}: AccessibilityMenuProps) {
  const panelId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const { settings, toggleHighContrast, setFontSize, resetSettings } = useAccessibilitySettings();
  const hasCustomSettings = settings.contrast === "high" || settings.fontSize !== "default";

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={["accessibility-menu", className].join(" ").trim()}>
      <button
        ref={triggerRef}
        type="button"
        className="accessibility-menu__trigger"
        aria-label="Abrir opciones de accesibilidad"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-haspopup="dialog"
        data-active={hasCustomSettings ? "true" : "false"}
        title="Opciones de accesibilidad"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <span aria-hidden="true" className="accessibility-menu__trigger-icon">
          <FaUniversalAccess />
        </span>
        <span className="accessibility-menu__trigger-text">{triggerText}</span>
      </button>

      {isOpen ? (
        <div id={panelId} className="accessibility-menu__panel" role="dialog" aria-labelledby={`${panelId}-title`}>
          <h2 id={`${panelId}-title`} className="accessibility-menu__title">
            Opciones de accesibilidad
          </h2>

          <button
            type="button"
            className="accessibility-menu__option"
            aria-pressed={settings.contrast === "high"}
            onClick={toggleHighContrast}
          >
            <span>Contraste alto</span>
            <span aria-hidden="true" className="accessibility-menu__state">
              {settings.contrast === "high" ? "Activo" : "Inactivo"}
            </span>
          </button>

          <div className="accessibility-menu__group" aria-label="Tamaño de letra">
            {fontSizeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="accessibility-menu__option"
                aria-pressed={settings.fontSize === option.value}
                onClick={() => setFontSize(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="accessibility-menu__reset"
            onClick={resetSettings}
          >
            Restablecer ajustes
          </button>
        </div>
      ) : null}
    </div>
  );
}
