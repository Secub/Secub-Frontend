export const ROUTES = {
  landing: "/",
  access: "/acceder",
  accessAliases: ["/login", "/auth"],
  panel: "/panel",
  panelDashboard: "/panel/dashboard",
  panelPerfilEgreso: "/panel/perfil-egreso",
  panelPropositoFormacion: "/panel/proposito-formacion",
  panelCompetenciasRa: "/panel/competencias-ra",
  panelMapeoCompetencias: "/panel/mapeo-competencias",
  panelCiclo: "/panel/ciclo",
  panelAsignarRa: "/panel/asignar-ra",
  panelMedicionRa: "/panel/medicion-ra",
} as const;

export function normalizePathname(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}
