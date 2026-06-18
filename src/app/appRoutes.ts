export const APP_BASE_PATH = "/Secub-Frontend";

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