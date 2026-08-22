import type { SecubRole } from "../config/access/roles";
import { canAccessModule, type PanelModuleKey } from "../config/access/permissions";
import { ROUTES } from "./appRoutes";

const panelRouteModules: Record<string, PanelModuleKey> = {
  [ROUTES.panel]: "dashboard",
  [ROUTES.panelDashboard]: "dashboard",
  [ROUTES.panelSettings]: "settings",
  [ROUTES.panelAccessibility]: "accessibility",
  [ROUTES.panelPerfilEgreso]: "perfilEgreso",
  [ROUTES.panelPropositoFormacion]: "propositoFormacion",
  [ROUTES.panelCompetenciasRa]: "competenciasRa",
  [ROUTES.panelMapeoCompetencias]: "mapeoCompetencias",
  [ROUTES.panelMapeoCompetenciasCrear]: "mapeoCompetenciasManage",
  [ROUTES.panelMapeoCompetenciasEditar]: "mapeoCompetenciasManage",
  [ROUTES.panelCiclo]: "ciclo",
  [ROUTES.panelAsignarRa]: "asignarRa",
  [ROUTES.panelMedicionRa]: "medicionRa",
};

export function getPanelRouteAccessRedirect(pathname: string, role: SecubRole) {
  const module = panelRouteModules[pathname];

  // Las rutas desconocidas continúan con el enrutamiento normal.
  if (!module || canAccessModule(role, module)) return null;

  return ROUTES.panelDashboard;
}
