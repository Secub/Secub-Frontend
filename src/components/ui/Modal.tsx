import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { GoX } from "react-icons/go";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  size?: "md" | "lg" | "xl";
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  closeOnBackdrop?: boolean;
  role?: "dialog" | "alertdialog";
}

const sizeStyles = {
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
} as const;

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter((element) => !element.hidden && element.getAttribute("aria-hidden") !== "true");
}

export function Modal({
  open,
  title,
  description,
  size = "lg",
  onClose,
  children,
  footer,
  closeOnBackdrop = true,
  role = "dialog",
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    const appRoot = document.getElementById("root");
    previousActiveElementRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const previousBodyOverflow = document.body.style.overflow;
    const rootWasInert = appRoot?.inert ?? false;
    document.body.style.overflow = "hidden";
    if (appRoot) appRoot.inert = true;

    const focusTimer = window.setTimeout(() => {
      if (!dialog) return;
      const initialFocus = dialog.querySelector<HTMLElement>("[data-autofocus]");
      const focusableElements = getFocusableElements(dialog);
      (initialFocus ?? focusableElements[0] ?? dialog).focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!dialog) return;

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements(dialog);
      if (!focusableElements.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      if (appRoot) appRoot.inert = rootWasInert;
      previousActiveElementRef.current?.focus?.();
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.target === event.currentTarget) onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#182233]/45 px-4 py-8 backdrop-blur-[2px]"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={dialogRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={[
          "flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[28px] border border-[var(--secub-border)] bg-[var(--secub-surface)] shadow-[0_24px_80px_rgba(24,34,51,0.18)] outline-none",
          sizeStyles[size],
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--secub-border)] px-6 py-5">
          <div>
            <h2 id={titleId} className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-2 text-sm leading-6 text-[var(--color-gray-3)]">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-gray-6)] text-[var(--color-gray-4)] transition-colors hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-secondary-4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--secub-focus-soft)]"
            aria-label="Cerrar modal"
          >
            <GoX aria-hidden="true" className="text-2xl" />
          </button>
        </div>

        <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>

        {footer ? (
          <div className="border-t border-[var(--secub-border)] px-6 py-5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
