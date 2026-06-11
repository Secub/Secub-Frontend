import AccessPage from "../pages/access/AccessPage";
import LandingPage from "../pages/landing/LandingPage";
import DashboardPage from "../pages/panel/dashboard/DashboardPage";
import PerfilEgresoPage from "../pages/panel/perfil-egreso/PerfilEgresoPage";
import PropositoFormacionPage from "../pages/panel/proposito-formacion/PropositoFormacionPage";
import CompetenciasRAPage from "../pages/panel/competencias-ra/CompetenciasRAPage";
import MapeoCompetenciasPage from "../pages/panel/mapeo-competencias/MapeoCompetenciasPage";
import MapeoCompetenciasCreatePage from "../pages/panel/mapeo-competencias/MapeoCompetenciasCreatePage";
import CicloPage from "../pages/panel/ciclo/CicloPage";
import AsignarRAPage from "../pages/panel/asignar-ra/AsignarRAPage";
import MedicionRAPage from "../pages/panel/medicion-ra/MedicionRAPage";
import UserSettingsPage from "../pages/panel/ajustes/UserSettingsPage";
import AccessibilitySettingsPage from "../pages/panel/accesibilidad/AccessibilitySettingsPage";
import { ROUTES, normalizePathname } from "./appRoutes";
import { getPanelRouteAccessRedirect } from "./panelRoutePermissions";
import { getCurrentMockUser } from "../services/auth/mockUser";
import { useInactivityLogout } from "../services/auth/useInactivityLogout";

function isAccessRoute(pathname: string) {
  return (
    pathname === ROUTES.access ||
    (ROUTES.accessAliases as readonly string[]).includes(pathname)
  );
}

export default function AppRouter() {
  const normalizedPath = normalizePathname(window.location.pathname);
  const isPanelRoute = normalizedPath === ROUTES.panel || normalizedPath.startsWith(`${ROUTES.panel}/`);

  useInactivityLogout(isPanelRoute);

  if (isPanelRoute) {
    const redirectPath = getPanelRouteAccessRedirect(normalizedPath, getCurrentMockUser().role);

    if (redirectPath) {
      window.history.replaceState(null, "", `${redirectPath}${window.location.search}`);
      return <DashboardPage />;
    }
  }

  if (isAccessRoute(normalizedPath)) {
    return <AccessPage />;
  }

  switch (normalizedPath) {
    case ROUTES.panel:
    case ROUTES.panelDashboard:
      return <DashboardPage />;
    case ROUTES.panelSettings:
      return <UserSettingsPage />;
    case ROUTES.panelAccessibility:
      return <AccessibilitySettingsPage />;
    case ROUTES.panelPerfilEgreso:
      return <PerfilEgresoPage />;
    case ROUTES.panelPropositoFormacion:
      return <PropositoFormacionPage />;
    case ROUTES.panelCompetenciasRa:
      return <CompetenciasRAPage />;
    case ROUTES.panelMapeoCompetencias:
      return <MapeoCompetenciasPage />;
    case ROUTES.panelMapeoCompetenciasCrear:
    case ROUTES.panelMapeoCompetenciasEditar:
      return <MapeoCompetenciasCreatePage />;
    case ROUTES.panelCiclo:
      return <CicloPage />;
    case ROUTES.panelAsignarRa:
      return <AsignarRAPage />;
    case ROUTES.panelMedicionRa:
      return <MedicionRAPage />;
    default:
      return <LandingPage />;
  }
}
