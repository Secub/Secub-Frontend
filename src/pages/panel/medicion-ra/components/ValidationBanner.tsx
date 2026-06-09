import { useEffect } from "react";
import { GoAlert, GoCheckCircle, GoInfo, GoX } from "react-icons/go";
import type { ValidationFeedback } from "../medicion-ra.types";

interface ValidationBannerProps {
  feedback: ValidationFeedback | null;
  onClose?: () => void;
}

const toastStyles = {
  success:
    "border-[var(--color-success)] bg-[var(--color-white)] text-[var(--color-secondary-4)] shadow-[var(--shadow-lg)]",
  error:
    "border-[var(--color-error)] bg-[var(--color-white)] text-[var(--color-secondary-4)] shadow-[var(--shadow-lg)]",
  info: "border-[var(--color-info)] bg-[var(--color-white)] text-[var(--color-secondary-4)] shadow-[var(--shadow-lg)]",
} as const;

const iconBoxStyles = {
  success: "bg-[var(--color-success)] text-[var(--color-secondary-4)]",
  error: "bg-[var(--color-error)] text-[var(--color-white)]",
  info: "bg-[var(--color-info)] text-[var(--color-secondary-4)]",
} as const;

const iconMap = {
  success: GoCheckCircle,
  error: GoAlert,
  info: GoInfo,
} as const;

export default function ValidationBanner({
  feedback,
  onClose,
}: ValidationBannerProps) {
  useEffect(() => {
    if (!feedback || !onClose) return;

    if (feedback.type === "error") return;

    const timeout = window.setTimeout(() => {
      onClose();
    }, 5500);

    return () => window.clearTimeout(timeout);
  }, [feedback, onClose]);

  if (!feedback) return null;

  const Icon = iconMap[feedback.type];

  return (
    <div
      className="fixed right-4 top-4 z-[90] w-[calc(100%-2rem)] max-w-xl md:right-8 md:top-6"
      role="status"
      aria-live={feedback.type === "error" ? "assertive" : "polite"}
    >
      <div
        className={[
          "rounded-[var(--radius-xl)] border p-4",
          toastStyles[feedback.type],
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          <span
            className={[
              "mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]",
              iconBoxStyles[feedback.type],
            ].join(" ")}
          >
            <Icon aria-hidden="true" className="text-xl" />
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-base font-semibold text-[var(--color-secondary-4)]">
              {feedback.title}
            </h3>

            <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
              {feedback.message}
            </p>

            {feedback.details?.length ? (
              <ul className="mt-3 max-h-40 list-disc space-y-1 overflow-y-auto pl-5 text-sm leading-6 text-[var(--color-gray-3)]">
                {feedback.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            ) : null}
          </div>

          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-pill)] text-[var(--color-gray-4)] transition hover:bg-[var(--color-gray-7)] hover:text-[var(--color-secondary-4)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-info)]"
              aria-label="Cerrar notificación"
            >
              <GoX aria-hidden="true" className="text-lg" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}