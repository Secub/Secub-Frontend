import { useEffect } from "react";
import { ROUTES, navigateToRoute } from "../../app/appRoutes";
import { getBrowserLocation, sessionStorageClient, storageClient } from "../../shared/browser";

export const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos

const AUTH_STORAGE_KEYS = [
  "secub:auth:user",
  "secub:auth:token",
  "secub:current-user",
  "secub:session",
  "secub:token",
  "secub-auth-user",
  "secub-auth-token",
  "secub-current-user",
  "secub-demo-user",
  "secub-session",
];

const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  "mousemove",
  "mousedown",
  "click",
  "scroll",
  "keydown",
  "touchstart",
];

export function clearSecubAuthSession() {
  AUTH_STORAGE_KEYS.forEach((key) => {
    storageClient.remove(key);
    sessionStorageClient.remove(key);
  });
}

export function useInactivityLogout(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let timeoutId: number | undefined;
    const listenerOptions: AddEventListenerOptions = { passive: true };

    const logoutByInactivity = () => {
      clearSecubAuthSession();

      const location = getBrowserLocation();
      const currentRoute = `${location.pathname}${location.search}`;
      const params = new URLSearchParams({
        reason: "inactive",
        redirect: currentRoute,
      });

      navigateToRoute(`${ROUTES.access}?${params.toString()}`, { replace: true });
    };

    const resetTimer = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(logoutByInactivity, INACTIVITY_TIMEOUT);
    };

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, listenerOptions);
    });

    resetTimer();

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer, listenerOptions);
      });
    };
  }, [enabled]);
}
