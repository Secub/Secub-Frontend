export const APP_BASE_PATH = "/Secub-Frontend";

export const ROUTES = {
<<<<<<< HEAD
  landing: "/",
  access: "/acceder",
  accessAliases: ["/login", "/auth"],
  programSelector: "/seleccionar-programa",
  programSelectorAliases: ["/program-selector"],
  panel: "/panel",
  panelDashboard: "/panel/dashboard",
  panelSettings: "/panel/ajustes",
  panelAccessibility: "/panel/accesibilidad",
  panelPerfilEgreso: "/panel/perfil-egreso",
  panelPropositoFormacion: "/panel/proposito-formacion",
  panelCompetenciasRa: "/panel/competencias-ra",
  panelMapeoCompetencias: "/panel/mapeo-competencias",
  panelMapeoCompetenciasCrear: "/panel/mapeo-competencias/crear",
  panelMapeoCompetenciasEditar: "/panel/mapeo-competencias/editar",
  panelCiclo: "/panel/ciclo",
  panelAsignarRa: "/panel/asignar-ra",
  panelMedicionRa: "/panel/medicion-ra",
=======
  landing: `${APP_BASE_PATH}/`,
  access: `${APP_BASE_PATH}/acceder`,
  accessAliases: [`${APP_BASE_PATH}/login`, `${APP_BASE_PATH}/auth`],
  panel: `${APP_BASE_PATH}/panel`,
  panelDashboard: `${APP_BASE_PATH}/panel/dashboard`,
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
>>>>>>> origin/test
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
