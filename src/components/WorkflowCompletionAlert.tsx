import { useEffect, useRef } from "react";

interface WorkflowCompletionAlertProps {
  open: boolean;
  onClose: () => void;
}

export default function WorkflowCompletionAlert({ open, onClose }: WorkflowCompletionAlertProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previousActiveElementRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const focusTimeout = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimeout);
      document.removeEventListener("keydown", handleKeyDown);
      previousActiveElementRef.current?.focus?.();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="completion-alert-backdrop">
      <section
        className="completion-alert"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="completion-alert-title"
        aria-describedby="completion-alert-description"
      >
        <div className="completion-alert-icon" aria-hidden="true">
          ✓
        </div>

        <h2 id="completion-alert-title" className="completion-alert-title">
          ¡Flujo completado!
        </h2>

        <p id="completion-alert-description" className="completion-alert-description">
          Has terminado todos los pasos del panel. A partir de ahora, los módulos quedarán disponibles en modo visualización para consulta y seguimiento.
        </p>

        <div className="completion-alert-actions">
          <button
            ref={closeButtonRef}
            type="button"
            className="completion-alert-button"
            onClick={onClose}
          >
            Entendido
          </button>
        </div>
      </section>
    </div>
  );
}
