import { httpClient } from "../infrastructure/api";

export interface SecubNotification {
  id: string;
  cycleId?: string | null;
  courseId?: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  emailStatus: "pending" | "sent" | "failed";
  createdAt: string;
}

export function listNotifications(signal?: AbortSignal) {
  return httpClient.get<SecubNotification[]>("/notifications", { signal });
}

export function markNotificationRead(notificationId: string) {
  return httpClient.patch<void>(`/notifications/${encodeURIComponent(notificationId)}/read`);
}

export function sendMeasurementReminder(input: { cycleId: string; courseId: string; courseName: string; pendingRa: number }) {
  return httpClient.post<SecubNotification>("/notifications/measurement-reminders", input);
}

export function notifyCycleCompletion(cycleId: string) {
  return httpClient.post<SecubNotification[]>("/notifications/cycle-completions", { cycleId });
}
