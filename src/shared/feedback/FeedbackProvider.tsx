import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { GoCheckCircle, GoInfo, GoStop, GoXCircle } from "react-icons/go";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import {
  feedbackEvents,
  type ConfirmationRequest,
  type FeedbackVariant,
  type NotificationRequest,
} from "./feedback.service";

interface FeedbackProviderProps {
  children: ReactNode;
}

interface ConfirmationState {
  request: ConfirmationRequest;
  resolve: (value: boolean) => void;
}

const notificationIcons: Record<FeedbackVariant, typeof GoInfo> = {
  info: GoInfo,
  success: GoCheckCircle,
  warning: GoStop,
  error: GoXCircle,
};

export default function FeedbackProvider({ children }: FeedbackProviderProps) {
  const [notification, setNotification] = useState<NotificationRequest | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  const dismissTimerRef = useRef<number | null>(null);

  const dismissNotification = useCallback(() => {
    if (dismissTimerRef.current !== null) {
      window.clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    setNotification(null);
  }, []);

  useEffect(() => {
    const handleNotification = (event: Event) => {
      const detail = (event as CustomEvent<NotificationRequest>).detail;
      dismissNotification();
      setNotification(detail);
      dismissTimerRef.current = window.setTimeout(
        () => setNotification(null),
        detail.durationMs ?? 5000,
      );
    };

    const handleConfirmation = (event: Event) => {
      const detail = (event as CustomEvent<ConfirmationState>).detail;
      setConfirmation((current) => {
        current?.resolve(false);
        return detail;
      });
    };

    window.addEventListener(feedbackEvents.notification, handleNotification);
    window.addEventListener(feedbackEvents.confirmation, handleConfirmation);

    return () => {
      window.removeEventListener(feedbackEvents.notification, handleNotification);
      window.removeEventListener(feedbackEvents.confirmation, handleConfirmation);
      if (dismissTimerRef.current !== null) window.clearTimeout(dismissTimerRef.current);
    };
  }, [dismissNotification]);

  const settleConfirmation = (result: boolean) => {
    setConfirmation((current) => {
      current?.resolve(result);
      return null;
    });
  };

  const variant = notification?.variant ?? "info";
  const NotificationIcon = notificationIcons[variant];

  return (
    <>
      {children}

      {notification ? (
        <div
          className="fixed bottom-5 right-5 z-[70] w-[min(92vw,420px)] rounded-[var(--radius-lg)] border border-[var(--secub-border)] bg-[var(--secub-surface)] p-4 shadow-[var(--shadow-lg)]"
          role={variant === "error" ? "alert" : "status"}
          aria-live={variant === "error" ? "assertive" : "polite"}
        >
          <div className="flex items-start gap-3">
            <NotificationIcon aria-hidden="true" className="mt-0.5 shrink-0 text-xl text-[var(--color-secondary-1)]" />
            <div className="min-w-0 flex-1">
              {notification.title ? (
                <p className="font-heading text-sm font-semibold text-[var(--color-secondary-4)]">
                  {notification.title}
                </p>
              ) : null}
              <p className="text-sm leading-6 text-[var(--color-gray-3)]">
                {notification.message}
              </p>
            </div>
            <button
              type="button"
              onClick={dismissNotification}
              className="rounded-lg p-1 text-[var(--color-gray-4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--secub-focus-soft)]"
              aria-label="Cerrar mensaje"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(confirmation)}
        title={confirmation?.request.title ?? "Confirmar acción"}
        description={confirmation?.request.message ?? ""}
        confirmLabel={confirmation?.request.confirmLabel ?? "Confirmar"}
        cancelLabel={confirmation?.request.cancelLabel ?? "Cancelar"}
        variant={confirmation?.request.variant ?? "warning"}
        onCancel={() => settleConfirmation(false)}
        onConfirm={() => settleConfirmation(true)}
      />
    </>
  );
}
