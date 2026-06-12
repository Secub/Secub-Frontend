export const ROUTES = {
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
} as const;

export function normalizePathname(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}
