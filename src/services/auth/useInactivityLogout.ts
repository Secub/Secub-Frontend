import { useEffect } from "react";
import { ROUTES } from "../../app/appRoutes";

export const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

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

function clearStorageKeys(storage: Storage | undefined) {
  if (!storage) return;

  try {
    AUTH_STORAGE_KEYS.forEach((key) => storage.removeItem(key));
  } catch {
    // Evita bloquear el cierre de sesión si el navegador restringe el acceso al storage.
  }
}

export function clearSecubAuthSession() {
  if (typeof window === "undefined") return;

  clearStorageKeys(window.localStorage);
  clearStorageKeys(window.sessionStorage);
}

export function useInactivityLogout(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let timeoutId: number | undefined;
    const listenerOptions: AddEventListenerOptions = { passive: true };

    const logoutByInactivity = () => {
      clearSecubAuthSession();

      const currentRoute = `${window.location.pathname}${window.location.search}`;
      const params = new URLSearchParams({
        reason: "inactive",
        redirect: currentRoute,
      });

      window.location.replace(`${ROUTES.access}?${params.toString()}`);
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
