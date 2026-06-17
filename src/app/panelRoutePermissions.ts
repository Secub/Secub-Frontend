import type { MockUserRole } from "../services/auth/mockUser";
import { ROUTES } from "./appRoutes";

const docenteAllowedPanelRoutes = new Set<string>([
  ROUTES.panel,
  ROUTES.panelDashboard,
  ROUTES.panelSettings,
  ROUTES.panelAccessibility,
  ROUTES.panelPerfilEgreso,
  ROUTES.panelPropositoFormacion,
  ROUTES.panelCompetenciasRa,
  ROUTES.panelMedicionRa,
]);

export function getPanelRouteAccessRedirect(pathname: string, role: MockUserRole) {
  if (role !== "docente") return null;

  return docenteAllowedPanelRoutes.has(pathname) ? null : ROUTES.panelDashboard;
}
