import { getBrowserLocation } from "../shared/browser";

const rawBaseUrl = import.meta.env.BASE_URL || "/";

export const APP_BASE_PATH = rawBaseUrl === "/"
  ? ""
  : `/${rawBaseUrl.replace(/^\/+|\/+$/g, "")}`;
export const APP_NAVIGATION_EVENT = "secub:navigation";
export const PERSISTED_DEMO_SEARCH_PARAMS = ["role", "programId", "programaId"] as const;

function withBasePath(path: string) {
  const normalizedPath = path === "/" ? "" : `/${path.replace(/^\/+|\/+$/g, "")}`;
  return `${APP_BASE_PATH}${normalizedPath}` || "/";
}

export const ROUTES = {
  landing: withBasePath("/"),

  access: withBasePath("/acceder"),
  accessAliases: [withBasePath("/login"), withBasePath("/auth")],

  programSelector: withBasePath("/seleccionar-programa"),
  programSelectorAliases: [withBasePath("/program-selector")],

  panel: withBasePath("/panel"),
  panelDashboard: withBasePath("/panel/dashboard"),
  panelSettings: withBasePath("/panel/ajustes"),
  panelAccessibility: withBasePath("/panel/accesibilidad"),

  panelPerfilEgreso: withBasePath("/panel/perfil-egreso"),
  panelPropositoFormacion: withBasePath("/panel/proposito-formacion"),
  panelCompetenciasRa: withBasePath("/panel/competencias-ra"),
  panelMapeoCompetencias: withBasePath("/panel/mapeo-competencias"),
  panelMapeoCompetenciasCrear: withBasePath("/panel/mapeo-competencias/crear"),
  panelMapeoCompetenciasEditar: withBasePath("/panel/mapeo-competencias/editar"),
  panelCiclo: withBasePath("/panel/ciclo"),
  panelAsignarRa: withBasePath("/panel/asignar-ra"),
  panelMedicionRa: withBasePath("/panel/medicion-ra"),

  privacyPolicy: withBasePath("/politicas-de-uso-y-privacidad"),
  termsAndConditions: withBasePath("/terminos-y-condiciones"),
} as const;

export function pickSearchParams(
  search: string | URLSearchParams,
  allowedKeys: readonly string[],
) {
  const source = search instanceof URLSearchParams
    ? search
    : new URLSearchParams(search);
  const result = new URLSearchParams();

  allowedKeys.forEach((key) => {
    source.getAll(key).forEach((value) => result.append(key, value));
  });

  return result;
}

export function buildRouteWithSearch(
  route: string,
  params: URLSearchParams | Record<string, string | undefined>,
) {
  const searchParams = params instanceof URLSearchParams
    ? new URLSearchParams(params)
    : new URLSearchParams();

  if (!(params instanceof URLSearchParams)) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });
  }

  const search = searchParams.toString();
  return search ? `${route}?${search}` : route;
}

export function normalizePathname(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === APP_BASE_PATH && APP_BASE_PATH ? APP_BASE_PATH : normalized;
}

export function isInternalRouteHref(href?: string) {
  if (!href || href.startsWith("#")) return false;
  if (typeof window === "undefined") return href.startsWith(APP_BASE_PATH || "/");

  try {
    const location = getBrowserLocation();
    const url = new URL(href, location.origin);
    return url.origin === location.origin && (
      !APP_BASE_PATH ||
      url.pathname === APP_BASE_PATH ||
      url.pathname.startsWith(`${APP_BASE_PATH}/`)
    );
  } catch {
    return !APP_BASE_PATH || href.startsWith(APP_BASE_PATH);
  }
}

interface NavigateOptions {
  replace?: boolean;
  preserveSearch?: boolean;
  allowedSearchParams?: readonly string[];
  notify?: boolean;
}

export function navigateToRoute(href: string, options: NavigateOptions = {}) {
  if (typeof window === "undefined") return;

  const location = getBrowserLocation();
  const target = new URL(href, location.origin);
  if (options.preserveSearch && !target.search) {
    target.search = pickSearchParams(
      location.search,
      options.allowedSearchParams ?? PERSISTED_DEMO_SEARCH_PARAMS,
    ).toString();
  }

  const nextHref = `${target.pathname}${target.search}${target.hash}`;
  const currentHref = `${location.pathname}${location.search}${location.hash}`;

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
