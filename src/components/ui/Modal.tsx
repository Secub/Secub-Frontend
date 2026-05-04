import type { ReactNode } from "react";
import { GoX } from "react-icons/go";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  size?: "md" | "lg" | "xl";
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

const sizeStyles = {
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
} as const;

export function Modal({
  open,
  title,
  description,
  size = "lg",
  onClose,
  children,
  footer,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#182233]/45 px-4 py-8 backdrop-blur-[2px]">
      <div
        className={[
          "flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[28px] border border-[var(--color-gray-6)] bg-white shadow-[0_24px_80px_rgba(24,34,51,0.18)]",
          sizeStyles[size],
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-gray-6)] px-6 py-5">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-[var(--color-gray-3)]">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-gray-6)] text-[var(--color-gray-4)] transition-colors hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-secondary-4)]"
            aria-label="Cerrar modal"
          >
            <GoX className="text-2xl" />
          </button>
        </div>

        <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>

        {footer ? (
          <div className="border-t border-[var(--color-gray-6)] px-6 py-5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Modal;
