export const APP_BASE_PATH = "/Secub-Frontend";
export const APP_NAVIGATION_EVENT = "secub:navigation";

export const ROUTES = {
  landing: `${APP_BASE_PATH}/`,

  access: `${APP_BASE_PATH}/acceder`,
  accessAliases: [`${APP_BASE_PATH}/login`, `${APP_BASE_PATH}/auth`],

  programSelector: `${APP_BASE_PATH}/seleccionar-programa`,
  programSelectorAliases: [`${APP_BASE_PATH}/program-selector`],

  panel: `${APP_BASE_PATH}/panel`,
  panelDashboard: `${APP_BASE_PATH}/panel/dashboard`,
  panelSettings: `${APP_BASE_PATH}/panel/ajustes`,
  panelAccessibility: `${APP_BASE_PATH}/panel/accesibilidad`,

  panelPerfilEgreso: `${APP_BASE_PATH}/panel/perfil-egreso`,
  panelPropositoFormacion: `${APP_BASE_PATH}/panel/proposito-formacion`,
  panelCompetenciasRa: `${APP_BASE_PATH}/panel/competencias-ra`,
  panelMapeoCompetencias: `${APP_BASE_PATH}/panel/mapeo-competencias`,
  panelMapeoCompetenciasCrear: `${APP_BASE_PATH}/panel/mapeo-competencias/crear`,
  panelMapeoCompetenciasEditar: `${APP_BASE_PATH}/panel/mapeo-competencias/editar`,
  panelCiclo: `${APP_BASE_PATH}/panel/ciclo`,
  panelAsignarRa: `${APP_BASE_PATH}/panel/asignar-ra`,
  panelMedicionRa: `${APP_BASE_PATH}/panel/medicion-ra`,

  privacyPolicy: `${APP_BASE_PATH}/politicas-de-uso-y-privacidad/`,
  termsAndConditions: `${APP_BASE_PATH}/terminos-y-condiciones/`,
} as const;

export function buildRouteWithSearch(
  route: string,
  params: URLSearchParams | Record<string, string | undefined>,
) {
  const searchParams =
    params instanceof URLSearchParams ? params : new URLSearchParams();

  if (!(params instanceof URLSearchParams)) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });
  }

  const search = searchParams.toString();
  return search ? `${route}?${search}` : route;
}

export function normalizePathname(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

export function isInternalRouteHref(href?: string) {
  if (!href || href.startsWith("#")) return false;

  try {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin && url.pathname.startsWith(APP_BASE_PATH);
  } catch {
    return href.startsWith(APP_BASE_PATH);
  }
}

export function navigateToRoute(
  href: string,
  options: { replace?: boolean; preserveSearch?: boolean; notify?: boolean } = {},
) {
  if (typeof window === "undefined") return;

  const hasSearch = href.includes("?");
  const nextHref = options.preserveSearch && !hasSearch
    ? `${href}${window.location.search}`
    : href;
  const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextHref === currentHref) {
    if (options.notify !== false) {
      window.dispatchEvent(new Event(APP_NAVIGATION_EVENT));
    }
    return;
  }

  if (options.replace) {
    window.history.replaceState(null, "", nextHref);
  } else {
    window.history.pushState(null, "", nextHref);
  }

  if (options.notify !== false) {
    window.dispatchEvent(new Event(APP_NAVIGATION_EVENT));
  }
}
