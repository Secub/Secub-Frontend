import type { MockUserRole } from "../services/auth/mockUser";
import { canAccessPanelModule, type PanelModuleKey } from "../services/auth/roleAccess";
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

export function getPanelRouteAccessRedirect(pathname: string, role: MockUserRole) {
  const module = panelRouteModules[pathname];

  // Las rutas desconocidas continúan con el enrutamiento normal.
  if (!module || canAccessPanelModule(role, module)) return null;

  return ROUTES.panelDashboard;
}
