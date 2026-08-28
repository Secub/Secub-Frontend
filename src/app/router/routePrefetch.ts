import { preloadRoute, preloadRoutes } from "./routeConfig";

/**
 * Handlers listos para desestructurar sobre un <button> o <a> de navegación.
 * Al detectar intención de navegar (mouse encima, foco por teclado o el
 * touchstart previo al click en móvil) se adelanta la descarga del chunk de
 * esa ruta, para que al hacer clic el cambio de página sea instantáneo.
 *
 * `enabled` permite desactivar la precarga en enlaces bloqueados (por el
 * candado del flujo académico) o sin destino aún resuelto.
 */
export function getRoutePrefetchProps(href?: string | null, enabled = true) {
  if (!href || !enabled) return {};

  const prefetch = () => preloadRoute(href);

  return {
    onMouseEnter: prefetch,
    onFocus: prefetch,
    onTouchStart: prefetch,
  };
}

/**
 * Precarga un grupo de rutas cuando el navegador está inactivo, para no
 * competir con el render de la página actual. Usa `requestIdleCallback`
 * cuando está disponible y cae a un `setTimeout` corto en el resto de
 * navegadores (Safari no lo soporta).
 */
export function preloadRoutesWhenIdle(pathnames: ReadonlyArray<string | null | undefined>) {
  if (typeof window === "undefined") return;

  const run = () => preloadRoutes(pathnames);

  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(run, { timeout: 2000 });
  } else {
    window.setTimeout(run, 300);
  }
}
