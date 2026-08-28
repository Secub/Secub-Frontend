import { useEffect } from "react";
import { IconButton, SecubIcon } from "../../../../components/ui";
import type { ValidationFeedback } from "../medicion-ra.types";

import { ActionIcon } from "../../../../components/ui/ActionIcon";

interface ValidationBannerProps {
  feedback: ValidationFeedback | null;
  onClose?: () => void;
}

const iconMap = {
  success: "complete",
  error: "warning",
  info: "info",
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

  const iconName = iconMap[feedback.type];

  return (
    <div
      className="fixed bottom-5 right-5 z-[70] w-[min(92vw,420px)]"
      role="status"
      aria-live={feedback.type === "error" ? "assertive" : "polite"}
    >
      <div className="rounded-[var(--radius-lg)] border border-[var(--secub-border)] bg-[var(--secub-surface)] p-4 shadow-[var(--shadow-lg)]">
        <div className="flex items-start gap-3">
          <SecubIcon name={iconName} weight="fill" size={20} className="mt-0.5 text-[var(--color-secondary-1)]" />

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
            <IconButton
              icon={<ActionIcon name="close" />}
              label="Cerrar notificación"
              variant="ghost"
              size="xs"
              onClick={onClose}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
