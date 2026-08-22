export type FeedbackVariant = "info" | "success" | "warning" | "error";

export interface NotificationRequest {
  title?: string;
  message: string;
  variant?: FeedbackVariant;
  durationMs?: number;
}

export interface ConfirmationRequest {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "warning" | "danger";
}

const NOTIFICATION_EVENT = "secub:feedback-notification";
const CONFIRMATION_EVENT = "secub:feedback-confirmation";

export function showNotification(request: string | NotificationRequest) {
  if (typeof window === "undefined") return;
  const detail: NotificationRequest = typeof request === "string"
    ? { message: request }
    : request;
  window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail }));
}

export function requestConfirmation(request: ConfirmationRequest) {
  if (typeof window === "undefined") return Promise.resolve(false);

  return new Promise<boolean>((resolve) => {
    window.dispatchEvent(new CustomEvent(CONFIRMATION_EVENT, {
      detail: { request, resolve },
    }));
  });
}

export const feedbackEvents = {
  notification: NOTIFICATION_EVENT,
  confirmation: CONFIRMATION_EVENT,
} as const;
