export const ROUTES = {
  landing: "/Secub-Frontend",
  access: "/Secub-Frontend/acceder",
  accessAliases: ["/login", "/auth"],
  panel: "/Secub-Frontend/panel",
  panelDashboard: "/Secub-Frontend/panel/dashboard",
  panelPerfilEgreso: "/Secub-Frontend/panel/perfil-egreso",
  panelPropositoFormacion: "/Secub-Frontend/panel/proposito-formacion",
  panelCompetenciasRa: "/Secub-Frontend/panel/competencias-ra",
  panelMapeoCompetencias: "/Secub-Frontend/panel/mapeo-competencias",
  panelMapeoCompetenciasCrear: "/Secub-Frontend/panel/mapeo-competencias/crear",
  panelMapeoCompetenciasEditar: "/Secub-Frontend/panel/mapeo-competencias/editar",
  panelCiclo: "/Secub-Frontend/panel/ciclo",
  panelAsignarRa: "/Secub-Frontend/panel/asignar-ra",
  panelMedicionRa: "/Secub-Frontend/panel/medicion-ra",
} as const;

export function normalizePathname(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}
