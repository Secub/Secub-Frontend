export const APP_BASE_PATH = "/Secub-Frontend";

export const ROUTES = {
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
} as const;

export function normalizePathname(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}
